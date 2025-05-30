// CREATE endpoint
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    // Get Supabase client and user FIRST
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // Authentication check
    if (!user) {
        throw createError({ statusCode: 401, message: 'Authentication required' })
    }

    // Get business ID from route parameters and body
    const body = await readBody(event)
    const { businessId: bodyBusinessId, dayOfWeek, openTime, closeTime, isClosed } = body
    const businessId = event.context.params?.id || bodyBusinessId

    console.log('Route params:', event.context.params)
    console.log('Business ID received:', businessId)
    console.log('Body businessId:', bodyBusinessId)

    // Validate businessId
    if (!businessId || !/^\d+$/.test(String(businessId))) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business ID format - must be numeric'
        })
    }

    const numericBusinessId = Number(businessId)
    if (numericBusinessId <= 0) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business ID value'
        })
    }

    // Validate day of week
    if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
        throw createError({
            statusCode: 400,
            message: 'Invalid dayOfWeek - must be number between 0-6'
        })
    }

    try {
        // Verify business ownership
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', numericBusinessId)
            .single()

        if (bizError || !business) {
            throw createError({
                statusCode: 404,
                message: 'Business not found'
            })
        }

        if (business.owner_id !== user.id) {
            throw createError({
                statusCode: 403,
                message: 'You do not own this business'
            })
        }

        // Check for existing entry
        const { data: existing } = await supabase
            .from('business_hours')
            .select()
            .eq('business_id', numericBusinessId)
            .eq('day_of_week', Number(dayOfWeek))
            .maybeSingle() // Use maybeSingle() instead of single() to avoid error if no record exists

        if (existing) {
            throw createError({
                statusCode: 409,
                message: 'Hours already exist for this day'
            })
        }

        // Create new entry
        const { data, error } = await supabase
            .from('business_hours')
            .insert({
                business_id: numericBusinessId,
                day_of_week: Number(dayOfWeek),
                open_time: openTime || null,
                close_time: closeTime || null,
                is_closed: Boolean(isClosed)
            })
            .select()
            .single()

        if (error) {
            console.error('Database error:', error)
            throw createError({
                statusCode: 500,
                message: 'Failed to create business hours'
            })
        }

        return {
            status: 201,
            data: {
                id: data.id,
                business_id: data.business_id,
                day: data.day_of_week,
                open_time: data.open_time,
                close_time: data.close_time,
                is_closed: data.is_closed
            }
        }

    } catch (err) {
        console.error('Error creating business hours:', err)

        // Return known errors directly
        if (err.statusCode && err.statusCode !== 500) {
            throw err
        }

        // Obfuscate internal errors
        throw createError({
            statusCode: 500,
            message: 'Internal server error'
        })
    }
})