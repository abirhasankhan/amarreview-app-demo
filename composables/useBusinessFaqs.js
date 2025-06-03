import { ref } from 'vue';
import { useApi } from './useApi';

export const useBusinessFaqs = () => {
    const { get, post, put, del } = useApi();

    const loading = ref(false);
    const error = ref(null);

    // Generic fetch handler
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

    // Get all FAQs for a business
    const getFaqs = async (businessId) => {
        return handleFetch(() =>
            get('/business-faqs', { query: { business_id: businessId } })
        );
    };

    // Create a new FAQ
    const createFaq = async (faqData) => {
        return handleFetch(() =>
            post('/business-faqs', faqData)
        );
    };

    // Update an existing FAQ
    const updateFaq = async (id, updateData) => {
        return handleFetch(() =>
            put('/business-faqs', updateData, { query: { id } })
        );
    };

    // Delete an FAQ
    const deleteFaq = async (id) => {
        return handleFetch(() =>
            del('/business-faqs', { query: { id } })
        );
    };

    return {
        loading,
        error,
        getFaqs,
        createFaq,
        updateFaq,
        deleteFaq
    };
};
