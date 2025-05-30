<template>
    <NuxtLayout name="business">
        <div class="max-w-4xl mx-auto space-y-6">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center p-8 text-gray-500">
                <Icon name="eos-icons:loading" class="w-8 h-8 animate-spin" />
                <p class="mt-2">Loading business profile...</p>
            </div>

            <!-- Content -->
            <div v-else>
                <!-- Cover Image -->
                <div class="relative w-full aspect-[3/1] rounded-lg overflow-hidden shadow-sm">
                    <img v-if="business?.image" :src="business.image" alt="Business cover image"
                        class="w-full h-full object-cover object-center" />
                    <div v-else
                        class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-lg">
                        No cover image
                    </div>

                    <!-- Upload Button -->
                    <div class="absolute bottom-4 right-4">
                        <input type="file" id="business-image-upload" accept="image/*" class="hidden"
                            @change="handleImageUpload" :disabled="isUploading" />
                        <label for="business-image-upload"
                            class="inline-flex items-center px-3 py-1.5 bg-white/80 text-sm text-gray-800 rounded-md hover:bg-white shadow transition"
                            :class="{ 'opacity-50 cursor-not-allowed': isUploading }">
                            <Icon :name="isUploading ? 'eos-icons:loading' : 'ic:baseline-upload'"
                                :class="['w-4 h-4 mr-1', { 'animate-spin': isUploading }]" />
                            {{ isUploading ? 'Uploading...' : 'Change Cover' }}
                        </label>
                    </div>
                </div>

                <!-- Profile Edit Form -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <ClientOnly>
                        <form @submit.prevent="saveProfile" class="space-y-6">
                            <!-- Header -->
                            <div class="flex items-center justify-between">
                                <h1 class="text-2xl font-semibold">Business Profile</h1>
                                <div v-if="isSaving" class="text-sm text-gray-600">
                                    <Icon name="eos-icons:loading" class="w-4 h-4 mr-1 animate-spin inline" />
                                    Saving changes...
                                </div>
                            </div>

                            <!-- Basic Information -->
                            <section class="space-y-4">
                                <h2 class="text-lg font-medium border-b pb-2">Basic Information</h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Business Name" required :error="validationErrors.name">
                                        <input v-model="form.name" type="text" class="form-input" />
                                    </FormField>

                                    <FormField label="Category" required :error="validationErrors.category_id">
                                        <select v-model="form.category_id" class="form-input">
                                            <option value="">Select a category</option>
                                            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                                                {{ cat.name }}
                                            </option>
                                        </select>
                                        <div class="mt-2 text-sm text-gray-500">
                                            Selected: {{ selectedCategoryName || 'None' }}
                                        </div>
                                    </FormField>

                                    <FormField class="md:col-span-2" label="Description" required
                                        :error="validationErrors.description">
                                        <textarea v-model="form.description" rows="3" class="form-input" />
                                    </FormField>
                                </div>
                            </section>

                            <!-- Contact Information -->
                            <section class="space-y-4">
                                <h2 class="text-lg font-medium border-b pb-2">Contact Information</h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField label="Phone" required :error="validationErrors.phone">
                                        <input v-model="form.phone" type="tel" class="form-input" />
                                    </FormField>

                                    <FormField label="Email" required :error="validationErrors.email">
                                        <input v-model="form.email" type="email" class="form-input" />
                                    </FormField>

                                    <FormField label="Website" :error="validationErrors.website">
                                        <input v-model="form.website" type="url" class="form-input" />
                                    </FormField>

                                    <FormField label="Social Media">
                                        <input v-model="form.social" type="text" placeholder="Facebook, Instagram, etc."
                                            class="form-input" />
                                    </FormField>
                                </div>
                            </section>

                            <!-- Location -->
                            <section class="space-y-4">
                                <h2 class="text-lg font-medium border-b pb-2">Location</h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField class="md:col-span-2" label="Address" required
                                        :error="validationErrors.address">
                                        <input v-model="form.address" type="text" class="form-input" />
                                    </FormField>

                                    <FormField label="City" required :error="validationErrors.city">
                                        <input v-model="form.city" type="text" class="form-input" />
                                    </FormField>

                                    <FormField label="State/Province" required :error="validationErrors.state">
                                        <input v-model="form.state" type="text" class="form-input" />
                                    </FormField>

                                    <FormField label="Postal Code" required :error="validationErrors.postal_code">
                                        <input v-model="form.postal_code" type="text" class="form-input" />
                                    </FormField>

                                    <FormField label="Country" required :error="validationErrors.country">
                                        <input v-model="form.country" type="text" class="form-input" />
                                    </FormField>
                                </div>
                            </section>

                            <!-- Actions -->
                            <div class="flex justify-end gap-3 pt-6 border-t">
                                <button type="button" @click="showDeleteConfirm = true" class="btn-danger">
                                    Delete Business
                                </button>
                                <button type="submit" :disabled="isSaving" class="btn-primary">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </ClientOnly>
                </div>

                <!-- Verification Section -->
                <div class="bg-white rounded-lg shadow-sm p-6">
                    <ClientOnly>
                        <BusinessVerification />
                    </ClientOnly>
                </div>

                <!-- Delete Confirmation Modal -->
                <div v-if="showDeleteConfirm"
                    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 class="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p class="text-gray-600 mb-6">Are you sure you want to delete this business? This action cannot
                            be undone.</p>
                        <div class="flex justify-end gap-3">
                            <button @click="showDeleteConfirm = false" class="btn-secondary">
                                Cancel
                            </button>
                            <button @click="handleDelete" class="btn-danger">
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useBusiness } from "@/composables/useBusiness";
import { useCategories } from "@/composables/useCategories";
import { useNotification } from "@/composables/useNotification";

const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useNotification();

const {
    business,
    fetchBusinessById,
    updateBusiness,
    uploadBusinessCover,
    deleteBusiness
} = useBusiness();

const { categories, fetchCategories } = useCategories();

// State
const isLoading = ref(true);
const isSaving = ref(false);
const isUploading = ref(false);
const showDeleteConfirm = ref(false);
const validationErrors = ref({});
const form = ref(createFormObject());

// Computed
const selectedCategoryName = computed(() => {
    return categories.value.find(cat => cat.id === form.value.category_id)?.name || '';
});

// Initialize
onMounted(async () => {
    try {
        await fetchCategories();
        const businessId = route.params._id;
        await fetchBusinessById(businessId);

        if (business.value) {
            form.value = {
                ...business.value,
                category_id: categories.value.some(c => c.id === business.value.category?.id)
                    ? business.value.category.id
                    : null
            };
        }
    } catch (error) {
        showError(`Failed to load data: ${error.message}`);
    } finally {
        isLoading.value = false;
    }
});

// Form Handling
const saveProfile = async () => {
    validationErrors.value = {};

    // Validation
    const requiredFields = {
        name: 'Business name is required',
        category_id: 'Category is required',
        description: 'Description is required',
        phone: 'Phone number is required',
        email: 'Email is required',
        address: 'Address is required',
        city: 'City is required',
        state: 'State is required',
        postal_code: 'Postal code is required',
        country: 'Country is required'
    };

    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!form.value[field]?.toString().trim()) {
            validationErrors.value[field] = message;
        }
    });

    if (Object.keys(validationErrors.value).length > 0) {
        showError('Please fix validation errors');
        return;
    }

    // Sanitization
    const sanitizedData = {
        ...form.value,
        phone: form.value.phone.replace(/[^\d+]/g, ''),
        website: form.value.website?.startsWith('http')
            ? form.value.website
            : form.value.website ? `https://${form.value.website}` : ''
    };

    try {
        isSaving.value = true;
        await updateBusiness(business.value.id, sanitizedData);
        showSuccess('Business profile updated successfully');
    } catch (error) {
        showError(`Save failed: ${error.message}`);
    } finally {
        isSaving.value = false;
    }
};

// Image Upload Handling
const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!business.value?.id) {
        showError('Business ID not found');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
        event.target.value = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        event.target.value = '';
        return;
    }

    try {
        isUploading.value = true;
        await uploadBusinessCover(business.value.id, file);
        showSuccess('Image updated successfully');

        // Clear the input so the same file can be selected again if needed
        event.target.value = '';
    } catch (error) {
        console.error('Upload error:', error);
        if (error.statusCode === 413) {
            showError('File too large');
        } else if (error.statusCode === 401) {
            showError('Please log in again');
        } else if (error.statusCode === 403) {
            showError('You do not have permission to edit this business');
        } else {
            showError(error.message || 'Failed to upload image');
        }
    } finally {
        isUploading.value = false;
    }
};

// Delete Handling
const handleDelete = async () => {
    try {
        await deleteBusiness(business.value.id);
        showSuccess('Business deleted successfully');
        router.push('/dashboard');
    } catch (error) {
        showError(`Delete failed: ${error.message}`);
    } finally {
        showDeleteConfirm.value = false;
    }
};

// Utilities
function createFormObject() {
    return {
        name: '',
        category_id: null,
        description: '',
        phone: '',
        email: '',
        website: '',
        social: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
    };
}
</script>

<style scoped>
.form-input {
    @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200;
}

.btn-primary {
    @apply px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors duration-200;
}

.btn-danger {
    @apply px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200;
}

.btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200;
}

.border-b {
    @apply border-gray-200;
}
</style>