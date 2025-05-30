// server/api/businesses/[id].get.js
import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const id = event.context.params?.id

    try {
        if (!id || id === 'undefined') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Valid business ID parameter required',
            })
        }

        // Get the business data by ID with related information
        const { data: business, error } = await supabase
            .from('businesses')
            .select(`
                id,
                name,
                slug,
                description,
                image,
                phone,
                email,
                website,
                address,
                city,
                state,
                postal_code,
                country,
                category:categories(id, name, slug),
                hours:business_hours(id, day_of_week, open_time, close_time, is_closed),
                reviews:reviews(
                    id,
                    rating,
                    content,
                    created_at,
                    user_id,
                    user:profiles(id, full_name, avatar_url)
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw error
        if (!business) {
            throw createError({ statusCode: 404, statusMessage: 'Business not found' })
        }

        const enrichedReviews = (business.reviews || []).map(review => ({
            ...review,
            user: review.user || {
                id: review.user_id,
                full_name: 'Unknown User',
                avatar_url: null
            }
        }))

        // Calculate review statistics
        const reviewCount = enrichedReviews.length
        const totalRating = enrichedReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
        const avgRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0

        return {
            ...business,
            stats: {
                avg_rating: avgRating,
                review_count: reviewCount,
                total_hours: business.hours?.length || 0,
            },
            hours: business.hours || [],
            reviews: enrichedReviews,
        }
    } catch (err) {
        console.error('[API Error]', err)
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.statusMessage || err.message || 'Internal server error',
        })
    }
})