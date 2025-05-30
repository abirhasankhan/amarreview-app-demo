// This endpoint handles searching for businesses
export default defineEventHandler(async (event) => {
    const { query } = getQuery(event);

    if (!query || query.length < 2) {
        return [];
    }

    const client = useSupabaseClient();

    try {
        const { data, error } = await client
            .from('businesses')
            .select('id, name, address')
            .ilike('name', `%${query}%`)
            .limit(5);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error searching businesses:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to search businesses',
        });
    }
});