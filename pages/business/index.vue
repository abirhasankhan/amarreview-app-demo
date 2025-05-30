<template>
    <div class="max-w-5xl mx-auto p-4">
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">My Business Claims</h1>
            <NuxtLink to="/business/claim">
                <button
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg">
                    Request Business Claim
                </button>
            </NuxtLink>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-10 text-gray-500">
            <div class="animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent mx-auto">
            </div>
            <p class="mt-2">Loading business claims...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-600">Error loading claims: {{ error }}</p>
            <button @click="fetchBusinessesAndClaims"
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                Retry
            </button>
        </div>

        <!-- Content -->
        <div v-else>
            <div v-if="businesses.length === 0" class="text-gray-600 py-4">
                No businesses found.
            </div>

            <ul class="space-y-6">
                <li v-for="business in businesses" :key="business.id"
                    class="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div>
                        <h2 class="text-xl font-semibold">
                            <NuxtLink :to="{
                                path: `/business/${business.id}/dashboard`,
                                query: { slug: business.slug }
                            }" class="hover:underline">
                                <h2 class="text-xl font-semibold text-blue-600 hover:text-blue-800">
                                    {{ business.name }}
                                </h2>
                            </NuxtLink>

                        </h2>

                        <p class="text-gray-500">
                            {{ business.city }}, {{ business.state }}
                        </p>
                        <p class="mt-1 text-sm">
                            Status:
                            <span :class="claimStatusClass(business.claim?.status)
                                ">
                                {{ business.claim?.status || "Not claimed" }}
                            </span>
                        </p>
                        <p v-if="
                            business.claim?.status === 'rejected' &&
                            business.claim.rejection_reason
                        " class="mt-1 text-sm text-red-600">
                            Reason: {{ business.claim.rejection_reason }}
                        </p>
                    </div>
                    <div>
                        <span v-if="business.claim?.status === 'pending'" class="text-yellow-600 font-semibold">
                            Claim Pending
                        </span>
                        <span v-else-if="business.claim?.status === 'approved'" class="text-green-600 font-semibold">
                            Claim Approved
                        </span>
                        <span v-else-if="business.claim?.status === 'rejected'" class="text-red-600 font-semibold">
                            Claim Rejected
                        </span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useSupabaseUser } from "#imports";
import { useBusinessClaim } from "@/composables/useBusinessClaim";

const user = useSupabaseUser();

// Use composable
const {
    businesses,
    error,
    isFetchingBusinesses: loading,
    fetchBusinessesWithClaims,
} = useBusinessClaim();

// Computed Properties (keep UI-specific logic in component)
const claimStatusClass = (status) => {
    switch (status) {
        case "approved":
            return "text-green-600 font-semibold";
        case "pending":
            return "text-yellow-600 font-semibold";
        case "rejected":
            return "text-red-600 font-semibold";
        default:
            return "text-gray-600";
    }
};

// Lifecycle
onMounted(async () => {
    if (user.value) {
        await fetchBusinessesWithClaims();
    }
});
</script>