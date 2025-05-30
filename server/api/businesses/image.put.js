// server/api/businesses/image.put.js
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { randomUUID } from 'crypto'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Get business ID from query params or request body
    const businessId = getQuery(event).id || getRouterParam(event, 'id')

    if (!businessId) {
        throw createError({
            statusCode: 400,
            message: 'Business ID is required'
        })
    }

    // Verify user owns/can edit this business
    const { data: business, error: businessError } = await client
        .from('businesses')
        .select('id, owner_id, image')
        .eq('id', businessId)
        .single()

    if (businessError || !business) {
        throw createError({
            statusCode: 404,
            message: 'Business not found'
        })
    }

    if (business.owner_id !== user.id) {
        throw createError({
            statusCode: 403,
            message: 'Forbidden - You do not have permission to edit this business'
        })
    }

    // Read multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || !formData.length) {
        throw createError({
            statusCode: 400,
            message: 'No file provided'
        })
    }

    // Look for 'image' field (matching client-side)
    const file = formData.find(part => part.name === 'image')
    if (!file) {
        throw createError({
            statusCode: 400,
            message: 'Image file not found in request'
        })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed'
        })
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.data.length > maxSize) {
        throw createError({
            statusCode: 400,
            message: 'File too large. Maximum size is 5MB'
        })
    }

    try {
        // Delete old image if it exists
        if (business.image) {
            try {
                const oldPath = business.image.split('/business-photos/')[1]
                if (oldPath) {
                    await client.storage
                        .from('business-photos')
                        .remove([`business-photos/${oldPath}`])
                }
            } catch (deleteError) {
                console.warn('Could not delete old image:', deleteError)
                // Continue anyway - don't fail the upload for this
            }
        }

        // Generate a unique filename
        const fileExt = file.filename?.split('.').pop() || 'jpg'
        const fileName = `${randomUUID()}.${fileExt}`
        const filePath = `business_cover/business_id-${businessId}/${fileName}`

        // Upload file to Supabase Storage
        const { error: uploadError } = await client.storage
            .from('business-photos')
            .upload(filePath, file.data, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw createError({
                statusCode: 500,
                message: 'Failed to upload image to storage'
            })
        }

        // Get public URL
        const { data: urlData, error: urlError } = await client.storage
            .from('business-photos')
            .getPublicUrl(filePath)

        if (urlError) {
            console.error('Error getting public URL:', urlError)
            throw createError({
                statusCode: 500,
                message: 'Error getting public URL'
            })
        }

        console.log('Public URL:', urlData.publicUrl)

        // Update business with new image URL
        const { error: updateError } = await client
            .from('businesses')
            .update({
                image: urlData.publicUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', businessId)

        if (updateError) {
            console.error('Database update error:', updateError)
            throw createError({
                statusCode: 500,
                message: 'Failed to update business record'
            })
        }

        return {
            message: 'Business cover uploaded successfully',
            image: urlData.publicUrl
        }

    } catch (error) {
        // If it's already a createError, just re-throw it
        if (error.statusCode) {
            throw error
        }

        console.error('Business cover upload error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error uploading business cover'
        })
    }
})