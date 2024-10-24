<template>
  <BusinessLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Business Settings</h1>

      <!-- Subscription -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Subscription</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Current Plan: {{ subscription.plan }}</p>
            <p class="text-sm text-gray-500">
              Next billing date: {{ formatDate(subscription.nextBilling) }}
            </p>
          </div>
          <NuxtLink
            to="/business/premium"
            v-if="subscription.plan === 'Free'"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Upgrade to Premium
          </NuxtLink>
          <button
            v-else
            @click="cancelSubscription"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Notification Settings</h2>
        <div class="space-y-4">
          <label class="flex items-center">
            <input
              v-model="notifications.newReviews"
              type="checkbox"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <span class="ml-2">Email notifications for new reviews</span>
          </label>
          <label class="flex items-center">
            <input
              v-model="notifications.messages"
              type="checkbox"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
            />
            <span class="ml-2">Email notifications for customer messages</span>
          </label>
        </div>
      </div>

      <!-- Account Settings -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium mb-4">Account Settings</h2>
        <div class="space-y-4">
          <button
            @click="deactivateAccount"
            class="text-red-600 hover:text-red-700"
          >
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  </BusinessLayout>
</template>

<script setup>
const subscription = ref({
  plan: 'Premium',
  nextBilling: '2024-05-01T00:00:00Z'
})

const notifications = ref({
  newReviews: true,
  messages: true
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cancelSubscription = async () => {
  if (!confirm('Are you sure you want to cancel your subscription?')) return
  
  try {
    // Cancel subscription logic
    subscription.value.plan = 'Free'
  } catch (error) {
    console.error('Error canceling subscription:', error)
  }
}

const deactivateAccount = async () => {
  if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return
  
  try {
    // Deactivate account logic
  } catch (error) {
    console.error('Error deactivating account:', error)
  }
}
</script>