<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Business Claims</h1>
        <div class="flex gap-4">
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search business name..."
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading claims...</p>
      </div>

      <!-- Claims Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Business
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Claimed By
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Verification
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Submitted
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="claim in paginatedClaims" :key="claim.id">
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">
                    {{ claim.business.name }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ claim.business.address }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">
                    {{ claim.user.full_name }}
                  </div>
                  <div class="text-sm text-gray-500">{{ claim.role }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': claim.status === 'pending',
                    'bg-green-100 text-green-800': claim.status === 'approved',
                    'bg-red-100 text-red-800': claim.status === 'rejected',
                  }"
                >
                  {{ claim.status }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-500">
                  {{
                    claim.verification_method === "document"
                      ? "Document"
                      : "Facebook Post"
                  }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(claim.created_at) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="reviewClaim(claim)"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of
          {{ totalClaims }} claims
        </div>
        <div class="flex gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded enabled:hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded enabled:hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Review Claim Modal -->
    <div
      v-if="selectedClaim"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">Review Business Claim</h2>
            <button
              @click="selectedClaim = null"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div class="space-y-6">
            <!-- Business Information -->
            <div>
              <h3 class="text-lg font-medium mb-2">Business Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Name</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.business.name }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Address</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.business.address }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Phone</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.business.phone }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Website</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.business.website }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Claimant Information -->
            <div>
              <h3 class="text-lg font-medium mb-2">Claimant Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Name</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.user.full_name }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Role</label
                  >
                  <div class="mt-1 text-sm text-gray-900">
                    {{ selectedClaim.role }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Verification Information -->
            <div>
              <h3 class="text-lg font-medium mb-2">Verification Information</h3>
              <div class="mt-1">
                <div v-if="selectedClaim.verification_method === 'document'">
                  <label class="block text-sm font-medium text-gray-700"
                    >Document</label
                  >
                  <a
                    :href="
                      getVerificationDocUrl(selectedClaim.verification_document)
                    "
                    target="_blank"
                    class="text-emerald-600 hover:text-emerald-900"
                  >
                    View Document
                  </a>
                </div>
                <div v-else>
                  <label class="block text-sm font-medium text-gray-700"
                    >Facebook Post</label
                  >
                  <a
                    :href="selectedClaim.facebook_post_url"
                    target="_blank"
                    class="text-emerald-600 hover:text-emerald-900"
                  >
                    View Facebook Post
                  </a>
                </div>
              </div>
            </div>

            <div v-if="selectedClaim.status === 'pending'">
              <h3 class="text-lg font-medium mb-2">Decision</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Notes</label
                  >
                  <textarea
                    v-model="decisionNotes"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="handleDecision('rejected')"
                    :disabled="isSubmitting"
                    class="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    @click="handleDecision('approved')"
                    :disabled="isSubmitting"
                    class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const client = useSupabaseClient();
const filters = ref({
  status: "",
  search: "",
});

const currentPage = ref(1);
const itemsPerPage = 10;
const selectedClaim = ref(null);
const decisionNotes = ref("");
const loading = ref(true);
const isSubmitting = ref(false);
const claims = ref([]);
/**
 * TODO: Fix error: "Could not find a relationship between 'business_claims' and 'profiles' in the schema cache"
 */
// Fetch claims from Supabase
const fetchClaims = async () => {
  try {
    loading.value = true;
    let query = client
      .from("business_claims")
      .select(
        `
        *,
        business:businesses(*),
        user:profiles(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false });

    if (filters.value.status) {
      query = query.eq("status", filters.value.status);
    }

    if (filters.value.search) {
      query = query.textSearch("business.name", filters.value.search);
    }

    const { data, error } = await query;

    if (error) throw error;
    claims.value = data;
  } catch (error) {
    console.error("Error fetching claims:", error);
  } finally {
    loading.value = false;
  }
};

// Filter and paginate claims
const filteredClaims = computed(() => claims.value);
const totalClaims = computed(() => filteredClaims.value.length);
const totalPages = computed(() => Math.ceil(totalClaims.value / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, totalClaims.value)
);
const paginatedClaims = computed(() => {
  return filteredClaims.value.slice(startIndex.value, endIndex.value);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getVerificationDocUrl = (fileName) => {
  return client.storage.from("verification-docs").getPublicUrl(fileName).data
    .publicUrl;
};

const reviewClaim = (claim) => {
  selectedClaim.value = claim;
  decisionNotes.value = "";
};

const handleDecision = async (decision) => {
  try {
    isSubmitting.value = true;

    // Update claim status
    const { error: claimError } = await client
      .from("business_claims")
      .update({
        status: decision,
        decision_notes: decisionNotes.value,
      })
      .eq("id", selectedClaim.value.id);

    if (claimError) throw claimError;

    if (decision === "approved") {
      // Update business owner and status
      const { error: businessError } = await client
        .from("businesses")
        .update({
          owner_id: selectedClaim.value.user_id,
          status: "active",
        })
        .eq("id", selectedClaim.value.business_id);

      if (businessError) throw businessError;

      // Update user role
      const { error: userError } = await client
        .from("profiles")
        .update({ role: "business_owner" })
        .eq("id", selectedClaim.value.user_id);

      if (userError) throw userError;
    }

    await fetchClaims();
    selectedClaim.value = null;
    decisionNotes.value = "";
  } catch (error) {
    console.error("Error updating claim:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1;
  fetchClaims();
});

// Initial data fetch
onMounted(async () => {
  await fetchClaims();
});
</script>
