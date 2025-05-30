// server/api/profile/username/[username].get.js
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const username = event.context.params.username

    if (!username) {
        throw createError({
            statusCode: 400,
            message: 'Username is required'
        })
    }

    try {
        // Check if username is available
        const { data, error, count } = await client
            .from('profiles')
            .select('*', { count: 'exact' })
            .eq('username', username)
            .limit(1)

        if (error) throw error

        return {
            available: count === 0,
            taken: count > 0
        }
    } catch (error) {
        console.error('Username check error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error checking username availability'
        })
    }
})