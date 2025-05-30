<template>
    <div class="space-y-2">
        <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>
        <select :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
            :class="{ 'border-red-300': error }" :disabled="disabled" :required="required">
            <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>
        <p v-if="helperText" class="mt-1 text-xs text-gray-500">{{ helperText }}</p>
        <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    id: {
        type: String,
        default: () => `select-${Math.random().toString(36).substring(2, 9)}`
    },
    options: {
        type: Array,
        default: () => []
    },
    placeholder: {
        type: String,
        default: 'Select an option'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    error: {
        type: String,
        default: ''
    },
    helperText: {
        type: String,
        default: ''
    }
})

defineEmits(['update:modelValue'])
</script>