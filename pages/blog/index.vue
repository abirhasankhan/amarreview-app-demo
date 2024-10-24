<template>
  <div class="max-w-5xl mx-auto">
    <header class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
      <p class="text-xl text-gray-600">
        Insights, guides, and news about customer reviews and business growth
      </p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <BlogCard
        v-for="post in posts"
        :key="post._path"
        :post="post"
      />
    </div>
  </div>
</template>

<script setup>
const { data: posts } = await useAsyncData('posts', () => queryContent('/blog')
  .sort({ date: -1 })
  .find()
)
</script>