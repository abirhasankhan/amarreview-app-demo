<template>
  <BusinessLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Reviews</h1>
        <div class="flex gap-4">
          <select
            v-model="filters.rating"
            class="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <select
            v-model="filters.response"
            class="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Reviews</option>
            <option value="responded">Responded</option>
            <option value="unresponded">Needs Response</option>
          </select>
        </div>
      </div>

      <!-- Reviews List -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 space-y-6">
          <div
            v-for="review in filteredReviews"
            :key="review.id"
            class="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center">
                <img
                  :src="review.userAvatar"
                  :alt="review.userName"
                  class="w-10 h-10 rounded-full"
                />
                <div class="ml-3">
                  <p class="font-medium">{{ review.userName }}</p>
                  <div class="flex items-center mt-1">
                    <div class="flex">
                      <span v-for="i in 5" :key="i">
                        <span
                          :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                        >
                          ★
                        </span>
                      </span>
                    </div>
                    <span class="ml-2 text-sm text-gray-500">
                      {{ formatDate(review.date) }}
                    </span>
                  </div>
                </div>
              </div>
              <button
                v-if="!review.response"
                @click="respondToReview(review)"
                class="text-emerald-600 hover:text-emerald-700"
              >
                Respond
              </button>
            </div>

            <p class="mt-3 text-gray-600">{{ review.content }}</p>

            <div v-if="review.response" class="mt-4 pl-4 border-l-4 border-gray-200">
              <div class="flex items-center">
                <span class="font-medium">Business Response</span>
                <span class="ml-2 text-sm text-gray-500">
                  {{ formatDate(review.response.date) }}
                </span>
              </div>
              <p class="mt-2 text-gray-600">{{ review.response.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Response Modal -->
    <ResponseModal
      v-if="selectedReview"
      :review="selectedReview"
      @close="selectedReview = null"
      @submit="submitResponse"
    />
  </BusinessLayout>
</template>

<script setup>
const filters = ref({
  rating: '',
  response: ''
})

const selectedReview = ref(null)

// Mock reviews data
const reviews = ref([
  {
    id: 1,
    userName: 'John Doe',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    rating: 5,
    content: 'Amazing food and great service! The atmosphere was perfect for our anniversary dinner.',
    date: '2024-04-01T10:00:00Z',
    response: {
      content: "Thank you for your kind words! We're delighted that you chose us for your special occasion.",
      date: '2024-04-01T14:30:00Z'
    }
  },
  {
    id: 2,
    userName: 'Sarah Smith',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 4,
    content: 'Good food but the wait was a bit long. Would still recommend.',
    date: '2024-03-28T15:00:00Z'
  }
])

const filteredReviews = computed(() => {
  return reviews.value.filter(review => {
    const matchesRating = !filters.value.rating || review.rating === parseInt(filters.value.rating)
    const matchesResponse = !filters.value.response || 
      (filters.value.response === 'responded' && review.response) ||
      (filters.value.response === 'unresponded' && !review.response)
    return matchesRating && matchesResponse
  })
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const respondToReview = (review) => {
  selectedReview.value = review
}

const submitResponse = async (response) => {
  try {
    const review = reviews.value.find(r => r.id === selectedReview.value.id)
    review.response = {
      content: response,
      date: new Date().toISOString()
    }
    selectedReview.value = null
  } catch (error) {
    console.error('Error submitting response:', error)
  }
}
</script>