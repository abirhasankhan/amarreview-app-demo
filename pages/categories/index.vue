<template>
  <div class="max-w-7xl mx-auto">
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Business Categories</h1>
      <p class="text-xl text-gray-600">Find trusted businesses by category</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <NuxtLink
        v-for="category in categories"
        :key="category.id"
        :to="`/categories/${category.slug}`"
        class="group"
      >
        <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div class="relative">
            <img
              :src="category.image"
              :alt="category.name"
              class="w-full h-48 object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h2 class="text-2xl font-bold text-white mb-1">{{ category.name }}</h2>
              <p class="text-white/90 text-sm">
                {{ category.businessCount }} businesses
              </p>
            </div>
          </div>
          <div class="p-6">
            <p class="text-gray-600 mb-4">{{ category.description }}</p>
            <div class="space-y-2">
              <div
                v-for="(business, index) in category.popularBusinesses"
                :key="index"
                class="flex items-center text-sm"
              >
                <div class="flex items-center text-yellow-400">
                  <span v-for="i in 5" :key="i">
                    <span :class="i <= business.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
                  </span>
                </div>
                <span class="ml-2 text-gray-600">{{ business.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Featured Categories Section -->
    <section class="mt-16">
      <h2 class="text-2xl font-semibold mb-8">Featured Categories</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          v-for="category in featuredCategories"
          :key="category.id"
          class="bg-emerald-50 p-4 rounded-lg text-center hover:bg-emerald-100 transition-colors"
        >
          <NuxtLink :to="`/categories/${category.slug}`" class="block">
            <span class="text-4xl mb-2 block">{{ category.icon }}</span>
            <h3 class="font-medium text-gray-900">{{ category.name }}</h3>
            <p class="text-sm text-gray-600">{{ category.businessCount }} businesses</p>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Mock categories data
const categories = ref([
  {
    id: 1,
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Find the best dining experiences, from casual eateries to fine dining establishments.',
    image: 'https://picsum.photos/seed/restaurants/800/600',
    businessCount: 245,
    popularBusinesses: [
      { name: 'Green Garden Restaurant', rating: 4.5 },
      { name: 'The Urban Spice', rating: 4.8 },
      { name: 'Coastal Kitchen', rating: 4.3 }
    ]
  },
  {
    id: 2,
    name: 'Home Services',
    slug: 'home-services',
    description: 'Professional services for home maintenance, repairs, and improvements.',
    image: 'https://picsum.photos/seed/home-services/800/600',
    businessCount: 189,
    popularBusinesses: [
      { name: 'Elite Plumbing', rating: 4.7 },
      { name: 'Pro Electricians', rating: 4.6 },
      { name: 'Home Fix Experts', rating: 4.4 }
    ]
  },
  {
    id: 3,
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Medical professionals and healthcare facilities for your well-being.',
    image: 'https://picsum.photos/seed/healthcare/800/600',
    businessCount: 156,
    popularBusinesses: [
      { name: 'City Medical Center', rating: 4.9 },
      { name: 'Family Dental Care', rating: 4.7 },
      { name: 'Wellness Center', rating: 4.5 }
    ]
  },
  {
    id: 4,
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'Expert services in legal, financial, and business consulting.',
    image: 'https://picsum.photos/seed/professional/800/600',
    businessCount: 203,
    popularBusinesses: [
      { name: 'Legal Solutions', rating: 4.8 },
      { name: 'Tax Advisors Pro', rating: 4.6 },
      { name: 'Business Consultants', rating: 4.7 }
    ]
  },
  {
    id: 5,
    name: 'Retail',
    slug: 'retail',
    description: 'Shop at the best local and online retail stores.',
    image: 'https://picsum.photos/seed/retail/800/600',
    businessCount: 312,
    popularBusinesses: [
      { name: 'Fashion Boutique', rating: 4.4 },
      { name: 'Electronics Hub', rating: 4.5 },
      { name: 'Home Decor Store', rating: 4.3 }
    ]
  },
  {
    id: 6,
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car dealerships, repair shops, and automotive services.',
    image: 'https://picsum.photos/seed/automotive/800/600',
    businessCount: 167,
    popularBusinesses: [
      { name: 'Premium Auto Care', rating: 4.6 },
      { name: 'Quick Car Service', rating: 4.4 },
      { name: 'Elite Motors', rating: 4.7 }
    ]
  }
])

// Featured categories with icons
const featuredCategories = computed(() => [
  { id: 1, name: 'Restaurants', slug: 'restaurants', icon: '🍽️', businessCount: 245 },
  { id: 2, name: 'Healthcare', slug: 'healthcare', icon: '⚕️', businessCount: 156 },
  { id: 3, name: 'Home Services', slug: 'home-services', icon: '🏠', businessCount: 189 },
  { id: 4, name: 'Retail', slug: 'retail', icon: '🛍️', businessCount: 312 }
])

// SEO
useHead({
  title: 'Business Categories - AmarReview',
  meta: [
    {
      name: 'description',
      content: 'Browse businesses by category. Find and review local businesses in your area.'
    }
  ]
})
</script>