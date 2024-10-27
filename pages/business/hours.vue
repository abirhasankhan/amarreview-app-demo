<template>
  <BusinessLayout>
    <div class="space-y-6">
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading business hours...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <p class="text-red-600">{{ error }}</p>
      </div>

      <template v-else>
        <h1 class="text-2xl font-semibold">Business Hours</h1>
        <CustomHours
          :initial-hours="businessHours"
          @update="updateBusinessHours"
        />
      </template>
    </div>
  </BusinessLayout>
</template>

<script setup>
const {
  business,
  loading,
  error,
  fetchBusiness,
  updateBusinessHours: updateHours,
} = useBusiness();
const user = useSupabaseUser();

// Format business hours
const businessHours = computed(() => {
  if (!business.value?.business_hours) return {};

  return business.value.business_hours.reduce((acc, hour) => {
    acc[hour.day] = {
      open: hour.open_time,
      close: hour.close_time,
      closed: hour.is_closed,
    };
    return acc;
  }, {});
});

const updateBusinessHours = async (hours) => {
  if (business.value) {
    await updateHours(business.value.id, hours);
  }
};

// Fetch business data on mount
onMounted(async () => {
  if (user.value) {
    const client = useSupabaseClient();
    const { data } = await client
      .from("businesses")
      .select("id")
      .eq("owner_id", user.value.id)
      .single();

    if (data) {
      await fetchBusiness(data.id);
    }
  }
});
</script>
