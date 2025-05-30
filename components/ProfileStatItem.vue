<template>
    <div>
        <p class="text-sm font-medium text-gray-500">
            {{ label }}
        </p>
        <p class="mt-1 text-sm font-semibold text-gray-900 truncate">
            {{ value }}
        </p>
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    value: {
        type: [String, Number],
        required: true
    }
})
</script>