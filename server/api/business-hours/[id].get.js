// server/api/business-hours/[id].get.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // Validate authentication
    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    // Validate parameters
    const { id: businessId } = event.context.params
    if (!businessId || isNaN(Number(businessId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid business ID format'
        })
    }

    try {
        // Verify business ownership
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', Number(businessId))
            .single()

        if (bizError || !business) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Business not found'
            })
        }

        if (business.owner_id !== user.id) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden: You do not own this business'
            })
        }

        // Fetch business hours
        const { data: hours, error: hoursError } = await supabase
            .from('business_hours')
            .select('*')
            .eq('business_id', Number(businessId))
            .order('day_of_week', { ascending: true })

        if (hoursError) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Database error fetching hours'
            })
        }

        // console.log('Fetched business hours:', hours);
        

        return {
            status: 200,
            data: hours || [],
            message: hours?.length ? 'Hours found' : 'No hours configured'
        }

    } catch (err) {
        console.error('Business hours error:', err)

        // Handle known error types
        if (err.statusCode) {
            throw err
        }

        // Generic error fallback
        throw createError({
            statusCode: 500,
            statusMessage: 'Internal server error',
            data: {
                originalError: err.message
            }
        })
    }
})