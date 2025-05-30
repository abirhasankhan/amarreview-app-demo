<template>
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Error State -->
		<div v-if="error" class="text-center py-12 bg-red-50 rounded-lg">
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
				<Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
			</div>
			<h3 class="mt-4 text-lg font-medium text-red-800">Error loading profile</h3>
			<p class="mt-2 text-sm text-red-600">{{ error }}</p>
			<div class="mt-6">
				<NuxtLink to="/" class="btn-secondary">
					<Icon name="heroicons:arrow-left" class="-ml-1 mr-1 h-5 w-5" />
					Back to Home
				</NuxtLink>
			</div>
		</div>

		<!-- Loading State -->
		<LoadingState v-if="isLoading || loading" size="xl" :text="`Loading ${profile?.full_name || 'dashboard'}...`" />

		<!-- Main Content -->
		<div v-if="profile" class="space-y-8">
			<!-- Profile Header -->
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<div class="px-6 py-8 sm:px-8 sm:py-10">
					<div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
						<!-- Avatar -->
						<div class="relative group">
							<img :src="profile.avatar_url || '/default-avatar.png'"
								class="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-emerald-100 shadow-md"
								alt="Profile picture" />
						</div>

						<!-- Profile Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between gap-4">
								<div>
									<h1 class="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
										{{ profile.full_name }}
									</h1>
									<p class="text-gray-600">@{{ profile.username }}</p>
								</div>
								<NuxtLink to="/dashboard/profile" class="btn-edit">
									<Icon name="heroicons:pencil-square" class="h-5 w-5" />
									Edit Profile
								</NuxtLink>
							</div>

							<p v-if="profile.bio" class="mt-3 text-gray-600">
								{{ profile.bio }}
							</p>

							<div class="mt-4 flex flex-wrap gap-2">
								<span v-if="profile.status" class="badge-success">
									{{ profile.status }}
								</span>
								<span v-if="profile.role" class="badge-info">
									{{ profile.role }}
								</span>
								<span v-if="profile.gender" class="badge-pink">
									{{ formatGender(profile.gender) }}
								</span>
							</div>

							<div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
								<ProfileStatItem label="Member Since" :value="formatDate(profile.created_at)" />
								<ProfileStatItem label="Last Updated" :value="formatDate(profile.updated_at)" />
								<ProfileStatItem label="Email" :value="profile.email" />
								<div class="col-span-2 sm:col-span-1">
									<p class="text-sm font-medium text-gray-500">Social Connections</p>
									<div class="mt-1 flex space-x-2">
										<a v-for="social in profile.socials || []" :key="social.platform"
											:href="social.url" target="_blank"
											class="text-gray-400 hover:text-emerald-600 transition-colors"
											:title="formatPlatformName(social.platform)">
											<span class="text-xl">{{ social.icon }}</span>
										</a>
										<span v-if="!profile.socials?.length" class="text-gray-400 text-sm">None</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Stats Section -->
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-200">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-medium text-gray-900">Your Stats</h2>
						<span :class="[userStats.rank.color, 'px-3 py-1 rounded-full text-sm font-medium']">
							{{ userStats.rank.name }}
						</span>
					</div>
				</div>
				<div class="px-6 py-5">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
						<StatCard label="Total Reviews" :value="userStats.totalReviews"
							icon="heroicons:chat-bubble-bottom-center-text" />
						<StatCard label="Helpful Votes" :value="userStats.helpfulVotes"
							icon="heroicons:hand-thumb-up" />
						<StatCard label="Review Score" :value="userStats.reviewScore" icon="heroicons:star" />
					</div>
				</div>
			</div>

			<!-- Badges Section -->
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Your Badges</h2>
				</div>
				<div class="px-6 py-5">
					<div v-if="userBadges.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<BadgeCard v-for="badge in userBadges" :key="badge.id" :badge="badge" />
					</div>
					<div v-else class="text-center py-8 text-gray-500">
						<Icon name="heroicons:trophy" class="mx-auto h-12 w-12 text-gray-300" />
						<p class="mt-2">No badges earned yet. Start reviewing to earn your first badge!</p>
					</div>
				</div>
			</div>

			<!-- Reviews Section -->
			<div class="bg-white shadow rounded-lg overflow-hidden">
				<div class="px-6 py-5 border-b border-gray-200">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-medium text-gray-900">Your Reviews</h2>
						<div class="flex items-center gap-3">
							<select v-model="filters.sort" class="select-field bg-gray-100" @change="sortReviews">
								<option value="recent">Most Recent</option>
								<option value="helpful">Most Helpful</option>
								<option value="rating">Highest Rating</option>
							</select>
							<NuxtLink to="/businesses" class="btn-primary">
								<Icon name="heroicons:plus" class="h-4 w-4 mr-1" />
								Write Review
							</NuxtLink>
						</div>
					</div>
				</div>

				<!-- Reviews Loading State -->
				<div v-if="reviewsLoading" class="px-6 py-8">
					<LoadingState size="md" text="Loading your reviews..." />
				</div>

				<!-- Reviews Error State -->
				<div v-else-if="reviewsError" class="px-6 py-8 text-center">
					<div class="text-red-600">
						<Icon name="heroicons:exclamation-triangle" class="mx-auto h-8 w-8 mb-2" />
						<p class="text-sm">{{ reviewsError.message || 'Failed to load reviews' }}</p>
						<button @click="loadUserReviews" class="btn-secondary mt-4">
							<Icon name="heroicons:arrow-path" class="h-4 w-4 mr-1" />
							Retry
						</button>
					</div>
				</div>

				<!-- Reviews Content -->
				<div v-else-if="sortedReviews.length" class="divide-y divide-gray-200">
					<ReviewCard v-for="review in sortedReviews" :key="review.id" :review="review" :show-actions="true"
						:loading="reviewActionLoading === review.id" @edit="openEditModal" @delete="handleDeleteReview" />
				</div>

				<!-- Empty State -->
				<div v-else class="px-6 py-12 text-center">
					<Icon name="heroicons:chat-bubble-bottom-center-text" class="mx-auto h-12 w-12 text-gray-300" />
					<h3 class="mt-4 text-lg font-medium text-gray-900">No reviews yet</h3>
					<p class="mt-2 text-gray-600">Start sharing your experiences with local businesses!</p>
					<div class="mt-6">
						<NuxtLink to="/businesses" class="btn-primary">
							<Icon name="heroicons:plus" class="h-4 w-4 mr-1" />
							Write Your First Review
						</NuxtLink>
					</div>
				</div>
			</div>

		</div>

		<!-- Edit Review Modal -->
		<div v-if="showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
			<div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
				<div class="mt-3">
					<!-- Modal Header -->
					<div class="flex items-center justify-between pb-4 border-b border-gray-200">
						<h3 class="text-lg font-medium text-gray-900">Edit Review</h3>
						<button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
							<Icon name="heroicons:x-mark" class="h-6 w-6" />
						</button>
					</div>

					<!-- Business Info -->
					<div v-if="editingReview" class="mt-4 p-4 bg-gray-50 rounded-lg">
						<div class="flex items-center space-x-3">
							<img v-if="editingReview.business.photos?.[0]" 
								:src="editingReview.business.photos[0]" 
								class="w-12 h-12 rounded-lg object-cover"
								:alt="editingReview.business.name" />
							<div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center" v-else>
								<Icon name="heroicons:building-storefront" class="h-6 w-6 text-gray-400" />
							</div>
							<div>
								<h4 class="font-medium text-gray-900">{{ editingReview.business.name }}</h4>
								<p class="text-sm text-gray-600">{{ editingReview.business.category }}</p>
							</div>
						</div>
					</div>

					<!-- Edit Form -->
					<form @submit.prevent="handleUpdateReview" class="mt-6 space-y-6">
						<!-- Rating -->
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Rating</label>
							<div class="flex items-center space-x-1">
								<button v-for="star in 5" :key="star" type="button"
									@click="editForm.rating = star"
									class="focus:outline-none">
									<Icon name="heroicons:star" 
										:class="[star <= editForm.rating ? 'text-yellow-400' : 'text-gray-300', 'h-8 w-8']" 
										:fill="star <= editForm.rating ? 'currentColor' : 'none'" />
								</button>
								<span class="ml-2 text-sm text-gray-600">({{ editForm.rating }}/5)</span>
							</div>
						</div>

						<!-- Review Text -->
						<div>
							<label for="review" class="block text-sm font-medium text-gray-700 mb-2">
								Your Review
							</label>
							<textarea id="review" v-model="editForm.content" rows="6"
								class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
								placeholder="Share your experience with this business..."
								required></textarea>
							<p class="mt-2 text-sm text-gray-500">
								{{ editForm.content.length }}/1000 characters
							</p>
						</div>

						<!-- Form Actions -->
						<div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
							<button type="button" @click="closeEditModal" 
								class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
								Cancel
							</button>
							<button type="submit" :disabled="editFormLoading || !editForm.content.trim()"
								class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed">
								<Icon v-if="editFormLoading" name="heroicons:arrow-path" class="animate-spin h-4 w-4 mr-2" />
								{{ editFormLoading ? 'Updating...' : 'Update Review' }}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>


<script setup>
import { ref, onMounted, computed, watch } from 'vue'

import LoadingState from "@/components/LoadingState.vue"
import ProfileStatItem from "@/components/ProfileStatItem.vue"
import StatCard from "@/components/StatCard.vue"
import BadgeCard from "@/components/BadgeCard.vue"
import ReviewCard from "@/components/ReviewCard.vue"
import { useProfile } from '~/composables/useProfile'
import { useReviews } from '~/composables/useReviews'
import { useNotification } from '~/composables/useNotification'
import { useRouter } from '#app'


const router = useRouter()
const loading = ref(false)
const reviewActionLoading = ref(null)

const { profile, isLoading, error, fetchProfile } = useProfile()
const {
	reviews: userReviews,
	loading: reviewsLoading,
	error: reviewsError,
	updateReview,
	deleteReview,
} = useReviews()
const { showNotification } = useNotification()

// Data
const filters = ref({ sort: 'recent' })

// Edit Modal State
const showEditModal = ref(false)
const editingReview = ref(null)
const editFormLoading = ref(false)
const editForm = ref({
	rating: 5,
	content: '',
	visit_date: '',
	recommend: true
})

// User stats (computed from actual reviews)
const userStats = computed(() => {
	const totalReviews = userReviews.value.length
	const helpfulVotes = userReviews.value.reduce((sum, review) => {
		return sum + (review.helpful_votes?.length || 0)
	}, 0)
	const reviewScore = userReviews.value.reduce((sum, review) => {
		return sum + (review.rating * 10) + (review.helpful_votes?.length || 0) * 5
	}, 0)

	// Determine rank based on activity
	let rank = { name: 'New Reviewer', color: 'bg-gray-100 text-gray-800' }
	if (totalReviews >= 20) {
		rank = { name: 'Elite Reviewer', color: 'bg-purple-100 text-purple-800' }
	} else if (totalReviews >= 10) {
		rank = { name: 'Gold Reviewer', color: 'bg-yellow-100 text-yellow-800' }
	} else if (totalReviews >= 5) {
		rank = { name: 'Silver Reviewer', color: 'bg-gray-100 text-gray-600' }
	} else if (totalReviews >= 1) {
		rank = { name: 'Bronze Reviewer', color: 'bg-orange-100 text-orange-800' }
	}

	return {
		totalReviews,
		helpfulVotes,
		reviewScore,
		rank
	}
})

// User badges (computed from actual activity)
const userBadges = computed(() => {
	const totalReviews = userStats.value.totalReviews
	const helpfulVotes = userStats.value.helpfulVotes

	// Get unique categories reviewed
	const categoriesReviewed = new Set(
		userReviews.value.map(review => review.business?.category).filter(Boolean)
	).size

	const badges = [
		{
			id: 1,
			name: 'Rookie Reviewer',
			icon: '🌟',
			description: 'Write your first review',
			unlocked: totalReviews >= 1,
			requiredCount: 1,
			currentCount: Math.min(1, totalReviews),
			progress: Math.min(100, (totalReviews / 1) * 100)
		},
		{
			id: 2,
			name: 'Trusted Reviewer',
			icon: '🏆',
			description: 'Get 10 helpful votes',
			unlocked: helpfulVotes >= 10,
			requiredCount: 10,
			currentCount: helpfulVotes,
			progress: Math.min(100, (helpfulVotes / 10) * 100)
		},
		{
			id: 3,
			name: 'Elite Critic',
			icon: '👑',
			description: 'Write 10 reviews',
			unlocked: totalReviews >= 10,
			requiredCount: 10,
			currentCount: totalReviews,
			progress: Math.min(100, (totalReviews / 10) * 100)
		},
		{
			id: 4,
			name: 'Category Expert',
			icon: '🎓',
			description: 'Review 5 businesses in different categories',
			unlocked: categoriesReviewed >= 5,
			requiredCount: 5,
			currentCount: categoriesReviewed,
			progress: Math.min(100, (categoriesReviewed / 5) * 100)
		}
	]

	return badges.filter(badge => badge.unlocked || badge.currentCount > 0)
})

// Formatters
const formatDate = (dateString) => {
	if (!dateString) return 'N/A'
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}

const formatGender = (gender) => {
	const map = {
		male: 'Male',
		female: 'Female',
		'non-binary': 'Non-binary',
		prefer_not_to_say: 'Prefer not to say'
	}
	return map[gender] || gender
}

const formatPlatformName = (platform) => {
	return platform.charAt(0).toUpperCase() + platform.slice(1)
}

// Computed property for sorting reviews
const sortedReviews = computed(() => {
	if (!userReviews.value.length) return []

	const reviews = [...userReviews.value]
	switch (filters.value.sort) {
		case 'helpful':
			return reviews.sort((a, b) => {
				const aVotes = a.helpful_votes?.length || 0
				const bVotes = b.helpful_votes?.length || 0
				return bVotes - aVotes
			})
		case 'rating':
			return reviews.sort((a, b) => b.rating - a.rating)
		case 'recent':
		default:
			return reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
	}
})

// Load user reviews
const loadUserReviews = async () => {
	
	if (!profile.value?.id) return

	try {
		const data = await $fetch('/api/reviews', {
			method: 'GET',
			credentials: 'include',
			query: {
				user_id: profile.value.id,
				limit: 50, // Get more reviews for dashboard
				sort: 'created_at',
				order: 'desc'
			}
		})

		const currentUserId = profile.value.id

		if (data?.success && data?.reviews) {
			userReviews.value = data.reviews.map(review => {
				const isOwnReview = review.user_id === currentUserId
				const helpfulVotes = Array.isArray(review.helpful_votes) ? review.helpful_votes : []

				return {
					...review,

					// 🧍 Fallback user object
					user: review.user || {
						id: review.user_id,
						full_name: 'Unknown User',
						avatar_url: null
					},

					// 📷 Ensure photos is always an array
					photos: Array.isArray(review.photos) ? review.photos : [],

					// 💬 Normalize responses to always be an array
					responses: Array.isArray(review.responses)
						? review.responses
						: review.responses
							? [review.responses]
							: [],

					// 👍 Handle helpful votes
					helpful_votes: helpfulVotes,
					helpful_votes_count: helpfulVotes.length,

					// ✅ Voting flag for current user
					current_user_voted_helpful: isOwnReview
						? false
						: helpfulVotes.some(vote => vote.user_id === currentUserId)
				}
			})
		} else {
			userReviews.value = []
		}

	} catch (error) {
		console.error('Error loading user reviews:', error)
		reviewsError.value = {
			message: error.data?.message || error.message || 'Failed to load your reviews'
		}
		showNotification('error', 'Failed to load your reviews')
	}
}

// Edit Modal Functions
const openEditModal = (review) => {
	editingReview.value = review
	editForm.value = {
		rating: review.rating,
		content: review.content,	
	}
	showEditModal.value = true
}

const closeEditModal = () => {
	showEditModal.value = false
	editingReview.value = null
	editForm.value = {
		rating: 5,
		content: '',
		visit_date: '',
		recommend: true
	}
}

const handleUpdateReview = async () => {
	if (!editingReview.value || !editForm.value.content.trim()) return

	editFormLoading.value = true

	try {
		const updatedData = {
			rating: editForm.value.rating,
			content: editForm.value.content,
			visit_date: editForm.value.visit_date,
			recommend: editForm.value.recommend
		}

		await updateReview(editingReview.value.id, updatedData)

		// Update the local review in the array
		const index = userReviews.value.findIndex(r => r.id === editingReview.value.id)
		if (index !== -1) {
			userReviews.value[index] = {
				...userReviews.value[index],
				...updatedData
			}
		}

		showNotification('success', 'Review updated successfully')
		closeEditModal()
	} catch (error) {
		console.error('Error updating review:', error)
		showNotification('error', error.message || 'Failed to update review')
	} finally {
		editFormLoading.value = false
	}
}

const editReview = (review) => {
	editingReview.value = true;
	currentReviewId.value = review.id;
	newReview.value = {
		rating: review.rating,
		content: review.content
	};
	showReviewModal.value = true;
};


// Actions
const handleDeleteReview = async (reviewId) => {
	if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
		return
	}

	reviewActionLoading.value = reviewId

	try {
		await deleteReview(reviewId)
		showNotification('success', 'Review deleted successfully')

		// Remove from local array
		const index = userReviews.value.findIndex(r => r.id === reviewId)
		if (index !== -1) {
			userReviews.value.splice(index, 1)
		}
	} catch (error) {
		console.error('Error deleting review:', error)
		showNotification('error', error.message || 'Failed to delete review')
	} finally {
		reviewActionLoading.value = null
	}
}

const sortReviews = () => {
	// Trigger reactivity for sorting
	filters.value = { ...filters.value }
}

// Watch for profile changes to load reviews
watch(profile, (newProfile) => {
	if (newProfile?.id) {
		loadUserReviews()
	}
}, { immediate: true })

// Lifecycle
onMounted(async () => {
	loading.value = true
	try {
		await fetchProfile()
		if (!profile.value) {
			router.push('/auth/login')
			return
		}
		// Reviews will be loaded by the watcher
	} catch (err) {
		showNotification('error', 'Failed to load profile')
		console.error(err)
	} finally {
		loading.value = false
	}
})
</script>

<style scoped>
.btn-secondary {
	@apply inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500;
}

.btn-primary {
	@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500;
}

.btn-edit {
	@apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500;
}

.select-field {
	@apply block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md;
}

.badge-success {
	@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800;
}

.badge-info {
	@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800;
}

.badge-pink {
	@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800;
}
</style>