// composables/useBusinessPhotos.js
import { ref, computed } from 'vue';

export const useBusinessPhotos = () => {
    // Reactive state
    const photos = ref([]);
    const currentPhoto = ref(null);
    const loading = ref(false);
    const uploading = ref(false);
    const deleting = ref(false);
    const updating = ref(false);
    const error = ref(null);

    // Pagination state
    const pagination = ref({
        limit: 20,
        offset: 0,
        total: 0,
        hasMore: false
    });

    // Clear error helper
    const clearError = () => {
        error.value = null;
    };

    // Fetch photos for a business
    const fetchPhotos = async (businessId, options = {}) => {
        if (!businessId || isNaN(businessId)) {
            error.value = 'Valid business ID required';
            return [];
        }

        try {
            loading.value = true;
            clearError();

            // Use $fetch if available (Nuxt), otherwise use fetch
            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            const queryParams = new URLSearchParams({
                business_id: businessId.toString(),
                limit: (options.limit || pagination.value.limit).toString(),
                offset: (options.offset || pagination.value.offset).toString()
            });

            let data;
            if (fetchFn === fetch) {
                const response = await fetch(`/api/business-photos?${queryParams}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                data = result.data || result;
            } else {
                const result = await fetchFn('/api/business-photos', {
                    method: 'GET',
                    query: Object.fromEntries(queryParams)
                });
                data = result.data || result;
            }

            // Ensure data is an array
            const photoArray = Array.isArray(data) ? data : [];

            if (options.append) {
                photos.value = [...photos.value, ...photoArray];
            } else {
                photos.value = photoArray;
                pagination.value.offset = 0;
            }

            pagination.value.total = photoArray.length; // This should come from API response
            pagination.value.hasMore = photoArray.length >= pagination.value.limit;

            return photoArray;

        } catch (err) {
            console.error('Error fetching photos:', err);
            error.value = err.data?.message || err.message || 'Failed to fetch photos';
            return [];
        } finally {
            loading.value = false;
        }
    };

    // Upload single photo
    const uploadPhoto = async ({ businessId, file, caption }) => {
        if (!businessId || !file) {
            error.value = 'Business ID and file required';
            return null;
        }

        try {
            uploading.value = true;
            clearError();

            const formData = new FormData();
            formData.append('business_id', businessId.toString());
            formData.append('file', file);
            if (caption) formData.append('caption', caption);

            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            let data;
            if (fetchFn === fetch) {
                const response = await fetch('/api/business-photos', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            } else {
                data = await fetchFn('/api/business-photos', {
                    method: 'POST',
                    body: formData
                });
            }

            const photoArray = Array.isArray(data) ? data : [data];
            if (photoArray.length > 0) {
                photos.value.unshift(...photoArray);
            }

            return photoArray;

        } catch (err) {
            console.error('Error uploading photo:', err);
            error.value = err.data?.message || err.message || 'Failed to upload photo';
            return null;
        } finally {
            uploading.value = false;
        }
    };

    // Upload multiple photos
    const uploadMultiplePhotos = async ({ businessId, files, caption }) => {
        if (!businessId || !files?.length) {
            error.value = 'Business ID and files required';
            return [];
        }

        try {
            uploading.value = true;
            clearError();

            const formData = new FormData();
            formData.append('business_id', businessId.toString());
            if (caption) formData.append('caption', caption);

            // Append each file
            Array.from(files).forEach(file => {
                formData.append('files', file); // Changed from 'file' to 'files' for multiple
            });

            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            let data;
            if (fetchFn === fetch) {
                const response = await $fetch('/api/business-photos', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            } else {
                data = await fetchFn('/api/business-photos', {
                    method: 'POST',
                    body: formData
                });
            }

            const photoArray = Array.isArray(data) ? data : [data];
            if (photoArray.length > 0) {
                photos.value = [...photoArray, ...photos.value];
            }

            return photoArray;

        } catch (err) {
            console.error('Error uploading multiple photos:', err);
            error.value = err.data?.message || err.message || 'Failed to upload photos';
            return [];
        } finally {
            uploading.value = false;
        }
    };

    // Update photo metadata
    const updatePhoto = async (photoId, updates) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return null;
        }

        try {
            updating.value = true;
            clearError();

            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            let data;
            if (fetchFn === fetch) {
                const response = await fetch(`/api/business-photos/${photoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            } else {
                data = await fetchFn(`/api/business-photos/${photoId}`, {
                    method: 'PUT',
                    body: updates
                });
            }

            // Update the photo in the local array
            const index = photos.value.findIndex(p => p.id === photoId);
            if (index !== -1) {
                photos.value.splice(index, 1, { ...photos.value[index], ...data });
            }

            return data;

        } catch (err) {
            console.error('Error updating photo:', err);
            error.value = err.data?.message || err.message || 'Failed to update photo';
            return null;
        } finally {
            updating.value = false;
        }
    };

    // Delete photo
    const deletePhoto = async (photoId) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return false;
        }

        try {
            deleting.value = true;
            clearError();

            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            if (fetchFn === fetch) {
                const response = await fetch(`/api/business-photos/${photoId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } else {
                await fetchFn(`/api/business-photos/${photoId}`, {
                    method: 'DELETE'
                });
            }

            // Remove photo from local array
            photos.value = photos.value.filter(p => p.id !== photoId);
            return true;

        } catch (err) {
            console.error('Error deleting photo:', err);
            error.value = err.data?.message || err.message || 'Failed to delete photo';
            return false;
        } finally {
            deleting.value = false;
        }
    };

    // Get single photo
    const getPhoto = async (photoId) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return null;
        }

        try {
            loading.value = true;
            clearError();

            const fetchFn = typeof $fetch !== 'undefined' ? $fetch : fetch;

            let data;
            if (fetchFn === fetch) {
                const response = await fetch(`/api/business-photos/${photoId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                data = await response.json();
            } else {
                data = await fetchFn(`/api/business-photos/${photoId}`);
            }

            currentPhoto.value = data;
            return data;

        } catch (err) {
            console.error('Error fetching photo:', err);
            error.value = err.data?.message || err.message || 'Failed to fetch photo';
            return null;
        } finally {
            loading.value = false;
        }
    };

    // Load more photos (pagination)
    const loadMore = async (businessId) => {
        if (!pagination.value.hasMore || loading.value) return;

        pagination.value.offset += pagination.value.limit;
        await fetchPhotos(businessId, {
            append: true,
            offset: pagination.value.offset
        });
    };

    // Reset pagination
    const resetPagination = () => {
        pagination.value = {
            limit: 20,
            offset: 0,
            total: 0,
            hasMore: false
        };
    };

    // Computed properties
    const approvedPhotos = computed(() =>
        photos.value.filter(p => p.approved === true)
    );

    const pendingPhotos = computed(() =>
        photos.value.filter(p => p.approved === false || p.approved === null)
    );

    const totalPhotos = computed(() => photos.value.length);

    const hasPhotos = computed(() => photos.value.length > 0);

    // Utility methods
    const findPhotoById = (photoId) => {
        return photos.value.find(p => p.id === photoId);
    };

    const getPhotoIndex = (photoId) => {
        return photos.value.findIndex(p => p.id === photoId);
    };

    // Clear all data
    const clearAll = () => {
        photos.value = [];
        currentPhoto.value = null;
        clearError();
        resetPagination();
    };

    return {
        // State (as computed to make them readonly)
        photos: computed(() => photos.value),
        currentPhoto: computed(() => currentPhoto.value),
        loading: computed(() => loading.value),
        uploading: computed(() => uploading.value),
        deleting: computed(() => deleting.value),
        updating: computed(() => updating.value),
        error: computed(() => error.value),
        pagination: computed(() => pagination.value),

        // Methods
        fetchPhotos,
        uploadPhoto,
        uploadMultiplePhotos,
        updatePhoto,
        deletePhoto,
        getPhoto,
        loadMore,
        clearError,
        resetPagination,
        clearAll,

        // Computed properties
        approvedPhotos,
        pendingPhotos,
        totalPhotos,
        hasPhotos,

        // Utility methods
        findPhotoById,
        getPhotoIndex
    };
};