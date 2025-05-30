<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <section class="text-center py-8 sm:py-12">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-2">
                Find and Review Trusted Businesses
            </h1>
            <p class="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
                Discover honest reviews from real customers
            </p>
            <div class="max-w-2xl mx-auto relative">
                <!-- Search Input with Suggestions -->
                <input v-model="searchQuery" type="text" placeholder="Search for businesses..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base shadow-sm"
                    @input="handleInput" @focus="showSuggestions = true" @blur="handleBlur"
                    aria-label="Search for businesses" />

                <!-- Loading Spinner -->
                <div v-if="loading" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent">
                    </div>
                </div>

                <!-- Suggestions Dropdown -->
                <div v-if="showSuggestions && searchResults.length > 0"
                    class="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 sm:max-h-96 overflow-y-auto">
                    <ul>
                        <li v-for="business in searchResults" :key="business.id" class="border-b last:border-b-0">
                            <NuxtLink :to="`/businesses/${business.slug}`"
                                class="block px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                @click="showSuggestions = false">
                                <div class="font-medium text-gray-900 text-sm sm:text-base">{{ business.name }}</div>
                                <div class="text-xs sm:text-sm text-gray-600 mt-1">{{ business.address }}</div>
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <!-- Popular Categories -->
        <section class="mt-8 sm:mt-12">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Popular Categories</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div v-for="category in popularCategories" :key="category.id"
                    class="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h3 class="text-lg sm:text-xl font-semibold mb-2">{{ category.name }}</h3>
                    <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">{{ category.description }}</p>
                    <NuxtLink :to="`/categories/${category.slug}`"
                        class="text-emerald-600 hover:text-emerald-700 font-medium text-sm sm:text-base">
                        Browse {{ category.name }} →
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Recent Reviews -->
        <section class="mt-8 sm:mt-12 pb-8">
            <h2 class="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Recent Reviews</h2>
            <div v-if="recentReviews.length === 0" class="text-center py-8 text-gray-500">
                No recent reviews available.
            </div>
            <div v-else class="space-y-4 sm:space-y-6">
                <div v-for="review in recentReviews" :key="review.id" class="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div class="flex-1">
                            <h3 class="text-base sm:text-lg font-semibold">{{ review.businessName }}</h3>
                            <div class="flex items-center mt-1">
                                <div class="flex items-center">
                                    <span v-for="i in 5" :key="i">
                                        <span class="text-sm sm:text-base"
                                            :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">
                                            ★
                                        </span>
                                    </span>
                                </div>
                                <span class="ml-2 text-xs sm:text-sm text-gray-600">{{ review.rating }}/5</span>
                            </div>
                        </div>
                        <span class="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-0 sm:ml-4">{{ review.date }}</span>
                    </div>
                    <p class="mt-3 text-sm sm:text-base text-gray-600 leading-relaxed">{{ review.content }}</p>
                    <div class="mt-4 flex items-center">
                        <img :src="review.userAvatar" :alt="review.userName"
                            class="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                        <span class="ml-2 text-xs sm:text-sm text-gray-600">{{ review.userName }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

const client = useSupabaseClient()
const router = useRouter()

// Search State
const searchQuery = ref('')
const showSuggestions = ref(false)
const loading = ref(false)
const searchResults = ref([])

const fetchBusinesses = async () => {
    if (!searchQuery.value || searchQuery.value.length < 2) {
        searchResults.value = []
        return
    }

    loading.value = true
    try {
        const { data, error } = await client
            .from('businesses')
            .select('id, name, address, slug')
            .ilike('name', `%${searchQuery.value}%`)
            .limit(5)

        if (error) throw error
        searchResults.value = data
    } catch (err) {
        console.error('Search error:', err)
    } finally {
        loading.value = false
    }
}

const searchBusinesses = useDebounceFn(fetchBusinesses, 300)

function handleInput() {
    searchBusinesses()
}

function handleBlur() {
    setTimeout(() => {
        showSuggestions.value = false
    }, 200)
}

function handleSearch() {
    if (searchQuery.value.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    }
}

// Static Categories
const popularCategories = [
    {
        id: 1,
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Find the best dining experiences in your area'
    },
    {
        id: 2,
        name: 'Home Services',
        slug: 'home-services',
        description: 'Trusted professionals for your home maintenance needs'
    },
    {
        id: 3,
        name: 'Online Shops',
        slug: 'online-shops',
        description: 'Verified online retailers and e-commerce stores'
    }
]

// Recent Reviews
const recentReviews = ref([])
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
}


const { data: reviewsData, error } = await useFetch('/api/reviews')

if (reviewsData.value?.reviews) {
    recentReviews.value = reviewsData.value.reviews.map(review => ({
        id: review.id,
        businessName: review.business?.name || 'Unknown Business',
        rating: review.rating,
        content: review.content,
        userName: review.user?.full_name || 'Anonymous',
        userAvatar: review.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.id}`,
        date: formatDate(review.created_at)
    }))
}

</script>
