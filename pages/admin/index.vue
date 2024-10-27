<template>
  <AdminLayout>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <AdminStatsCard
        title="Total Users"
        :value="stats.totalUsers"
        trend="+12%"
        trend-direction="up"
        icon="👥"
      />
      <AdminStatsCard
        title="Total Reviews"
        :value="stats.totalReviews"
        trend="+8%"
        trend-direction="up"
        icon="📝"
      />
      <AdminStatsCard
        title="Pending Claims"
        :value="stats.pendingClaims"
        trend="+5%"
        trend-direction="up"
        icon="🏢"
      />
      <AdminStatsCard
        title="Reported Content"
        :value="stats.reportedContent"
        trend="-3%"
        trend-direction="down"
        icon="⚠️"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <AdminActivityItem
            v-for="activity in recentActivity"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4">
          <AdminQuickAction
            v-for="action in quickActions"
            :key="action.id"
            v-bind="action"
            @click="handleQuickAction(action.id)"
          />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
definePageMeta({
  //middleware: "admin",
});

// Mock statistics
const stats = ref({
  totalUsers: 1234,
  totalReviews: 5678,
  pendingClaims: 23,
  reportedContent: 15,
});

// Mock recent activity
const recentActivity = ref([
  {
    id: 1,
    type: "review",
    user: "John Doe",
    action: "posted a new review",
    target: "Green Garden Restaurant",
    time: "5 minutes ago",
  },
  {
    id: 2,
    type: "claim",
    user: "Sarah Smith",
    action: "submitted a business claim for",
    target: "Tech Solutions Pro",
    time: "15 minutes ago",
  },
  {
    id: 3,
    type: "report",
    user: "Mike Johnson",
    action: "reported a review on",
    target: "City Cafe",
    time: "1 hour ago",
  },
]);

// Quick actions
const quickActions = ref([
  {
    id: "review-claims",
    title: "Review Claims",
    description: "Process pending business claims",
    icon: "🏢",
    color: "bg-blue-50 text-blue-700",
  },
  {
    id: "moderate-reviews",
    title: "Moderate Reviews",
    description: "Review reported content",
    icon: "📝",
    color: "bg-yellow-50 text-yellow-700",
  },
  {
    id: "manage-users",
    title: "Manage Users",
    description: "View and manage user accounts",
    icon: "👥",
    color: "bg-green-50 text-green-700",
  },
  {
    id: "system-settings",
    title: "Settings",
    description: "Configure system settings",
    icon: "⚙️",
    color: "bg-purple-50 text-purple-700",
  },
]);

const router = useRouter();

const handleQuickAction = (actionId) => {
  switch (actionId) {
    case "review-claims":
      router.push("/admin/claims");
      break;
    case "moderate-reviews":
      router.push("/admin/moderation");
      break;
    case "manage-users":
      router.push("/admin/users");
      break;
    case "system-settings":
      router.push("/admin/settings");
      break;
  }
};
</script>
