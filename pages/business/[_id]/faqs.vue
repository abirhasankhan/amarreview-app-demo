<template>

    <NuxtLayout name="business">
        <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8 flex justify-between items-center">
                    <h1 class="text-3xl font-bold text-gray-900">Business FAQs</h1>
                    <button @click="openCreateModal"
                        class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        <Icon name="mdi:plus" class="w-5 h-5" />
                        Add New FAQ
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="space-y-4">
                    <div v-for="i in 3" :key="i" class="animate-pulse bg-white p-6 rounded-lg shadow">
                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>

                <!-- FAQs List -->
                <div v-else class="space-y-4">
                    <div v-for="faq in faqs" :key="faq.id"
                        class="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow group">
                        <div class="flex justify-between items-start">
                            <div class="space-y-2">
                                <h3 class="text-lg font-semibold text-gray-900">{{ faq.question }}</h3>
                                <p class="text-gray-600">{{ faq.answer }}</p>
                                <p class="text-sm text-gray-500">Order: {{ faq.order_index }}</p>
                            </div>
                            <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="openEditModal(faq)"
                                    class="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50">
                                    <Icon name="mdi:pencil" class="w-5 h-5" />
                                </button>
                                <button @click="confirmDelete(faq.id)"
                                    class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                                    <Icon name="mdi:trash" class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="!faqs.length" class="text-center py-12">
                        <p class="text-gray-500">No FAQs found. Start by creating a new one!</p>
                    </div>
                </div>

                <!-- Create/Edit Modal -->
                <div v-if="isModalOpen"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 class="text-xl font-bold mb-4">
                            {{ isEditing ? 'Edit FAQ' : 'New FAQ' }}
                        </h2>
                        <form @submit.prevent="submitForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                <input v-model="form.question" type="text"
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    :class="{ 'border-red-500': errors.question }" />
                                <p v-if="errors.question" class="text-red-500 text-sm mt-1">{{ errors.question }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                                <textarea v-model="form.answer" rows="4"
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    :class="{ 'border-red-500': errors.answer }"></textarea>
                                <p v-if="errors.answer" class="text-red-500 text-sm mt-1">{{ errors.answer }}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                                <input v-model="form.order_index" type="number" min="0"
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    :class="{ 'border-red-500': errors.order_index }" />
                                <p v-if="errors.order_index" class="text-red-500 text-sm mt-1">{{ errors.order_index }}
                                </p>
                                <p class="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
                            </div>
                            <div class="flex justify-end space-x-4">
                                <button type="button" @click="closeModal"
                                    class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                    Cancel
                                </button>
                                <button type="submit"
                                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                                    <Icon :name="isEditing ? 'mdi:content-save' : 'mdi:plus'" class="w-5 h-5" />
                                    {{ isEditing ? 'Update' : 'Create' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Delete Confirmation -->
                <div v-if="isDeleteDialogOpen"
                    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div class="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 class="text-lg font-bold mb-2">Delete FAQ</h3>
                        <p class="text-gray-600 mb-6">Are you sure you want to delete this FAQ? This action cannot be
                            undone.</p>
                        <div class="flex justify-end space-x-4">
                            <button @click="isDeleteDialogOpen = false"
                                class="px-4 py-2 text-gray-600 hover:text-gray-800">
                                Cancel
                            </button>
                            <button @click="handleDelete"
                                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                <Icon name="mdi:trash" class="w-5 h-5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>

</template>

<script setup>
const { showSuccess, showError } = useNotification()
const { getFaqs, createFaq, updateFaq, deleteFaq } = useBusinessFaqs()
import { useRoute } from '#imports';

const route = useRoute();

// State
const isLoading = ref(true)
const faqs = ref([])
const isModalOpen = ref(false)
const isDeleteDialogOpen = ref(false)
const selectedFaqId = ref(null)

// Business ID handling
const businessId = computed(() => {
    const id = route.params.id || route.params._id || route.params.businessId;
    if (!id) {
        showError('Business ID not found in route parameters')
        return null;
    }

    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
        showError('Invalid business ID format')
        return null;
    }

    return numericId;
});

// Form handling
const isEditing = ref(false)
const form = reactive({
    question: '',
    answer: '',
    order_index: 0,
    business_id: null
})
const errors = reactive({
    question: '',
    answer: '',
    order_index: ''
})

// Validation
const validateForm = () => {
    let isValid = true
    errors.question = ''
    errors.answer = ''
    errors.order_index = ''

    if (form.question.length < 5) {
        errors.question = 'Question must be at least 5 characters'
        isValid = false
    }

    if (form.answer.length < 5) {
        errors.answer = 'Answer must be at least 5 characters'
        isValid = false
    }

    if (form.order_index < 0 || isNaN(form.order_index)) {
        errors.order_index = 'Order index must be a non-negative number'
        isValid = false
    }

    return isValid
}

// Modal handling
const openCreateModal = () => {
    isEditing.value = false
    resetForm()
    form.business_id = businessId.value
    isModalOpen.value = true
}

const openEditModal = (faq) => {
    isEditing.value = true
    form.question = faq.question
    form.answer = faq.answer
    form.order_index = faq.order_index
    form.business_id = businessId.value
    selectedFaqId.value = faq.id
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    resetForm()
}

const resetForm = () => {
    form.question = ''
    form.answer = ''
    form.order_index = 0
    selectedFaqId.value = null
}

// Form submission
const submitForm = async () => {
    if (!validateForm()) return

    try {
        const payload = {
            ...form,
            business_id: businessId.value
        }

        if (isEditing.value) {
            await updateFaq(selectedFaqId.value, payload)
            showSuccess('FAQ updated successfully')
        } else {
            await createFaq(payload)
            showSuccess('FAQ created successfully')
        }
        await loadFaqs()
        closeModal()
    } catch (error) {
        showError(error.message || 'An error occurred')
    }
}

// Delete handling
const confirmDelete = (id) => {
    selectedFaqId.value = id
    isDeleteDialogOpen.value = true
}

const handleDelete = async () => {
    try {
        await deleteFaq(selectedFaqId.value)
        showSuccess('FAQ deleted successfully')
        await loadFaqs()
    } catch (error) {
        showError(error.message || 'Failed to delete FAQ')
    }
    isDeleteDialogOpen.value = false
}

// Load FAQs
const loadFaqs = async () => {
    try {
        isLoading.value = true
        if (!businessId.value) {
            throw new Error('Business ID is required')
        }

        const data = await getFaqs(businessId.value)
        // Sort by order_index ascending
        faqs.value = data.sort((a, b) => a.order_index - b.order_index)
    } catch (error) {
        showError(error.message || 'Failed to load FAQs')
    } finally {
        isLoading.value = false
    }
}

// Initial load
onMounted(loadFaqs)
</script>

<style>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}
</style>