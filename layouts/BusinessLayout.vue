<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/business/dashboard" class="flex items-center">
              <span class="text-xl font-bold text-emerald-600">Business Manager</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <NuxtLink 
              to="/"
              class="text-gray-600 hover:text-gray-900"
            >
              View Site
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <div class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-64">
          <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div class="flex-grow flex flex-col">
              <nav class="flex-1 px-2 space-y-1">
                <NuxtLink
                  v-for="item in navigationItems"
                  :key="item.path"
                  :to="item.path"
                  :class="[
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md',
                    route.path === item.path
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  ]"
                >
                  <span class="mr-3">{{ item.icon }}</span>
                  {{ item.name }}
                </NuxtLink>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/business/dashboard',
    icon: '📊'
  },
  {
    name: 'Profile',
    path: '/business/profile',
    icon: '🏢'
  },
  {
    name: 'Reviews',
    path: '/business/reviews',
    icon: '📝'
  },
  {
    name: 'Photos',
    path: '/business/photos',
    icon: '📸'
  },
  {
    name: 'Hours',
    path: '/business/hours',
    icon: '⏰'
  },
  {
    name: 'FAQ',
    path: '/business/faq',
    icon: '❓'
  },
  {
    name: 'Analytics',
    path: '/business/analytics',
    icon: '📈'
  },
  {
    name: 'Settings',
    path: '/business/settings',
    icon: '⚙️'
  }
]
</script>