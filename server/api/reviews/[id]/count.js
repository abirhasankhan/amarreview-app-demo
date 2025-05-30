// server/api/reviews/[id]/count.js
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const reviewId = event.context.params?.id

    if (!reviewId) {
        return createError({
            statusCode: 400,
            message: 'Review ID is required'
        })
    }

    try {
        const { count, error } = await client
            .from('review_helpful_votes')
            .select('*', { count: 'exact', head: true })
            .eq('review_id', reviewId)

        if (error) throw error

        return {
            success: true,
            count: count || 0
        }
    } catch (error) {
        return createError({
            statusCode: 500,
            message: 'Failed to count votes'
        })
    }
})