// DELETE endpoint - Delete specific business hours record by its ID
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({ statusCode: 401, message: 'Authentication required' })
    }

    // Get business hours record ID from route params
    const businessHoursId = event.context.params?.id

    console.log('Route params:', event.context.params)
    console.log('Business Hours ID received:', businessHoursId)

    // Validate businessHoursId
    if (!businessHoursId || !/^\d+$/.test(String(businessHoursId))) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business hours ID format - must be numeric'
        })
    }

    const numericHoursId = Number(businessHoursId)
    if (numericHoursId <= 0) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business hours ID value'
        })
    }

    try {
        // Get the business hours record and verify ownership
        const { data: businessHours, error: hoursError } = await supabase
            .from('business_hours')
            .select(`
                id,
                business_id,
                businesses!inner(
                    id,
                    owner_id,
                    name
                )
            `)
            .eq('id', numericHoursId)

        console.log('Business hours query result:', businessHours)
        console.log('Business hours query error:', hoursError)

        if (hoursError) {
            console.error('Database error:', hoursError)
            throw createError({ statusCode: 500, message: 'Database error' })
        }

        if (!businessHours || businessHours.length === 0) {
            throw createError({ statusCode: 404, message: 'Business hours record not found' })
        }

        const hoursRecord = businessHours[0]

        // Verify the user owns the business
        if (hoursRecord.businesses.owner_id !== user.id) {
            throw createError({ statusCode: 403, message: 'Unauthorized access' })
        }

        // Delete the specific business hours record
        const { error: deleteError } = await supabase
            .from('business_hours')
            .delete()
            .eq('id', numericHoursId)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            throw createError({ statusCode: 500, message: 'Deletion failed' })
        }

        return {
            status: 200,
            data: {
                success: true,
                message: `Business hours record ${numericHoursId} deleted successfully`
            }
        }

    } catch (err) {
        console.error('Delete business hours error:', err)
        if (err.statusCode) throw err
        throw createError({ statusCode: 500, message: 'Internal server error' })
    }
})