<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2 text-sm focus:outline-none"
    >
      <img
        :src="user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`"
        alt=""
        class="h-8 w-8 rounded-full"
      />
      <span class="hidden md:block">{{ user?.user_metadata?.full_name || user?.email }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
    >
      <div class="py-1">
        <NuxtLink
          to="/"
          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          View Site
        </NuxtLink>
        <button
          @click="handleLogout"
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const isOpen = ref(false)

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/auth/login')
}

onMounted(() => {
  const handleClickOutside = (event) => {
    if (isOpen.value && !event.target.closest('.relative')) {
      isOpen.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>