<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-lg font-semibold mb-4">Business Status</h2>
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Profile Completion</span>
        <span class="font-medium">{{ completion }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-emerald-600 h-2 rounded-full"
          :style="{ width: `${completion}%` }"
        ></div>
      </div>
      <div v-if="completion < 100">
        <p class="text-sm text-gray-500 mt-2">Complete your profile to improve visibility:</p>
        <ul class="mt-2 space-y-1 text-sm text-gray-600">
          <li v-for="(item, index) in missingItems" :key="index">
            • {{ item }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  completion: {
    type: Number,
    required: true
  },
  missingItems: {
    type: Array,
    default: () => []
  }
})
</script>