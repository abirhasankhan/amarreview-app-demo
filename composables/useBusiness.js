import { ref } from "vue";
import { useApi } from "./useApi";


export const useBusiness = () => {

    const { get, post, put, del } = useApi();

    const businesses = ref([]);
    const business = ref(null);
    const loading = ref(false);
    const error = ref(null);

    // Generic fetch handler
    const handleFetch = async (fn) => {
        loading.value = true;
        error.value = null;
        try {
            return await fn();
        } catch (err) {
            error.value = err.data?.message || err.message || "An error occurred";
            throw err;
        } finally {
            loading.value = false;
        }
    };

    // Fetch all businesses
    const fetchBusinesses = async (params = {}) => {
        return handleFetch(async () => {
            const data = await get("/businesses", { query: params });
            businesses.value = data.map(b => ({
                ...b,
                stats: b.stats || { review_count: 0, avg_rating: 0 }
            }));
            return businesses.value;
        });
    };

    // Fetch business by ID
    const fetchBusinessById = async (id) => {
        if (!id || id === 'undefined') {
            error.value = 'Valid business ID is required';
            return null;
        }

        return await handleFetch(async () => {
            business.value = null;
            const response = await get(`/businesses/id/${id}`);

            if (!response?.id) throw new Error('Invalid business data structure received');

            const processedReviews = (response.reviews || []).map(review => ({
                ...review,
                user: review.user || {
                    id: review.user_id,
                    full_name: 'Unknown User',
                    avatar_url: null
                }
            }));

            business.value = {
                ...response,
                hours: response.hours || [],
                reviews: processedReviews,
                category: response.category || null,
                stats: response.stats || {
                    avg_rating: 0,
                    review_count: 0,
                    total_hours: 0
                }
            };
            return business.value;
        });
    };

    // Fetch business by slug
    const fetchBusinessBySlug = async (slug) => {
        if (!slug || slug === 'undefined') {
            error.value = 'Valid slug parameter is required';
            return null;
        }

        return await handleFetch(async () => {
            business.value = null;
            const response = await get(`/businesses/slug/${slug}`);

            if (!response?.id) throw new Error('Invalid business data structure received');

            const processedReviews = (response.reviews || []).map(review => ({
                ...review,
                user: review.user || {
                    id: review.user_id,
                    full_name: 'Unknown User',
                    avatar_url: null
                }
            }));

            business.value = {
                ...response,
                hours: response.hours || [],
                reviews: processedReviews,
                category: response.category || null,
                stats: response.stats || {
                    avg_rating: 0,
                    review_count: 0,
                    total_hours: 0
                }
            };
            return business.value;
        });
    };


    // Create a new business
    const createBusiness = async (businessData) => {
        return handleFetch(async () => {
            const newBusiness = await post("/businesses", businessData);
            businesses.value = [newBusiness, ...businesses.value];
            return newBusiness;
        });
    };

    // Update an existing business
    const updateBusiness = async (id, updates) => {
        return handleFetch(async () => {
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([_, value]) => value !== null)
            );
            const updatedBusiness = await put(`/businesses?id=${id}`, cleanUpdates);
            businesses.value = businesses.value.map(b =>
                b.id === updatedBusiness.id ? updatedBusiness : b
            );
            if (business.value?.id === id) {
                business.value = updatedBusiness;
            }
            return updatedBusiness;
        });
    };

    // Upload business cover
    const uploadBusinessCover = async (businessId, file) => {
        if (!file) return;
        loading.value = true;
        error.value = null;

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await $fetch(`${useRuntimeConfig().public.apiBase}/businesses/image?id=${businessId}`, {
                method: 'PUT',
                body: formData
            });

            if (business.value) {
                business.value.image = response.image;
            }
            return response;
            
        } catch (err) {
            error.value = err.message || 'Failed to upload business cover';
            console.error('Error uploading business cover:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };


    // Delete a business
    const deleteBusiness = async (id) => {
        return handleFetch(async () => {
            await del(`/businesses?id=${id}`);
            businesses.value = businesses.value.filter(b => b.id !== id);
            if (business.value?.id === id) {
                business.value = null;
            }
        });
    };

    // Fetch businesses by category
    const fetchBusinessesByCategory = async (categoryId, params = {}) => {
        return handleFetch(async () => {
            businesses.value = await get('/businesses', {
                query: { ...params, category_id: categoryId }
            });
            return businesses.value;
        });
    };

    // Fetch businesses by category
    const fetchBusinessesByCategorySlug = async (categorySlug, params = {}) => {
        return handleFetch(async () => {
            businesses.value = await get('/businesses', {
                query: { ...params, category_slug: categorySlug }
            });
            return businesses.value;
        });
    };

    return {
        businesses,
        business,
        loading,
        error,
        fetchBusinesses,
        fetchBusinessById,
        fetchBusinessBySlug,
        createBusiness,
        updateBusiness,
        uploadBusinessCover,
        deleteBusiness,
        fetchBusinessesByCategory,
        fetchBusinessesByCategorySlug
    };
};