<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Recent Reviews</h2>
      <NuxtLink
        to="/business/reviews"
        class="text-sm text-emerald-600 hover:text-emerald-700"
      >
        View all
      </NuxtLink>
    </div>
    <div class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <img
              :src="review.userAvatar"
              :alt="review.userName"
              class="w-8 h-8 rounded-full"
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
        </div>
        <p class="mt-2 text-gray-600">{{ review.content }}</p>
        <button
          v-if="!review.response"
          @click="$emit('respond', review)"
          class="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          Respond to review
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  reviews: {
    type: Array,
    required: true
  }
})

defineEmits(['respond'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>