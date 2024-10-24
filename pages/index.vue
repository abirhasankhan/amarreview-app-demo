<template>
  <div>
    <section class="text-center py-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Find and Review Trusted Businesses
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Discover honest reviews from real customers
      </p>
      <div class="max-w-2xl mx-auto">
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search for businesses..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            class="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Search
          </button>
        </form>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Popular Categories</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="category in popularCategories"
          :key="category.id"
          class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 class="text-xl font-semibold mb-2">{{ category.name }}</h3>
          <p class="text-gray-600 mb-4">{{ category.description }}</p>
          <NuxtLink
            :to="`/categories/${category.slug}`"
            class="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Browse {{ category.name }} →
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-2xl font-semibold text-gray-900 mb-6">Recent Reviews</h2>
      <div class="space-y-6">
        <div
          v-for="review in recentReviews"
          :key="review.id"
          class="bg-white p-6 rounded-lg shadow-sm"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-lg font-semibold">{{ review.businessName }}</h3>
              <div class="flex items-center mt-1">
                <div class="flex items-center">
                  <span v-for="i in 5" :key="i">
                    <span
                      class="text-yellow-400"
                      :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    >
                      ★
                    </span>
                  </span>
                </div>
                <span class="ml-2 text-sm text-gray-600">{{ review.rating }}/5</span>
              </div>
            </div>
            <span class="text-sm text-gray-500">{{ review.date }}</span>
          </div>
          <p class="mt-3 text-gray-600">{{ review.content }}</p>
          <div class="mt-4 flex items-center">
            <img
              :src="review.userAvatar"
              :alt="review.userName"
              class="w-8 h-8 rounded-full"
            />
            <span class="ml-2 text-sm text-gray-600">{{ review.userName }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const searchQuery = ref('')
const router = useRouter()

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

// Mock data - replace with Supabase queries
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

const recentReviews = [
  {
    id: 1,
    businessName: 'Green Garden Restaurant',
    rating: 4,
    content: 'Amazing food and great service! The atmosphere was perfect for our anniversary dinner.',
    userName: 'John Doe',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    date: '2 days ago'
  },
  {
    id: 2,
    businessName: 'Tech Solutions Pro',
    rating: 5,
    content: 'Excellent technical support. They resolved my issue quickly and professionally.',
    userName: 'Sarah Smith',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    date: '4 days ago'
  }
]
</script>