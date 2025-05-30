<template>
    <div class="space-y-2">
      <div class="flex justify-between">
        <label :for="id" class="block text-sm font-medium text-gray-700">{{ label }}</label>
        <span v-if="required" class="text-red-500 text-sm">*</span>
      </div>
      
      <div class="relative">
        <input
          :id="id"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm disabled:bg-gray-50 disabled:text-gray-500"
          :class="{ 'border-red-300 focus:ring-red-500 focus:border-red-500': error }"
        />
        
        <div v-if="error" class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <div class="flex justify-between text-sm">
        <p v-if="error" class="text-red-600">{{ error }}</p>
        <p v-else-if="helperText" class="text-gray-500">{{ helperText }}</p>
        <div v-if="showCharCount && maxLength" class="text-gray-400">
          {{ modelValue ? modelValue.length : 0 }}/{{ maxLength }}
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
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
    },
    showCharCount: {
      type: Boolean,
      default: false
    },
    maxLength: {
      type: Number,
      default: null
    },
    id: {
      type: String,
      default: () => `input-${Math.random().toString(36).substring(2, 9)}`
    }
  });
  
  defineEmits(['update:modelValue']);
  </script>