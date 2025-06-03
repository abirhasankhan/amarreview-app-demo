import { ref } from 'vue';
import { useApi } from './useApi';

export const useBusinessClaim = () => {
    const { get, post } = useApi();

    const states = {
        isSubmitting: ref(false),
        isCreatingBusiness: ref(false),
        isSubmittingClaim: ref(false),
        isFetchingBusinesses: ref(false),
        error: ref(null),
        submitted: ref(false),
        businesses: ref([])
    };

    // Generic fetch handler
    const handleFetch = async (fn, loadingRef) => {
        loadingRef.value = true;
        states.error.value = null;
        try {
            return await fn();
        } catch (e) {
            states.error.value = e.data?.message || e.message || "An error occurred";
            throw e;
        } finally {
            loadingRef.value = false;
        }
    };

    const createBusiness = async (businessData) => {
        return handleFetch(async () => {
            const newBusiness = await post('/businesses', businessData);
            return newBusiness;
        }, states.isCreatingBusiness);
    };

    const submitClaim = async (businessId, role, verificationFile) => {
        return handleFetch(async () => {
            const formData = new FormData();
            formData.append('business_id', businessId.toString());
            formData.append('role', role);
            if (verificationFile) {
                formData.append('file', verificationFile);
            }
            // Using raw fetch here because post() from useApi may not handle FormData correctly
            const response = await fetch(`${useRuntimeConfig().public.apiBase}/businesses/claims`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                if (response.status === 409) {
                    const errorData = await response.json();
                    throw { data: { message: errorData.message || 'You have already claimed this business.' }, response };
                }
                throw new Error('Failed to submit claim.');
            }
            states.submitted.value = true;
        }, states.isSubmittingClaim);
    };

    const handleSubmit = async (selectedBusiness, formData) => {
        states.isSubmitting.value = true;
        states.error.value = null;
        try {
            let businessId = selectedBusiness?.id;

            if (!businessId) {
                const newBusiness = await createBusiness({
                    name: formData.businessName,
                    description: formData.description,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postal_code: formData.postalCode,
                    country: formData.country,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    category_id: formData.categoryId,
                });
                businessId = newBusiness.id;
            }

            await submitClaim(businessId, formData.role, formData.verificationFile);

        } catch (e) {
            states.error.value = e.data?.message || e.message || "An error occurred during submission.";
        } finally {
            states.isSubmitting.value = false;
        }
    };

    const fetchBusinessesWithClaims = async () => {
        return handleFetch(async () => {
            const data = await get('/businesses/claims');
            states.businesses.value = data;
            return data;
        }, states.isFetchingBusinesses);
    };

    const reset = () => {
        states.isSubmitting.value = false;
        states.isCreatingBusiness.value = false;
        states.isSubmittingClaim.value = false;
        states.isFetchingBusinesses.value = false;
        states.error.value = null;
        states.submitted.value = false;
        states.businesses.value = [];
    };

    return {
        ...states,
        handleSubmit,
        reset,
        fetchBusinessesWithClaims
    };
};
