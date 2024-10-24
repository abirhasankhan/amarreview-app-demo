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

      <!-- Users Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in paginatedUsers" :key="user.id">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <img
                    :src="user.avatar"
                    :alt="user.name"
                    class="w-8 h-8 rounded-full"
                  />
                  <div class="ml-3">
                    <div class="font-medium text-gray-900">{{ user.name }}</div>
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
                    'bg-red-100 text-red-800': user.status === 'suspended'
                  }"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ user.reviewCount }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(user.joinedAt) }}
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
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalUsers }} users
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
            <button @click="selectedUser = null" class="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <form @submit.prevent="updateUser" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="editForm.name"
                type="text"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
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
                class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const filters = ref({
  role: '',
  status: '',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = 10
const selectedUser = ref(null)
const editForm = ref({
  name: '',
  email: '',
  role: ''
})

// Mock users data
const users = ref([
  {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    reviewCount: 15,
    joinedAt: '2024-01-15T10:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'business_owner',
    status: 'active',
    reviewCount: 8,
    joinedAt: '2024-02-20T14:30:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'admin',
    status: 'active',
    reviewCount: 42,
    joinedAt: '2023-12-01T09:15:00Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
  },
  // Add more mock users...
])

// Filter and paginate users
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesRole = !filters.value.role || user.role === filters.value.role
    const matchesStatus = !filters.value.status || user.status === filters.value.status
    const matchesSearch = !filters.value.search || 
      user.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.value.search.toLowerCase())
    return matchesRole && matchesStatus && matchesSearch
  })
})

const totalUsers = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.ceil(totalUsers.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalUsers.value))
const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value)
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getRoleClass = (role) => {
  const classes = {
    admin: 'bg-purple-100 text-purple-800',
    business_owner: 'bg-blue-100 text-blue-800',
    user: 'bg-gray-100 text-gray-800'
  }
  return classes[role]
}

const formatRole = (role) => {
  const labels = {
    admin: 'Admin',
    business_owner: 'Business Owner',
    user: 'User'
  }
  return labels[role]
}

const editUser = (user) => {
  selectedUser.value = user
  editForm.value = {
    name: user.name,
    email: user.email,
    role: user.role
  }
}

const updateUser = async () => {
  try {
    const user = users.value.find(u => u.id === selectedUser.value.id)
    Object.assign(user, editForm.value)
    selectedUser.value = null
  } catch (error) {
    console.error('Error updating user:', error)
  }
}

const suspendUser = async (user) => {
  if (!confirm(`Are you sure you want to suspend ${user.name}?`)) return
  
  try {
    user.status = 'suspended'
  } catch (error) {
    console.error('Error suspending user:', error)
  }
}

const activateUser = async (user) => {
  try {
    user.status = 'active'
  } catch (error) {
    console.error('Error activating user:', error)
  }
}

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1
})
</script>