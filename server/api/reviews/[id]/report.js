// server/api/reviews/[id]/report.js - API for reporting reviews
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // Ensure user is authenticated
    if (!user) {
        return createError({
            statusCode: 401,
            message: 'Authentication required'
        })
    }

    const reviewId = event.context.params.id

    // Get HTTP method and request body
    const method = event.node.req.method
    const body = method === 'POST' ? await readBody(event) : null

    // Only POST method is supported for reporting
    if (method !== 'POST') {
        return createError({
            statusCode: 405,
            message: 'Method not allowed'
        })
    }

    try {
        const { reason } = body

        if (!reason) {
            return createError({
                statusCode: 400,
                message: 'Reason for reporting is required'
            })
        }

        // Check if user already reported this review
        const { data: existingReport, error: checkError } = await client
            .from('review_reports')
            .select('id')
            .eq('review_id', reviewId)
            .eq('user_id', user.id)

        if (checkError) throw checkError

        if (existingReport && existingReport.length > 0) {
            return createError({
                statusCode: 409,
                message: 'You have already reported this review'
            })
        }

        // Create report
        const { data, error } = await client
            .from('review_reports')
            .insert({
                review_id: reviewId,
                user_id: user.id,
                reason
            })
            .select()

        if (error) throw error

        // Mark review as reported
        await client
            .from('reviews')
            .update({ reported: true })
            .eq('id', reviewId)

        return { success: true, message: 'Review reported successfully' }
    } catch (error) {
        return createError({
            statusCode: 500,
            message: error.message
        })
    }
})