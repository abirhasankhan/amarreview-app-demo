<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-semibold">Analytics Dashboard</h2>
      <div class="flex gap-4">
        <select
          v-model="timeRange"
          class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>
    </div>

    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Profile Views</p>
            <p class="mt-1 text-2xl font-semibold">{{ metrics.profileViews }}</p>
          </div>
          <span class="text-2xl">👁️</span>
        </div>
        <div class="mt-4">
          <span
            class="inline-flex items-center text-sm"
            :class="metrics.profileViewsTrend > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ metrics.profileViewsTrend > 0 ? '↑' : '↓' }}
            {{ Math.abs(metrics.profileViewsTrend) }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">New Reviews</p>
            <p class="mt-1 text-2xl font-semibold">{{ metrics.newReviews }}</p>
          </div>
          <span class="text-2xl">📝</span>
        </div>
        <div class="mt-4">
          <span
            class="inline-flex items-center text-sm"
            :class="metrics.newReviewsTrend > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ metrics.newReviewsTrend > 0 ? '↑' : '↓' }}
            {{ Math.abs(metrics.newReviewsTrend) }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Average Rating</p>
            <p class="mt-1 text-2xl font-semibold">{{ metrics.averageRating }}</p>
          </div>
          <span class="text-2xl">⭐</span>
        </div>
        <div class="mt-4">
          <span
            class="inline-flex items-center text-sm"
            :class="metrics.averageRatingTrend > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ metrics.averageRatingTrend > 0 ? '↑' : '↓' }}
            {{ Math.abs(metrics.averageRatingTrend) }}
          </span>
          <span class="text-sm text-gray-500 ml-2">point change</span>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Response Rate</p>
            <p class="mt-1 text-2xl font-semibold">{{ metrics.responseRate }}%</p>
          </div>
          <span class="text-2xl">💬</span>
        </div>
        <div class="mt-4">
          <span
            class="inline-flex items-center text-sm"
            :class="metrics.responseRateTrend > 0 ? 'text-green-600' : 'text-red-600'"
          >
            {{ metrics.responseRateTrend > 0 ? '↑' : '↓' }}
            {{ Math.abs(metrics.responseRateTrend) }}%
          </span>
          <span class="text-sm text-gray-500 ml-2">vs previous period</span>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Profile Views Chart -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium mb-4">Profile Views Over Time</h3>
        <div class="h-64">
          <LineChart
            :data="viewsChartData"
            :options="chartOptions"
          />
        </div>
      </div>

      <!-- Rating Distribution -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium mb-4">Rating Distribution</h3>
        <div class="h-64">
          <BarChart
            :data="ratingChartData"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>

    <!-- Customer Demographics -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h3 class="text-lg font-medium mb-4">Customer Demographics</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Age Distribution -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Age Groups</h4>
          <div class="space-y-2">
            <div v-for="(value, age) in demographics.ageGroups" :key="age">
              <div class="flex items-center justify-between text-sm">
                <span>{{ age }}</span>
                <span>{{ value }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-emerald-600 h-2 rounded-full"
                  :style="{ width: `${value}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gender Distribution -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Gender</h4>
          <div class="space-y-2">
            <div v-for="(value, gender) in demographics.gender" :key="gender">
              <div class="flex items-center justify-between text-sm">
                <span>{{ gender }}</span>
                <span>{{ value }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-emerald-600 h-2 rounded-full"
                  :style="{ width: `${value}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Location Distribution -->
        <div>
          <h4 class="text-sm font-medium text-gray-700 mb-2">Top Locations</h4>
          <div class="space-y-2">
            <div v-for="(value, location) in demographics.locations" :key="location">
              <div class="flex items-center justify-between text-sm">
                <span>{{ location }}</span>
                <span>{{ value }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-emerald-600 h-2 rounded-full"
                  :style="{ width: `${value}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Line as LineChart, Bar as BarChart } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  businessId: {
    type: String,
    required: true
  }
})

const timeRange = ref('30')

// Mock metrics data
const metrics = ref({
  profileViews: 1234,
  profileViewsTrend: 12,
  newReviews: 45,
  newReviewsTrend: -5,
  averageRating: 4.5,
  averageRatingTrend: 0.2,
  responseRate: 95,
  responseRateTrend: 3
})

// Mock demographics data
const demographics = ref({
  ageGroups: {
    '18-24': 15,
    '25-34': 35,
    '35-44': 25,
    '45-54': 15,
    '55+': 10
  },
  gender: {
    'Male': 45,
    'Female': 52,
    'Other': 3
  },
  locations: {
    'Downtown': 35,
    'Suburbs': 25,
    'Online': 40
  }
})

// Chart data
const viewsChartData = computed(() => ({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Profile Views',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: '#059669',
      tension: 0.1
    }
  ]
}))

const ratingChartData = computed(() => ({
  labels: ['1★', '2★', '3★', '4★', '5★'],
  datasets: [
    {
      label: 'Number of Reviews',
      data: [5, 8, 15, 45, 78],
      backgroundColor: '#059669'
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

// Fetch analytics data based on time range
watch(timeRange, async (newRange) => {
  try {
    // Mock API call to fetch data
    await new Promise(resolve => setTimeout(resolve, 500))
    // Update metrics and charts with new data
  } catch (error) {
    console.error('Error fetching analytics:', error)
  }
})

// Initial data fetch
onMounted(async () => {
  try {
    // Mock API call to fetch initial data
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('Error fetching initial analytics:', error)
  }
})
</script>