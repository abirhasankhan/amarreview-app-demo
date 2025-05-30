<!-- components/LoadingState.vue -->
<template>
    <div class="flex flex-col items-center justify-center py-8 space-y-4">
        <!-- Spinner -->
        <div v-if="type === 'spinner'" :class="['relative flex items-center justify-center', spinnerSizeClass]">
            <div v-if="withPing"
                class="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 animate-ping"></div>
            <svg class="relative z-10 animate-spin" :class="spinnerSizeClass" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" :fill="color" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
        </div>

        <!-- Skeleton Loader -->
        <div v-else class="w-full space-y-3">
            <div v-for="(line, index) in lines" :key="index" class="h-4 bg-gray-200 rounded animate-pulse"
                :class="line"></div>
        </div>

        <!-- Text -->
        <p v-if="text" class="text-gray-500 text-sm text-center">
            {{ text }}
        </p>
    </div>
</template>

<script setup>
const props = defineProps({
    type: {
        type: String,
        default: 'skeleton', // 'skeleton' or 'spinner'
    },
    size: {
        type: String,
        default: 'md', // 'sm', 'md', 'lg' (spinner only)
    },
    color: {
        type: String,
        default: '#10B981', // spinner color
    },
    text: {
        type: String,
        default: '',
    },
    withPing: {
        type: Boolean,
        default: true,
    },
    lines: {
        type: Array,
        default: () => ['w-3/4 mx-auto', 'w-1/2 mx-auto', 'w-2/3 mx-auto']
    },
    lineHeight: {
        type: String,
        default: 'h-4'
    }
})

const spinnerSizeClass = computed(() => {
    switch (props.size) {
        case 'sm': return 'h-6 w-6'
        case 'lg': return 'h-16 w-16'
        default: return 'h-10 w-10'
    }
})
</script>

<style scoped>
@keyframes ping {
    0% {
        transform: scale(1);
        opacity: 1
    }

    75%,
    100% {
        transform: scale(2);
        opacity: 0
    }
}

.animate-ping {
    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>