// composables/useBusinessFaqs.js

export const useBusinessFaqs = () => {
    const config = useRuntimeConfig()

    // Get all FAQs for a business
    const getFaqs = async (businessId) => {
        try {
            return await $fetch('/api/business-faqs', {
                method: 'GET',
                query: { business_id: businessId },
            })
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch FAQs')
        }
    }

    // Create a new FAQ
    const createFaq = async (faqData) => {
        try {
            return await $fetch('/api/business-faqs', {
                method: 'POST',
                body: faqData,
            })
        } catch (error) {
            throw new Error(error.message || 'Failed to create FAQ')
        }
    }

    // Update an existing FAQ
    const updateFaq = async (id, updateData) => {
        try {
            return await $fetch('/api/business-faqs', {
                method: 'PUT',
                query: { id },
                body: updateData,
            })
        } catch (error) {
            throw new Error(error.message || 'Failed to update FAQ')
        }
    }

    // Delete an FAQ
    const deleteFaq = async (id) => {
        try {
            return await $fetch('/api/business-faqs', {
                method: 'DELETE',
                query: { id },
            })
        } catch (error) {
            throw new Error(error.message || 'Failed to delete FAQ')
        }
    }

    return {
        getFaqs,
        createFaq,
        updateFaq,
        deleteFaq
    }
}