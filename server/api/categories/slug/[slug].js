import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    // Initialize Supabase client properly
    const supabase = await serverSupabaseClient(event)
    const slug = event.context.params?.slug

    try {
        // Verify Supabase client exists
        if (!supabase?.from) {
            throw new Error('Supabase client not initialized')
        }

        // Fetch category
        const { data: category, error: categoryError } = await supabase
            .from('categories')
            .select('id,name, image, slug')
            .eq('slug', slug)
            .single()

        if (categoryError || !category) {
            throw {
                code: 'CATEGORY_NOT_FOUND',
                message: `Category "${slug}" not found`,
                details: categoryError
            }
        }

        // Fetch businesses with reviews
        const { data: businesses, error: bizError } = await supabase
            .from('businesses')
            .select(`
                id,
                name,
                slug,
                description,
                image,
                status,
                verified,
                created_at,
                reviews:reviews(id,rating)
            `)
            .eq('category_id', category.id)

        if (bizError) {
            throw {
                code: 'BUSINESSES_ERROR',
                message: 'Failed to load businesses',
                details: bizError
            }
        }

        // Process businesses data
        const processedBusinesses = businesses.map(biz => {
            const reviews = biz.reviews || []
            const totalRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0)
            const avgRating = reviews.length ? Number((totalRating / reviews.length).toFixed(1)) : 0

            return {
                ...biz,
                reviews: undefined, // Remove raw reviews
                avg_rating: avgRating,
                review_count: reviews.length
            }
        })

        return {
            ...category,
            businesses: processedBusinesses
        }

    } catch (error) {
        console.error('API Error:', {
            slug,
            errorCode: error.code,
            message: error.message,
            supabaseError: error.details
        })

        throw createError({
            statusCode: error.code === 'CATEGORY_NOT_FOUND' ? 404 : 500,
            statusMessage: error.message
        })
    }
})