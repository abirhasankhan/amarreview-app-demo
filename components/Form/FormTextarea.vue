<template>
    <div class="space-y-2">
        <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>
        <textarea :id="id" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            class="block w-full px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
            :class="{ 'border-red-300': error }" :placeholder="placeholder" :rows="rows" :maxlength="maxlength"
            :disabled="disabled" :required="required"></textarea>
        <div class="flex justify-between">
            <p v-if="helperText" class="text-xs text-gray-500">{{ helperText }}</p>
            <p v-if="maxlength" class="text-xs text-gray-400">
                {{ modelValue ? modelValue.length : 0 }}/{{ maxlength }}
            </p>
        </div>
        <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    id: {
        type: String,
        default: () => `textarea-${Math.random().toString(36).substring(2, 9)}`
    },
    placeholder: {
        type: String,
        default: ''
    },
    rows: {
        type: [Number, String],
        default: 3
    },
    maxlength: {
        type: [Number, String],
        default: ''
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