<template>
  <NuxtLayout name="business">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Loading State -->
      <div v-if="businessLoading" class="text-center p-8">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="businessError" class="text-center text-red-500 p-8">
        <p class="text-lg font-semibold">{{ businessError }}</p>
        <NuxtLink to="/businesses" class="mt-4 inline-block text-emerald-600 hover:underline">
          Browse all businesses
        </NuxtLink>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Business Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ business?.name }}</h1>
              <p class="mt-2 text-emerald-600">Business Owner Dashboard</p>
            </div>
            <img v-if="business?.image" :src="business.image" :alt="business?.name"
              class="w-32 h-32 rounded-lg object-cover shadow-sm">
          </div>
        </div>

        <!-- Reviews Section -->
        <div v-if="business" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 class="text-2xl font-semibold">Customer Reviews Management</h2>
            <div class="flex gap-3">
              <select v-model="filters.responseStatus" class="px-3 py-2 border rounded-md text-sm">
                <option value="all">All Reviews</option>
                <option value="responded">Responded</option>
                <option value="unresponded">Needs Response</option>
              </select>
              <select v-model="filters.rating" class="px-3 py-2 border rounded-md text-sm">
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <!-- Reviews List -->
          <div v-if="filteredReviews.length" class="space-y-6">
            <div v-for="review in filteredReviews" :key="review.id" class="border-b last:border-0 pb-6 group relative"
              :class="{ 'bg-amber-50/50': !review.responses?.length }">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0">
                  <img :src="getUserAvatar(review)" :alt="getUserName(review)" class="w-12 h-12 rounded-full">
                </div>
                <div class="flex-1">
                  <div class="flex items-baseline justify-between">
                    <div>
                      <h3 class="font-semibold">{{ getUserName(review) }}</h3>
                      <div class="flex items-center mt-1">
                        <div class="flex text-yellow-400">
                          <span v-for="i in 5" :key="i"
                            :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'">
                            ★
                          </span>
                        </div>
                        <span class="ml-2 text-sm text-gray-500">
                          {{ formatDate(review.created_at) }}
                        </span>
                      </div>
                    </div>
                    <span v-if="!review.responses?.length" class="text-sm text-amber-600">
                      Needs Response
                    </span>
                  </div>

                  <p class="mt-3 text-gray-600">{{ review.content }}</p>

                  <!-- Existing Response -->
                  <div v-if="review.responses?.length" class="mt-4 pl-4 border-l-2 border-emerald-600">
                    <div class="flex items-start gap-2">
                      <span class="material-icons text-emerald-600 mt-1">store</span>
                      <div class="flex-1">
                        <div class="flex items-baseline justify-between">
                          <span class="font-medium text-emerald-600">Your Response</span>
                          <span class="text-xs text-gray-500">
                            {{ formatDate(review.responses[0].created_at) }}
                          </span>
                        </div>
                        <p class="mt-1 text-gray-600">{{ review.responses[0].content }}</p>
                        <div class="mt-2 flex gap-3">
                          <button @click="openResponseForm(review.id, review.responses[0].content)"
                            class="text-emerald-600 hover:text-emerald-700 text-sm flex items-center">
                            <span class="material-icons text-base mr-1">edit</span>
                            Edit
                          </button>
                          <button @click="confirmDeleteResponse(review.id)"
                            class="text-red-600 hover:text-red-700 text-sm flex items-center">
                            <span class="material-icons text-base mr-1">delete</span>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Response Actions -->
                  <div class="mt-4 flex gap-3">
                    <button v-if="!review.responses?.length" @click="openResponseForm(review.id)"
                      class="px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm">
                      Add Response
                    </button>
                    <button v-else @click="openResponseForm(review.id, review.responses[0].content)"
                      class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                      Update Response
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12 text-gray-500">
            <p class="text-lg">No reviews match your current filters</p>
            <button @click="resetFilters" class="mt-4 text-emerald-600 hover:underline">
              Reset filters
            </button>
          </div>
        </div>
      </div>

      <!-- Response Modal -->
      <div v-if="showResponseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 class="text-xl font-semibold mb-4">
            {{ editingResponse ? 'Edit Business Response' : 'Add Business Response' }}
          </h3>
          <form @submit.prevent="submitResponse">
            <textarea v-model="responseContent" rows="4"
              class="w-full px-3 py-2 border rounded-md mb-4 focus:ring-2 focus:ring-emerald-500"
              placeholder="Write your business response..."></textarea>
            <div class="flex justify-end gap-3">
              <button type="button" @click="closeResponseModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button type="submit" class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
                {{ editingResponse ? 'Update Response' : 'Post Response' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>


<script setup>
import { useBusiness } from '~/composables/useBusiness';
import { useReviews } from '~/composables/useReviews';

const route = useRoute();
const businessId = computed(() => route.params._id || route.params.id || null)

const user = useSupabaseUser();
const { showSuccess, showError } = useNotification();

console.log('Route params:', route.params)



// Business Data
const { business, loading: businessLoading, error: businessError, fetchBusinessById } = useBusiness();
const { reviews, fetchReviews, respondToReview, updateResponse, deleteResponse } = useReviews();

// UI State
const showResponseModal = ref(false);
const responseContent = ref('');
const currentReviewId = ref(null);
const editingResponse = ref(false);
const filters = reactive({
  responseStatus: 'unresponded',
  rating: 'all'
});


// Computed Properties
const filteredReviews = computed(() => {
  if (!reviews.value) return [];

  return reviews.value.filter(review => {
    const responseFilter = filters.responseStatus === 'all' ? true :
      filters.responseStatus === 'responded' ? review.responses?.length :
        !review.responses?.length;

    const ratingFilter = filters.rating === 'all' ? true :
      review.rating === parseInt(filters.rating);

    return responseFilter && ratingFilter;
  }).sort((a, b) => {
    if (!a.responses?.length && b.responses?.length) return -1;
    if (a.responses?.length && !b.responses?.length) return 1;
    return new Date(b.created_at) - new Date(a.created_at);
  });
});

// Methods
const openResponseForm = (reviewId, existingContent = '') => {
  currentReviewId.value = reviewId;
  responseContent.value = existingContent;
  editingResponse.value = !!existingContent;
  showResponseModal.value = true;
};

const closeResponseModal = () => {
  showResponseModal.value = false;
  responseContent.value = '';
  currentReviewId.value = null;
  editingResponse.value = false;
};

const submitResponse = async () => {
  try {
    if (!responseContent.value.trim()) {
      showError('Please enter a response');
      return;
    }

    if (!businessId.value) {
      showError('Business not found');
      return;
    }

    const action = editingResponse.value ?
      await updateResponse(currentReviewId.value, responseContent.value) :
      await respondToReview(currentReviewId.value, responseContent.value);

    showSuccess(`Response ${editingResponse.value ? 'updated' : 'added'} successfully`);
    closeResponseModal();
    await fetchReviews(businessId.value);
  } catch (error) {
    showError(error.message || 'Failed to save response');
  }
};

const confirmDeleteResponse = async (reviewId) => {
  try {
    if (!businessId.value) {
      showError('Business not found');
      return;
    }

    await deleteResponse(reviewId);
    showSuccess('Response deleted successfully');
    await fetchReviews(businessId.value);
  } catch (error) {
    showError(error.message || 'Failed to delete response');
  }
};

const resetFilters = () => {
  filters.responseStatus = 'unresponded';
  filters.rating = 'all';
};

// Utilities
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
};

const getUserName = (review) => review.user?.full_name || 'Anonymous User';
const getUserAvatar = (review) => review.user?.avatar_url ||
  `https://api.dicebear.com/7.x/initials/svg?seed=${getUserName(review)}`;

// Data Fetching
const { data } = await useAsyncData('business', async () => {
  try {
    if (!businessId.value) throw new Error('Business ID not found in user profile');

    await fetchBusinessById(businessId.value);

    if (!business.value) throw new Error('Business not found');

    await fetchReviews(businessId.value);
    return business.value;
  } catch (error) {
    businessError.value = error.message;
    return null;
  }
});

useHead({
  link: [{
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/icon?family=Material+Icons'
  }]
});
</script>

<style scoped>
.bg-amber-50\/50 {
  background-color: rgba(255, 251, 235, 0.5);
}
</style>