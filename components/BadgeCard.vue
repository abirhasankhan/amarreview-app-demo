<template>
    <div class="relative bg-white p-4 rounded-lg border border-gray-200" :class="{ 'opacity-50': !badge.unlocked }">
        <div class="flex items-start">
            <div class="flex-shrink-0 text-2xl mr-3">
                {{ badge.icon }}
            </div>
            <div class="min-w-0 flex-1">
                <h3 class="text-sm font-medium text-gray-900">
                    {{ badge.name }}
                </h3>
                <p class="text-xs text-gray-500 mt-1">
                    {{ badge.description }}
                </p>
                <div class="mt-3">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: `${badge.progress}%` }"></div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 text-right">
                        {{ badge.currentCount }}/{{ badge.requiredCount }}
                    </p>
                </div>
            </div>
        </div>
        <div v-if="!badge.unlocked" class="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
            <Icon name="heroicons:lock-closed" class="h-6 w-6 text-gray-400" />
        </div>
    </div>
</template>

<script setup>

defineProps({
    badge: {
        type: Object,
        required: true,
        validator: (value) => {
            return [
                'id',
                'name',
                'icon',
                'description',
                'unlocked',
                'progress',
                'currentCount',
                'requiredCount'
            ].every(key => key in value)
        }
    }
})
</script>