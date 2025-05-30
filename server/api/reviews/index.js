// server/api/reviews.js - REST API for reviews
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)

    let user = null
    try {
        user = await serverSupabaseUser(event)
    } catch (err) {
        // No session is OK for public access
        user = null
    }
    
    // Get HTTP method and request body
    const method = event.node.req.method
    const body = method !== 'GET' ? await readBody(event) : null

    // Get query params (for GET requests)
    const query = getQuery(event)

    // Handle different HTTP methods
    switch (method) {
        case 'GET':
            return await handleGetReviews(event, client, user, query)
        case 'POST':
            return await handleCreateReview(event, client, user, body)
        case 'PUT':
            return await handleUpdateReview(event, client, user, body)
        case 'DELETE':
            return await handleDeleteReview(event, client, user, query)
        default:
            return createError({
                statusCode: 405,
                message: 'Method not allowed'
            })
    }
})

// GET - Fetch reviews (with optional filters)
async function handleGetReviews(event, client, user, query) {
    try {
        const safeQuery = { ...query }; // Normalize prototype-less object

        // console.log('Fetching reviews with query:', safeQuery);

        const {
            business_id,
            user_id,
            limit = 50,
            offset = 0,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = safeQuery;

        // Default query for fetching reviews
        let reviewsQuery = client
            .from('reviews')
            .select(`
                *,
                user:profiles(id, full_name, avatar_url),
                photos:review_photos(id, url),
                business:businesses(id, name, slug),
                responses:review_responses(
                    id, 
                    content, 
                    created_at, 
                    user:profiles(id, full_name, avatar_url)
                ),
                helpful_votes:review_helpful_votes(id, user_id)
            `)
            .eq('status', 'approved'); // Always fetch only approved reviews

        // Determine if special case for "latest 5 reviews"
        const fetchRecentOnly = !business_id && !user_id;

        // Apply filters if provided
        if (business_id) {
            reviewsQuery = reviewsQuery.eq('business_id', business_id);
        }

        if (user_id) {
            reviewsQuery = reviewsQuery.eq('user_id', user_id);
        }

        // Apply ordering and pagination
        const finalLimit = fetchRecentOnly ? 5 : limit;
        const finalOffset = fetchRecentOnly ? 0 : offset;

        reviewsQuery = reviewsQuery
            .order(sort_by, { ascending: sort_order === 'asc' })
            .range(finalOffset, finalOffset + finalLimit - 1);

        const { data, error } = await reviewsQuery;

        if (error) {
            console.error('Supabase query error:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        // console.log(`Fetched ${data.length} reviews`);

        // Add a flag for whether the current user voted helpful
        if (user && user.id) {
            data.forEach(review => {
                review.current_user_voted_helpful = review.helpful_votes?.some(
                    vote => vote.user_id === user.id
                ) || false;
            });
        }

        return {
            success: true,
            reviews: data,
            meta: {
                count: data.length,
                limit: finalLimit,
                offset: finalOffset
            }
        };
    } catch (error) {
        console.error('Error in handleGetReviews:', {
            message: error.message,
            stack: error.stack,
            originalError: error.originalError || error
        });

        return createError({
            statusCode: 500,
            message: 'Failed to fetch reviews',
            data: {
                originalError: error.message,
                code: error.code
            }
        });
    }
}


// POST - Create a new review
async function handleCreateReview(event, client, user, body) {
    try {
        // Ensure user is authenticated
        if (!user) {
            return createError({
                statusCode: 401,
                message: 'Authentication required'
            })
        }

        const { business_id, rating, content, photos = [] } = body

        if (!business_id || !rating) {
            return createError({
                statusCode: 400,
                message: 'Business ID and rating are required'
            })
        }

        // Check if user already reviewed this business
        const { data: existingReviews, error: checkError } = await client
            .from('reviews')
            .select('id')
            .eq('business_id', business_id)
            .eq('user_id', user.id)

        if (checkError) throw checkError

        if (existingReviews && existingReviews.length > 0) {
            return createError({
                statusCode: 409,
                message: 'You have already reviewed this business'
            })
        }

        // Create the review
        const { data: review, error } = await client
            .from('reviews')
            .insert({
                business_id,
                user_id: user.id,
                rating,
                content,
                status: 'approved' // Auto-approve for now, can be changed to 'pending' for moderation
            })
            .select()

        if (error) throw error

        // Upload photos if any
        if (photos.length > 0) {
            const photoInserts = photos.map(photoUrl => ({
                review_id: review[0].id,
                url: photoUrl
            }))

            const { error: photoError } = await client
                .from('review_photos')
                .insert(photoInserts)

            if (photoError) throw photoError
        }

        // Update business average rating
        await updateBusinessRating(client, business_id)

        return { review: review[0] }
    } catch (error) {
        return createError({
            statusCode: 500,
            message: error.message
        })
    }
}

// PUT - Update an existing review
async function handleUpdateReview(event, client, user, body) {
    try {
        // Ensure user is authenticated
        if (!user) {
            return createError({
                statusCode: 401,
                message: 'Authentication required'
            })
        }

        const { id, rating, content, photos = [] } = body

        if (!id) {
            return createError({
                statusCode: 400,
                message: 'Review ID is required'
            })
        }

        // Check if review exists and belongs to user
        const { data: existingReview, error: checkError } = await client
            .from('reviews')
            .select('id, business_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (checkError) throw checkError

        if (!existingReview) {
            return createError({
                statusCode: 404,
                message: 'Review not found or you do not have permission to edit it'
            })
        }

        // Update the review
        const updateData = {}
        if (rating) updateData.rating = rating
        if (content !== undefined) updateData.content = content
        updateData.updated_at = new Date().toISOString()

        const { data: updatedReview, error } = await client
            .from('reviews')
            .update(updateData)
            .eq('id', id)
            .select()

        if (error) throw error

        // Handle photos if needed
        if (photos.length > 0) {
            // First delete existing photos
            const { error: deleteError } = await client
                .from('review_photos')
                .delete()
                .eq('review_id', id)

            if (deleteError) throw deleteError

            // Then insert new photos
            const photoInserts = photos.map(photoUrl => ({
                review_id: id,
                url: photoUrl
            }))

            const { error: photoError } = await client
                .from('review_photos')
                .insert(photoInserts)

            if (photoError) throw photoError
        }

        // Update business average rating
        await updateBusinessRating(client, existingReview.business_id)

        return { review: updatedReview[0] }
    } catch (error) {
        return createError({
            statusCode: 500,
            message: error.message
        })
    }
}

// DELETE - Remove a review
async function handleDeleteReview(event, client, user, query) {
    try {
        // Ensure user is authenticated
        if (!user) {
            return createError({
                statusCode: 401,
                message: 'Authentication required'
            })
        }

        const { id } = query

        if (!id) {
            return createError({
                statusCode: 400,
                message: 'Review ID is required'
            })
        }

        // Check if review exists and belongs to user
        const { data: existingReview, error: checkError } = await client
            .from('reviews')
            .select('id, business_id')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (checkError) throw checkError

        if (!existingReview) {
            return createError({
                statusCode: 404,
                message: 'Review not found or you do not have permission to delete it'
            })
        }

        // Delete the review (this will cascade delete photos, responses, votes, etc.)
        const { error } = await client
            .from('reviews')
            .delete()
            .eq('id', id)

        if (error) throw error

        // Update business average rating
        await updateBusinessRating(client, existingReview.business_id)

        return { success: true, message: 'Review deleted successfully' }
    } catch (error) {
        return createError({
            statusCode: 500,
            message: error.message
        })
    }
}

// Helper function to update business average rating
async function updateBusinessRating(client, businessId) {
    try {
        // Get all approved reviews for this business
        const { data: reviews, error } = await client
            .from('reviews')
            .select('rating')
            .eq('business_id', businessId)
            .eq('status', 'approved')

        if (error) throw error

        // Calculate average rating
        const reviewCount = reviews.length
        let avgRating = 0

        if (reviewCount > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
            avgRating = totalRating / reviewCount
        }

        // Update business stats
        await client
            .from('businesses')
            .update({
                stats: {
                    avg_rating: avgRating,
                    review_count: reviewCount
                }
            })
            .eq('id', businessId)

        return true
    } catch (error) {
        console.error('Error updating business rating:', error)
        return false
    }
}