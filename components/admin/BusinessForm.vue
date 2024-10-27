<template>
  <form @submit.prevent="$emit('submit', form)" class="space-y-6">
    <!-- Basic Information -->
    <div>
      <h3 class="text-lg font-medium mb-4">Basic Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Business Name</label
          >
          <input
            v-model="form.name"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Category</label
          >
          <select
            v-model="form.category_id"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <textarea
            v-model="form.description"
            rows="3"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="form.status"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Image URL</label
          >
          <input
            v-model="form.image"
            type="url"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>

    <!-- Contact Information -->
    <div>
      <h3 class="text-lg font-medium mb-4">Contact Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>

    <!-- Address -->
    <div>
      <h3 class="text-lg font-medium mb-4">Address</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700"
            >Street Address</label
          >
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
          <label class="block text-sm font-medium text-gray-700"
            >State/Province</label
          >
          <input
            v-model="form.state"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Postal Code</label
          >
          <input
            v-model="form.postal_code"
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

    <div class="flex justify-end space-x-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-700 hover:text-gray-900"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        {{ isEditing ? "Save Changes" : "Add Business" }}
      </button>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  business: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
});

defineEmits(["submit", "cancel"]);

const isEditing = computed(() => !!props.business);

const form = ref({
  name: "",
  category_id: "",
  description: "",
  status: "active",
  image: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
});

// Initialize form with business data if editing
watch(
  () => props.business,
  (newBusiness) => {
    if (newBusiness) {
      form.value = { ...newBusiness };
    } else {
      form.value = {
        name: "",
        category_id: "",
        description: "",
        status: "active",
        image: "",
        phone: "",
        email: "",
        website: "",
        address: "",
        city: "Dhaka",
        state: "Dhaka",
        postal_code: "",
        country: "Bangladesh",
      };
    }
  },
  { immediate: true }
);
</script>
