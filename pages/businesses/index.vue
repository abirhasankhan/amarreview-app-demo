<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-6">Businesses</h1>
            
            <!-- Mobile: Vertical layout, Desktop: Horizontal layout -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <!-- Search Input -->
                <div class="relative w-full sm:w-auto sm:min-w-[300px]">
                    <input v-model="filters.search" type="text" placeholder="Search businesses..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    <span class="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </span>
                </div>
                
                <!-- Filter Controls -->
                <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <select v-model="filters.category"
                        class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">All Categories</option>
                        <option v-for="category in categories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                    <select v-model="filters.rating"
                        class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">All Ratings</option>
                        <option value="4">4+ Stars</option>
                        <option value="3">3+ Stars</option>
                        <option value="2">2+ Stars</option>
                        <option value="1">1+ Stars</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {{ error }}
        </div>
       
        <!-- Loading and error states -->
        <LoadingState v-if="loading" size="lg" text="Loading businesses..." />
        
        <!-- Business Grid -->
        <div v-if="!loading && businesses.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div v-for="business in paginatedBusinesses" :key="business.id"
                class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <NuxtLink :to="`/businesses/${business.slug}`">
                    <img v-if="business.image" :src="business.image" :alt="business.name"
                        class="w-full h-48 object-cover rounded-t-lg" />
                    <div class="p-4 sm:p-6">
                        <h2 class="text-lg sm:text-xl font-semibold mb-2">
                            {{ business.name }}
                        </h2>
                        <p class="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">
                            {{ business.description }}
                        </p>
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                            <div class="flex items-center">
                                <div class="flex">
                                    <span v-for="i in 5" :key="i">
                                        <span
                                            :class="i <= Math.round(business?.stats?.avg_rating || 0) ? 'text-yellow-400' : 'text-gray-300'">
                                            ★
                                        </span>
                                    </span>
                                </div>
                                <span class="ml-2 text-sm text-gray-600">
                                    ({{ business?.stats?.review_count || 0 }} reviews)
                                </span>
                            </div>
                            <span class="text-sm text-gray-500">
                                {{ business.category.name }}
                            </span>
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="!loading && !error" class="mt-8 flex justify-center">
            <nav class="flex items-center gap-1 sm:gap-2">
                <button @click="currentPage--" :disabled="currentPage === 1"
                    class="px-2 sm:px-3 py-1 text-sm sm:text-base rounded border enabled:hover:bg-gray-100 disabled:opacity-50">
                    <span class="hidden sm:inline">Previous</span>
                    <span class="sm:hidden">Prev</span>
                </button>
                <div class="flex gap-1 max-w-xs overflow-x-auto">
                    <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="[
                        'px-2 sm:px-3 py-1 text-sm sm:text-base rounded border flex-shrink-0',
                        currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'
                    ]">
                        {{ page }}
                    </button>
                </div>
                <button @click="currentPage++" :disabled="currentPage === totalPages"
                    class="px-2 sm:px-3 py-1 text-sm sm:text-base rounded border enabled:hover:bg-gray-100 disabled:opacity-50">
                    <span class="hidden sm:inline">Next</span>
                    <span class="sm:hidden">Next</span>
                </button>
            </nav>
        </div>
    </div>
</template>


<script setup>
import LoadingState from "@/components/LoadingState.vue";

import { onMounted } from 'vue'
import { useBusiness } from '~/composables/useBusiness'
import { useCategories } from '~/composables/useCategories'

const {
	businesses,
	fetchBusinesses,
	loading: businessLoading,
	error: businessError
} = useBusiness()

const {
	categories,
	fetchCategories,
	loading: categoryLoading,
	error: categoryError
} = useCategories()

onMounted(async () => {
	await Promise.all([
		fetchBusinesses(),
		fetchCategories()
	])
})

const loading = computed(() => businessLoading.value || categoryLoading.value)

const error = computed(() => businessError.value || categoryError.value)


const filters = ref({
	search: '',
	category: '',
	rating: ''
})

const currentPage = ref(1)
const itemsPerPage = 9

onMounted(() => {
	fetchCategories()
})

// Filter and paginate businesses client-side
const filteredBusinesses = computed(() => {
	return businesses.value.filter(business => {
		const name = business.name?.toLowerCase() || '';
		const description = business.description?.toLowerCase() || '';
		const categoryId = business.category?.id;

		const matchesSearch = !filters.value.search ||
			name.includes(filters.value.search.toLowerCase()) ||
			description.includes(filters.value.search.toLowerCase());

		const matchesCategory = !filters.value.category ||
			categoryId === Number(filters.value.category);

		const matchesRating = !filters.value.rating ||
			Number(business.stats?.avg_rating || 0) >= Number(filters.value.rating);

		return matchesSearch && matchesCategory && matchesRating;
	});
});



const totalPages = computed(() =>
	Math.ceil(filteredBusinesses.value.length / itemsPerPage)
)

const paginatedBusinesses = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage
	const end = start + itemsPerPage
	return filteredBusinesses.value.slice(start, end)
})

// Reset to first page when filters change
watch(filters, () => {
	currentPage.value = 1
}, { deep: true })

</script>