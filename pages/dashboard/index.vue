<template>
  <div class="max-w-7xl mx-auto">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
      <p class="mt-4 text-gray-600">Loading your dashboard...</p>
    </div>

    <div v-else>
      <!-- User Stats -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold">Your Dashboard</h1>
          <span :class="[userStats.rank.color, 'px-3 py-1 rounded-full text-sm font-medium']">
            {{ userStats.rank.name }}
          </span>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Total Reviews</p>
            <p class="text-2xl font-semibold">{{ userStats.totalReviews }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Helpful Votes</p>
            <p class="text-2xl font-semibold">{{ userStats.helpfulVotes }}</p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Review Score</p>
            <p class="text-2xl font-semibold">{{ userStats.reviewScore }}</p>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold mb-6">Your Badges</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="badge in userBadges"
            :key="badge.id"
            class="relative bg-gray-50 p-4 rounded-lg"
            :class="{ 'opacity-50': !badge.unlocked }"
          >
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">{{ badge.icon }}</span>
              <div>
                <h3 class="font-medium">{{ badge.name }}</h3>
                <p class="text-sm text-gray-600">{{ badge.description }}</p>
              </div>
            </div>
            <div class="mt-2">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-emerald-600 h-2 rounded-full"
                  :style="{ width: `${badge.progress}%` }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                {{ badge.currentCount }}/{{ badge.requiredCount }}
              </p>
            </div>
            <div
              v-if="!badge.unlocked"
              class="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg"
            >
              <span class="text-gray-500">🔒</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold">Your Reviews</h2>
          <select
            v-model="filters.sort"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>

        <div class="space-y-6">
          <div
            v-for="review in sortedReviews"
            :key="review.id"
            class="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
          >
            <div class="flex items-start justify-between">
              <div>
                <NuxtLink
                  :to="`/businesses/${review.business.id}`"
                  class="text-lg font-medium hover:text-emerald-600"
                >
                  {{ review.business.name }}
                </NuxtLink>
                <p class="text-sm text-gray-500">{{ review.business.category }}</p>
              </div>
              <div class="flex items-center space-x-4">
                <button
                  @click="editReview(review)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  ✏️
                </button>
                <button
                  @click="deleteReview(review.id)"
                  class="text-gray-400 hover:text-gray-600"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div class="flex items-center mt-2">
              <div class="flex">
                <span v-for="i in 5" :key="i">
                  <span
                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ★
                  </span>
                </span>
              </div>
              <span class="ml-2 text-sm text-gray-600">
                {{ formatDate(review.created_at) }}
              </span>
            </div>

            <p class="mt-3 text-gray-600">{{ review.content }}</p>

            <div class="mt-4 flex items-center space-x-6">
              <span class="flex items-center text-sm text-gray-500">
                <span class="mr-1">👍</span>
                {{ review.helpful_votes }} helpful votes
              </span>
              <span class="flex items-center text-sm text-gray-500">
                <span class="mr-1">💬</span>
                {{ review.comments }} comments
              </span>
            </div>

            <div v-if="review.badges?.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="badge in review.badges"
                :key="badge"
                class="px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full"
              >
                {{ badge }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()

const loading = ref(true)
const userReviews = ref([])
const filters = ref({
  sort: 'recent'
})

// Mock user stats with ranking system
const userStats = ref({
  totalReviews: 15,
  helpfulVotes: 47,
  reviewScore: 162,
  rank: {
    name: 'Gold Reviewer',
    color: 'bg-yellow-100 text-yellow-800'
  }
})

// Enhanced badge system
const userBadges = ref([
  {
    id: 1,
    name: 'Rookie Reviewer',
    icon: '🌟',
    description: 'Write your first review',
    unlocked: true,
    requiredCount: 1,
    currentCount: 1,
    progress: 100
  },
  {
    id: 2,
    name: 'Trusted Reviewer',
    icon: '🏆',
    description: 'Get 10 helpful votes',
    unlocked: true,
    requiredCount: 10,
    currentCount: 47,
    progress: 100
  },
  {
    id: 3,
    name: 'Elite Critic',
    icon: '👑',
    description: 'Write 10 reviews',
    unlocked: true,
    requiredCount: 10,
    currentCount: 15,
    progress: 100
  },
  {
    id: 4,
    name: 'Category Expert',
    icon: '🎓',
    description: 'Review 5 businesses in one category',
    unlocked: false,
    requiredCount: 5,
    currentCount: 3,
    progress: 60
  }
])

// Format date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    business: {
      id: 1,
      name: 'Green Garden Restaurant',
      category: 'Restaurants'
    },
    rating: 5,
    content: 'Amazing farm-to-table experience! The vegetables were incredibly fresh, and you could really taste the difference. The service was impeccable, and the atmosphere was perfect for a special dinner.',
    created_at: '2024-03-15T18:30:00Z',
    helpful_votes: 23,
    comments: 5,
    badges: ['Top Review', 'Photo Review']
  },
  {
    id: 2,
    business: {
      id: 2,
      name: 'Tech Solutions Pro',
      category: 'Professional Services'
    },
    rating: 4,
    content: 'Quick and professional service. They fixed my laptop issue in under an hour. Pricing was reasonable too. Only giving 4 stars because the wait time was a bit long.',
    created_at: '2024-03-10T14:20:00Z',
    helpful_votes: 12,
    comments: 2
  },
  {
    id: 3,
    business: {
      id: 3,
      name: 'Wellness Center',
      category: 'Healthcare'
    },
    rating: 5,
    content: 'Dr. Smith is amazing! Very thorough and takes time to explain everything. The facility is clean and modern, and the staff is friendly and professional.',
    created_at: '2024-03-05T09:15:00Z',
    helpful_votes: 8,
    comments: 1,
    badges: ['Verified Visit']
  }
];
// Sort reviews based on filter
const sortedReviews = computed(() => {
  const reviews = [...mockReviews]
  switch (filters.value.sort) {
    case 'helpful':
      return reviews.sort((a, b) => b.helpful_votes - a.helpful_votes)
    case 'rating':
      return reviews.sort((a, b) => b.rating - a.rating)
    case 'recent':
    default:
      return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

// Edit review
const editReview = (review) => {
  // Implement edit functionality
  console.log('Edit review:', review.id)
}

// Delete review
const deleteReview = async (reviewId) => {
  if (!confirm('Are you sure you want to delete this review?')) return

  try {
    // Mock deletion
    mockReviews.splice(mockReviews.findIndex(r => r.id === reviewId), 1)
    
    // Update stats
    userStats.value.totalReviews--
    // Update badges
    updateBadges()
  } catch (error) {
    console.error('Error deleting review:', error)
  }
}

// Update badges
const updateBadges = () => {
  // Implementation for updating badges based on user activity
  userBadges.value = userBadges.value.map(badge => {
    switch (badge.id) {
      case 1: // Rookie Reviewer
        badge.unlocked = userStats.value.totalReviews > 0
        badge.currentCount = Math.min(1, userStats.value.totalReviews)
        break
      case 2: // Trusted Reviewer
        badge.currentCount = userStats.value.helpfulVotes
        badge.unlocked = badge.currentCount >= badge.requiredCount
        badge.progress = Math.min(100, (badge.currentCount / badge.requiredCount) * 100)
        break
      case 3: // Elite Critic
        badge.currentCount = userStats.value.totalReviews
        badge.unlocked = badge.currentCount >= badge.requiredCount
        badge.progress = Math.min(100, (badge.currentCount / badge.requiredCount) * 100)
        break
      // Add more badge logic as needed
    }
    return badge
  })
}

// Initialize with mock data
onMounted(() => {
  loading.value = false
  userReviews.value = mockReviews
})
</script>