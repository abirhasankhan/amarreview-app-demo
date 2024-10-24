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

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="category in categories"
          :key="category.id"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div class="relative h-48">
            <img
              :src="category.image"
              :alt="category.name"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h2 class="text-xl font-bold text-white">{{ category.name }}</h2>
              <p class="text-white/90 text-sm">{{ category.businessCount }} businesses</p>
            </div>
          </div>
          <div class="p-4">
            <p class="text-gray-600 mb-4">{{ category.description }}</p>
            <div class="flex justify-between items-center">
              <span
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ category.active ? 'Active' : 'Inactive' }}
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
                  {{ category.active ? 'Deactivate' : 'Activate' }}
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
              {{ selectedCategory ? 'Edit Category' : 'Add Category' }}
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
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                v-model="form.description"
                rows="3"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                v-model="form.image"
                type="url"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Slug</label>
              <input
                v-model="form.slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
              <p class="mt-1 text-sm text-gray-500">
                Use lowercase letters, numbers, and hyphens only
              </p>
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
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                {{ selectedCategory ? 'Save Changes' : 'Add Category' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const showAddModal = ref(false)
const selectedCategory = ref(null)
const form = ref({
  name: '',
  description: '',
  image: '',
  slug: '',
  active: true
})

// Mock categories data
const categories = ref([
  {
    id: 1,
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Find the best dining experiences, from casual eateries to fine dining establishments.',
    image: 'https://picsum.photos/seed/restaurants/800/600',
    businessCount: 245,
    active: true
  },
  {
    id: 2,
    name: 'Home Services',
    slug: 'home-services',
    description: 'Professional services for home maintenance, repairs, and improvements.',
    image: 'https://picsum.photos/seed/home-services/800/600',
    businessCount: 189,
    active: true
  },
  {
    id: 3,
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Medical professionals and healthcare facilities for your well-being.',
    image: 'https://picsum.photos/seed/healthcare/800/600',
    businessCount: 156,
    active: true
  }
])

const editCategory = (category) => {
  selectedCategory.value = category
  form.value = { ...category }
}

const closeModal = () => {
  showAddModal.value = false
  selectedCategory.value = null
  form.value = {
    name: '',
    description: '',
    image: '',
    slug: '',
    active: true
  }
}

const handleSubmit = async () => {
  try {
    if (selectedCategory.value) {
      // Update existing category
      const index = categories.value.findIndex(c => c.id === selectedCategory.value.id)
      categories.value[index] = { ...categories.value[index], ...form.value }
    } else {
      // Add new category
      categories.value.push({
        id: Date.now(),
        ...form.value,
        businessCount: 0
      })
    }
    closeModal()
  } catch (error) {
    console.error('Error saving category:', error)
  }
}

const toggleCategoryStatus = async (category) => {
  try {
    category.active = !category.active
  } catch (error) {
    console.error('Error toggling category status:', error)
  }
}

// Auto-generate slug from name
watch(() => form.value.name, (newName) => {
  if (!selectedCategory.value) {
    form.value.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
})
</script>