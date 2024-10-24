<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Frequently Asked Questions</h2>
      <button
        v-if="isOwner && isPremium"
        @click="showAddModal = true"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Add FAQ
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="faq in faqs"
        :key="faq.id"
        class="bg-white rounded-lg shadow-sm"
      >
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3
              class="text-lg font-medium cursor-pointer"
              @click="faq.isOpen = !faq.isOpen"
            >
              {{ faq.question }}
            </h3>
            <div v-if="isOwner && isPremium" class="flex items-center ml-4">
              <button
                @click="editFAQ(faq)"
                class="text-gray-400 hover:text-gray-600 mr-2"
              >
                ✏️
              </button>
              <button
                @click="deleteFAQ(faq.id)"
                class="text-gray-400 hover:text-gray-600"
              >
                🗑️
              </button>
            </div>
          </div>
          <div v-show="faq.isOpen" class="text-gray-600">
            {{ faq.answer }}
          </div>
        </div>
      </div>

      <div v-if="faqs.length === 0" class="text-center text-gray-500 py-8">
        No FAQs available
      </div>
    </div>

    <!-- Add/Edit FAQ Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">
              {{ selectedFAQ ? 'Edit FAQ' : 'Add FAQ' }}
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Question</label>
              <input
                v-model="form.question"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Answer</label>
              <textarea
                v-model="form.answer"
                rows="4"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                {{ selectedFAQ ? 'Save Changes' : 'Add FAQ' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  businessId: {
    type: String,
    required: true
  },
  isOwner: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  }
})

const showAddModal = ref(false)
const selectedFAQ = ref(null)
const form = ref({
  question: '',
  answer: ''
})

// Mock FAQs data
const faqs = ref([
  {
    id: 1,
    question: 'What are your business hours?',
    answer: 'We are open Monday through Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays.',
    isOpen: false
  },
  {
    id: 2,
    question: 'Do you offer delivery services?',
    answer: 'Yes, we offer delivery within a 5-mile radius. Delivery fees may apply depending on the distance and order size.',
    isOpen: false
  }
])

const closeModal = () => {
  showAddModal.value = false
  selectedFAQ.value = null
  form.value = {
    question: '',
    answer: ''
  }
}

const editFAQ = (faq) => {
  selectedFAQ.value = faq
  form.value = {
    question: faq.question,
    answer: faq.answer
  }
  showAddModal.value = true
}

const deleteFAQ = async (id) => {
  if (!confirm('Are you sure you want to delete this FAQ?')) return

  try {
    // Delete FAQ logic here
    faqs.value = faqs.value.filter(faq => faq.id !== id)
  } catch (error) {
    console.error('Error deleting FAQ:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (selectedFAQ.value) {
      // Update existing FAQ
      const index = faqs.value.findIndex(f => f.id === selectedFAQ.value.id)
      faqs.value[index] = {
        ...faqs.value[index],
        ...form.value
      }
    } else {
      // Add new FAQ
      faqs.value.push({
        id: Date.now(),
        ...form.value,
        isOpen: false
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving FAQ:', error)
  }
}
</script>