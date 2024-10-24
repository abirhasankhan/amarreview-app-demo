<template>
  <div class="max-w-7xl mx-auto" v-if="category">
    <header class="mb-8">
      <div class="relative h-64 mb-8">
        <img
          :src="category.image"
          :alt="category.name"
          class="w-full h-full object-cover rounded-lg"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <h1 class="text-4xl font-bold text-white mb-2">{{ category.name }}</h1>
          <p class="text-white/90 text-lg">{{ category.description }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-4 items-center justify-between">
        <p class="text-gray-600">
          {{ filteredBusinesses.length }} businesses found
        </p>
        
        <div class="flex gap-4">
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search in this category..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
          </div>
          
          <select
            v-model="filters.sort"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="reviews">Sort by Review Count</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <select
            v-model="filters.rating"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="business in paginatedBusinesses"
        :key="business.id"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/businesses/${business.id}`">
          <img
            :src="business.image"
            :alt="business.name"
            class="w-full h-48 object-cover rounded-t-lg"
          />
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">{{ business.name }}</h2>
            <p class="text-gray-600 mb-4 line-clamp-2">{{ business.description }}</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex">
                  <span v-for="i in 5" :key="i">
                    <span
                      :class="i <= business.rating ? 'text-yellow-400' : 'text-gray-300'"
                    >
                      ★
                    </span>
                  </span>
                </div>
                <span class="ml-2 text-sm text-gray-600">
                  ({{ business.reviewCount }} reviews)
                </span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex justify-center" v-if="totalPages > 1">
      <nav class="flex items-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
        >
          Previous
        </button>
        <div class="flex gap-1">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="currentPage = page"
            :class="[
              'px-3 py-1 rounded border',
              currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const currentPage = ref(1)
const itemsPerPage = 9

const filters = ref({
  search: '',
  sort: 'rating',
  rating: ''
})

// Mock category data - replace with Supabase query
const category = ref({
  id: 1,
  name: 'Restaurants',
  slug: 'restaurants',
  description: 'Find the best dining experiences, from casual eateries to fine dining establishments.',
  image: 'https://picsum.photos/seed/restaurants-header/1600/900',
  businesses: [
    {
      id: 1,
      name: 'Green Garden Restaurant',
      description: 'Farm-to-table restaurant serving organic dishes in a cozy atmosphere.',
      rating: 4.5,
      reviewCount: 128,
      image: 'https://picsum.photos/seed/restaurant1/800/600'
    },
    {
      id: 2,
      name: 'The Urban Spice',
      description: 'Modern Indian cuisine with a contemporary twist.',
      rating: 4.8,
      reviewCount: 256,
      image: 'https://picsum.photos/seed/restaurant2/800/600'
    },
    {
      id: 3,
      name: 'Coastal Kitchen',
      description: 'Fresh seafood and spectacular ocean views.',
      rating: 4.3,
      reviewCount: 89,
      image: 'https://picsum.photos/seed/restaurant3/800/600'
    },
    // Add more mock businesses
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 4,
      name: `Restaurant ${i + 4}`,
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      rating: 3 + Math.random() * 2,
      reviewCount: Math.floor(Math.random() * 200),
      image: `https://picsum.photos/seed/restaurant${i + 4}/800/600`
    }))
  ]
})

// Filter and sort businesses
const filteredBusinesses = computed(() => {
  let result = [...category.value.businesses]

  // Apply search filter
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase()
    result = result.filter(business => 
      business.name.toLowerCase().includes(searchTerm) ||
      business.description.toLowerCase().includes(searchTerm)
    )
  }

  // Apply rating filter
  if (filters.value.rating) {
    const minRating = parseInt(filters.value.rating)
    result = result.filter(business => business.rating >= minRating)
  }

  // Apply sorting
  result.sort((a, b) => {
    switch (filters.value.sort) {
      case 'rating':
        return b.rating - a.rating
      case 'reviews':
        return b.reviewCount - a.reviewCount
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return result
})

// Pagination
const totalPages = computed(() => 
  Math.ceil(filteredBusinesses.value.length / itemsPerPage)
)

const paginatedBusinesses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBusinesses.value.slice(start, end)
})

// Reset page when filters change
watch(filters, () => {
  currentPage.value = 1
})

// SEO
useHead({
  title: `${category.value.name} - AmarReview`,
  meta: [
    {
      name: 'description',
      content: category.value.description
    }
  ]
})

// Fetch category data based on slug
onMounted(async () => {
  // Replace with actual Supabase query
  // const { data, error } = await client
  //   .from('categories')
  //   .select('*, businesses(*)')
  //   .eq('slug', route.params.slug)
  //   .single()
})
</script>