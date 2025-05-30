<template>

  <NuxtLayout name="business">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Modal -->
      <div v-if="error" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl p-6 max-w-md w-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-red-600">Error</h3>
            <button @click="clearError" class="text-gray-500 hover:text-gray-700">
              <Icon name="heroicons-outline:x" class="w-6 h-6" />
            </button>
          </div>
          <p class="text-gray-700">{{ error }}</p>
        </div>
      </div>

      <!-- Upload Section -->
      <div class="mb-12 bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Upload Photos</h2>
        <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 transition-colors hover:border-blue-500"
          :class="{ 'border-blue-500': isDragging }" @dragover.prevent="handleDragOver"
          @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop">
          <input type="file" id="photo-upload" multiple accept="image/*" @change="handleFileSelect" class="hidden"
            ref="fileInput" />
          <label for="photo-upload" class="flex flex-col items-center justify-center cursor-pointer space-y-4">
            <div class="p-4 bg-gray-100 rounded-full">
              <Icon name="heroicons-outline:cloud-upload" class="w-8 h-8 text-gray-600" />
            </div>
            <p class="text-gray-600 font-medium">Drag & drop photos or click to browse</p>
            <p class="text-sm text-gray-500">
              Supported formats: JPEG, PNG, WEBP, GIF (Max 10MB each)
            </p>
          </label>
        </div>

        <!-- Preview Section -->
        <div v-if="previews.length" class="mt-8 space-y-4">
          <div v-for="(preview, index) in previews" :key="`preview-${index}`"
            class="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div class="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <img v-if="preview.url && !preview.error" :src="preview.url" class="w-full h-full object-cover"
                :alt="preview.file.name" />
              <Icon v-else name="heroicons-outline:photograph" class="w-8 h-8 text-gray-400" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900 truncate">{{ preview.file.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(preview.file.size) }}</p>
              <p v-if="preview.error" class="text-sm text-red-600 mt-1">{{ preview.error }}</p>
            </div>
            <button @click="removePreview(index)"
              class="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
              <Icon name="heroicons-outline:x" class="w-5 h-5" />
            </button>
          </div>

          <div class="flex gap-3">
            <button
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!validFiles.length || uploading" @click="startUpload">
              <span v-if="uploading" class="flex items-center justify-center gap-2">
                <Icon name="eos-icons:loading" class="animate-spin w-5 h-5" />
                Uploading {{ validFiles.length }} Photos...
              </span>
              <span v-else>Upload {{ validFiles.length }} Photos</span>
            </button>
            <button @click="clearPreviews"
              class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </div>

      <!-- Photo Grid -->
      <div class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Business Photos</h2>
          <div class="flex items-center gap-4">
            <select v-model="filterStatus" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="all">All Photos</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Only</option>
            </select>
            <span class="text-gray-500 text-sm">
              Showing {{ filteredPhotos.length }} of {{ photos.length }}
            </span>
          </div>
        </div>

        <div v-if="loading && !photos.length" class="flex justify-center p-8">
          <Icon name="eos-icons:loading" class="w-8 h-8 animate-spin text-blue-600" />
        </div>

        <div v-else-if="!photos.length" class="text-center py-12 text-gray-500">
          <Icon name="heroicons-outline:photograph" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg font-medium">No photos uploaded yet</p>
          <p class="text-sm">Upload some photos to get started</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="photo in filteredPhotos" :key="photo.id"
            class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <!-- Photo Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <span class="text-xs font-semibold px-2 py-1 rounded-full"
                :class="photo.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'">
                {{ photo.approved ? 'Approved' : 'Pending' }}
              </span>
              <div class="flex items-center gap-2">
                <button @click="togglePhotoApproval(photo)" :disabled="updating"
                  class="p-2 hover:bg-gray-50 rounded-full transition-colors"
                  :title="photo.approved ? 'Mark as Pending' : 'Approve Photo'">
                  <Icon :name="photo.approved ? 'heroicons-outline:x-circle' : 'heroicons-outline:check-circle'"
                    class="w-5 h-5" :class="photo.approved ? 'text-yellow-600' : 'text-green-600'" />
                </button>
                <button @click="confirmDelete(photo.id)" :disabled="deleting"
                  class="p-2 hover:bg-red-50 rounded-full text-red-600 hover:text-red-700 transition-colors">
                  <Icon name="heroicons-outline:trash" class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Photo Image -->
            <div class="relative">
              <img :src="photo.url" class="w-full h-48 object-cover cursor-pointer"
                :alt="photo.caption || 'Business photo'" @click="openLightbox(photo)" />
              <div v-if="deleting" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Icon name="eos-icons:loading" class="w-6 h-6 animate-spin text-white" />
              </div>
            </div>

            <!-- Photo Details -->
            <div class="p-4">
              <div class="mb-3">
                <input v-model="editableCaptions[photo.id]" @keyup.enter="updateCaption(photo)"
                  @blur="updateCaption(photo)" :placeholder="photo.caption || 'Add caption...'"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>{{ formatDate(photo.created_at) }}</span>
                <span class="font-medium">ID: {{ photo.user_id?.slice(0, 8) || 'Unknown' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div v-if="lightboxPhoto" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div class="relative max-w-4xl max-h-full">
          <button @click="closeLightbox" class="absolute top-4 right-4 text-white hover:text-gray-300 z-10">
            <Icon name="heroicons-outline:x" class="w-8 h-8" />
          </button>
          <img :src="lightboxPhoto.url" :alt="lightboxPhoto.caption || 'Business photo'"
            class="max-w-full max-h-full object-contain" />
          <div v-if="lightboxPhoto.caption" class="absolute bottom-4 left-4 right-4 text-white text-center">
            <p class="bg-black bg-opacity-50 px-4 py-2 rounded-lg">{{ lightboxPhoto.caption }}</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>

</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Get business ID from route
const currentBusinessId = computed(() => {
  const id = parseInt(route.params.id || route.params._id || route.params.businessId)
  if (isNaN(id)) {
    console.error('Invalid business ID from route:', route.params)
    return null
  }
  return id
})

// State
const photos = ref([])
const loading = ref(false)
const uploading = ref(false)
const updating = ref(false)
const deleting = ref(false)
const error = ref(null)
const previews = ref([])
const isDragging = ref(false)
const editableCaptions = ref({})
const filterStatus = ref('all')
const lightboxPhoto = ref(null)
const fileInput = ref(null)

// Computed properties
const validFiles = computed(() => previews.value.filter(p => !p.error))

const filteredPhotos = computed(() => {
  if (filterStatus.value === 'all') return photos.value
  if (filterStatus.value === 'approved') return photos.value.filter(p => p.approved)
  if (filterStatus.value === 'pending') return photos.value.filter(p => !p.approved)
  return photos.value
})

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Please upload JPEG, PNG, WEBP, or GIF images.'
  }

  if (file.size > maxSize) {
    return 'File too large. Maximum size is 10MB.'
  }

  return null
}

const createPreviews = async (files) => {
  return files.map(file => {
    const error = validateFile(file)
    const url = error ? null : URL.createObjectURL(file)
    return { file, url, error }
  })
}

const clearError = () => {
  error.value = null
}

// API functions
const fetchPhotos = async (businessId) => {
  try {
    loading.value = true
    clearError()

    const response = await $fetch(`/api/business-photos`, {
      query: { business_id: businessId }
    })

    photos.value = response
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to fetch photos'
    console.error('Fetch photos error:', err)
  } finally {
    loading.value = false
  }
}

const uploadMultiplePhotos = async ({ businessId, files, caption = '' }) => {
  try {
    uploading.value = true
    clearError()

    const formData = new FormData()
    formData.append('business_id', businessId.toString())
    if (caption) formData.append('caption', caption)

    files.forEach(file => {
      formData.append('file', file)
    })

    const response = await $fetch('/api/business-photos', {
      method: 'POST',
      body: formData
    })

    // Add new photos to the beginning of the array
    if (Array.isArray(response)) {
      photos.value.unshift(...response)
    } else {
      photos.value.unshift(response)
    }

    return response
  } catch (err) {
    const errorMessage = err.data?.message || err.message || 'Failed to upload photos'
    error.value = errorMessage
    throw new Error(errorMessage)
  } finally {
    uploading.value = false
  }
}

const updatePhoto = async (photoId, updates) => {
  try {
    updating.value = true
    clearError()

    const response = await $fetch(`/api/business-photos?id=${photoId}`, {
      method: 'PUT',
      body: updates
    })

    // Update the photo in the array
    const index = photos.value.findIndex(p => p.id === photoId)
    if (index !== -1) {
      photos.value[index] = { ...photos.value[index], ...response }
    }

    return response
  } catch (err) {
    const errorMessage = err.data?.message || err.message || 'Failed to update photo'
    error.value = errorMessage
    throw new Error(errorMessage)
  } finally {
    updating.value = false
  }
}

const deletePhoto = async (photoId) => {
  try {
    deleting.value = true
    clearError()

    await $fetch(`/api/business-photos?id=${photoId}`, {
      method: 'DELETE'
    })

    photos.value = photos.value.filter(p => p.id !== photoId)

    return true
  } catch (err) {
    const errorMessage = err.data?.message || err.message || 'Failed to delete photo'
    error.value = errorMessage
    throw new Error(errorMessage)
  } finally {
    deleting.value = false
  }
}


// Drag and drop handlers
const handleDragOver = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragging.value = false
  }
}

const handleDrop = async (e) => {
  e.preventDefault()
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  await handleFiles(files)
}

// File handling
const handleFileSelect = async (e) => {
  const files = Array.from(e.target.files)
  await handleFiles(files)
}

const handleFiles = async (files) => {
  try {
    clearError()
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== files.length) {
      console.warn('Some files were filtered out (non-images)')
    }
    previews.value = await createPreviews(imageFiles)
  } catch (err) {
    error.value = 'Failed to process files: ' + err.message
  }
}

const removePreview = (index) => {
  // Revoke object URL to prevent memory leaks
  const preview = previews.value[index]
  if (preview.url) {
    URL.revokeObjectURL(preview.url)
  }
  previews.value.splice(index, 1)
}

const clearPreviews = () => {
  // Revoke all object URLs
  previews.value.forEach(preview => {
    if (preview.url) {
      URL.revokeObjectURL(preview.url)
    }
  })
  previews.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const startUpload = async () => {
  try {
    if (!currentBusinessId.value) {
      throw new Error('Business ID is required')
    }

    const files = validFiles.value.map(p => p.file)
    if (!files.length) {
      throw new Error('Please select valid files to upload')
    }

    await uploadMultiplePhotos({
      businessId: currentBusinessId.value,
      files
    })

    clearPreviews()
  } catch (err) {
    error.value = err.message || 'Failed to upload photos'
  }
}

// Photo operations
const confirmDelete = async (photoId) => {
  if (confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
    await handleDelete(photoId)
  }
}

const handleDelete = async (photoId) => {
  try {
    await deletePhoto(photoId)
    console.log('Photo deleted successfully')
  } catch (err) {
    error.value = err.message || 'Failed to delete photo'
  }
}

const updateCaption = async (photo) => {
  const newCaption = editableCaptions.value[photo.id]?.trim()
  if (newCaption === undefined || newCaption === photo.caption) return

  try {
    await updatePhoto(photo.id, { caption: newCaption })
  } catch (err) {
    error.value = err.message || 'Failed to update caption'
    // Reset caption on error
    editableCaptions.value[photo.id] = photo.caption || ''
  }
}

const togglePhotoApproval = async (photo) => {
  try {
    await updatePhoto(photo.id, { approved: !photo.approved })
  } catch (err) {
    error.value = err.message || 'Failed to update photo status'
  }
}

// Lightbox functions
const openLightbox = (photo) => {
  lightboxPhoto.value = photo
}

const closeLightbox = () => {
  lightboxPhoto.value = null
}

// Initialize captions when photos change
watch(photos, (newPhotos) => {
  newPhotos.forEach(photo => {
    if (!(photo.id in editableCaptions.value)) {
      editableCaptions.value[photo.id] = photo.caption || ''
    }
  })
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  clearPreviews()
})

// Initial load
onMounted(async () => {
  try {
    if (currentBusinessId.value) {
      await fetchPhotos(currentBusinessId.value)
    } else {
      error.value = 'Invalid business ID in URL'
    }
  } catch (err) {
    error.value = err.message || 'Failed to load photos'
  }
})

// Keyboard shortcuts
onMounted(() => {
  const handleKeydown = (e) => {
    if (lightboxPhoto.value && e.key === 'Escape') {
      closeLightbox()
    }
  }

  document.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
/* Add any custom styles here */
.drag-over {
  @apply border-blue-500 bg-blue-50;
}
</style>