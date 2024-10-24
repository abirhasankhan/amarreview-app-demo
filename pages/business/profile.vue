<template>
  <NuxtLayout name="business">
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Business Profile</h1>
        <div v-if="isSaving" class="text-sm text-gray-600">
          Saving changes...
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <ClientOnly>
          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h2 class="text-lg font-medium mb-4">Basic Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Business Name</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    v-model="form.category"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    v-model="form.description"
                    rows="4"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div>
              <h2 class="text-lg font-medium mb-4">Contact Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <input
                    v-model="form.website"
                    type="url"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Social Media</label>
                  <input
                    v-model="form.social"
                    type="text"
                    placeholder="Facebook, Instagram, etc."
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <!-- Location -->
            <div>
              <h2 class="text-lg font-medium mb-4">Location</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    v-model="form.address"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">City</label>
                  <input
                    v-model="form.city"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">State/Province</label>
                  <input
                    v-model="form.state"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                  <input
                    v-model="form.postalCode"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Country</label>
                  <input
                    v-model="form.country"
                    type="text"
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isSaving"
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </form>
        </ClientOnly>
      </div>

      <!-- Business Verification -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <ClientOnly>
          <BusinessVerification />
        </ClientOnly>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const isSaving = ref(false)

// Mock categories
const categories = ref([
  { id: 1, name: 'Restaurants' },
  { id: 2, name: 'Home Services' },
  { id: 3, name: 'Healthcare' },
  { id: 4, name: 'Retail' },
  { id: 5, name: 'Professional Services' }
])

// Form data with default values
const form = ref({
  name: '',
  category: '',
  description: '',
  phone: '',
  email: '',
  website: '',
  social: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: ''
})

// Load initial data
onMounted(async () => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100))
    form.value = {
      name: 'Green Garden Restaurant',
      category: 1,
      description: 'Farm-to-table restaurant serving organic dishes.',
      phone: '(555) 123-4567',
      email: 'contact@greengardenrestaurant.com',
      website: 'https://greengardenrestaurant.com',
      social: '@greengardenrestaurant',
      address: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      postalCode: '12345',
      country: 'United States'
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
})

const saveProfile = async () => {
  try {
    isSaving.value = true
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Success notification would go here
  } catch (error) {
    console.error('Error saving profile:', error)
  } finally {
    isSaving.value = false
  }
}
</script>