// server/middleware/auth.js
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
    const protectedPaths = [
        /^\/api\/profiles/,
        // Add other protected routes here
    ]

    const isProtected = protectedPaths.some((regex) => regex.test(event.path))

    if (isProtected) {
        const user = await serverSupabaseUser(event)

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized: You must be logged in to access this resource'
            })
        }
    }
})
