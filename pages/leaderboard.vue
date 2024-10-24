<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <header class="text-center mb-8 sm:mb-12">
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Top Reviewers</h1>
      <p class="text-lg sm:text-xl text-gray-600">Recognizing our most active and helpful community members</p>
    </header>

    <!-- Time Period Filter -->
    <div class="flex justify-end mb-6 sm:mb-8">
      <select
        v-model="timePeriod"
        class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        <option value="all-time">All Time</option>
        <option value="this-month">This Month</option>
        <option value="this-week">This Week</option>
      </select>
    </div>

    <!-- Top 3 Reviewers -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
      <div
        v-for="(reviewer, index) in topThree"
        :key="reviewer.id"
        class="relative bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center"
        :class="{
          'lg:transform lg:-translate-y-4': index === 1,
          'order-2 lg:order-1': index === 0,
          'order-1 lg:order-2': index === 1,
          'order-3': index === 2
        }"
      >
        <!-- Crown for #1 -->
        <div
          v-if="index === 1"
          class="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl sm:text-4xl"
        >
          👑
        </div>
        
        <div class="relative inline-block">
          <img
            :src="reviewer.avatar"
            :alt="reviewer.name"
            class="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 sm:mb-4"
          />
          <span
            class="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg font-bold"
            :class="{
              'bg-yellow-400 text-white': index === 1,
              'bg-gray-300 text-gray-700': index === 0,
              'bg-amber-600 text-white': index === 2
            }"
            style="border-radius: 50%"
          >
            {{ index === 0 ? '2' : index === 1 ? '1' : '3' }}
          </span>
        </div>
        
        <h3 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">{{ reviewer.name }}</h3>
        <p class="text-emerald-600 font-medium mb-3 sm:mb-4">{{ reviewer.rank }}</p>
        
        <div class="space-y-2">
          <div class="flex items-center justify-center gap-2">
            <span class="text-gray-500">📝</span>
            <span class="font-medium">{{ reviewer.totalReviews }} Reviews</span>
          </div>
          <div class="flex items-center justify-center gap-2">
            <span class="text-gray-500">👍</span>
            <span class="font-medium">{{ reviewer.helpfulVotes }} Helpful Votes</span>
          </div>
          <div class="flex items-center justify-center gap-2">
            <span class="text-gray-500">⭐</span>
            <span class="font-medium">{{ reviewer.score }} Points</span>
          </div>
        </div>

        <div class="mt-3 sm:mt-4 flex flex-wrap justify-center gap-2">
          <span
            v-for="badge in reviewer.topBadges"
            :key="badge"
            class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            :class="getBadgeClass(badge)"
          >
            {{ badge }}
          </span>
        </div>
      </div>
    </div>

    <!-- Leaderboard Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Desktop Table -->
      <div class="hidden sm:block">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviewer
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Helpful Votes
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Badges
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(reviewer, index) in otherReviewers" :key="reviewer.id">
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ index + 4 }}
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <img
                    :src="reviewer.avatar"
                    :alt="reviewer.name"
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                  />
                  <div class="ml-3 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ reviewer.name }}</div>
                    <div class="text-sm text-gray-500">{{ reviewer.rank }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ reviewer.totalReviews }}
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ reviewer.helpfulVotes }}
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ reviewer.score }}
              </td>
              <td class="px-4 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="badge in reviewer.topBadges.slice(0, 2)"
                    :key="badge"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                    :class="getBadgeClass(badge)"
                  >
                    {{ badge }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="sm:hidden divide-y divide-gray-200">
        <div
          v-for="(reviewer, index) in otherReviewers"
          :key="reviewer.id"
          class="p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center">
              <img
                :src="reviewer.avatar"
                :alt="reviewer.name"
                class="w-10 h-10 rounded-full"
              />
              <div class="ml-3">
                <div class="font-medium">{{ reviewer.name }}</div>
                <div class="text-sm text-gray-500">{{ reviewer.rank }}</div>
              </div>
            </div>
            <div class="text-lg font-semibold text-gray-500">
              #{{ index + 4 }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span class="text-gray-500">Reviews:</span>
              <span class="font-medium ml-1">{{ reviewer.totalReviews }}</span>
            </div>
            <div>
              <span class="text-gray-500">Helpful:</span>
              <span class="font-medium ml-1">{{ reviewer.helpfulVotes }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-gray-500">Score:</span>
              <span class="font-medium ml-1">{{ reviewer.score }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span
              v-for="badge in reviewer.topBadges.slice(0, 2)"
              :key="badge"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getBadgeClass(badge)"
            >
              {{ badge }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const timePeriod = ref('all-time')

// Mock data for reviewers
const mockReviewers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    rank: 'Elite Reviewer',
    totalReviews: 156,
    helpfulVotes: 423,
    score: 892,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    topBadges: ['Elite Critic', 'Trend Setter', 'Photo Expert']
  },
  {
    id: 2,
    name: 'Michael Chen',
    rank: 'Master Reviewer',
    totalReviews: 203,
    helpfulVotes: 567,
    score: 1245,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    topBadges: ['Master Critic', 'Community Leader', 'Restaurant Expert']
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    rank: 'Elite Reviewer',
    totalReviews: 134,
    helpfulVotes: 389,
    score: 845,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    topBadges: ['Elite Critic', 'Local Guide', 'Helpful Pro']
  },
  {
    id: 4,
    name: 'David Kim',
    rank: 'Senior Reviewer',
    totalReviews: 98,
    helpfulVotes: 276,
    score: 654,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    topBadges: ['Rising Star', 'Photo Expert']
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    rank: 'Senior Reviewer',
    totalReviews: 87,
    helpfulVotes: 245,
    score: 589,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    topBadges: ['Rising Star', 'Service Pro']
  }
]

// Sort reviewers by score
const sortedReviewers = computed(() => {
  return [...mockReviewers].sort((a, b) => b.score - a.score)
})

// Get top 3 reviewers
const topThree = computed(() => sortedReviewers.value.slice(0, 3))

// Get other reviewers
const otherReviewers = computed(() => sortedReviewers.value.slice(3))

// Badge styling helper
const getBadgeClass = (badge) => {
  const classes = {
    'Master Critic': 'bg-purple-100 text-purple-800',
    'Elite Critic': 'bg-yellow-100 text-yellow-800',
    'Rising Star': 'bg-blue-100 text-blue-800',
    'Community Leader': 'bg-red-100 text-red-800',
    'Local Guide': 'bg-green-100 text-green-800',
    'Photo Expert': 'bg-indigo-100 text-indigo-800',
    'Restaurant Expert': 'bg-orange-100 text-orange-800',
    'Helpful Pro': 'bg-pink-100 text-pink-800',
    'Trend Setter': 'bg-teal-100 text-teal-800',
    'Service Pro': 'bg-cyan-100 text-cyan-800'
  }
  return classes[badge] || 'bg-gray-100 text-gray-800'
}

// SEO
useHead({
  title: 'Leaderboard - AmarReview',
  meta: [
    {
      name: 'description',
      content: 'See our top reviewers and most active community members.'
    }
  ]
})
</script>