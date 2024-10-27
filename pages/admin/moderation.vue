<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Content Moderation</h1>
        <div class="flex gap-4">
          <select
            v-model="filters.type"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Content</option>
            <option value="review">Reviews</option>
            <option value="comment">Comments</option>
            <option value="photo">Photos</option>
          </select>
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading content...</p>
      </div>

      <!-- Reports Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Content
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Reports
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="report in paginatedReports" :key="report.id">
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">
                    {{ report.content }}
                  </div>
                  <div class="text-sm text-gray-500">
                    by {{ report.author }} on
                    {{ formatDate(report.created_at) }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getTypeClass(report.type)"
                >
                  {{ report.type }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="showReports(report)"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  {{ report.report_count }} reports
                </button>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800':
                      report.status === 'pending',
                    'bg-green-100 text-green-800': report.status === 'approved',
                    'bg-red-100 text-red-800': report.status === 'rejected',
                  }"
                >
                  {{ report.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="reviewContent(report)"
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
          {{ totalReports }} reports
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

    <!-- Review Content Modal -->
    <div
      v-if="selectedContent"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">Review Content</h2>
            <button
              @click="selectedContent = null"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div class="space-y-6">
            <!-- Content Details -->
            <div>
              <h3 class="text-lg font-medium mb-2">Content Information</h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="mb-4">
                  <div class="flex items-center mb-2">
                    <img
                      :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedContent.author}`"
                      :alt="selectedContent.author"
                      class="w-8 h-8 rounded-full mr-2"
                    />
                    <span class="font-medium">{{
                      selectedContent.author
                    }}</span>
                  </div>
                  <p class="text-gray-600">{{ selectedContent.content }}</p>
                </div>
                <div class="text-sm text-gray-500">
                  Posted on {{ formatDate(selectedContent.created_at) }}
                </div>
              </div>
            </div>

            <!-- Reports -->
            <div>
              <h3 class="text-lg font-medium mb-2">Reports</h3>
              <div class="space-y-3">
                <div
                  v-for="report in selectedContent.reports"
                  :key="report.id"
                  class="bg-gray-50 p-3 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-medium">{{ report.reported_by }}</span>
                    <span class="text-sm text-gray-500">{{
                      formatDate(report.reported_at)
                    }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ report.reason }}</p>
                </div>
              </div>
            </div>

            <!-- Moderation Actions -->
            <div>
              <h3 class="text-lg font-medium mb-2">Take Action</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Notes</label
                  >
                  <textarea
                    v-model="moderationNotes"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="handleModeration('rejected')"
                    :disabled="isSubmitting"
                    class="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                  >
                    Remove Content
                  </button>
                  <button
                    @click="handleModeration('approved')"
                    :disabled="isSubmitting"
                    class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Approve Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reports Modal -->
    <div
      v-if="showingReports"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-lg w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">Report Details</h2>
            <button
              @click="showingReports = null"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="report in showingReports?.reports"
              :key="report.id"
              class="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
            >
              <div class="flex justify-between mb-2">
                <span class="font-medium">{{ report.reported_by }}</span>
                <span class="text-sm text-gray-500">{{
                  formatDate(report.reported_at)
                }}</span>
              </div>
              <p class="text-gray-600">{{ report.reason }}</p>
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
  type: "",
  status: "",
});

const currentPage = ref(1);
const itemsPerPage = 10;
const selectedContent = ref(null);
const showingReports = ref(null);
const moderationNotes = ref("");
const loading = ref(true);
const isSubmitting = ref(false);
const reports = ref([]);
// Fetch reported content from Supabase
const fetchReportedContent = async () => {
  try {
    loading.value = true;
    let query = client
      .from("review_reports")
      .select(
        `
        *,
        review:reviews(
          id,
          content,
          user_id,
          created_at,
          status,
          user:profiles(full_name)
        ),
        reported_by:profiles(full_name)
      `
      )
      .order("created_at", { ascending: false });

    if (filters.value.status) {
      query = query.eq("status", filters.value.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process the data
    reports.value = data.map((report) => ({
      id: report.id,
      type: "review",
      content: report.review.content,
      author: report.review.user.full_name,
      created_at: report.review.created_at,
      status: report.review.status,
      report_count: 1,
      reports: [
        {
          id: report.id,
          reported_by: report.reported_by.full_name,
          reported_at: report.created_at,
          reason: report.reason,
        },
      ],
    }));
  } catch (error) {
    console.error("Error fetching reported content:", error);
  } finally {
    loading.value = false;
  }
};

// Filter and paginate reports
const filteredReports = computed(() => reports.value);
const totalReports = computed(() => filteredReports.value.length);
const totalPages = computed(() => Math.ceil(totalReports.value / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, totalReports.value)
);
const paginatedReports = computed(() => {
  return filteredReports.value.slice(startIndex.value, endIndex.value);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getTypeClass = (type) => {
  const classes = {
    review: "bg-blue-100 text-blue-800",
    comment: "bg-purple-100 text-purple-800",
    photo: "bg-orange-100 text-orange-800",
  };
  return classes[type] || "bg-gray-100 text-gray-800";
};

const reviewContent = (content) => {
  selectedContent.value = content;
  moderationNotes.value = "";
};

const showReports = (content) => {
  showingReports.value = content;
};

const handleModeration = async (decision) => {
  try {
    isSubmitting.value = true;

    // Update review status
    const { error: reviewError } = await client
      .from("reviews")
      .update({
        status: decision,
        moderation_notes: moderationNotes.value,
      })
      .eq("id", selectedContent.value.review.id);

    if (reviewError) throw reviewError;

    // Update report status
    const { error: reportError } = await client
      .from("review_reports")
      .update({ status: "resolved" })
      .eq("review_id", selectedContent.value.review.id);

    if (reportError) throw reportError;

    await fetchReportedContent();
    selectedContent.value = null;
    moderationNotes.value = "";
  } catch (error) {
    console.error("Error updating content:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1;
  fetchReportedContent();
});

// Initial data fetch
onMounted(async () => {
  await fetchReportedContent();
});
</script>
