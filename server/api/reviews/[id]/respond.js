import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        return createError({
            statusCode: 401,
            message: 'Authentication required'
        })
    }

    const reviewId = event.context.params.id
    const method = event.node.req.method
    const body = method !== 'GET' ? await readBody(event) : null

    switch (method) {
        case 'GET':
            return await handleGetResponse(event, client, reviewId)
        case 'POST':
            return await handleCreateResponse(event, client, user, reviewId, body)
        case 'PUT':
            return await handleUpdateResponse(event, client, user, reviewId, body)
        case 'DELETE':
            return await handleDeleteResponse(event, client, user, reviewId)
        default:
            return createError({
                statusCode: 405,
                message: 'Method not allowed'
            })
    }
})

// GET - View the review response
async function handleGetResponse(event, client, reviewId) {
    try {
        const { data, error } = await client
            .from('review_responses')
            .select(`
                *,
                user:profiles(id, full_name, avatar_url)
            `)
            .eq('review_id', reviewId)
            .maybeSingle()

        if (error) throw error

        return { response: data }
    } catch (error) {
        return createError({ statusCode: 500, message: error.message })
    }
}

// POST - Create a response
async function handleCreateResponse(event, client, user, reviewId, body) {
    try {
        const { content } = body
        if (!content) {
            return createError({ statusCode: 400, message: 'Response content is required' })
        }

        // Get the review with business_id
        const { data: review, error: reviewError } = await client
            .from('reviews')
            .select('business_id')
            .eq('id', reviewId)
            .single()

        if (reviewError) throw reviewError

        // Check if the user has a claim with role 'owner', 'manager', or 'admin'
        const { data: businessClaim, error: businessError } = await client
            .from('business_claims')
            .select('business_role')
            .eq('business_id', review.business_id)
            .eq('user_id', user.id)
            .maybeSingle()

        if (businessError) throw businessError

        // Check if a response already exists
        const { data: existingResponse, error: responseError } = await client
            .from('review_responses')
            .select('id')
            .eq('review_id', reviewId)
            .maybeSingle()

        if (responseError) throw responseError

        if (existingResponse) {
            return createError({
                statusCode: 409,
                message: 'A response already exists for this review'
            })
        }

        // Authorization check
        if (!businessClaim || !['owner', 'manager', 'admin'].includes(businessClaim.business_role)) {
            return createError({
                statusCode: 403,
                message: 'You are not authorized to respond to this review'
            })
        }

        // Insert new response
        const { data, error } = await client
            .from('review_responses')
            .insert({
                review_id: reviewId,
                user_id: user.id,
                content
            })
            .select()

        if (error) throw error

        return { response: data[0] }
    } catch (error) {
        return createError({ statusCode: 500, message: error.message })
    }
}

// PUT - Update a response
async function handleUpdateResponse(event, client, user, reviewId, body) {
    try {
        const { content } = body
        if (!content) {
            return createError({ statusCode: 400, message: 'Response content is required' })
        }

        // Check if the user owns this response
        const { data: existingResponse, error: checkError } = await client
            .from('review_responses')
            .select('id')
            .eq('review_id', reviewId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (checkError) throw checkError

        if (!existingResponse) {
            // If not owner of response, check if user is authorized by business claim
            const { data: review, error: reviewError } = await client
                .from('reviews')
                .select('business_id')
                .eq('id', reviewId)
                .single()

            if (reviewError) throw reviewError

            const { data: businessClaim, error: businessError } = await client
                .from('business_claims')
                .select('business_role')
                .eq('business_id', review.business_id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (businessError) throw businessError

            if (!businessClaim || !['owner', 'manager', 'admin'].includes(businessClaim.business_role)) {
                return createError({
                    statusCode: 403,
                    message: 'You are not authorized to update this response'
                })
            }
        }

        // Update the response
        const { data, error } = await client
            .from('review_responses')
            .update({
                content,
                updated_at: new Date().toISOString()
            })
            .eq('review_id', reviewId)
            .select()

        if (error) throw error

        return { response: data[0] }
    } catch (error) {
        return createError({ statusCode: 500, message: error.message })
    }
}

// DELETE - Remove a response
async function handleDeleteResponse(event, client, user, reviewId) {
    try {
        // Check if the user owns the response
        const { data: existingResponse, error: checkError } = await client
            .from('review_responses')
            .select('id')
            .eq('review_id', reviewId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (checkError) throw checkError

        if (!existingResponse) {
            // Check if user is authorized by business_claims
            const { data: review, error: reviewError } = await client
                .from('reviews')
                .select('business_id')
                .eq('id', reviewId)
                .single()

            if (reviewError) throw reviewError

            const { data: businessClaim, error: businessError } = await client
                .from('business_claims')
                .select('business_role')
                .eq('business_id', review.business_id)
                .eq('user_id', user.id)
                .maybeSingle()

            if (businessError) throw businessError

            if (!businessClaim || !['owner', 'manager', 'admin'].includes(businessClaim.business_role)) {
                return createError({
                    statusCode: 403,
                    message: 'You are not authorized to delete this response'
                })
            }
        }

        // Delete the response
        const { error } = await client
            .from('review_responses')
            .delete()
            .eq('review_id', reviewId)

        if (error) throw error

        return { success: true, message: 'Response deleted successfully' }
    } catch (error) {
        return createError({ statusCode: 500, message: error.message })
    }
}
