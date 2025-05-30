// ~/server/api/business-hours/[id].put.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    // 1. Initialize Supabase client correctly
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // 2. Authentication check
    if (!user) {
        throw createError({ statusCode: 401, message: 'Authentication required' })
    }

    // Get business ID from route parameters and body
    const body = await readBody(event)
    const { businessId: bodyBusinessId, dayOfWeek, openTime, closeTime, isClosed } = body
    const businessId = event.context.params?.id || bodyBusinessId

    // Validate businessId
    if (!businessId || !/^\d+$/.test(String(businessId))) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business ID format - must be numeric'
        })
    }

    const numericId = Number(businessId)
    if (numericId <= 0) {
        throw createError({
            statusCode: 400,
            message: 'Invalid business ID value'
        })
    }

    try {
        // 4. Get existing business hour entry
        const { data: existing, error: existError } = await supabase
            .from('business_hours')
            .select('business_id, day_of_week')
            .eq('id', numericId)
            .single()

        if (existError || !existing) {
            throw createError({
                statusCode: 404,
                message: 'Business hour entry not found'
            })
        }

        // 5. Verify business ownership
        const { data: business, error: bizError } = await supabase
            .from('businesses')
            .select('owner_id')
            .eq('id', existing.business_id)
            .single()

        if (bizError || !business || business.owner_id !== user.id) {
            throw createError({
                statusCode: 403,
                message: 'Unauthorized: You do not own this business'
            })
        }

        // 6. Process request body
        const body = await readBody(event)
        const { dayOfWeek, openTime, closeTime, isClosed } = body

        // 7. Validate dayOfWeek if provided
        if (dayOfWeek !== undefined && (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid dayOfWeek - must be number between 0-6'
            })
        }

        // 8. Check for day conflicts if changing dayOfWeek
        if (dayOfWeek !== undefined && dayOfWeek !== existing.day_of_week) {
            const { data: conflict } = await supabase
                .from('business_hours')
                .select('id')
                .eq('business_id', existing.business_id)
                .eq('day_of_week', dayOfWeek)
                .maybeSingle()

            if (conflict) {
                throw createError({
                    statusCode: 409,
                    message: 'Entry for this day already exists'
                })
            }
        }

        // 9. Prepare update payload
        const payload = {
            updated_at: new Date().toISOString(),
            ...(dayOfWeek !== undefined && { day_of_week: Number(dayOfWeek) }),
            ...(openTime !== undefined && { open_time: openTime }),
            ...(closeTime !== undefined && { close_time: closeTime }),
            ...(isClosed !== undefined && { is_closed: Boolean(isClosed) })
        }

        // 10. Perform update
        const { data, error } = await supabase
            .from('business_hours')
            .update(payload)
            .eq('id', numericId)
            .select()
            .single()

        if (error) {
            console.error('Database update error:', error)
            throw createError({
                statusCode: 500,
                message: 'Failed to update business hours'
            })
        }

        // 11. Return standardized response
        return {
            status: 200,
            data: {
                id: data.id,
                business_id: data.business_id,
                day: data.day_of_week,
                open: data.open_time,
                close: data.close_time,
                closed: data.is_closed
            }
        }

    } catch (err) {
        console.error('Update error:', err)

        // Return known errors directly
        if (err.statusCode && err.statusCode !== 500) {
            throw err
        }

        // Generic error for production
        throw createError({
            statusCode: 500,
            message: 'Internal server error'
        })
    }
})