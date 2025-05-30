// composables/useBusinessClaim.js
import { ref } from 'vue';

export const useBusinessClaim = () => {
    const states = {
        isSubmitting: ref(false),
        isCreatingBusiness: ref(false),
        isSubmittingClaim: ref(false),
        isFetchingBusinesses: ref(false),
        error: ref(null),
        submitted: ref(false),
        businesses: ref([])
    };

    const createBusiness = async (businessData) => {
        states.isCreatingBusiness.value = true;
        try {
            return await $fetch("/api/businesses", {
                method: "POST",
                body: businessData
            });
        } catch (e) {
            states.error.value = e.message || "Failed to create business";
            throw e;
        } finally {
            states.isCreatingBusiness.value = false;
        }
    };

    const submitClaim = async (businessId, role, verificationFile) => {
        states.isSubmittingClaim.value = true;
        states.error.value = null;

        try {
            const formData = new FormData();
            formData.append("business_id", businessId.toString());
            formData.append("role", role);

            if (verificationFile) {
                formData.append("file", verificationFile);
            }

            await $fetch("/api/businesses/claims", {
                method: "POST",
                body: formData,
            });

            states.submitted.value = true;
        } catch (e) {
            let message = "Failed to submit claim.";

            // Check for 409 Conflict (already claimed)
            if (e?.response?.status === 409) {
                message = e.response._data?.message || "You have already claimed this business.";
            }

            states.error.value = message;

            // Optional: show notification if you're using one
            // showNotification(message, 'error');

            throw new Error(message); // allow UI-level handler to catch it too
        } finally {
            states.isSubmittingClaim.value = false;
        }
    };
    
    

    const handleSubmit = async (selectedBusiness, formData) => {
        states.isSubmitting.value = true;
        states.error.value = null;

        try {
            let businessId = selectedBusiness?.id;

            if (!businessId) {
                const { id } = await createBusiness({
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
                businessId = id;
            }

            await submitClaim(businessId, formData.role, formData.verificationFile);

        } catch (e) {
            states.error.value = e.message || "An error occurred during submission.";
        } finally {
            states.isSubmitting.value = false;
        }
    };


    const fetchBusinessesWithClaims = async () => {
        states.isFetchingBusinesses.value = true;
        states.error.value = null;
        try {
            const data = await $fetch("/api/businesses/claims");
            states.businesses.value = data;
            return data;
        } catch (e) {
            states.error.value = e.message || "Failed to fetch businesses and claims";
            throw e;
        } finally {
            states.isFetchingBusinesses.value = false;
        }
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