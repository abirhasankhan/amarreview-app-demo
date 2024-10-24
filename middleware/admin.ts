export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient()

  if (!user.value) {
    return navigateTo('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.value.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return navigateTo('/')
  }
})