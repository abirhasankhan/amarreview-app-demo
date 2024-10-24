<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold text-center mb-8">Create Account</h1>
    
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <button
        type="submit"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        Create Account
      </button>
    </form>

    <div class="mt-6">
      <p class="text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/auth/login" class="text-emerald-600 hover:text-emerald-500">
          Sign in
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const client = useSupabaseClient()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref(null)

const handleRegister = async () => {
  try {
    error.value = null
    const { error: authError } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: name.value
        }
      }
    })

    if (authError) throw authError

    router.push('/auth/verify-email')
  } catch (e) {
    error.value = e.message
  }
}
</script>