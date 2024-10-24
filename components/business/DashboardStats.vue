<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Total Reviews</p>
          <p class="mt-1 text-2xl font-semibold">{{ stats.totalReviews }}</p>
        </div>
        <span class="text-2xl">📝</span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Average Rating</p>
          <p class="mt-1 text-2xl font-semibold">{{ stats.averageRating }}</p>
        </div>
        <span class="text-2xl">⭐</span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500">Profile Views</p>
          <p class="mt-1 text-2xl font-semibold">{{ stats.profileViews }}</p>
        </div>
        <span class="text-2xl">👁️</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true
  }
})
</script>