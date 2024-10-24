<template>
  <div v-if="business">
    <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div class="flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">{{ business.name }}</h1>
          <p class="mt-2 text-gray-600">{{ business.description }}</p>
          <div class="mt-4 flex items-center">
            <div class="flex items-center">
              <span v-for="i in 5" :key="i">
                <span
                  class="text-2xl"
                  :class="i <= business.averageRating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </span>
              </span>
            </div>
            <span class="ml-2 text-lg">{{ business.averageRating }}/5</span>
            <span class="ml-2 text-gray-600">({{ business.totalReviews }} reviews)</span>
          </div>
        </div>
        
        <button
          v-if="user"
          @click="showReviewModal = true"
          class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Write a Review
        </button>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h3 class="text-lg font-semibold mb-2">Contact Information</h3>
          <p class="text-gray-600">{{ business.address }}</p>
          <p class="text-gray-600">{{ business.phone }}</p>
          <p class="text-gray-600">{{ business.email }}</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-2">Business Hours</h3>
          <div v-for="(hours, day) in business.hours" :key="day" class="flex justify-between text-gray-600">
            <span>{{ day }}:</span>
            <span>{{ hours }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <h2 class="text-2xl font-semibold">Reviews</h2>
      <div v-for="review in reviews" :key="review.id" class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <img
              :src="review.userAvatar"
              :alt="review.userName"
              class="w-10 h-10 rounded-full"
            />
            <div class="ml-4">
              <h3 class="font-semibold">{{ review.userName }}</h3>
              <div class="flex items-center mt-1">
                <span v-for="i in 5" :key="i">
                  <span
                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                  >
                    ★
                  </span>
                </span>
              </div>
            </div>
          </div>
          <span class="text-sm text-gray-500">{{ review.date }}</span>
        </div>
        <p class="mt-4 text-gray-600">{{ review.content }}</p>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 class="text-2xl font-semibold mb-4">Write a Review</h2>
        <form @submit.prevent="submitReview">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Rating</label>
            <div class="flex items-center mt-1">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                @click="newReview.rating = i"
                class="text-2xl focus:outline-none"
                :class="i <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'"
              >
                ★
              </button>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Review</label>
            <textarea
              v-model="newReview.content"
              rows="4"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="showReviewModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const user = useSupabaseUser()
const client = useSupabaseClient()

const showReviewModal = ref(false)
const newReview = ref({
  rating: 0,
  content: ''
})

// Mock data - replace with Supabase queries
const business = ref({
  id: route.params.id,
  name: 'Sample Business',
  description: 'A great local business serving the community.',
  averageRating: 4.5,
  totalReviews: 128,
  address: '123 Main St, City, State 12345',
  phone: '(555) 123-4567',
  email: 'contact@business.com',
  hours: {
    Monday: '9:00 AM - 5:00 PM',
    Tuesday: '9:00 AM - 5:00 PM',
    Wednesday: '9:00 AM - 5:00 PM',
    Thursday: '9:00 AM - 5:00 PM',
    Friday: '9:00 AM - 5:00 PM',
    Saturday: '10:00 AM - 3:00 PM',
    Sunday: 'Closed'
  }
})

const reviews = ref([
  {
    id: 1,
    userName: 'John Doe',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    rating: 5,
    content: 'Excellent service! Would definitely recommend.',
    date: '2 days ago'
  },
  {
    id: 2,
    userName: 'Jane Smith',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    rating: 4,
    content: 'Good experience overall. Staff was very helpful.',
    date: '1 week ago'
  }
])

const submitReview = async () => {
  try {
    // Add review to Supabase
    const { data, error } = await client
      .from('reviews')
      .insert({
        business_id: route.params.id,
        user_id: user.value.id,
        rating: newReview.value.rating,
        content: newReview.value.content
      })

    if (error) throw error

    // Update UI
    reviews.value.unshift({
      id: data[0].id,
      userName: user.value.user_metadata.full_name,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.value.id}`,
      rating: newReview.value.rating,
      content: newReview.value.content,
      date: 'Just now'
    })

    showReviewModal.value = false
    newReview.value = { rating: 0, content: '' }
  } catch (error) {
    console.error('Error submitting review:', error)
  }
}
</script>