// server/api/businesses/claims/index.get.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    try {
        // Fetch businesses owned by user
        const { data: businessesData, error: bizError } = await supabase
            .from("businesses")
            .select("id, name, city, state, slug")
            .eq("owner_id", user.id)
            .order("name")

        if (bizError) throw bizError

        // Fetch user's claims
        const { data: claimsData, error: claimsError } = await supabase
            .from("business_claims")
            .select("id, business_id, status, rejection_reason")
            .eq("user_id", user.id)

        if (claimsError) throw claimsError

        // Merge data
        const merged = businessesData.map((business) => ({
            ...business,
            claim: claimsData.find((c) => c.business_id === business.id) || null
        }))

        return merged
    } catch (err) {
        console.error("Server error fetching business claims:", err)
        throw createError({
            statusCode: 500,
            statusMessage: err.message || "Internal Server Error"
        })
    }
})
