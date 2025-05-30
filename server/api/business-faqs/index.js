// server/api/business-faqs/index.js
import { z } from 'zod'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

const faqSchema = z.object({
    business_id: z.number().int().positive(),
    question: z.string().min(5).max(500),
    answer: z.string().min(5).max(2000),
    order_index: z.number().int().nonnegative().optional().default(0)
})

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized - Please log in'
        })
    }

    switch (event.method) {
        case 'GET': {
            const { business_id } = getQuery(event)
            if (!business_id) throw createError(400, 'Business ID required')

            const { data, error } = await client
                .from('business_faqs')
                .select('*')
                .eq('business_id', business_id)
                .order('order_index')

            if (error) throw createError(500, error.message)
            return data
        }

        case 'POST': {
            try {
                const body = await readBody(event)
                const validated = faqSchema.parse(body)

                // Verify business ownership
                const { count, error: bizError } = await client
                    .from('businesses')
                    .select('*', { count: 'exact', head: true })
                    .eq('id', validated.business_id)
                    .eq('owner_id', user.id)

                if (bizError) throw createError(500, bizError.message)
                if (count === 0) throw createError(403, 'Business ownership required')

                const { data, error } = await client
                    .from('business_faqs')
                    .insert(validated)
                    .select()
                    .single()

                return error ? createError(500, error.message) : data
            } catch (err) {
                throw createError(err.statusCode || 400, err.message)
            }
        }

        case 'PUT': {
            try {
                const { id } = getQuery(event)
                if (!id) throw createError(400, 'FAQ ID required')

                const body = await readBody(event)
                const validated = faqSchema.partial().parse(body)

                // First verify ownership
                const { data: faqData, error: fetchError } = await client
                    .from('business_faqs')
                    .select('business_id')
                    .eq('id', id)
                    .single()

                if (fetchError) throw createError(404, 'FAQ not found')

                // Check business ownership
                const { count, error: bizError } = await client
                    .from('businesses')
                    .select('*', { count: 'exact', head: true })
                    .eq('id', faqData.business_id)
                    .eq('owner_id', user.id)

                if (bizError) throw createError(500, bizError.message)
                if (count === 0) throw createError(403, 'Update not authorized')

                // Perform update
                const { data, error } = await client
                    .from('business_faqs')
                    .update(validated)
                    .eq('id', id)
                    .select()
                    .single()

                return error ? createError(500, error.message) : data
            } catch (err) {
                throw createError(err.statusCode || 400, err.message)
            }
        }

        case 'DELETE': {
            try {
                const { id } = getQuery(event)
                if (!id) throw createError(400, 'FAQ ID required')

                // First verify ownership
                const { data: faqData, error: fetchError } = await client
                    .from('business_faqs')
                    .select('business_id')
                    .eq('id', id)
                    .single()

                if (fetchError) throw createError(404, 'FAQ not found')

                // Check business ownership
                const { count, error: bizError } = await client
                    .from('businesses')
                    .select('*', { count: 'exact', head: true })
                    .eq('id', faqData.business_id)
                    .eq('owner_id', user.id)

                if (bizError) throw createError(500, bizError.message)
                if (count === 0) throw createError(403, 'Deletion not authorized')

                // Perform deletion
                const { error } = await client
                    .from('business_faqs')
                    .delete()
                    .eq('id', id)

                return error ? createError(500, error.message) : { status: 'success' }
            } catch (err) {
                throw createError(err.statusCode || 400, err.message)
            }
        }

        default:
            throw createError(405, 'Method not allowed')
    }
})