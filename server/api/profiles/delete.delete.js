// server/api/profile/delete.delete.js
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
        // Step 1: Delete all user files from storage
        const { data: userFiles, error: storageListError } = await client.storage
            .from('avatars')
            .list(`avatars/${user.id}`)

        if (storageListError && storageListError.code !== 'PGRST116') {
            // PGRST116 means no files found, which is fine
            throw storageListError
        }

        // Delete files if they exist
        if (userFiles && userFiles.length > 0) {
            const filePaths = userFiles.map(file => `avatars/${user.id}/${file.name}`)
            const { error: deleteFilesError } = await client.storage
                .from('avatars')
                .remove(filePaths)

            if (deleteFilesError) throw deleteFilesError
        }

        // Step 2: Delete profile record
        const { error: profileError } = await client
            .from('profiles')
            .delete()
            .eq('id', user.id)

        if (profileError) throw profileError

        // Step 3: Delete user authentication record
        // This requires admin privileges and is typically handled differently
        // For security reasons, we'll use a dedicated admin endpoint or handle it through
        // a protected backend service

        // Here's a placeholder - in production you'd likely use a different approach
        const { error: authError } = await client.auth.admin.deleteUser(user.id)

        if (authError) throw authError

        // Step 4: Clear auth cookie
        await client.auth.signOut()

        return {
            message: 'Account deleted successfully'
        }
    } catch (error) {
        console.error('Account deletion error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error deleting account'
        })
    }
})