<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
            <!-- Header -->
            <div class="flex items-center space-x-3 text-red-600">
                <div class="p-2 bg-red-100 rounded-full">
                    <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-yellow-500" />
                </div>
                <h3 class="text-xl font-bold">Delete Account</h3>
            </div>

            <!-- Body -->
            <div class="space-y-4">
                <p class="text-gray-700">
                    Are you sure you want to delete your account? This action is permanent and cannot be undone.
                    All your data will be permanently removed.
                </p>

                <div class="bg-red-50 p-4 rounded-lg border border-red-100">
                    <p class="text-sm text-red-700">
                        To confirm deletion, please type <strong>delete my account</strong> below:
                    </p>
                    <input v-model="confirmText" type="text" placeholder="Type 'delete my account'"
                        class="mt-2 w-full px-3 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm" />
                </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end space-x-3">
                <button @click="$emit('close')"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                </button>
                <button @click="handleConfirm" :disabled="confirmText !== 'delete my account' || isLoading" :class="[
                    'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center',
                    (confirmText === 'delete my account' && !isLoading)
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-300 cursor-not-allowed'
                ]">
                    <template v-if="isLoading">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Processing...
                    </template>
                    <template v-else>
                        Delete Account
                    </template>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    isLoading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close', 'confirm'])

const confirmText = ref('')

const handleConfirm = () => {
    if (confirmText.value === 'delete my account') {
        emit('confirm')
    }
}
</script>