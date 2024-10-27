<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">User Management</h1>
        <div class="flex gap-4">
          <select
            v-model="filters.role"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="business_owner">Business Owner</option>
            <option value="admin">Admin</option>
          </select>
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search users..."
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Loading users...</p>
      </div>

      <!-- Users Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
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
                Joined
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img
                    :src="
                      user.avatar_url ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                    "
                    :alt="user.full_name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div class="ml-3">
                    <div class="font-medium text-gray-900">
                      {{ user.full_name }}
                    </div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getRoleClass(user.role)"
                >
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': user.status === 'active',
                    'bg-red-100 text-red-800': user.status === 'suspended',
                  }"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ user.review_count }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="editUser(user)"
                  class="text-emerald-600 hover:text-emerald-900 mr-3"
                >
                  Edit
                </button>
                <button
                  v-if="user.status === 'active'"
                  @click="suspendUser(user)"
                  class="text-red-600 hover:text-red-900"
                >
                  Suspend
                </button>
                <button
                  v-else
                  @click="activateUser(user)"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  Activate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of
          {{ totalUsers }} users
        </div>
        <div class="flex gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded enabled:hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded enabled:hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div
      v-if="selectedUser"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">Edit User</h2>
            <button
              @click="selectedUser = null"
              class="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form @submit.prevent="updateUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Name</label
              >
              <input
                v-model="editForm.full_name"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Email</label
              >
              <input
                v-model="editForm.email"
                type="email"
                disabled
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Role</label
              >
              <select
                v-model="editForm.role"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="user">User</option>
                <option value="business_owner">Business Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="selectedUser = null"
                class="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
              >
                {{ isSubmitting ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const client = useSupabaseClient();
const currentPage = ref(1);
const itemsPerPage = 10;
const selectedUser = ref(null);
const loading = ref(true);
const isSubmitting = ref(false);

const filters = ref({
  role: "",
  status: "",
  search: "",
});

const editForm = ref({
  full_name: "",
  email: "",
  role: "",
});

const users = ref([]);

// Fetch users from Supabase
const fetchUsers = async () => {
  try {
    loading.value = true;
    let query = client
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.value.role) {
      query = query.eq("role", filters.value.role);
    }

    if (filters.value.status) {
      query = query.eq("status", filters.value.status);
    }

    if (filters.value.search) {
      query = query.or(
        `full_name.ilike.%${filters.value.search}%,email.ilike.%${filters.value.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    users.value = data;
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loading.value = false;
  }
};

// Filter and paginate users
const filteredUsers = computed(() => users.value);
const totalUsers = computed(() => filteredUsers.value.length);
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage, totalUsers.value)
);
const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value);
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getRoleClass = (role) => {
  const classes = {
    admin: "bg-purple-100 text-purple-800",
    business_owner: "bg-blue-100 text-blue-800",
    user: "bg-gray-100 text-gray-800",
  };
  return classes[role];
};

const formatRole = (role) => {
  const labels = {
    admin: "Admin",
    business_owner: "Business Owner",
    user: "User",
  };
  return labels[role];
};

const editUser = (user) => {
  selectedUser.value = user;
  editForm.value = {
    full_name: user.full_name,
    email: user.email,
    role: user.role,
  };
};

const updateUser = async () => {
  try {
    isSubmitting.value = true;
    const { error } = await client
      .from("profiles")
      .update({
        full_name: editForm.value.full_name,
        role: editForm.value.role,
      })
      .eq("id", selectedUser.value.id);

    if (error) throw error;

    await fetchUsers();
    selectedUser.value = null;
  } catch (error) {
    console.error("Error updating user:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const suspendUser = async (user) => {
  if (!confirm(`Are you sure you want to suspend ${user.full_name}?`)) return;

  try {
    const { error } = await client
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", user.id);

    if (error) throw error;

    await fetchUsers();
  } catch (error) {
    console.error("Error suspending user:", error);
  }
};

const activateUser = async (user) => {
  try {
    const { error } = await client
      .from("profiles")
      .update({ status: "active" })
      .eq("id", user.id);

    if (error) throw error;

    await fetchUsers();
  } catch (error) {
    console.error("Error activating user:", error);
  }
};

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1;
  fetchUsers();
});

// Initial data fetch
onMounted(async () => {
  await fetchUsers();
});
</script>
