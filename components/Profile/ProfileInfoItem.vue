<template>
    <div class="flex flex-col space-y-1">
        <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-500">{{ label }}</span>
            <span v-if="helperText" class="text-xs text-gray-400">{{ helperText }}</span>
        </div>
        <p v-if="value" class="text-gray-900">{{ value }}</p>
        <p v-else class="text-gray-400 italic text-sm">Not provided</p>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: String,
        default: ''
    },
    helperText: {
        type: String,
        default: ''
    }
})
</script>