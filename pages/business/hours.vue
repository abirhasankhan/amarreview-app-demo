<template>
  <BusinessLayout>
    <div class="space-y-6">
      <h1 class="text-2xl font-semibold">Business Hours</h1>
      <CustomHours
        :initial-hours="businessHours"
        @update="updateBusinessHours"
      />
    </div>
  </BusinessLayout>
</template>

<script setup>
// Mock business hours
const businessHours = ref({
  Monday: { open: '09:00', close: '17:00', closed: false },
  Tuesday: { open: '09:00', close: '17:00', closed: false },
  Wednesday: { open: '09:00', close: '17:00', closed: false },
  Thursday: { open: '09:00', close: '17:00', closed: false },
  Friday: { open: '09:00', close: '17:00', closed: false },
  Saturday: { open: '10:00', close: '15:00', closed: false },
  Sunday: { open: '', close: '', closed: true }
})

const updateBusinessHours = async (newHours) => {
  try {
    // Update hours in the database
    businessHours.value = newHours
  } catch (error) {
    console.error('Error updating business hours:', error)
  }
}
</script>