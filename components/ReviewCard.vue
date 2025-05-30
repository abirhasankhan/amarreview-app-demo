<template>
    <div class="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
        <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2">
                    <NuxtLink :to="`/businesses/${review.business.slug}`"
                        class="text-lg font-medium text-gray-900 hover:text-emerald-600">
                        {{ review.business.name }}
                    </NuxtLink>
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {{ review.business.category }}
                    </span>
                </div>

                <div class="flex items-center mt-2">
                    <div class="flex">
                        <Icon v-for="i in 5" :key="i" name="heroicons:star" class="h-5 w-5"
                            :class="i <= review.rating ? 'text-amber-400' : 'text-gray-300'" />
                    </div>
                    <span class="ml-2 text-sm text-gray-500">
                        {{ formatDate(review.created_at) }}
                    </span>
                </div>

                <p class="mt-3 text-gray-600">
                    {{ review.content }}
                </p>

                <div class="mt-4 flex items-center space-x-6">
                    <span class="inline-flex items-center text-sm text-gray-500">
                        <Icon name="heroicons:hand-thumb-up" class="h-4 w-4 mr-1" />
                        {{ review.helpful_votes_count }} helpful votes
                    </span>
                    <span class="inline-flex items-center text-sm text-gray-500">
                        <Icon name="heroicons:chat-bubble-left-ellipsis" class="h-4 w-4 mr-1" />
                        {{ review.comments }} comments
                    </span>
                </div>

                <div v-if="review.badges?.length" class="mt-3 flex flex-wrap gap-2">
                    <span v-for="badge in review.badges" :key="badge"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                        {{ badge }}
                    </span>
                </div>
            </div>

            <div class="ml-4 flex-shrink-0 flex space-x-4">
                <button @click="$emit('edit', review)" class="text-gray-400 hover:text-gray-500" title="Edit review">
                    <Icon name="heroicons:pencil-square" class="h-5 w-5" />
                </button>
                <button @click="$emit('delete', review.id)" class="text-gray-400 hover:text-gray-500"
                    title="Delete review">
                    <Icon name="heroicons:trash" class="h-5 w-5" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    review: {
        type: Object,
        required: true
    }
})

defineEmits(['edit', 'delete'])

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}
</script>
