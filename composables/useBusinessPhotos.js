import { ref, computed } from 'vue';
import { useApi } from './useApi';

export const useBusinessPhotos = () => {
    const { get, post, put, del } = useApi();

    const photos = ref([]);
    const currentPhoto = ref(null);
    const loading = ref(false);
    const uploading = ref(false);
    const deleting = ref(false);
    const updating = ref(false);
    const error = ref(null);

    const pagination = ref({
        limit: 20,
        offset: 0,
        total: 0,
        hasMore: false,
    });

    const clearError = () => {
        error.value = null;
    };

    const fetchPhotos = async (businessId, options = {}) => {
        if (!businessId || isNaN(businessId)) {
            error.value = 'Valid business ID required';
            return [];
        }
        try {
            loading.value = true;
            clearError();

            const queryParams = new URLSearchParams({
                business_id: businessId.toString(),
                limit: (options.limit || pagination.value.limit).toString(),
                offset: (options.offset || pagination.value.offset).toString(),
            });

            const data = await get(`/business-photos?${queryParams.toString()}`);

            const photoArray = Array.isArray(data) ? data : [];

            if (options.append) {
                photos.value = [...photos.value, ...photoArray];
            } else {
                photos.value = photoArray;
                pagination.value.offset = 0;
            }

            // You may want to get total from API if available
            pagination.value.total = photoArray.length;
            pagination.value.hasMore = photoArray.length >= pagination.value.limit;

            return photoArray;
        } catch (err) {
            console.error('Error fetching photos:', err);
            error.value = err?.message || 'Failed to fetch photos';
            return [];
        } finally {
            loading.value = false;
        }
    };

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

            const data = await post('/business-photos', formData);

            const photoArray = Array.isArray(data) ? data : [data];
            if (photoArray.length > 0) {
                photos.value.unshift(...photoArray);
            }

            return photoArray;
        } catch (err) {
            console.error('Error uploading photo:', err);
            error.value = err?.message || 'Failed to upload photo';
            return null;
        } finally {
            uploading.value = false;
        }
    };

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

            Array.from(files).forEach(file => {
                formData.append('files', file); // or 'file' if your backend expects it differently
            });

            const data = await post('/business-photos', formData);

            const photoArray = Array.isArray(data) ? data : [data];
            if (photoArray.length > 0) {
                photos.value = [...photoArray, ...photos.value];
            }

            return photoArray;
        } catch (err) {
            console.error('Error uploading multiple photos:', err);
            error.value = err?.message || 'Failed to upload photos';
            return [];
        } finally {
            uploading.value = false;
        }
    };

    const updatePhoto = async (photoId, updates) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return null;
        }
        try {
            updating.value = true;
            clearError();

            const data = await put(`/business-photos/${photoId}`, updates);

            // Update locally
            const index = photos.value.findIndex(p => p.id === photoId);
            if (index !== -1) {
                photos.value.splice(index, 1, { ...photos.value[index], ...data });
            }

            return data;
        } catch (err) {
            console.error('Error updating photo:', err);
            error.value = err?.message || 'Failed to update photo';
            return null;
        } finally {
            updating.value = false;
        }
    };

    const deletePhoto = async (photoId) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return false;
        }
        try {
            deleting.value = true;
            clearError();

            await del(`/business-photos/${photoId}`);

            photos.value = photos.value.filter(p => p.id !== photoId);
            return true;
        } catch (err) {
            console.error('Error deleting photo:', err);
            error.value = err?.message || 'Failed to delete photo';
            return false;
        } finally {
            deleting.value = false;
        }
    };

    const getPhoto = async (photoId) => {
        if (!photoId) {
            error.value = 'Photo ID required';
            return null;
        }
        try {
            loading.value = true;
            clearError();

            const data = await get(`/business-photos/${photoId}`);

            currentPhoto.value = data;
            return data;
        } catch (err) {
            console.error('Error fetching photo:', err);
            error.value = err?.message || 'Failed to fetch photo';
            return null;
        } finally {
            loading.value = false;
        }
    };

    const loadMore = async (businessId) => {
        if (!pagination.value.hasMore || loading.value) return;

        pagination.value.offset += pagination.value.limit;
        await fetchPhotos(businessId, {
            append: true,
            offset: pagination.value.offset,
        });
    };

    const resetPagination = () => {
        pagination.value = {
            limit: 20,
            offset: 0,
            total: 0,
            hasMore: false,
        };
    };

    const approvedPhotos = computed(() =>
        photos.value.filter(p => p.approved === true)
    );

    const pendingPhotos = computed(() =>
        photos.value.filter(p => p.approved === false || p.approved === null)
    );

    const totalPhotos = computed(() => photos.value.length);
    const hasPhotos = computed(() => photos.value.length > 0);

    const findPhotoById = (photoId) => photos.value.find(p => p.id === photoId);
    const getPhotoIndex = (photoId) => photos.value.findIndex(p => p.id === photoId);

    const clearAll = () => {
        photos.value = [];
        currentPhoto.value = null;
        clearError();
        resetPagination();
    };

    return {
        photos: computed(() => photos.value),
        currentPhoto: computed(() => currentPhoto.value),
        loading: computed(() => loading.value),
        uploading: computed(() => uploading.value),
        deleting: computed(() => deleting.value),
        updating: computed(() => updating.value),
        error: computed(() => error.value),
        pagination: computed(() => pagination.value),

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

        approvedPhotos,
        pendingPhotos,
        totalPhotos,
        hasPhotos,

        findPhotoById,
        getPhotoIndex,
    };
};
