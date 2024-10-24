<template>
  <article class="max-w-3xl mx-auto">
    <header class="mb-12">
      <div class="flex items-center text-sm text-gray-500 mb-4">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span class="mx-2">·</span>
        <span>{{ post.readingTime }} min read</span>
      </div>
      
      <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ post.title }}</h1>
      
      <p v-if="post.description" class="text-xl text-gray-600 mb-6">
        {{ post.description }}
      </p>

      <div v-if="post.author" class="flex items-center">
        <img
          :src="post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`"
          :alt="post.author.name"
          class="w-12 h-12 rounded-full"
        />
        <div class="ml-3">
          <div class="font-medium text-gray-900">{{ post.author.name }}</div>
          <div class="text-gray-500">{{ post.author.title }}</div>
        </div>
      </div>
    </header>

    <img
      v-if="post.cover"
      :src="post.cover"
      :alt="post.title"
      class="w-full aspect-video object-cover rounded-lg mb-12"
    />

    <div class="prose prose-emerald max-w-none">
      <ContentDoc />
    </div>

    <footer class="mt-12 pt-12 border-t">
      <h2 class="text-2xl font-semibold mb-6">Related Posts</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BlogCard
          v-for="relatedPost in relatedPosts"
          :key="relatedPost._path"
          :post="relatedPost"
        />
      </div>
    </footer>
  </article>
</template>

<script setup>
const { path } = useRoute()
const post = await queryContent(path).findOne()

// Get related posts based on tags
const relatedPosts = await queryContent('/blog')
  .where({ 
    _path: { $ne: path },
    tags: { $contains: post.tags?.[0] }
  })
  .limit(2)
  .find()

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

useHead({
  title: `${post.title} - TrustReview Blog`,
  meta: [
    { name: 'description', content: post.description },
    { property: 'og:title', content: post.title },
    { property: 'og:description', content: post.description },
    { property: 'og:image', content: post.cover },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})
</script>