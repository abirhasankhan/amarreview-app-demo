<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Business
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Category
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Status
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Reviews
          </th>
          <th
            class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="business in businesses" :key="business.id">
          <td class="px-6 py-4">
            <div class="flex items-center">
              <img
                :src="business.image"
                :alt="business.name"
                class="w-10 h-10 rounded-lg object-cover"
              />
              <div class="ml-4">
                <div class="font-medium text-gray-900">{{ business.name }}</div>
                <div class="text-sm text-gray-500">{{ business.address }}</div>
              </div>
            </div>
          </td>
          <td class="px-6 py-4">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getCategoryClass(business.category?.name)"
            >
              {{ business.category?.name }}
            </span>
          </td>
          <td class="px-6 py-4">
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-green-100 text-green-800': business.status === 'active',
                'bg-red-100 text-red-800': business.status === 'inactive',
                'bg-yellow-100 text-yellow-800': business.status === 'pending',
              }"
            >
              {{ business.status }}
            </span>
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center">
              <span class="text-yellow-400 mr-1">★</span>
              <span>{{ business.average_rating || 0 }}</span>
              <span class="text-gray-500 ml-1"
                >({{ business.review_count || 0 }})</span
              >
            </div>
          </td>
          <td class="px-6 py-4 text-sm">
            <button
              @click="$emit('edit', business)"
              class="text-emerald-600 hover:text-emerald-900 mr-3"
            >
              Edit
            </button>
            <button
              @click="$emit('delete', business)"
              class="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  businesses: {
    type: Array,
    required: true,
  },
});

defineEmits(["edit", "delete"]);

const getCategoryClass = (category) => {
  const classes = {
    Restaurants: "bg-blue-100 text-blue-800",
    "Home Services": "bg-green-100 text-green-800",
    Healthcare: "bg-purple-100 text-purple-800",
    Retail: "bg-orange-100 text-orange-800",
    "Professional Services": "bg-indigo-100 text-indigo-800",
  };
  return classes[category] || "bg-gray-100 text-gray-800";
};
</script>
