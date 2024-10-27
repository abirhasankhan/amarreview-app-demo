<template>
  <BusinessLayout>
    <div class="space-y-6">
      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading photos...</p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <p class="text-red-600">{{ error }}</p>
      </div>

      <template v-else>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold">Photo Gallery</h1>
          <button
            @click="$refs.fileInput.click()"
            class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Add Photos
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />
        </div>

        <div v-if="business?.photos?.length === 0" class="text-center py-8">
          <p class="text-gray-500">No photos yet</p>
          <p class="text-sm text-gray-400 mt-2">
            Add photos to showcase your business
          </p>
        </div>

        <div
          v-else
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <div
            v-for="photo in business.photos"
            :key="photo.id"
            class="relative group aspect-square"
          >
            <img
              :src="photo.url"
              :alt="business.name"
              class="w-full h-full object-cover rounded-lg"
              @click="openLightbox(photo)"
            />
            <div
              class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg"
            >
              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  @click.stop="deletePhoto(photo.id, photo.file_name)"
                  class="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  🗑️
                </button>
              </div>
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
              :alt="business.name"
              class="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </div>
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
  uploadPhoto: upload,
  deletePhoto: remove,
} = useBusiness();
const user = useSupabaseUser();
const selectedPhoto = ref(null);

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files);
  const validFiles = files.filter((file) => {
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Maximum size is 5MB.`);
      return false;
    }
    if (!file.type.startsWith("image/")) {
      alert(`${file.name} is not an image file.`);
      return false;
    }
    return true;
  });

  for (const file of validFiles) {
    await upload(business.value.id, file);
  }

  event.target.value = "";
};

const openLightbox = (photo) => {
  selectedPhoto.value = photo;
};

const deletePhoto = async (photoId, fileName) => {
  if (!confirm("Are you sure you want to delete this photo?")) return;
  await remove(photoId, fileName);
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
