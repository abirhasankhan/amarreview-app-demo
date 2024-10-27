<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Business Management</h1>
        <div class="flex gap-4">
          <div class="relative">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search businesses..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <span class="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>
          </div>
          <select
            v-model="filters.category"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
          <button
            @click="showAddModal = true"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Add Business
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading businesses...</p>
      </div>

      <template v-else>
        <AdminBusinessTable
          :businesses="paginatedBusinesses"
          @edit="editBusiness"
          @delete="deleteBusiness"
        />

        <!-- Pagination -->
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of
            {{ totalBusinesses }} businesses
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
      </template>
    </div>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">
              {{ selectedBusiness ? "Edit Business" : "Add Business" }}
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <AdminBusinessForm
            :business="selectedBusiness"
            :categories="categories"
            @submit="handleSubmit"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const client = useSupabaseClient();
const showAddModal = ref(false);
const selectedBusiness = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;
const loading = ref(true);

const filters = ref({
  search: "",
  category: "",
  status: "",
});

const businesses = ref([]);
const categories = ref([]);

// Fetch businesses from Supabase with corrected query
const fetchBusinesses = async () => {
  try {
    loading.value = true;
    let query = client.from("businesses").select(`
        *,
        category:categories(id, name),
        review_stats:reviews(
          id,
          rating
        )
      `);

    if (filters.value.search) {
      query = query.ilike("name", `%${filters.value.search}%`);
    }

    if (filters.value.category) {
      query = query.eq("category_id", filters.value.category);
    }

    if (filters.value.status) {
      query = query.eq("status", filters.value.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Process the data to calculate averages and counts
    businesses.value = data.map((business) => {
      const reviews = business.review_stats || [];
      const totalRating = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const reviewCount = reviews.length;

      return {
        ...business,
        average_rating:
          reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0,
        review_count: reviewCount,
        review_stats: undefined, // Remove the raw stats from the object
      };
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
  } finally {
    loading.value = false;
  }
};

// Fetch categories from Supabase
const fetchCategories = async () => {
  try {
    const { data, error } = await client
      .from("categories")
      .select("*")
      .order("name");

    if (error) throw error;
    categories.value = data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

// Filter and paginate businesses
const filteredBusinesses = computed(() => businesses.value);
const totalBusinesses = computed(() => filteredBusinesses.value.length);
const totalPages = computed(() =>
  Math.ceil(totalBusinesses.value / itemsPerPage)
);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, totalBusinesses.value)
);
const paginatedBusinesses = computed(() => {
  return filteredBusinesses.value.slice(startIndex.value, endIndex.value);
});

const closeModal = () => {
  showAddModal.value = false;
  selectedBusiness.value = null;
};

const editBusiness = (business) => {
  selectedBusiness.value = business;
  showAddModal.value = true;
};

const deleteBusiness = async (business) => {
  if (!confirm(`Are you sure you want to delete ${business.name}?`)) return;

  try {
    const { error } = await client
      .from("businesses")
      .delete()
      .eq("id", business.id);

    if (error) throw error;

    await fetchBusinesses();
  } catch (error) {
    console.error("Error deleting business:", error);
  }
};

const handleSubmit = async (formData) => {
  try {
    if (selectedBusiness.value) {
      // Update existing business
      const { error } = await client
        .from("businesses")
        .update(formData)
        .eq("id", selectedBusiness.value.id);

      if (error) throw error;
    } else {
      // Add new business
      const { error } = await client.from("businesses").insert(formData);

      if (error) throw error;
    }

    await fetchBusinesses();
    closeModal();
  } catch (error) {
    console.error("Error saving business:", error);
  }
};

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1;
  fetchBusinesses();
});

// Initial data fetch
onMounted(async () => {
  await Promise.all([fetchCategories(), fetchBusinesses()]);
});
</script>
