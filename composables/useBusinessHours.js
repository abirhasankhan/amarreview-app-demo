import { ref } from 'vue';
import { useApi } from './useApi';

export const useBusinessHours = () => {
    const { get, post, put, del } = useApi();

    const loading = ref(false);
    const error = ref(null);

    const handleFetch = async (fn) => {
        loading.value = true;
        error.value = null;
        try {
            return await fn();
        } catch (err) {
            error.value = err.data?.message || err.message || 'An error occurred';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getBusinessHours = async (businessId) => {
        return handleFetch(async () => {
            const data = await get(`/business-hours/${businessId}`);
            return Array.isArray(data?.data) ? data.data : [];
        });
    };

    const createBusinessHours = async (payload) => {
        return handleFetch(() => post('/business-hours', payload));
    };

    const updateBusinessHours = async (id, payload) => {
        return handleFetch(() => put(`/business-hours/${id}`, payload));
    };

    const deleteBusinessHours = async (id) => {
        return handleFetch(() => del(`/business-hours/${id}`));
    };

    return {
        loading,
        error,
        getBusinessHours,
        createBusinessHours,
        updateBusinessHours,
        deleteBusinessHours
    };
};
