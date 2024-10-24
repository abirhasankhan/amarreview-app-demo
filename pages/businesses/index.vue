<template>
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Businesses</h1>
      <div class="flex gap-4">
        <div class="relative">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search businesses..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <span class="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </span>
        </div>
        <select
          v-model="filters.category"
          class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
        <select
          v-model="filters.rating"
          class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="1">1+ Stars</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="business in paginatedBusinesses"
        :key="business.id"
        class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <NuxtLink :to="`/businesses/${business.id}`">
          <img
            v-if="business.image"
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
              <span class="text-sm text-gray-500">{{ business.category }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-8 flex justify-center">
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
const filters = ref({
  search: '',
  category: '',
  rating: ''
})

const currentPage = ref(1)
const itemsPerPage = 9

// Mock categories
const categories = [
  { id: 1, name: 'Restaurants' },
  { id: 2, name: 'Home Services' },
  { id: 3, name: 'Healthcare' },
  { id: 4, name: 'Retail' },
  { id: 5, name: 'Professional Services' }
]

// Mock businesses data
const businesses = ref([
  {
    id: 1,
    name: 'Green Garden Restaurant',
    description: 'Farm-to-table restaurant serving organic dishes in a cozy atmosphere.',
    category: 'Restaurants',
    categoryId: 1,
    rating: 4.5,
    reviewCount: 128,
    image: 'https://picsum.photos/seed/restaurant1/800/600'
  },
  {
    id: 2,
    name: 'Tech Solutions Pro',
    description: 'Professional IT services and computer repair.',
    category: 'Professional Services',
    categoryId: 5,
    rating: 4.8,
    reviewCount: 89,
    image: 'https://picsum.photos/seed/tech1/800/600'
  },
  {
    id: 3,
    name: 'Home Fix Experts',
    description: 'Reliable home repair and maintenance services.',
    category: 'Home Services',
    categoryId: 2,
    rating: 4.2,
    reviewCount: 156,
    image: 'https://picsum.photos/seed/home1/800/600'
  },
  {
    id: 4,
    name: 'Wellness Center',
    description: 'Holistic health and wellness services.',
    category: 'Healthcare',
    categoryId: 3,
    rating: 4.7,
    reviewCount: 92,
    image: 'https://picsum.photos/seed/health1/800/600'
  },
  {
    id: 5,
    name: 'Fashion Boutique',
    description: 'Trendy clothing and accessories for all styles.',
    category: 'Retail',
    categoryId: 4,
    rating: 4.4,
    reviewCount: 73,
    image: 'https://picsum.photos/seed/fashion1/800/600'
  },
  // Add more mock businesses to test pagination
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 6,
    name: `Business ${i + 6}`,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    category: categories[i % 5].name,
    categoryId: (i % 5) + 1,
    rating: 3 + Math.random() * 2,
    reviewCount: Math.floor(Math.random() * 200),
    image: `https://picsum.photos/seed/business${i + 6}/800/600`
  }))
])

// Filter and paginate businesses
const filteredBusinesses = computed(() => {
  return businesses.value.filter(business => {
    const matchesSearch = !filters.value.search || 
      business.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      business.description.toLowerCase().includes(filters.value.search.toLowerCase())
    
    const matchesCategory = !filters.value.category || 
      business.categoryId === parseInt(filters.value.category)
    
    const matchesRating = !filters.value.rating || 
      business.rating >= parseInt(filters.value.rating)
    
    return matchesSearch && matchesCategory && matchesRating
  })
})

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
})
</script>