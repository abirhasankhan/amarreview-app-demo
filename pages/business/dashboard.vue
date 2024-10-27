<template>
  <BusinessLayout>
    <div class="space-y-8">
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading dashboard...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <p class="text-red-600">{{ error }}</p>
      </div>

      <template v-else>
        <!-- Business Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Total Reviews</p>
                <p class="mt-1 text-2xl font-semibold">
                  {{ business?.reviews?.length || 0 }}
                </p>
              </div>
              <span class="text-2xl">📝</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Average Rating</p>
                <p class="mt-1 text-2xl font-semibold">{{ averageRating }}/5</p>
              </div>
              <span class="text-2xl">⭐</span>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Profile Views</p>
                <p class="mt-1 text-2xl font-semibold">
                  {{ business?.view_count || 0 }}
                </p>
              </div>
              <span class="text-2xl">👁️</span>
            </div>
          </div>
        </div>

        <!-- Recent Reviews -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold">Recent Reviews</h2>
            <NuxtLink
              to="/business/reviews"
              class="text-sm text-emerald-600 hover:text-emerald-700"
            >
              View all
            </NuxtLink>
          </div>

          <div
            v-if="recentReviews.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No reviews yet
          </div>

          <div v-else class="space-y-6">
            <div
              v-for="review in recentReviews"
              :key="review.id"
              class="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center">
                  <img
                    :src="
                      review.user.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user.id}`
                    "
                    :alt="review.user.full_name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div class="ml-3">
                    <p class="font-medium">{{ review.user.full_name }}</p>
                    <div class="flex items-center mt-1">
                      <div class="flex">
                        <span v-for="i in 5" :key="i">
                          <span
                            :class="
                              i <= review.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            "
                          >
                            ★
                          </span>
                        </span>
                      </div>
                      <span class="ml-2 text-sm text-gray-500">
                        {{ formatDate(review.created_at) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p class="mt-2 text-gray-600">{{ review.content }}</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </BusinessLayout>
</template>

<script setup>
const { business, loading, error, fetchBusiness } = useBusiness();
const user = useSupabaseUser();

// Calculate average rating
const averageRating = computed(() => {
  if (!business.value?.reviews?.length) return 0;
  const total = business.value.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  return (total / business.value.reviews.length).toFixed(1);
});

// Get recent reviews
const recentReviews = computed(() => {
  if (!business.value?.reviews) return [];
  return [...business.value.reviews]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
