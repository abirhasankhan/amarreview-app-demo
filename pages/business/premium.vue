<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <header class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Upgrade to Premium</h1>
      <p class="text-xl text-gray-600">Get more features to grow your business</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Free Plan -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold mb-2">Free</h2>
          <p class="text-gray-600">Basic business listing</p>
          <p class="text-3xl font-bold mt-4">$0</p>
          <p class="text-sm text-gray-500">Forever free</p>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Basic business profile
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Respond to reviews
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Basic analytics
          </li>
        </ul>

        <button
          class="w-full px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
          disabled
        >
          Current Plan
        </button>
      </div>

      <!-- Premium Plan -->
      <div class="bg-emerald-50 rounded-lg shadow-sm p-6 border-2 border-emerald-500 lg:transform lg:scale-105">
        <div class="text-center mb-8">
          <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            RECOMMENDED
          </span>
          <h2 class="text-2xl font-semibold mb-2">Premium</h2>
          <p class="text-gray-600">Enhanced visibility & features</p>
          <p class="text-3xl font-bold mt-4">$29</p>
          <p class="text-sm text-gray-500">per month</p>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            All Free features
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Business FAQ section
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            "Registered Business" badge
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Advanced analytics
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Priority support
          </li>
        </ul>

        <button
          @click="upgradeToPremium"
          class="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Upgrade Now
        </button>
      </div>

      <!-- Enterprise Plan -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold mb-2">Enterprise</h2>
          <p class="text-gray-600">Custom solutions for large businesses</p>
          <p class="text-3xl font-bold mt-4">Custom</p>
          <p class="text-sm text-gray-500">Contact for pricing</p>
        </div>

        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            All Premium features
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Multiple locations
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            API access
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Dedicated account manager
          </li>
        </ul>

        <button
          @click="contactSales"
          class="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Contact Sales
        </button>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-3xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="bg-white rounded-lg shadow-sm"
        >
          <button
            @click="faq.isOpen = !faq.isOpen"
            class="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
          >
            <span class="font-medium">{{ faq.question }}</span>
            <span
              class="ml-6 flex-shrink-0 text-gray-400"
              :class="{ 'transform rotate-180': faq.isOpen }"
            >
              ▼
            </span>
          </button>
          <div v-show="faq.isOpen" class="px-6 pb-4">
            <p class="text-gray-600">{{ faq.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Modal -->
  <div
    v-if="showPaymentModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-xl font-semibold">Complete Your Upgrade</h2>
        <button @click="showPaymentModal = false" class="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>

      <form @submit.prevent="processPayment" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Card Number</label>
          <input
            v-model="paymentForm.cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              v-model="paymentForm.expiryDate"
              type="text"
              placeholder="MM/YY"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">CVC</label>
            <input
              v-model="paymentForm.cvc"
              type="text"
              placeholder="123"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            @click="showPaymentModal = false"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Pay $29/month
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const showPaymentModal = ref(false)
const paymentForm = ref({
  cardNumber: '',
  expiryDate: '',
  cvc: ''
})

const faqs = ref([
  {
    question: 'What is included in the Premium plan?',
    answer: 'The Premium plan includes enhanced business visibility, a FAQ section for your business page, the ability to display your business registration information with a verified badge, advanced analytics, and priority customer support.',
    isOpen: false
  },
  {
    question: 'Can I cancel my Premium subscription anytime?',
    answer: 'Yes, you can cancel your Premium subscription at any time. Your premium features will remain active until the end of your current billing period.',
    isOpen: false
  },
  {
    question: 'How do I get the "Registered Business" badge?',
    answer: 'After upgrading to Premium, you can upload your business registration documents through your dashboard. Our team will verify the documents within 2-3 business days.',
    isOpen: false
  },
  {
    question: 'What analytics are included?',
    answer: 'Premium analytics include detailed visitor demographics, page view trends, click-through rates, competitor analysis, and customer engagement metrics.',
    isOpen: false
  }
])

const upgradeToPremium = () => {
  showPaymentModal.value = true
}

const contactSales = () => {
  window.location.href = 'mailto:sales@amarreview.com'
}

const processPayment = async () => {
  try {
    // Process payment logic here
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to dashboard
    showPaymentModal.value = false
    navigateTo('/business/dashboard')
  } catch (error) {
    console.error('Payment error:', error)
  }
}
</script>