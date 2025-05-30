<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <NuxtLink :to="`/business/${businessId}/dashboard`"
              class="flex items-center space-x-2 text-emerald-600 font-bold text-lg hover:text-emerald-700 transition-colors">
              <Icon name="heroicons:building-office-2" class="w-8 h-8" />
              <span>Business Dashboard</span>
            </NuxtLink>
          </div>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center space-x-1">
            <NuxtLink v-for="item in navigationItems" :key="item.name" :to="item.fullPath"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200" :class="[
                route.path === item.fullPath
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              ]">
              <Icon :name="item.icon" class="w-4 h-4 inline mr-2" />
              {{ item.name }}
            </NuxtLink>
          </div>

          <!-- Visit Page Button & Mobile Menu -->
          <div class="flex items-center space-x-3">
            <!-- Visit Business Page Button -->
            <NuxtLink v-if="slug" :to="`/businesses/${slug}`" target="_blank"
              class="hidden sm:inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-sm hover:shadow-md">
              <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4 mr-2" />
              Visit Page
            </NuxtLink>

            <!-- Mobile Menu Button -->
            <button @click="mobileMenuOpen = !mobileMenuOpen"
              class="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
              <span class="sr-only">Open menu</span>
              <Icon name="heroicons:bars-3" v-if="!mobileMenuOpen" class="h-6 w-6" />
              <Icon name="heroicons:x-mark" v-else class="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
        <div v-show="mobileMenuOpen" class="lg:hidden border-t border-gray-200 bg-white">
          <div class="px-4 pt-4 pb-3 space-y-2">
            <!-- Mobile Visit Button -->
            <NuxtLink v-if="slug" :to="`/businesses/${slug}`" target="_blank"
              class="flex items-center w-full px-4 py-3 mb-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-sm font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
              @click="mobileMenuOpen = false">
              <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4 mr-3" />
              Visit Business Page
            </NuxtLink>

            <!-- Mobile Navigation Items -->
            <NuxtLink v-for="item in navigationItems" :key="item.name" :to="item.fullPath"
              class="flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors" :class="[
                route.path === item.fullPath
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              ]" @click="mobileMenuOpen = false">
              <Icon :name="item.icon" class="w-5 h-5 mr-3" />
              {{ item.name }}
            </NuxtLink>
          </div>
        </div>
      </transition>
    </nav>

    <!-- Main Content Area -->
    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <!-- Footer (optional) -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <p>&copy; 2025 Business Dashboard. All rights reserved.</p>
          <div class="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" class="hover:text-gray-900 transition-colors">Help</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Support</a>
            <a href="#" class="hover:text-gray-900 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// Using Nuxt Icon instead of Heroicons

const route = useRoute()
const mobileMenuOpen = ref(false)

const businessId = computed(() => route.params._id || route.params.id || null) 
const slug = computed(() => route.query.slug || route.params.slug)

const navigationItems = computed(() => {
  if (!businessId.value) return []
  return [
    {
      name: 'Dashboard',
      fullPath: `/business/${businessId.value}/dashboard`,
      icon: 'heroicons:home'
    },
    {
      name: 'Profile',
      fullPath: `/business/${businessId.value}/profile`,
      icon: 'heroicons:user'
    },
    {
      name: 'Hours',
      fullPath: `/business/${businessId.value}/hours`,
      icon: 'heroicons:clock'
    },
    {
      name: 'Gallery',
      fullPath: `/business/${businessId.value}/photos`,
      icon: 'heroicons:photo'
    },
    {
      name: 'Reviews',
      fullPath: `/business/${businessId.value}/reviews`,
      icon: 'heroicons:star'
    },
    {
      name: 'FAQs',
      fullPath: `/business/${businessId.value}/faqs`,
      icon: 'heroicons:question-mark-circle'
    },
    {
      name: 'Analytics',
      fullPath: `/business/${businessId.value}/analytics`,
      icon: 'heroicons:chart-bar'
    },
  ]
})

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

// Close mobile menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    if (mobileMenuOpen.value && !event.target.closest('nav')) {
      mobileMenuOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
/* Custom scrollbar for mobile menu if needed */
.space-y-2>*+* {
  margin-top: 0.5rem;
}

/* Ensure smooth transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>