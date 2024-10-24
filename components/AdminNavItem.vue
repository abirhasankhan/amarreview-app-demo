<template>
  <NuxtLink
    :to="path"
    :class="[
      'flex items-center px-4 py-2 text-sm font-medium rounded-md',
      isActive
        ? 'bg-emerald-100 text-emerald-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    ]"
  >
    <span class="mr-3">{{ icon }}</span>
    {{ name }}
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }
})

const route = useRoute()
const isActive = computed(() => route.path === props.path)
</script>