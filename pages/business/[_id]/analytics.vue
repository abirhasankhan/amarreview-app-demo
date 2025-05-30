<template>
  <NuxtLayout name="business">
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Analytics</h1>
      <BusinessAnalytics :business-id="businessId" />
    </div>
    </NuxtLayout>
</template>

<script setup>
const businessId = '123' // Replace with actual business ID
</script>