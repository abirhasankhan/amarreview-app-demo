import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { defineEventHandler, getQuery, readBody, createError } from "h3";
import { z } from "zod";

// Schema validations
const businessSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive', 'pending']).optional(),
    image: z.string().url().or(z.literal('')).nullable().optional(),
    phone: z.string().nullable().optional(),
    email: z.string().email().or(z.literal('')).nullable().optional(),
    website: z.string().url().or(z.literal('')).nullable().optional(),
    address: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    postal_code: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    category_id: z.number().positive(),
});

const generateSlug = (name) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
        .substring(0, 64); // Limit slug length
};

const updateBusinessSchema = businessSchema
    .omit({ status: true, verified: true, verification_submitted_at: true, verification_approved_at: true })
    .partial();

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const method = event.method;

    // Only fetch user if needed
    let user = null;

    try {
        // Authorization check for write operations
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            
            user = await serverSupabaseUser(event);
            if (!user) {
                throw createError({
                    statusCode: 401,
                    message: 'Unauthorized',
                });
            }
        }

        if (method === "GET") {
            const query = getQuery(event);
            const id = query.id ? Number(query.id) : null;

            // If ID is provided, fetch single business
            if (id) {
                const { data, error } = await supabase
                    .from("businesses")
                    .select(`
                        *,
                        category:categories(id, name),
                        reviews(*)
                    `)
                    .eq('id', id)
                    .single();

                if (error) {
                    throw createError({
                        statusCode: 404,
                        message: 'Business not found'
                    });
                }

                // Calculate review stats for single business
                const reviews = data.reviews || [];
                const review_count = reviews.length;
                const avg_rating = review_count
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / review_count
                    : 0;

                return {
                    ...data,
                    stats: {
                        review_count,
                        avg_rating,
                    },
                };
            }

            // Otherwise, fetch all businesses
            const { data, error } = await supabase
                .from("businesses")
                .select(`
                    *,
                    category:categories(id, name),
                    reviews(*)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Map businesses to include review stats
            const enriched = data.map(b => {
                const reviews = b.reviews || [];
                const review_count = reviews.length;
                const avg_rating = review_count
                    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / review_count
                    : 0;

                return {
                    ...b,
                    stats: {
                        review_count,
                        avg_rating,
                    },
                };
            });

            return enriched;
        }

        // POST: Create new business
        if (method === "POST") {
            const body = await readBody(event);

            const parsed = businessSchema.safeParse(body);

            if (!parsed.success) {
                const errorMessage = parsed.error.errors.map(e =>
                    `${e.path.join('.')}: ${e.message}`
                ).join(', ');

                throw createError({
                    statusCode: 400,
                    message: `Validation failed: ${errorMessage}`
                });
            }

            // Generate base slug
            const baseSlug = generateSlug(parsed.data.name);
            let finalSlug = baseSlug;

            // Fetch all slugs that start with baseSlug
            const { data: existing, error: slugCheckError } = await supabase
                .from("businesses")
                .select("slug")
                .ilike("slug", `${baseSlug}%`);

            if (slugCheckError) {
                throw createError({
                    statusCode: 500,
                    message: "Failed to check existing slugs: " + slugCheckError.message
                });
            }

            if (existing && existing.length > 0) {
                const slugSet = new Set(existing.map(s => s.slug));
                let counter = 1;
                while (slugSet.has(finalSlug)) {
                    finalSlug = `${baseSlug}-${counter}`;
                    counter++;
                }
            }

            // Create business
            const { data, error } = await supabase
                .from("businesses")
                .insert([{
                    ...parsed.data,
                    slug: finalSlug,
                    owner_id: user?.id,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) {
                throw createError({ statusCode: 500, message: error.message });
            }

            return {
                success: true,
                id: data.id,
                data // full business object
            };
        }

        // PUT: Update a business
        if (method === "PUT") {
            const body = await readBody(event);
            const query = getQuery(event);

            // Get ID from query parameters (from URL like /api/businesses?id=30)
            const id = query.id ? Number(query.id) : null;

            if (!id || isNaN(id)) {
                throw createError({
                    statusCode: 400,
                    message: "Invalid business ID",
                });
            }

            // Validate request body
            const parsed = updateBusinessSchema.safeParse(body);
            if (!parsed.success) {
                const errorMessage = parsed.error.errors.map(e =>
                    `${e.path.join('.')}: ${e.message}`
                ).join(', ');

                throw createError({
                    statusCode: 400,
                    message: `Validation failed: ${errorMessage}`
                });
            }

            // Check ownership
            const { data: existingBusiness, error: fetchError } = await supabase
                .from('businesses')
                .select('owner_id')
                .eq('id', id)
                .single();

            if (fetchError) {
                throw createError({ statusCode: 500, message: 'Error fetching business' });
            }

            if (existingBusiness?.owner_id !== user.id) {
                throw createError({ statusCode: 403, message: 'Forbidden' });
            }

            // Prevent slug updates
            const updates = { ...parsed.data };
            delete updates.slug;

            // Update business
            const { data, error } = await supabase
                .from("businesses")
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .select()
                .single();

            if (error) {
                throw createError({ statusCode: 500, message: 'Update failed: ' + error.message });
            }

            return {
                success: true,
                data
            };
        }

        // DELETE: Remove a business
        if (method === "DELETE") {
            const query = getQuery(event);
            const id = Number(query.id);

            if (!id || isNaN(id)) {
                throw createError({
                    statusCode: 400,
                    message: "Invalid business ID",
                });
            }

            // Check ownership
            const { data: existingBusiness, error: fetchError } = await supabase
                .from('businesses')
                .select('owner_id')
                .eq('id', id)
                .single();

            if (fetchError) {
                throw createError({ statusCode: 500, message: 'Error fetching business' });
            }

            if (existingBusiness?.owner_id !== user.id) {
                throw createError({ statusCode: 403, message: 'Forbidden' });
            }

            const { error } = await supabase
                .from("businesses")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return { success: true };
        }

        throw createError({
            statusCode: 405,
            message: `Method ${method} Not Allowed`,
        });
    } catch (err) {
        console.error(`API Error (${method}):`, err);
        throw createError({
            statusCode: err.statusCode || 500,
            message: err.message || "Internal Server Error",
        });
    }
});