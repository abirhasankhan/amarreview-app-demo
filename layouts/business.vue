<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/business/dashboard" class="text-emerald-600 font-semibold">
              Business Dashboard
            </NuxtLink>
          </div>
          
          <div class="hidden md:flex space-x-4">
            <NuxtLink 
              v-for="item in navigationItems" 
              :key="item.path"
              :to="item.path"
              class="px-3 py-2 rounded-md text-sm font-medium"
              :class="[
                route.path === item.path
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              {{ item.name }}
            </NuxtLink>
          </div>

          <div class="md:hidden">
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <span class="sr-only">Open menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  v-if="!mobileMenuOpen"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div
        v-show="mobileMenuOpen"
        class="md:hidden border-b border-gray-200"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="block px-3 py-2 rounded-md text-base font-medium"
            :class="[
              route.path === item.path
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-600 hover:text-gray-900'
            ]"
            @click="mobileMenuOpen = false"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute()
const mobileMenuOpen = ref(false)

const navigationItems = [
  { name: 'Dashboard', path: '/business/dashboard' },
  { name: 'Profile', path: '/business/profile' },
  { name: 'Hours', path: '/business/hours' },
  { name: 'Gallery', path: '/business/gallery' },
  { name: 'Reviews', path: '/business/reviews' },
  { name: 'Analytics', path: '/business/analytics' }
]

// Close mobile menu on route change
watch(() => route.path, () => {
  mobileMenuOpen.value = false
})
</script>