<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Claim Your Business</h1>
    
    <div v-if="!user" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
      <p class="text-yellow-800">
        Please <NuxtLink to="/auth/login" class="text-yellow-900 underline">sign in</NuxtLink> 
        or <NuxtLink to="/auth/register" class="text-yellow-900 underline">create an account</NuxtLink> 
        to claim your business.
      </p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="businessName" class="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          id="businessName"
          v-model="form.businessName"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="address" class="block text-sm font-medium text-gray-700">Business Address</label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700">Business Phone</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="website" class="block text-sm font-medium text-gray-700">Business Website</label>
        <input
          id="website"
          v-model="form.website"
          type="url"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="role" class="block text-sm font-medium text-gray-700">Your Role at the Business</label>
        <select
          id="role"
          v-model="form.role"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Select your role</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <div>
        <label for="verification" class="block text-sm font-medium text-gray-700">
          Verification Document
        </label>
        <div class="mt-1">
          <input
            id="verification"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileChange"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p class="mt-1 text-sm text-gray-500">
            Upload a business license, utility bill, or other document proving your association with the business
          </p>
        </div>
      </div>

      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
      >
        {{ isSubmitting ? 'Submitting...' : 'Submit Claim' }}
      </button>
    </form>

    <div v-if="submitted" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-semibold mb-4">Claim Submitted!</h2>
        <p class="text-gray-600 mb-6">
          Thank you for submitting your business claim. Our team will review your submission and contact you within 2-3 business days.
        </p>
        <button
          @click="handleClose"
          class="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const form = ref({
  businessName: '',
  address: '',
  phone: '',
  website: '',
  role: '',
  verificationFile: null
})

const error = ref(null)
const isSubmitting = ref(false)
const submitted = ref(false)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.verificationFile = file
  }
}

const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = null

    // Upload verification document
    const fileExt = form.value.verificationFile.name.split('.').pop()
    const fileName = `${user.value.id}-${Date.now()}.${fileExt}`
    const { error: uploadError } = await client.storage
      .from('verification-docs')
      .upload(fileName, form.value.verificationFile)

    if (uploadError) throw uploadError

    // Create business claim record
    const { error: claimError } = await client
      .from('business_claims')
      .insert({
        user_id: user.value.id,
        business_name: form.value.businessName,
        address: form.value.address,
        phone: form.value.phone,
        website: form.value.website,
        role: form.value.role,
        verification_doc: fileName,
        status: 'pending'
      })

    if (claimError) throw claimError

    submitted.value = true
  } catch (e) {
    error.value = e.message
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  submitted.value = false
  router.push('/')
}
</script>