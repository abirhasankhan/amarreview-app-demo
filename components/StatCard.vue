<template>
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div class="flex items-center">
            <div class="flex-shrink-0 p-3 rounded-lg" :class="iconBgColor">
                <component :is="icon" class="h-6 w-6 text-white" />
            </div>
            <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">
                    {{ label }}
                </p>
                <p class="text-2xl font-semibold text-gray-900">
                    {{ value }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    },
    icon: {
        type: [String, Object],
        required: true
    }
})

const iconBgColor = computed(() => {
    const colors = [
        'bg-emerald-500',
        'bg-blue-500',
        'bg-purple-500',
        'bg-amber-500',
        'bg-rose-500'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
})
</script>