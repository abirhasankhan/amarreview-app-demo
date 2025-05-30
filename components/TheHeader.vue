<template>
  <header class="bg-white shadow">
    <nav class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-emerald-600">AmarReview</NuxtLink>

        <!-- Mobile menu button -->
        <button @click="isMenuOpen = !isMenuOpen"
          class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500"
          aria-controls="mobile-menu" :aria-expanded="isMenuOpen">
          <span class="sr-only">Open main menu</span>
          <!-- Icon when menu is closed -->
          <svg v-if="!isMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <!-- Icon when menu is open -->
          <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Desktop navigation -->
        <div class="hidden md:flex md:items-center md:space-x-6">
          <NuxtLink to="/categories" class="text-gray-600 hover:text-gray-900"
            :class="{ 'text-emerald-600': route.path.startsWith('/categories') }">
            Categories
          </NuxtLink>
          <NuxtLink to="/businesses" class="text-gray-600 hover:text-gray-900"
            :class="{ 'text-emerald-600': route.path.startsWith('/businesses') }">
            Businesses
          </NuxtLink>
          <NuxtLink to="/blog" class="text-gray-600 hover:text-gray-900"
            :class="{ 'text-emerald-600': route.path.startsWith('/blog') }">
            Blog
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-600 hover:text-gray-900"
            :class="{ 'text-emerald-600': route.path.startsWith('/pricing') }">
            Pricing
          </NuxtLink>

          <template v-if="user">
            <NuxtLink to="/dashboard" class="text-gray-600 hover:text-gray-900"
              :class="{ 'text-emerald-600': route.path.startsWith('/dashboard') }">
              Dashboard
            </NuxtLink>
            <NuxtLink to="/business" class="text-gray-600 hover:text-gray-900"
              :class="{ 'text-emerald-600': route.path.startsWith('/dashboard') }">
              Business
            </NuxtLink>
            <button @click="handleLogout" class="text-gray-600 hover:text-gray-900">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
              Sign In
            </NuxtLink>
          </template>
        </div>
      </div>

      <!-- Mobile menu -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-100 ease-in"
        leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
        <div v-if="isMenuOpen" class="md:hidden" id="mobile-menu">
          <div class="pt-2 pb-3 space-y-1">
            <NuxtLink to="/categories"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/categories') }"
              @click="isMenuOpen = false">
              Categories
            </NuxtLink>
            <NuxtLink to="/businesses"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/businesses') }"
              @click="isMenuOpen = false">
              Businesses
            </NuxtLink>
            <NuxtLink to="/blog"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/blog') }" @click="isMenuOpen = false">
              Blog
            </NuxtLink>
            <NuxtLink to="/pricing"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/pricing') }"
              @click="isMenuOpen = false">
              Pricing
            </NuxtLink>

            <template v-if="user">
              <NuxtLink to="/dashboard"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/dashboard') }"
                @click="isMenuOpen = false">
                Dashboard
              </NuxtLink>
              <NuxtLink to="/business"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                :class="{ 'bg-emerald-50 text-emerald-600': route.path.startsWith('/dashboard') }"
                @click="isMenuOpen = false">
                Business
              </NuxtLink>
              <button @click="handleLogout" :disabled="isLoggingOut" class="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/auth/login"
                class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                @click="isMenuOpen = false">
                Sign In
              </NuxtLink>
            </template>
          </div>
        </div>
      </transition>
    </nav>
  </header>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const isMenuOpen = ref(false)
const isLoggingOut = ref(false)


// Close mobile menu when route changes
watch(() => route.path, () => {
  isMenuOpen.value = false
})

const handleLogout = async () => {

  isLoggingOut.value = true

  try {
    const { error } = await client.auth.signOut()
    if (error) throw error

    // This ensures `useSupabaseUser()` updates after logout
    await new Promise(resolve => setTimeout(resolve, 100)) // slight delay to sync

    router.push('/')
  } catch (err) {

    console.error('Logout failed:', err.message)

  } finally {

    isLoggingOut.value = false

  }
}

const handleMobileLogout = async () => {
  isMenuOpen.value = false
  await handleLogout()
}

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (event) => {
    const mobileMenu = document.getElementById('mobile-menu')
    const menuButton = event.target.closest('button')

    if (isMenuOpen.value && mobileMenu && !mobileMenu.contains(event.target) && !menuButton) {
      isMenuOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>