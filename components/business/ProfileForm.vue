<template>
  <form @submit.prevent="$emit('save', form)" class="space-y-6">
    <!-- Basic Information -->
    <div>
      <h2 class="text-lg font-medium mb-4">Basic Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Business Name</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Category</label>
          <select
            v-model="form.category"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Contact Information -->
    <div>
      <h2 class="text-lg font-medium mb-4">Contact Information</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Phone</label>
          <input
            v-model="form.phone"
            type="tel"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Website</label>
          <input
            v-model="form.website"
            type="url"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Social Media</label>
          <input
            v-model="form.social"
            type="text"
            placeholder="Facebook, Instagram, etc."
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Location -->
    <div>
      <h2 class="text-lg font-medium mb-4">Location</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">Address</label>
          <input
            v-model="form.address"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">City</label>
          <input
            v-model="form.city"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">State/Province</label>
          <input
            v-model="form.state"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Postal Code</label>
          <input
            v-model="form.postalCode"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Country</label>
          <input
            v-model="form.country"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Save Changes
      </button>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  initialData: {
    type: Object,
    required: true
  },
  categories: {
    type: Array,
    required: true
  }
})

const form = ref({ ...props.initialData })

defineEmits(['save'])
</script>