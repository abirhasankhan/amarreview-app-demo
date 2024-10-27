<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Category Management</h1>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Add Category
        </button>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading categories...</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div class="relative h-48">
            <img
              :src="
                category.image ||
                `https://picsum.photos/seed/${category.id}/800/600`
              "
              :alt="category.name"
              class="w-full h-full object-cover"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            ></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h2 class="text-xl font-bold text-white">{{ category.name }}</h2>
              <p class="text-white/90 text-sm">
                {{ category.business_count || 0 }} businesses
              </p>
            </div>
          </div>
          <div class="p-4">
            <p class="text-gray-600 mb-4">{{ category.description }}</p>
            <div class="flex justify-between items-center">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="
                  category.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                "
              >
                {{ category.active ? "Active" : "Inactive" }}
              </span>
              <div class="flex gap-2">
                <button
                  @click="editCategory(category)"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  Edit
                </button>
                <button
                  @click="toggleCategoryStatus(category)"
                  class="text-gray-600 hover:text-gray-900"
                >
                  {{ category.active ? "Deactivate" : "Activate" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Category Modal -->
    <div
      v-if="showAddModal || selectedCategory"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">
              {{ selectedCategory ? "Edit Category" : "Add Category" }}
            </h2>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Name</label
              >
              <input
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <textarea
                v-model="form.description"
                rows="3"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Image URL</label
              >
              <input
                v-model="form.image"
                type="url"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="form.active"
                type="checkbox"
                class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-900">Active</label>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {{
                  isSubmitting
                    ? "Saving..."
                    : selectedCategory
                    ? "Save Changes"
                    : "Add Category"
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const client = useSupabaseClient();
const showAddModal = ref(false);
const selectedCategory = ref(null);
const loading = ref(true);
const isSubmitting = ref(false);

const categories = ref([]);

const form = ref({
  name: "",
  description: "",
  image: "",
  active: true,
});

// Fetch categories with business count
const fetchCategories = async () => {
  try {
    loading.value = true;
    const { data, error } = await client
      .from("categories")
      .select(
        `
        *,
        business_count:businesses(count)
      `
      )
      .order("name");

    if (error) throw error;

    // Process the data to get the business count
    categories.value = data.map((category) => ({
      ...category,
      business_count: category.business_count?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  selectedCategory.value = null;
  form.value = {
    name: "",
    description: "",
    image: "",
    active: true,
  };
};

const editCategory = (category) => {
  selectedCategory.value = category;
  form.value = {
    name: category.name,
    description: category.description,
    image: category.image,
    active: category.active,
  };
  showAddModal.value = true;
};

const toggleCategoryStatus = async (category) => {
  try {
    const { error } = await client
      .from("categories")
      .update({ active: !category.active })
      .eq("id", category.id);

    if (error) throw error;

    await fetchCategories();
  } catch (error) {
    console.error("Error toggling category status:", error);
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    // Generate slug from name
    const slug = form.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const categoryData = {
      ...form.value,
      slug,
    };

    if (selectedCategory.value) {
      // Update existing category
      const { error } = await client
        .from("categories")
        .update(categoryData)
        .eq("id", selectedCategory.value.id);

      if (error) throw error;
    } else {
      // Add new category
      const { error } = await client.from("categories").insert(categoryData);

      if (error) throw error;
    }

    await fetchCategories();
    closeModal();
  } catch (error) {
    console.error("Error saving category:", error);
  } finally {
    isSubmitting.value = false;
  }
};

// Initial data fetch
onMounted(async () => {
  await fetchCategories();
});
</script>
