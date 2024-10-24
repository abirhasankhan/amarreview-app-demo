<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/admin" class="flex items-center">
              <span class="text-xl font-bold text-emerald-600">Admin Dashboard</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <AdminUserMenu />
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
                <AdminNavItem
                  v-for="item in navigationItems"
                  :key="item.path"
                  v-bind="item"
                />
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
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: '📊'
  },
  {
    name: 'Business Claims',
    path: '/admin/claims',
    icon: '🏢'
  },
  {
    name: 'Content Moderation',
    path: '/admin/moderation',
    icon: '📝'
  },
  {
    name: 'User Management',
    path: '/admin/users',
    icon: '👥'
  },
  {
    name: 'Categories',
    path: '/admin/categories',
    icon: '📁'
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: '⚙️'
  }
]
</script>