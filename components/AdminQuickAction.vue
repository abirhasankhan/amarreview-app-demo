<template>
  <button
    class="flex flex-col items-center p-4 rounded-lg transition-colors"
    :class="color"
    @click="$emit('click')"
  >
    <span class="text-2xl mb-2">{{ icon }}</span>
    <h3 class="font-medium text-sm mb-1">{{ title }}</h3>
    <p class="text-xs text-center">{{ description }}</p>
  </button>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  }
})

defineEmits(['click'])
</script>