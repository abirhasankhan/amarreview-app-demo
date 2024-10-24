<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <header class="text-center mb-12">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
      <p class="text-xl text-gray-600">Choose the plan that's right for your business</p>
    </header>

    <!-- Pricing Toggle -->
    <div class="flex justify-center mb-12">
      <div class="flex items-center space-x-3 bg-gray-100 p-1 rounded-lg">
        <button
          @click="billingPeriod = 'monthly'"
          class="px-4 py-2 rounded-md"
          :class="billingPeriod === 'monthly' ? 'bg-white shadow-sm' : 'text-gray-600'"
        >
          Monthly
        </button>
        <button
          @click="billingPeriod = 'yearly'"
          class="px-4 py-2 rounded-md"
          :class="billingPeriod === 'yearly' ? 'bg-white shadow-sm' : 'text-gray-600'"
        >
          Yearly
          <span class="text-sm text-emerald-600 ml-1">Save 20%</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      <!-- Free Plan -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold mb-2">Free</h2>
          <p class="text-gray-600 mb-4">Basic business listing</p>
          <p class="text-4xl font-bold">$0</p>
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
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Email support
          </li>
        </ul>

        <NuxtLink
          to="/business/claim"
          class="block w-full text-center px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50"
        >
          Get Started
        </NuxtLink>
      </div>

      <!-- Premium Plan -->
      <div class="bg-emerald-50 rounded-lg shadow-sm p-8 border-2 border-emerald-500 lg:transform lg:scale-105">
        <div class="text-center mb-8">
          <span class="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            RECOMMENDED
          </span>
          <h2 class="text-2xl font-semibold mb-2">Premium</h2>
          <p class="text-gray-600 mb-4">Enhanced visibility & features</p>
          <p class="text-4xl font-bold">
            ${{ billingPeriod === 'monthly' ? '29' : '279' }}
          </p>
          <p class="text-sm text-gray-500">
            per {{ billingPeriod === 'monthly' ? 'month' : 'year' }}
          </p>
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
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Custom business hours
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Photo gallery
          </li>
        </ul>

        <NuxtLink
          to="/business/premium"
          class="block w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Upgrade Now
        </NuxtLink>
      </div>

      <!-- Enterprise Plan -->
      <div class="bg-white rounded-lg shadow-sm p-8">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-semibold mb-2">Enterprise</h2>
          <p class="text-gray-600 mb-4">Custom solutions for large businesses</p>
          <p class="text-4xl font-bold">Custom</p>
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
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            Custom integrations
          </li>
          <li class="flex items-center">
            <span class="text-emerald-500 mr-2">✓</span>
            SLA support
          </li>
        </ul>

        <button
          @click="contactSales"
          class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Contact Sales
        </button>
      </div>
    </div>

    <!-- Feature Comparison -->
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl font-semibold mb-8 text-center">Compare Features</h2>
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900">Free</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900">Premium</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900">Enterprise</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="feature in features" :key="feature.name">
              <td class="px-6 py-4 text-sm text-gray-900">{{ feature.name }}</td>
              <td class="px-6 py-4 text-center">
                <span v-if="feature.free" class="text-emerald-500">✓</span>
                <span v-else class="text-gray-300">✗</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="feature.premium" class="text-emerald-500">✓</span>
                <span v-else class="text-gray-300">✗</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span v-if="feature.enterprise" class="text-emerald-500">✓</span>
                <span v-else class="text-gray-300">✗</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-3xl mx-auto mt-16">
      <h2 class="text-2xl font-semibold mb-8 text-center">Frequently Asked Questions</h2>
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
</template>

<script setup>
const billingPeriod = ref('monthly')

const features = [
  {
    name: 'Business Profile',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Review Response',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Basic Analytics',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    name: 'Business FAQ Section',
    free: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'Registered Business Badge',
    free: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'Advanced Analytics',
    free: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'Priority Support',
    free: false,
    premium: true,
    enterprise: true
  },
  {
    name: 'Multiple Locations',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    name: 'API Access',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    name: 'Dedicated Account Manager',
    free: false,
    premium: false,
    enterprise: true
  }
]

const faqs = ref([
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.',
    isOpen: false
  },
  {
    question: 'Can I upgrade or downgrade my plan at any time?',
    answer: 'Yes, you can upgrade your plan at any time. When downgrading, the change will take effect at the end of your current billing period.',
    isOpen: false
  },
  {
    question: 'Is there a contract or minimum commitment?',
    answer: 'No, our Premium plan is month-to-month with no long-term commitment required. You can cancel at any time.',
    isOpen: false
  },
  {
    question: 'What happens after I upgrade to Premium?',
    answer: 'Premium features will be instantly activated on your account after payment is processed. You\'ll have immediate access to all Premium features.',
    isOpen: false
  }
])

const contactSales = () => {
  window.location.href = 'mailto:sales@amarreview.com'
}

// SEO
useHead({
  title: 'Pricing - AmarReview',
  meta: [
    {
      name: 'description',
      content: 'Choose the perfect plan for your business. Simple, transparent pricing with no hidden fees.'
    }
  ]
})
</script>