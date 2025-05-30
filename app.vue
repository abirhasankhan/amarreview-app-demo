<template>
  <div class="min-h-screen bg-gray-50">
    <TheHeader />
    <main class="container mx-auto px-4 py-8">
      <NuxtPage />
      <NotificationProvider />
    </main>
    <TheFooter />
  </div>
</template>

<script setup>
import NotificationProvider from '~/components/NotificationProvider.vue';// Initialize auth on app mount
const { refreshSession } = useAuth();

onMounted(async () => {
  await refreshSession();
});
</script>
