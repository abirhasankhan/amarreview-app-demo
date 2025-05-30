// API version 02 - Corrected
import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const slug = event.context.params?.slug

    try {
        if (!slug || slug === 'undefined') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Valid slug parameter required',
            })
        }

        // Get the business data with related hours, category, and reviews with user profile
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
                owner_id,
                category:categories(id, name, slug),
                hours:business_hours(id, day_of_week, open_time, close_time, is_closed),
                photos:business_photos(id, url, caption, approved),
                faqs:business_faqs(id, question, answer, order_index),
                reviews:reviews(
                    id,
                    rating,
                    content,
                    created_at,
                    user_id,
                    status,
                    user:profiles(id, full_name, avatar_url)
                )
            `)
            .eq('slug', slug)
            .maybeSingle()

        if (error) throw error

        if (!business) {
            throw createError({ statusCode: 404, statusMessage: 'Business not found' })
        }

        // Filter approved photos and reviews in JavaScript
        const approvedPhotos = (business.photos || []).filter(photo => photo.approved === true)
        const approvedReviews = (business.reviews || []).filter(review => review.status === 'approved')

        const enrichedReviews = approvedReviews.map(review => ({
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
            photos: approvedPhotos,
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