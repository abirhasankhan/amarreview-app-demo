import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import { defineEventHandler, getQuery, readBody, createError } from "h3";
import { z } from "zod";

// Schema validations
const categorySchema = z.object({
    name: z.string().min(2),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
    image: z.string().url().optional(),
});

const updateCategorySchema = categorySchema.partial();

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event);
    const method = event.method;

    try {
        // Authorization check for write operations
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
            const user = await serverSupabaseUser(event);
            if (!user) {
                throw createError({
                    statusCode: 401,
                    message: 'Unauthorized',
                });
            }
        }

        // GET: Fetch all categories
        if (method === "GET") {
            const { data, error } = await supabase
                .from("categories")
                .select("*, businesses(count)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            

            return data.map(c => ({
                ...c,
                businessCount: c.businesses?.[0]?.count ?? 0
            }));
            
        }


        // POST: Create new category
        if (method === "POST") {
            const body = await readBody(event);
            const parsed = categorySchema.safeParse(body);

            if (!parsed.success) {
                throw createError({
                    statusCode: 400,
                    message: parsed.error.errors[0].message,
                });
            }

            const { data, error } = await supabase
                .from("categories")
                .insert([parsed.data])
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // PUT: Update a category
        if (method === "PUT") {
            const body = await readBody(event);
            const parsed = updateCategorySchema.safeParse(body);

            if (!parsed.success) {
                throw createError({
                    statusCode: 400,
                    message: parsed.error.errors[0].message,
                });
            }

            const { id, ...updates } = body;
            if (!id || isNaN(Number(id))) {
                throw createError({
                    statusCode: 400,
                    message: "Invalid category ID",
                });
            }

            const { data, error } = await supabase
                .from("categories")
                .update(updates)
                .eq("id", Number(id))
                .select()
                .single();

            if (error) throw error;
            return data;
        }

        // DELETE: Remove a category
        if (method === "DELETE") {
            const query = getQuery(event);
            const id = Number(query.id);

            if (!id || isNaN(id)) {
                throw createError({
                    statusCode: 400,
                    message: "Invalid category ID",
                });
            }

            const { error } = await supabase
                .from("categories")
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