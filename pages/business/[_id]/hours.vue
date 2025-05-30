<template>

    <NuxtLayout name="business">
        <div class="max-w-4xl mx-auto p-6">
            <!-- Header Section -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Business Hours</h1>
                <p class="text-gray-600">Manage your business operating hours for each day of the week</p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-12">
                <div class="flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span class="text-gray-600">Loading business hours...</span>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-red-800 font-medium">{{ error }}</span>
                </div>
            </div>

            <!-- Main Content -->
            <div v-else class="space-y-6">
                <!-- Business Hours Cards -->
                <div class="grid gap-4">
                    <div v-for="day in hours" :key="day.id"
                        class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">

                        <!-- Day Header -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-4">
                                <span class="text-xl font-semibold text-gray-900">
                                    {{ getDayLabel(day.day_of_week) }}
                                </span>

                                <!-- Status Badge -->
                                <span :class="day.is_closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                    {{ day.is_closed ? 'Closed' : 'Open' }}
                                </span>
                            </div>

                            <div class="flex items-center space-x-2">
                                <!-- Edit Button -->
                                <button @click="openEditModal(day)"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                        </path>
                                    </svg>
                                    Edit
                                </button>

                                <!-- Delete Button -->
                                <button @click="deleteDay(day.id)"
                                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                        </path>
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>

                        <!-- Time Display -->
                        <div class="flex items-center space-x-4 text-gray-600">
                            <div class="flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span v-if="day.is_closed" class="text-red-600">Closed all day</span>
                                <span v-else class="font-mono text-lg">
                                    {{ day.open_time || '--:--' }} - {{ day.close_time || '--:--' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add New Day Button -->
                <div class="pt-4">
                    <button @click="openCreateModal" :disabled="loading || availableDays.length === 0"
                        class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Add Day
                        <span class="ml-2 text-blue-200">({{ availableDays.length }} available)</span>
                    </button>
                </div>

                <!-- Summary Section -->
                <div class="bg-gray-50 rounded-xl p-6 mt-8">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Schedule Summary</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="day in hours" :key="`summary-${day.id}`"
                            class="flex justify-between items-center py-2">
                            <span class="font-medium text-gray-700">{{ getDayLabel(day.day_of_week) }}</span>
                            <span class="text-sm" :class="day.is_closed ? 'text-red-600' : 'text-green-600'">
                                {{ day.is_closed ? 'Closed' : `${day.open_time || '--'} - ${day.close_time || '--'}` }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Create/Edit Modal -->
            <div v-if="showModal"
                class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-200">
                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ isEditMode ? 'Edit Business Hours' : 'Add Business Hours' }}
                        </h3>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6 space-y-6">
                        <!-- Day Selector -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                            <div class="relative">
                                <select v-model.number="formData.day_of_week" :disabled="isEditMode"
                                    class="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 pr-10 font-medium text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option v-for="day in availableDaysForModal" :value="day.value" :key="day.value">
                                        {{ day.label }}
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- Closed Toggle -->
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">Closed all day</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" v-model="formData.is_closed" class="sr-only peer">
                                <div
                                    class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                                </div>
                            </label>
                        </div>

                        <!-- Time Controls -->
                        <div v-if="!formData.is_closed" class="space-y-4">
                            <!-- Opening Time -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                                <div class="relative">
                                    <input type="time" v-model="formData.open_time"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                                    <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <!-- Closing Time -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                                <div class="relative">
                                    <input type="time" v-model="formData.close_time"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors">
                                    <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Form Error -->
                        <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div class="flex items-center">
                                <svg class="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clip-rule="evenodd"></path>
                                </svg>
                                <span class="text-red-800 text-sm">{{ formError }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                        <button @click="closeModal"
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            Cancel
                        </button>
                        <button @click="saveForm" :disabled="formLoading"
                            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <span v-if="formLoading" class="flex items-center">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </span>
                            <span v-else>
                                {{ isEditMode ? 'Update' : 'Create' }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from '#imports';

const route = useRoute();
const { getBusinessHours, createBusinessHours, updateBusinessHours, deleteBusinessHours } = useBusinessHours();

const hours = ref([]);
const loading = ref(false);
const error = ref(null);

// Modal state
const showModal = ref(false);
const isEditMode = ref(false);
const formLoading = ref(false);
const formError = ref(null);
const editingId = ref(null);

// Form data
const formData = ref({
    day_of_week: 1,
    is_closed: true,
    open_time: '09:00',
    close_time: '17:00'
});

// Business ID handling
const businessId = computed(() => {
    const id = route.params.id || route.params._id || route.params.businessId;
    console.log('Route params:', route.params);
    console.log('Extracted business ID:', id);

    if (!id) {
        error.value = 'Business ID not found in route parameters';
        return null;
    }

    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
        error.value = 'Invalid business ID format';
        return null;
    }

    return numericId;
});

// Days configuration
const daysList = [
    { label: 'Sunday', value: 0 },
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
];

// Helper function to get day label
const getDayLabel = (dayValue) => {
    const day = daysList.find(d => d.value === Number(dayValue));
    return day ? day.label : `Day ${dayValue}`;
};

// Available days computation
const availableDays = computed(() => {
    if (!hours.value || hours.value.length === 0) {
        return daysList;
    }

    const usedDays = new Set(
        hours.value.map(h => Number(h.day_of_week))
    );

    return daysList.filter(day => !usedDays.has(day.value));
});

// Available days for modal (includes current day if editing)
const availableDaysForModal = computed(() => {
    if (isEditMode.value) {
        // In edit mode, only show the current day
        const currentDay = hours.value.find(h => h.id === editingId.value);
        if (currentDay) {
            const dayOption = daysList.find(d => d.value === Number(currentDay.day_of_week));
            return dayOption ? [dayOption] : daysList;
        }
    }
    // In create mode, show available days
    return availableDays.value;
});

// Data initialization
onMounted(async () => {
    if (!businessId.value) return;

    try {
        loading.value = true;
        error.value = null;

        const response = await getBusinessHours(businessId.value);

        if (Array.isArray(response)) {
            hours.value = response.map(d => ({
                ...d,
                day_of_week: Number(d.day_of_week),
                is_closed: Boolean(d.is_closed),
                open_time: d.open_time || '',
                close_time: d.close_time || ''
            }));
        } else {
            hours.value = [];
        }

    } catch (err) {
        console.error('Error loading business hours:', err);
        error.value = err.message || 'Failed to load business hours';
        hours.value = [];
    } finally {
        loading.value = false;
    }
});

// Modal operations
const openCreateModal = () => {
    if (availableDays.value.length === 0) {
        error.value = 'No available days to add';
        return;
    }

    isEditMode.value = false;
    editingId.value = null;
    formError.value = null;

    formData.value = {
        day_of_week: availableDays.value[0].value,
        is_closed: true,
        open_time: '09:00',
        close_time: '17:00'
    };

    showModal.value = true;
};

const openEditModal = (day) => {
    isEditMode.value = true;
    editingId.value = day.id;
    formError.value = null;

    formData.value = {
        day_of_week: day.day_of_week,
        is_closed: day.is_closed,
        open_time: day.open_time || '09:00',
        close_time: day.close_time || '17:00'
    };

    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    isEditMode.value = false;
    editingId.value = null;
    formError.value = null;
    formLoading.value = false;
};

const saveForm = async () => {
    try {
        formLoading.value = true;
        formError.value = null;

        // Validation
        if (!formData.value.is_closed) {
            if (!formData.value.open_time || !formData.value.close_time) {
                formError.value = 'Please provide both opening and closing times';
                return;
            }
            if (formData.value.open_time >= formData.value.close_time) {
                formError.value = 'Opening time must be before closing time';
                return;
            }
        }

        if (isEditMode.value) {
            // Update existing day
            const updatePayload = {
                dayOfWeek: Number(formData.value.day_of_week),
                isClosed: formData.value.is_closed,
                openTime: formData.value.is_closed ? null : formData.value.open_time,
                closeTime: formData.value.is_closed ? null : formData.value.close_time
            };

            const updatedDay = await updateBusinessHours(editingId.value, updatePayload);

            // Update local state
            const index = hours.value.findIndex(d => d.id === editingId.value);
            if (index !== -1) {
                hours.value[index] = {
                    ...hours.value[index],
                    ...updatedDay,
                    day_of_week: Number(updatedDay.day_of_week ?? updatedDay.dayOfWeek ?? formData.value.day_of_week),
                    is_closed: Boolean(updatedDay.is_closed ?? updatedDay.isClosed ?? formData.value.is_closed),
                    open_time: updatedDay.open_time ?? updatedDay.openTime ?? (formData.value.is_closed ? '' : formData.value.open_time),
                    close_time: updatedDay.close_time ?? updatedDay.closeTime ?? (formData.value.is_closed ? '' : formData.value.close_time)
                };
            }
        } else {
            // Create new day
            const createPayload = {
                businessId: businessId.value,
                dayOfWeek: Number(formData.value.day_of_week),
                isClosed: formData.value.is_closed,
                openTime: formData.value.is_closed ? null : formData.value.open_time,
                closeTime: formData.value.is_closed ? null : formData.value.close_time
            };

            const newDay = await createBusinessHours(createPayload);

            // Add to hours array
            hours.value.push({
                ...newDay,
                day_of_week: Number(newDay.day_of_week ?? newDay.dayOfWeek ?? formData.value.day_of_week),
                is_closed: Boolean(newDay.is_closed ?? newDay.isClosed ?? formData.value.is_closed),
                open_time: newDay.open_time ?? newDay.openTime ?? (formData.value.is_closed ? '' : formData.value.open_time),
                close_time: newDay.close_time ?? newDay.closeTime ?? (formData.value.is_closed ? '' : formData.value.close_time)
            });
        }

        closeModal();

    } catch (err) {
        console.error('Error saving form:', err);
        formError.value = err.message || 'Failed to save business hours';
    } finally {
        formLoading.value = false;
    }
};

const deleteDay = async (id) => {
    if (!confirm('Are you sure you want to delete this business day?')) {
        return;
    }

    try {
        error.value = null;
        await deleteBusinessHours(id);
        hours.value = hours.value.filter(d => d.id !== id);
    } catch (err) {
        console.error('Error deleting day:', err);
        error.value = err.message || 'Failed to delete day';
    }
};
</script>