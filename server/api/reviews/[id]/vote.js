// server/api/reviews/[id]/vote.js
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user?.id) {
        return createError({
            statusCode: 401,
            message: 'You must be logged in to vote',
            data: { code: 'UNAUTHENTICATED' }
        })
    }

    const reviewId = event.context.params?.id
    if (!reviewId) {
        return createError({
            statusCode: 400,
            message: 'Review ID is required',
            data: { code: 'MISSING_REVIEW_ID' }
        })
    }

    const method = getMethod(event)

    try {
        switch (method) {
            case 'POST':
                return await handleAddVote(client, user.id, reviewId)
            case 'DELETE':
                return await handleRemoveVote(client, user.id, reviewId)
            default:
                return createError({
                    statusCode: 405,
                    message: 'Method not allowed',
                    data: { allowedMethods: ['POST', 'DELETE'] }
                })
        }
    } catch (error) {
        console.error('Vote API error:', error)
        return createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Internal server error',
            data: error.data || {}
        })
    }
})

async function updateVoteCount(client, reviewId) {
    const { count, error } = await client
        .from('review_helpful_votes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId)

    if (error) throw {
        statusCode: 500,
        message: 'Failed to count votes',
        data: { code: 'COUNT_ERROR' }
    }

    const { error: updateError } = await client
        .from('reviews')
        .update({ helpful_votes: count })
        .eq('id', reviewId)

    if (updateError) throw {
        statusCode: 500,
        message: 'Failed to update review',
        data: { code: 'UPDATE_ERROR' }
    }

    return count
}

async function handleAddVote(client, userId, reviewId) {
    const { data: review, error: reviewError } = await client
        .from('reviews')
        .select('id')
        .eq('id', reviewId)
        .single()

    if (reviewError || !review) throw {
        statusCode: 404,
        message: 'Review not found',
        data: { code: 'REVIEW_NOT_FOUND' }
    }

    const { data: existingVote, error: existingError } = await client
        .from('review_helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle()

    if (existingError) throw {
        statusCode: 500,
        message: 'Failed to check existing vote',
        data: { code: 'CHECK_ERROR' }
    }

    if (existingVote) throw {
        statusCode: 409,
        message: 'You have already voted for this review',
        data: { code: 'ALREADY_VOTED' }
    }

    const { error: insertError } = await client
        .from('review_helpful_votes')
        .insert({
            review_id: reviewId,
            user_id: userId,
            created_at: new Date().toISOString()
        })

    if (insertError) throw {
        statusCode: 500,
        message: 'Failed to add vote',
        data: { code: 'INSERT_ERROR' }
    }

    const count = await updateVoteCount(client, reviewId)

    return {
        success: true,
        helpful_votes: count,
        user_voted: true
    }
}

async function handleRemoveVote(client, userId, reviewId) {
    const { error: deleteError } = await client
        .from('review_helpful_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId)

    if (deleteError) throw {
        statusCode: 500,
        message: 'Failed to remove vote',
        data: { code: 'DELETE_ERROR' }
    }

    const count = await updateVoteCount(client, reviewId)

    return {
        success: true,
        helpful_votes: count,
        current_user_voted: true/false  // User's vote status
    }
}