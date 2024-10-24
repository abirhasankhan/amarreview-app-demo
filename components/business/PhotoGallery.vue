<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold">Photo Gallery</h2>
      <button
        @click="showUploadModal = true"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Add Photos
      </button>
    </div>

    <div v-if="photos.length === 0" class="text-center py-8">
      <p class="text-gray-500">No photos yet</p>
      <p class="text-sm text-gray-400 mt-2">Add photos to showcase your business</p>
    </div>

    <div
      v-else
      class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
    >
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="relative group aspect-square"
      >
        <img
          :src="photo.url"
          :alt="photo.caption"
          class="w-full h-full object-cover rounded-lg"
          @click="openLightbox(photo)"
        />
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg">
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              @click.stop="deletePhoto(photo)"
              class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h3 class="text-xl font-semibold">Upload Photos</h3>
            <button
              @click="showUploadModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="handleUpload" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">
                Select Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                @change="handleFileSelect"
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p class="mt-1 text-sm text-gray-500">
                You can upload up to 10 photos at once (max 5MB each)
              </p>
            </div>

            <div v-if="selectedFiles.length > 0" class="space-y-2">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between"
              >
                <span class="text-sm text-gray-600">{{ file.name }}</span>
                <button
                  type="button"
                  @click="removeFile(index)"
                  class="text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="showUploadModal = false"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                :disabled="selectedFiles.length === 0 || isUploading"
              >
                {{ isUploading ? 'Uploading...' : 'Upload' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="selectedPhoto"
      class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4"
      @click="selectedPhoto = null"
    >
      <div class="max-w-4xl w-full" @click.stop>
        <img
          :src="selectedPhoto.url"
          :alt="selectedPhoto.caption"
          class="w-full h-auto max-h-[80vh] object-contain rounded-lg"
        />
        <div class="mt-4 text-white text-center">
          <p>{{ selectedPhoto.caption }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  businessId: {
    type: String,
    required: true
  }
})

const showUploadModal = ref(false)
const selectedFiles = ref([])
const isUploading = ref(false)
const selectedPhoto = ref(null)

// Mock photos data
const photos = ref([
  {
    id: 1,
    url: 'https://picsum.photos/seed/business1/800/800',
    caption: 'Store front'
  },
  {
    id: 2,
    url: 'https://picsum.photos/seed/business2/800/800',
    caption: 'Interior'
  },
  {
    id: 3,
    url: 'https://picsum.photos/seed/business3/800/800',
    caption: 'Products'
  }
])

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  const validFiles = files.filter(file => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum size is 5MB.`)
      return false
    }
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file.`)
      return false
    }
    return true
  })
  selectedFiles.value = validFiles
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
  try {
    isUploading.value = true
    // Mock upload delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Add new photos to the gallery
    const newPhotos = selectedFiles.value.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      caption: file.name
    }))
    photos.value.push(...newPhotos)
    
    // Reset form
    selectedFiles.value = []
    showUploadModal.value = false
  } catch (error) {
    console.error('Error uploading photos:', error)
  } finally {
    isUploading.value = false
  }
}

const deletePhoto = async (photo) => {
  if (!confirm('Are you sure you want to delete this photo?')) return
  
  try {
    // Mock delete delay
    await new Promise(resolve => setTimeout(resolve, 500))
    photos.value = photos.value.filter(p => p.id !== photo.id)
  } catch (error) {
    console.error('Error deleting photo:', error)
  }
}

const openLightbox = (photo) => {
  selectedPhoto.value = photo
}
</script>