// server/api/profile/index.js
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    try {
        // Get profile data
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error

        // Add generated avatar URL if no avatar exists
        const profileData = {
            ...data,
            avatar_url: data.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
        }

        return profileData
    } catch (error) {
        console.error('Profile fetch error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error fetching profile data'
        })
    }
})