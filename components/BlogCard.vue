<template>
  <NuxtLink :to="post._path" class="block group">
    <div class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img
        v-if="post.cover"
        :src="post.cover"
        :alt="post.title"
        class="w-full h-48 object-cover"
      />
      <div class="p-6">
        <div class="flex items-center text-sm text-gray-500 mb-2">
          <time :datetime="post.date">{{ formatDate(post.date) }}</time>
          <span class="mx-2">·</span>
          <span>{{ post.readingTime }} min read</span>
        </div>
        <h2 class="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 mb-2">
          {{ post.title }}
        </h2>
        <p class="text-gray-600 line-clamp-2">{{ post.description }}</p>
        <div class="mt-4 flex items-center">
          <div v-if="post.author" class="flex items-center">
            <img
              :src="post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`"
              :alt="post.author.name"
              class="w-8 h-8 rounded-full"
            />
            <span class="ml-2 text-sm text-gray-600">{{ post.author.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>