<template>
  <BusinessLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Business FAQ</h1>
      <BusinessFAQ
        :business-id="businessId"
        :is-owner="true"
        :is-premium="true"
      />
    </div>
  </BusinessLayout>
</template>

<script setup>
const businessId = '123' // Replace with actual business ID
</script>