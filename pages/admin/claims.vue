<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Business Claims</h1>
        <div class="flex gap-4">
          <select
            v-model="filters.status"
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search business name..."
            class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Claims Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Business
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Claimed By
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="claim in filteredClaims" :key="claim.id">
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">{{ claim.businessName }}</div>
                  <div class="text-sm text-gray-500">{{ claim.address }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">{{ claim.claimedBy }}</div>
                  <div class="text-sm text-gray-500">{{ claim.role }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-yellow-100 text-yellow-800': claim.status === 'pending',
                    'bg-green-100 text-green-800': claim.status === 'approved',
                    'bg-red-100 text-red-800': claim.status === 'rejected'
                  }"
                >
                  {{ claim.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(claim.submittedAt) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <button
                  @click="openClaimDetails(claim)"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  Review
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalClaims }} claims
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

    <!-- Claim Details Modal -->
    <div
      v-if="selectedClaim"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-xl font-semibold">Review Business Claim</h2>
            <button @click="selectedClaim = null" class="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium mb-2">Business Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.businessName }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Address</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.address }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Phone</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.phone }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Website</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.website }}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-2">Claimant Information</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Name</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.claimedBy }}</div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Role</label>
                  <div class="mt-1 text-sm text-gray-900">{{ selectedClaim.role }}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium mb-2">Verification Document</h3>
              <div class="mt-1">
                <a
                  :href="selectedClaim.verificationDoc"
                  target="_blank"
                  class="text-emerald-600 hover:text-emerald-900"
                >
                  View Document
                </a>
              </div>
            </div>

            <div v-if="selectedClaim.status === 'pending'">
              <h3 class="text-lg font-medium mb-2">Decision</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    v-model="decisionNotes"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-4">
                  <button
                    @click="handleDecision('rejected')"
                    class="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                  >
                    Reject
                  </button>
                  <button
                    @click="handleDecision('approved')"
                    class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
const filters = ref({
  status: '',
  search: ''
})

const currentPage = ref(1)
const itemsPerPage = 10
const selectedClaim = ref(null)
const decisionNotes = ref('')

// Mock claims data
const claims = ref([
  {
    id: 1,
    businessName: 'Green Garden Restaurant',
    address: '123 Main St, City, State 12345',
    phone: '(555) 123-4567',
    website: 'www.greengardenrestaurant.com',
    claimedBy: 'John Smith',
    role: 'Owner',
    status: 'pending',
    submittedAt: '2024-04-01T10:00:00Z',
    verificationDoc: '#'
  },
  {
    id: 2,
    businessName: 'Tech Solutions Pro',
    address: '456 Tech Ave, City, State 12345',
    phone: '(555) 987-6543',
    website: 'www.techsolutionspro.com',
    claimedBy: 'Sarah Johnson',
    role: 'Manager',
    status: 'approved',
    submittedAt: '2024-03-28T14:30:00Z',
    verificationDoc: '#'
  },
  // Add more mock data...
])

// Filter and paginate claims
const filteredClaims = computed(() => {
  return claims.value.filter(claim => {
    const matchesStatus = !filters.value.status || claim.status === filters.value.status
    const matchesSearch = !filters.value.search || 
      claim.businessName.toLowerCase().includes(filters.value.search.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const totalClaims = computed(() => filteredClaims.value.length)
const totalPages = computed(() => Math.ceil(totalClaims.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalClaims.value))

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openClaimDetails = (claim) => {
  selectedClaim.value = claim
  decisionNotes.value = ''
}

const handleDecision = async (decision) => {
  try {
    // Update claim status in database
    const claim = claims.value.find(c => c.id === selectedClaim.value.id)
    claim.status = decision
    
    // Close modal
    selectedClaim.value = null
    decisionNotes.value = ''
  } catch (error) {
    console.error('Error updating claim:', error)
  }
}

// Reset to first page when filters change
watch(filters, () => {
  currentPage.value = 1
})
</script>