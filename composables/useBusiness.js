import { ref } from "vue";

export const useBusiness = () => {
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

    const fetchBusinesses = async (params = {}) => {
        return handleFetch(async () => {
            businesses.value = await $fetch("/api/businesses", {
                method: "GET",
                query: params,
            }).then(businesses => businesses.map(b => ({
                ...b,
                stats: b.stats || { review_count: 0, avg_rating: 0 }
            })));

            return businesses.value;
        });
    };

    const fetchBusinessById = async (id) => {
        try {
            // Validate ID parameter
            if (!id || id === 'undefined') {
                error.value = 'Valid business ID is required';
                return null;
            }

            return await handleFetch(async () => {
                // Clear previous business data
                business.value = null;

                // Fetch business data from API
                const response = await $fetch(`/api/businesses/id/${id}`);

                // Validate response structure
                if (!response?.id) {
                    throw new Error('Invalid business data structure received');
                }

                // Process reviews to ensure consistent user data structure
                const processedReviews = (response.reviews || []).map(review => ({
                    ...review,
                    user: review.user || {
                        id: review.user_id,
                        full_name: 'Unknown User',
                        avatar_url: null
                    }
                }));

                // Structure the business data with fallbacks
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
        } catch (err) {
            // Handle specific error cases
            if (err.response?.status === 404 || err.message.includes('404')) {
                error.value = `Business not found: ${id}`;
            } else {
                error.value = `Failed to load business: ${err.message}`;
            }
            business.value = null;
            throw err;
        }
    };

    const fetchBusinessBySlug = async (slug) => {
        try {
            // Validate slug parameter
            if (!slug || slug === 'undefined') {
                error.value = 'Valid slug parameter is required'
                return null
            }

            return await handleFetch(async () => {
                // Clear previous business data
                business.value = null

                // Fetch new business data
                const response = await $fetch(`/api/businesses/slug/${slug}`)

                // Validate response structure
                if (!response?.id) {
                    throw new Error('Invalid business data structure received')
                }

                // Process reviews to ensure user data is properly structured
                const processedReviews = (response.reviews || []).map(review => ({
                    ...review,
                    // Ensure user object exists and has consistent properties
                    user: review.user || {
                        id: review.user_id,
                        full_name: 'Unknown User',
                        avatar_url: null
                    }
                }))

                business.value = {
                    ...response,
                    // Ensure nested properties exist with proper structure
                    hours: response.hours || [],
                    reviews: processedReviews,
                    category: response.category || null,
                    stats: response.stats || {
                        avg_rating: 0,
                        review_count: 0,
                        total_hours: 0
                    }
                }

                return business.value
            })
        } catch (err) {
            // Handle specific error cases
            if (err.response?.status === 404 || err.message.includes('404')) {
                error.value = `Business not found: ${slug}`
            } else {
                error.value = `Failed to load business: ${err.message}`
            }
            business.value = null
            throw err
        }
    }

    const createBusiness = async (businessData) => {
        return handleFetch(async () => {
            const newBusiness = await $fetch("/api/businesses", {
                method: "POST",
                body: businessData
            });
            businesses.value = [newBusiness, ...businesses.value];
            return newBusiness;
        });
    };


    const updateBusiness = async (id, updates) => {
        return handleFetch(async () => {
            // Filter out null values
            const cleanUpdates = Object.fromEntries(
                Object.entries(updates).filter(([key, value]) => value !== null)
            );

            const response = await $fetch(`/api/businesses?id=${id}`, {
                method: "PUT",
                body: cleanUpdates
            });
            const updatedBusiness = response.data;
            businesses.value = businesses.value.map(b =>
                b.id === updatedBusiness.id ? updatedBusiness : b
            );
            if (business.value?.id === id) {
                business.value = updatedBusiness;
            }
            return updatedBusiness;
        });
    };


    const uploadBusinessCover = async (businessId, file) => {
        if (!file) return

        loading.value = true
        error.value = null

        try {
            const formData = new FormData()
            formData.append('image', file) // Matches server expectation now

            const response = await $fetch(`/api/businesses/image?id=${businessId}`, {
                method: 'PUT',
                body: formData
            })

            if (business.value) {
                business.value.image = response.image
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to upload business cover'
            console.error('Error uploading business cover:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteBusiness = async (id) => {
        return handleFetch(async () => {
            const response = await $fetch(`/api/businesses?id=${id}`, {
                method: "DELETE"
            });
            businesses.value = businesses.value.filter(b => b.id !== id);
            if (business.value?.id === id) {
                business.value = null;
            }
            return response;
        });
    };

    const fetchBusinessesByCategory = async (categoryId, params = {}) => {
        return handleFetch(async () => {
            businesses.value = await $fetch('/api/businesses', {
                method: 'GET',
                query: { ...params, category_id: categoryId }
            });
            return businesses.value;
        });
    };

    const fetchBusinessesByCategorySlug = async (categorySlug, params = {}) => {
        return handleFetch(async () => {
            businesses.value = await $fetch('/api/businesses', {
                method: 'GET',
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