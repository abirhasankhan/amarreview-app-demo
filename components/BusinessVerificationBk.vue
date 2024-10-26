<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold">Business Verification</h2>
        <p class="text-sm text-gray-600 mt-1">
          Upload your business registration documents to get the "Registered Business" badge
        </p>
      </div>
      <div v-if="verificationStatus" class="flex items-center">
        <span
          class="px-3 py-1 rounded-full text-sm font-medium"
          :class="{
            'bg-yellow-100 text-yellow-800': verificationStatus === 'pending',
            'bg-green-100 text-green-800': verificationStatus === 'verified',
            'bg-red-100 text-red-800': verificationStatus === 'rejected'
          }"
        >
          {{ formatStatus(verificationStatus) }}
        </span>
      </div>
    </div>

    <div
      v-if="!verificationStatus || verificationStatus === 'rejected'"
      class="bg-white rounded-lg shadow-sm p-6"
    >
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Registration Number -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Business Registration Number
          </label>
          <input
            v-model="form.registrationNumber"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <!-- Registration Authority -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Registration Authority
          </label>
          <input
            v-model="form.authority"
            type="text"
            required
            placeholder="e.g., Chamber of Commerce"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <!-- Registration Date -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Registration Date
          </label>
          <input
            v-model="form.registrationDate"
            type="date"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <!-- Document Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Registration Documents
          </label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label
                  for="file-upload"
                  class="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    class="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    @change="handleFileChange"
                    required
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">
                PDF, PNG, JPG up to 10MB
              </p>
            </div>
          </div>
          <div v-if="form.file" class="mt-2 text-sm text-gray-600">
            Selected file: {{ form.file.name }}
          </div>
        </div>

        <!-- Additional Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any additional information about your business registration"
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit for Verification' }}
          </button>
        </div>
      </form>
    </div>

    <div
      v-else-if="verificationStatus === 'pending'"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-yellow-400 text-xl">⏳</span>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Verification in Progress</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>
              Your business registration documents are being reviewed. This process typically
              takes 2-3 business days. We'll notify you once the verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="verificationStatus === 'verified'"
      class="bg-green-50 border border-green-200 rounded-lg p-6"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-green-400 text-xl">✓</span>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800">Verification Complete</h3>
          <div class="mt-2 text-sm text-green-700">
            <p>
              Your business is now verified! The "Registered Business" badge is displayed
              on your business profile.
            </p>
          </div>
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
  }
})

const verificationStatus = ref('pending') // 'pending', 'verified', 'rejected', or null
const isSubmitting = ref(false)
const form = ref({
  registrationNumber: '',
  authority: '',
  registrationDate: '',
  file: null,
  notes: ''
})

const formatStatus = (status) => {
  const formats = {
    pending: 'Under Review',
    verified: 'Verified',
    rejected: 'Rejected'
  }
  return formats[status] || status
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      event.target.value = ''
      return
    }
    form.value.file = file
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Mock API call to upload documents and submit verification request
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update verification status
    verificationStatus.value = 'pending'

    // Reset form
    form.value = {
      registrationNumber: '',
      authority: '',
      registrationDate: '',
      file: null,
      notes: ''
    }
  } catch (error) {
    console.error('Error submitting verification:', error)
  } finally {
    isSubmitting.value = false
  }
}

// Fetch initial verification status
onMounted(async () => {
  try {
    // Mock API call to get verification status
    await new Promise(resolve => setTimeout(resolve, 500))
    // verificationStatus.value = 'pending' // Already set above
  } catch (error) {
    console.error('Error fetching verification status:', error)
  }
})
</script>