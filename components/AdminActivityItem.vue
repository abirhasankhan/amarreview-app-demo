<template>
  <div class="flex items-start space-x-3">
    <div class="flex-shrink-0">
      <span class="text-2xl">
        {{ getActivityIcon(activity.type) }}
      </span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm text-gray-900">
        <span class="font-medium">{{ activity.user }}</span>
        {{ activity.action }}
        <span class="font-medium">{{ activity.target }}</span>
      </p>
      <p class="text-sm text-gray-500">{{ activity.time }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const getActivityIcon = (type) => {
  const icons = {
    review: '📝',
    claim: '🏢',
    report: '⚠️',
    user: '👤'
  }
  return icons[type] || '📋'
}
</script>