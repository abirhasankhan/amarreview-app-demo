// server/api/profile/avatar.post.js
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // This assumes you're using multipart form data
    const formData = await readMultipartFormData(event)

    if (!formData || !formData.length) {
        throw createError({
            statusCode: 400,
            message: 'No file provided'
        })
    }

    const file = formData.find(part => part.name === 'avatar')

    if (!file) {
        throw createError({
            statusCode: 400,
            message: 'Avatar file not found in request'
        })
    }

    try {
        // Generate a unique filename
        const fileExt = file.filename.split('.').pop()
        const fileName = `${randomUUID()}.${fileExt}`
        const filePath = `avatars/user_id-${user.id}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await client.storage
            .from('avatars')
            .upload(filePath, file.data, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData, error: urlError } = await client.storage
            .from('avatars')
            .getPublicUrl(filePath)

        if (urlError) {
            console.error('Error getting public URL:', urlError)
            throw createError({
                statusCode: 500,
                message: 'Error getting public URL'
            })
        }

        // Log the public URL for debugging
        console.log('Public URL:', urlData.publicUrl)

        // Update profile with new avatar URL
        const { error: updateError } = await client
            .from('profiles')
            .update({
                avatar_url: urlData.publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)

        if (updateError) throw updateError

        return {
            message: 'Avatar uploaded successfully',
            avatar_url: urlData.publicUrl
        }
    } catch (error) {
        console.error('Avatar upload error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error uploading avatar'
        })
    }
})