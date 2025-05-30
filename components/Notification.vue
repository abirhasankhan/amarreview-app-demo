<template>
  <div v-if="show" class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
    <div class="max-w-auto w-full rounded-lg shadow-lg overflow-hidden" :class="notificationClass">
      <!-- Notification content -->
      <div class="p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <!-- Dynamically render icons based on type -->
            <svg v-if="type === 'success'" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else-if="type === 'error'" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else-if="type === 'info'" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M12 3h.01M5 12h.01M19 12h.01M7 12h.01M17 12h.01" />
            </svg>
            <svg v-else-if="type === 'warning'" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M12 3h.01M5 12h.01M19 12h.01M7 12h.01M17 12h.01" />
            </svg>
          </div>
          <div class="ml-3 w-auto flex-1 pt-0.5">
            <p class="text-sm font-medium" :class="textColor">
              {{ title }}
            </p>
            <p class="mt-1 text-sm" :class="messageTextColor">
              {{ message }}
            </p>
          </div>
          <div class="ml-4 flex flex-shrink-0">
            <button @click="close" class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="closeButtonClass">
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 5000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const show = ref(false)
let timeoutId = null

const close = () => {
  show.value = false
  setTimeout(() => {
    emit('close')
  }, 300) // Time for transition
}

onMounted(() => {
  setTimeout(() => {
    show.value = true
    if (props.autoClose && props.duration > 0) {
      timeoutId = setTimeout(() => {
        close()
      }, props.duration)
    }
  }, 100)
})

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

watch(() => props.message, () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  show.value = true
  if (props.autoClose && props.duration > 0) {
    timeoutId = setTimeout(() => {
      close()
    }, props.duration)
  }
})

// Dynamic classes based on notification type
const notificationClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50'
    case 'error':
      return 'bg-red-50'
    case 'info':
      return 'bg-blue-50'
    case 'warning':
      return 'bg-yellow-50'
    default:
      return 'bg-green-50'
  }
})

const textColor = computed(() => {
  return props.type === 'success' ? 'text-green-800' :
    props.type === 'error' ? 'text-red-800' :
      props.type === 'info' ? 'text-blue-800' : 'text-yellow-800'
})

const messageTextColor = computed(() => {
  return props.type === 'success' ? 'text-green-700' :
    props.type === 'error' ? 'text-red-700' :
      props.type === 'info' ? 'text-blue-700' : 'text-yellow-700'
})

const closeButtonClass = computed(() => {
  return props.type === 'success' ? 'text-green-500 hover:text-green-600' :
    props.type === 'error' ? 'text-red-500 hover:text-red-600' :
      props.type === 'info' ? 'text-blue-500 hover:text-blue-600' : 'text-yellow-500 hover:text-yellow-600'
})
</script>
