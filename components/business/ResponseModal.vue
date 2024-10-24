<template>
  <div
    v-if="review"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-lg max-w-lg w-full">
      <div class="p-6">
        <div class="flex justify-between items-start mb-6">
          <h2 class="text-xl font-semibold">Respond to Review</h2>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div class="mb-4">
          <div class="flex items-center mb-2">
            <img
              :src="review.userAvatar"
              :alt="review.userName"
              class="w-8 h-8 rounded-full"
            />
            <div class="ml-3">
              <p class="font-medium">{{ review.userName }}</p>
              <div class="flex items-center">
                <div class="flex">
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
          </div>
          <p class="text-gray-600">{{ review.content }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Your Response</label>
            <textarea
              v-model="responseText"
              rows="4"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  review: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'submit'])
const responseText = ref('')

const handleSubmit = () => {
  emit('submit', responseText.value)
  responseText.value = ''
}
</script>