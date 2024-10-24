<template>
  <AdminLayout>
    <div class="space-y-8">
      <h1 class="text-2xl font-semibold">System Settings</h1>

      <!-- Site Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Site Settings</h2>
        <form @submit.prevent="saveSiteSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Site Name</label>
            <input
              v-model="siteSettings.name"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Site Description</label>
            <textarea
              v-model="siteSettings.description"
              rows="3"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              v-model="siteSettings.contactEmail"
              type="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save Site Settings
            </button>
          </div>
        </form>
      </div>

      <!-- Review Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Review Settings</h2>
        <form @submit.prevent="saveReviewSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Minimum Review Length</label>
            <input
              v-model="reviewSettings.minLength"
              type="number"
              min="1"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Maximum Review Length</label>
            <input
              v-model="reviewSettings.maxLength"
              type="number"
              min="1"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="reviewSettings.requireVerification"
              type="checkbox"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">
              Require email verification before posting reviews
            </label>
          </div>

          <div class="flex items-center">
            <input
              v-model="reviewSettings.allowPhotos"
              type="checkbox"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <label class="ml-2 block text-sm text-gray-900">
              Allow photo uploads in reviews
            </label>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save Review Settings
            </button>
          </div>
        </form>
      </div>

      <!-- Email Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Email Settings</h2>
        <form @submit.prevent="saveEmailSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">SMTP Host</label>
            <input
              v-model="emailSettings.smtpHost"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">SMTP Port</label>
            <input
              v-model="emailSettings.smtpPort"
              type="number"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">SMTP Username</label>
            <input
              v-model="emailSettings.smtpUsername"
              type="text"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">SMTP Password</label>
            <input
              v-model="emailSettings.smtpPassword"
              type="password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Save Email Settings
            </button>
          </div>
        </form>
      </div>

      <!-- Cache Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Cache Settings</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Cache Status</label>
            <p class="mt-1 text-sm text-gray-500">
              Last cleared: {{ formatDate(cacheSettings.lastCleared) }}
            </p>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              @click="clearCache"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Cache
            </button>
            <button
              @click="rebuildCache"
              class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Rebuild Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
// Mock settings data
const siteSettings = ref({
  name: 'AmarReview',
  description: 'Find and review trusted local businesses',
  contactEmail: 'contact@amarreview.com'
})

const reviewSettings = ref({
  minLength: 50,
  maxLength: 2000,
  requireVerification: true,
  allowPhotos: true
})

const emailSettings = ref({
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUsername: 'notifications@amarreview.com',
  smtpPassword: '********'
})

const cacheSettings = ref({
  lastCleared: '2024-04-01T10:00:00Z'
})

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Save settings handlers
const saveSiteSettings = async () => {
  try {
    // Save to database
    console.log('Saving site settings:', siteSettings.value)
    showNotification('Site settings saved successfully')
  } catch (error) {
    console.error('Error saving site settings:', error)
    showNotification('Error saving site settings', 'error')
  }
}

const saveReviewSettings = async () => {
  try {
    // Save to database
    console.log('Saving review settings:', reviewSettings.value)
    showNotification('Review settings saved successfully')
  } catch (error) {
    console.error('Error saving review settings:', error)
    showNotification('Error saving review settings', 'error')
  }
}

const saveEmailSettings = async () => {
  try {
    // Save to database
    console.log('Saving email settings:', emailSettings.value)
    showNotification('Email settings saved successfully')
  } catch (error) {
    console.error('Error saving email settings:', error)
    showNotification('Error saving email settings', 'error')
  }
}

// Cache management
const clearCache = async () => {
  try {
    // Clear cache implementation
    cacheSettings.value.lastCleared = new Date().toISOString()
    showNotification('Cache cleared successfully')
  } catch (error) {
    console.error('Error clearing cache:', error)
    showNotification('Error clearing cache', 'error')
  }
}

const rebuildCache = async () => {
  try {
    // Rebuild cache implementation
    showNotification('Cache rebuilt successfully')
  } catch (error) {
    console.error('Error rebuilding cache:', error)
    showNotification('Error rebuilding cache', 'error')
  }
}

// Simple notification helper (replace with your notification system)
const showNotification = (message, type = 'success') => {
  alert(`${type.toUpperCase()}: ${message}`)
}
</script>