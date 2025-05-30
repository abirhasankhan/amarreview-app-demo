import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized'
        })
    }

    // Define validation schema
    const profileSchema = z.object({
        full_name: z.string().optional(),
        bio: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        gender: z.enum(['male', 'female', 'non-binary', 'prefer_not_to_say']).nullable().optional(),
        socials: z.array(
            z.object({
                platform: z.string().min(1),
                icon: z.string().min(1),
                url: z.string().min(1)
            })
        ).optional()
    })

    // Read and validate body
    const body = await readBody(event)
    const result = profileSchema.safeParse(body)

    if (!result.success) {
        const issues = result.error.errors.map(e => e.message).join(', ')
        throw createError({
            statusCode: 400,
            message: `Validation error: ${issues}`
        })
    }
    
    const data = result.data

    // Build update object
    const updates = {
        updated_at: new Date().toISOString()
    }

    if (data.bio !== undefined) updates.bio = data.bio
    if (data.location !== undefined) updates.location = data.location
    if (data.gender !== undefined) updates.gender = data.gender
    if (data.socials !== undefined) updates.socials = data.socials

    try {
        // Update profile
        const { error: updateError } = await client
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (updateError) throw updateError

        // Fetch updated profile
        const { data: updatedProfile, error: fetchError } = await client
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (fetchError) throw fetchError

        return {
            message: 'Profile updated successfully',
            profile: updatedProfile
        }
    } catch (error) {
        console.error('Profile update error:', error)
        throw createError({
            statusCode: 500,
            message: 'Error updating profile'
        })
    }
})
