<template>
  <div class="max-w-md mx-auto text-center">
    <div v-if="loading" class="py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
      <p class="mt-4 text-gray-600">Verifying your email...</p>
    </div>

    <div v-else-if="error" class="py-12">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold text-red-800 mb-2">Verification Failed</h2>
        <p class="text-red-600">{{ error }}</p>
      </div>
      <NuxtLink
        to="/auth/login"
        class="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Return to Login
      </NuxtLink>
    </div>

    <div v-else-if="verified" class="py-12">
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-6 mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-12 w-12 text-emerald-600 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 class="text-xl font-semibold text-emerald-800 mb-2">Email Verified!</h2>
        <p class="text-emerald-600">Your email has been successfully verified.</p>
      </div>
      <NuxtLink
        to="/dashboard"
        class="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Go to Dashboard
      </NuxtLink>
    </div>

    <div v-else class="py-12">
      <h1 class="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p class="text-gray-600 mb-6">
        Please check your email for a verification link. Click the link to verify your email address.
      </p>
      <p class="text-sm text-gray-500">
        Didn't receive the email? Check your spam folder or
        <button
          @click="handleResendVerification"
          :disabled="isResending"
          class="text-emerald-600 hover:text-emerald-700 underline focus:outline-none disabled:opacity-50"
        >
          click here to resend
        </button>
      </p>
      <div v-if="resendMessage" class="mt-4 text-sm text-emerald-600">
        {{ resendMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const client = useSupabaseClient()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const verified = ref(false)
const isResending = ref(false)
const resendMessage = ref('')

// Handle email verification
onMounted(async () => {
  const code = route.query.code

  if (code) {
    try {
      const { error: verifyError } = await client.auth.verifyOtp({
        token: code,
        type: 'signup'
      })

      if (verifyError) throw verifyError

      verified.value = true
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

// Handle resend verification email
const handleResendVerification = async () => {
  try {
    isResending.value = true
    resendMessage.value = ''

    const { error: resendError } = await client.auth.resend({
      type: 'signup'
    })

    if (resendError) throw resendError

    resendMessage.value = 'Verification email has been resent. Please check your inbox.'
  } catch (e) {
    error.value = e.message
  } finally {
    isResending.value = false
  }
}

// Redirect if user is already verified
const user = useSupabaseUser()
watch(user, (newUser) => {
  if (newUser?.email_confirmed_at && !verified.value) {
    router.push('/dashboard')
  }
})
</script>