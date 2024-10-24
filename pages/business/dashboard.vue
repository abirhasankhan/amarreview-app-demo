<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Business Dashboard</h1>

    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
    </div>

    <div v-else-if="!businessClaim" class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold mb-4">Get Started</h2>
      <p class="text-gray-600 mb-6">
        You haven't claimed any business yet. Claim your business to start managing your presence on AmarReview.
      </p>
      <NuxtLink
        to="/business/claim"
        class="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Claim Your Business
      </NuxtLink>
    </div>

    <div v-else class="space-y-8">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-2xl font-semibold">{{ businessClaim.business_name }}</h2>
            <p class="text-gray-600">{{ businessClaim.address }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <span
              :class="{
                'bg-yellow-100 text-yellow-800': businessClaim.status === 'pending',
                'bg-green-100 text-green-800': businessClaim.status === 'approved',
                'bg-red-100 text-red-800': businessClaim.status === 'rejected'
              }"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ businessClaim.status.charAt(0).toUpperCase() + businessClaim.status.slice(1) }}
            </span>
            <span v-if="isPremium" class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              Premium
            </span>
          </div>
        </div>

        <div v-if="businessClaim.status === 'pending'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p class="text-yellow-800">
            Your business claim is under review. We'll notify you once it's approved.
          </p>
        </div>

        <div v-else-if="businessClaim.status === 'approved'">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 class="text-lg font-semibold mb-4">Recent Reviews</h3>
              <div v-if="recentReviews.length === 0" class="text-gray-500 text-center py-4">
                No reviews yet
              </div>
              <div v-else class="space-y-4">
                <div v-for="review in recentReviews" :key="review.id" class="border-b pb-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex">
                        <span v-for="i in 5" :key="i">
                          <span :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">★</span>
                        </span>
                      </div>
                      <span class="ml-2 text-sm text-gray-600">{{ formatDate(review.created_at) }}</span>
                    </div>
                  </div>
                  <p class="mt-2 text-gray-600">{{ review.content }}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-semibold mb-4">Analytics</h3>
              <div class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600">Average Rating</p>
                  <p class="text-2xl font-semibold">{{ averageRating }}/5</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600">Total Reviews</p>
                  <p class="text-2xl font-semibold">{{ totalReviews }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                  <p class="text-sm text-gray-600">Profile Views (Last 30 days)</p>
                  <p class="text-2xl font-semibold">{{ profileViews }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Premium Features -->
          <div v-if="isPremium" class="space-y-8">
            <!-- Business Hours -->
            <CustomHours
              :initial-hours="businessHours"
              @update="updateBusinessHours"
            />

            <!-- Photo Gallery -->
            <PhotoGallery :business-id="businessClaim.business_id" />

            <!-- FAQ Management -->
            <div class="border-t pt-8">
              <div class="mb-6">
                <div class="flex items-center justify-between mb-4">
                  <h4 class="font-medium">Business FAQ</h4>
                  <button
                    @click="showFaqModal = true"
                    class="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Add FAQ
                  </button>
                </div>
                <div v-if="faqs.length === 0" class="text-gray-500 text-center py-4">
                  No FAQs added yet
                </div>
                <div v-else class="space-y-4">
                  <div v-for="faq in faqs" :key="faq.id" class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex items-center justify-between mb-2">
                      <h5 class="font-medium">{{ faq.question }}</h5>
                      <button
                        @click="deleteFaq(faq.id)"
                        class="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <p class="text-gray-600">{{ faq.answer }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Premium Upgrade CTA -->
          <div v-else class="mt-8 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <h3 class="text-lg font-semibold mb-2">Upgrade to Premium</h3>
            <p class="text-gray-600 mb-4">
              Get access to advanced features like business FAQ, verified business badge, and detailed analytics.
            </p>
            <button
              @click="showUpgradeModal = true"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals remain the same -->
  </div>
</template>

<script setup>
// ... existing imports and setup ...

// Mock business hours
const businessHours = ref({
  Monday: { open: '09:00', close: '17:00', closed: false },
  Tuesday: { open: '09:00', close: '17:00', closed: false },
  Wednesday: { open: '09:00', close: '17:00', closed: false },
  Thursday: { open: '09:00', close: '17:00', closed: false },
  Friday: { open: '09:00', close: '17:00', closed: false },
  Saturday: { open: '10:00', close: '15:00', closed: false },
  Sunday: { open: '', close: '', closed: true }
})

const updateBusinessHours = async (newHours) => {
  try {
    // Update hours in the database
    businessHours.value = newHours
  } catch (error) {
    console.error('Error updating business hours:', error)
  }
}

// ... rest of the existing script ...
</script>