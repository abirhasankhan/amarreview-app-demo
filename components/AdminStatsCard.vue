<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-500">{{ title }}</p>
        <p class="mt-1 text-2xl font-semibold">{{ value }}</p>
      </div>
      <span class="text-2xl">{{ icon }}</span>
    </div>
    <div class="mt-4">
      <span
        class="inline-flex items-center text-sm"
        :class="{
          'text-green-600': trendDirection === 'up',
          'text-red-600': trendDirection === 'down'
        }"
      >
        {{ trendDirection === 'up' ? '↑' : '↓' }}
        {{ trend }}
      </span>
      <span class="text-sm text-gray-500 ml-2">vs last month</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  trend: {
    type: String,
    required: true
  },
  trendDirection: {
    type: String,
    required: true,
    validator: (value) => ['up', 'down'].includes(value)
  },
  icon: {
    type: String,
    required: true
  }
})
</script>