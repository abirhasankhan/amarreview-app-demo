<template>
	<div class="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">

		<!-- Error State -->
		<div v-if="error" class="text-center py-8 sm:py-12 text-red-500 mx-2 sm:mx-0">
			<p class="text-base sm:text-lg font-semibold px-4">{{ error }}</p>
			<NuxtLink to="/businesses" class="mt-3 sm:mt-4 inline-block text-emerald-600 hover:underline text-sm sm:text-base">
				Browse all businesses
			</NuxtLink>
		</div>

		<!-- Loading State -->
		<LoadingState v-if="loading" size="lg" :text="`Loading ${business?.name || 'business'}...`" />

		<!-- Business Details -->
		<div v-else-if="business" class="space-y-4 sm:space-y-6 lg:space-y-8">

			<!-- Header Section -->
			<div class="bg-white rounded-lg shadow-sm mx-2 sm:mx-0">

				<!-- Cover Image -->
				<div v-if="business.image" class="w-full h-48 sm:h-60 lg:h-80 relative overflow-hidden rounded-t-lg">
					<img :src="business.image" :alt="business.name" class="w-full h-full object-cover object-center" />
				</div>

				<!-- Business Info -->
				<div class="p-4 sm:p-6">
					<div class="flex flex-col gap-4 sm:gap-6">
						<div class="flex-1">
							<h1 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
								{{ business.name }}
							</h1>
							<p v-if="business.description" class="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
								{{ business.description }}
							</p>

							<!-- Rating -->
							<div class="mt-3 sm:mt-4 flex flex-col xs:flex-row xs:items-center gap-2">
								<div class="flex items-center">
									<span v-for="i in 5" :key="i">
										<span class="text-lg sm:text-xl lg:text-2xl transition-colors"
											:class="i <= Math.floor(business.stats.avg_rating) ? 'text-yellow-400' : 'text-gray-300'">
											★
										</span>
									</span>
								</div>

								<div class="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
									<span class="text-base sm:text-lg font-medium">
										{{ business.stats.avg_rating.toFixed(1) }}/5
									</span>
									<span class="text-sm sm:text-base text-gray-600">
										({{ business.stats.review_count }} {{ business.stats.review_count === 1 ? 'review' : 'reviews' }})
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Contact & Hours Grid -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				<!-- Contact Information -->
				<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
					<h2 class="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">
						Contact Information
					</h2>
					<div class="space-y-3">
						<div v-if="business.address" class="flex items-start">
							<span class="material-icons flex-shrink-0 mt-0.5 mr-2 sm:mr-3 text-gray-500 text-lg sm:text-xl">location_on</span>
							<span class="text-sm sm:text-base text-gray-600 break-words">{{ business.address }}</span>
						</div>
						<div v-if="business.phone" class="flex items-center">
							<span class="material-icons flex-shrink-0 mr-2 sm:mr-3 text-gray-500 text-lg sm:text-xl">phone</span>
							<a :href="`tel:${business.phone}`" class="text-sm sm:text-base text-gray-600 hover:text-emerald-600 transition-colors">
								{{ business.phone }}
							</a>
						</div>
						<div v-if="business.email" class="flex items-center">
							<span class="material-icons flex-shrink-0 mr-2 sm:mr-3 text-gray-500 text-lg sm:text-xl">email</span>
							<a :href="`mailto:${business.email}`" class="text-sm sm:text-base text-gray-600 hover:text-emerald-600 transition-colors break-all">
								{{ business.email }}
							</a>
						</div>
					</div>
				</div>

				<!-- Business Hours -->
				<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
					<h2 class="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Opening Hours</h2>
					<div class="space-y-2">
						<div v-for="hours in business.hours" :key="hours.id"
							class="flex justify-between items-center py-2 border-b last:border-0">
							<span class="font-medium text-gray-700 text-sm sm:text-base">{{
								formatDay(hours.day_of_week)
							}}</span>
							<span v-if="!hours.is_closed" class="text-gray-600 text-sm sm:text-base text-right">
								{{ formatTime(hours.open_time) }} -
								{{ formatTime(hours.close_time) }}
							</span>
							<span v-else class="text-red-500 text-sm sm:text-base">Closed</span>
						</div>
						<p v-if="!business.hours.length" class="text-gray-500 text-center py-2 text-sm sm:text-base">
							No hours available
						</p>
					</div>
				</div>
			</div>

			<!-- Photos Section -->
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
				<h2 class="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Photos</h2>

				<div v-if="business.photos?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
					<div v-for="photo in business.photos" :key="photo.id" class="aspect-square flex flex-col">
						<img :src="photo.url" :alt="photo.caption || 'Business photo'"
							class="w-full h-full object-cover rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer"
							@click="openLightbox(photo)" />
						<p v-if="photo.caption" class="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-700 text-center line-clamp-2 px-1">
							{{ photo.caption }}
						</p>
					</div>
				</div>

				<p v-else class="text-gray-500 text-center py-4 text-sm sm:text-base">No photos available yet.</p>
			</div>

			<!-- FAQ Section -->
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">
				<div class="flex items-center justify-between mb-4 sm:mb-6">
					<h2 class="text-base sm:text-lg lg:text-xl font-semibold">Frequently Asked Questions</h2>
				</div>

				<!-- FAQ List -->
				<div v-if="business.faqs?.length" class="space-y-2 sm:space-y-4">
					<details v-for="faq in [...business.faqs].sort((a, b) => a.order_index - b.order_index)"
						:key="faq.id" class="group border-b last:border-b-0">
						<summary class="list-none cursor-pointer py-3 sm:py-4 px-2 sm:px-4 hover:bg-gray-50 transition-colors rounded-lg">
							<div class="flex justify-between items-center gap-4">
								<span class="font-medium text-sm sm:text-base flex-1 text-left">{{ faq.question }}</span>
								<svg class="transform transition-transform group-open:rotate-180 flex-shrink-0" width="16" height="16"
									viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round"
										stroke-linejoin="round" />
								</svg>
							</div>
						</summary>
						<div class="px-2 sm:px-4 pb-3 sm:pb-4 pt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
							{{ faq.answer }}
						</div>
					</details>
				</div>

				<!-- Empty State -->
				<div v-else class="text-center py-6 text-gray-500">
					<p class="text-sm sm:text-base">No FAQs available yet.</p>
				</div>
			</div>

			<!-- Reviews Section -->
			<div class="bg-white rounded-lg shadow-sm p-4 sm:p-6 mx-2 sm:mx-0">

				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
					<h2 class="text-base sm:text-lg lg:text-xl font-semibold">
						Customer Reviews
					</h2>
					<button v-if="user" @click="showReviewModal = true"
						class="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm sm:text-base font-medium">
						Write a Review
					</button>
					<NuxtLink v-else to="/auth/login" class="text-emerald-600 hover:underline text-sm sm:text-base">
						Log in to write a review
					</NuxtLink>
				</div>

				<!-- Review Loading State -->
				<LoadingState v-if="reviewsLoading" size="md" text="Loading reviews..." />

				<div v-else-if="reviews.length" class="space-y-4 sm:space-y-6">
					<div v-for="review in reviews" :key="review.id" class="border-b last:border-0 pb-4 sm:pb-6">
						<div class="flex items-start justify-between gap-3 sm:gap-4">
							<div class="flex items-start flex-1 min-w-0">
								<!-- User Avatar with fallback -->
								<img :src="getUserAvatar(review)" :alt="getUserName(review)"
									class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
								<div class="ml-3 sm:ml-4 flex-1 min-w-0">
									<div class="flex flex-col xs:flex-row xs:items-baseline xs:justify-between gap-1 xs:gap-4">
										<h3 class="font-semibold text-sm sm:text-base truncate">
											{{ getUserName(review) }}
										</h3>
										<span class="text-xs sm:text-sm text-gray-500 flex-shrink-0">{{
											formatDate(review.created_at)
										}}</span>
									</div>
									<div class="flex items-center mt-1">
										<span v-for="i in 5" :key="i">
											<span class="text-sm sm:text-base" :class="i <= review.rating
												? 'text-yellow-400'
												: 'text-gray-300'
											">
												★
											</span>
										</span>
									</div>
									<p v-if="review.content" class="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed break-words">
										{{ review.content }}
									</p>

									<!-- Review Actions -->
									<div class="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
										<!-- Helpful button -->
										<button @click="handleHelpfulVote(review.id)" :class="[
											'flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1 -m-1 rounded transition-colors',
											review.current_user_voted_helpful ? 'font-medium text-emerald-600' : 'hover:text-emerald-600'
										]" :disabled="loadingVote === review.id || loadingCount[review.id]">
											<!-- Count -->
											<span class="mr-1">
												<template v-if="!loadingCount[review.id]">
													({{ review.helpful_votes || 0 }})
												</template>
												<template v-else>
													<span class="inline-block w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-300 rounded-full animate-spin"></span>
												</template>
											</span>

											<!-- Thumb Icon -->
											<span class="material-icons text-sm sm:text-base transition-colors duration-200" :class="{
												'text-emerald-600': review.current_user_voted_helpful,
												'text-gray-400 group-hover:text-emerald-500': !review.current_user_voted_helpful
											}">
												thumb_up
											</span>
											<span>Helpful</span>

											<!-- Spinner when voting -->
											<span v-if="loadingVote === review.id"
												class="ml-1.5 inline-block h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
										</button>

										<!-- Report button -->
										<button v-if="user && user.id !== review.user_id"
											@click="showReportModal(review.id)"
											class="flex items-center gap-1 text-gray-600 hover:text-gray-900 p-1 -m-1 rounded transition-colors">
											<span class="material-icons text-sm sm:text-base">flag</span>
											<span>Report</span>
										</button>

										<!-- Edit/Delete for owner -->
										<div v-if="user && user.id === review.user_id" class="flex items-center gap-2">
											<button @click="editReview(review)"
												class="flex items-center gap-1 text-gray-600 hover:text-emerald-600 p-1 -m-1 rounded transition-colors">
												<span class="material-icons text-sm sm:text-base">edit</span>
												<span>Edit</span>
											</button>
											<button @click="confirmDeleteReview(review.id)"
												class="flex items-center gap-1 text-gray-600 hover:text-red-600 p-1 -m-1 rounded transition-colors">
												<span class="material-icons text-sm sm:text-base">delete</span>
												<span>Delete</span>
											</button>
										</div>
									</div>

									<!-- Business Owner Response -->
									<div v-if="review.responses && review.responses.length"
										class="mt-3 sm:mt-4 ml-2 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-gray-200">
										<div class="flex items-start gap-2">
											<span class="material-icons flex-shrink-0 mt-1 text-emerald-600 text-base sm:text-lg">store</span>
											<div class="min-w-0 flex-1">
												<div class="flex flex-col xs:flex-row xs:items-baseline gap-1 xs:gap-2">
													<h4 class="font-medium text-gray-900 text-sm sm:text-base">Business Response</h4>
													<span class="text-xs text-gray-500 flex-shrink-0">{{
														formatDate(review.responses[0].created_at) }}</span>
												</div>
												<p class="mt-1 text-gray-600 text-sm sm:text-base leading-relaxed break-words">{{ review.responses[0].content }}</p>

												<!-- Response Actions for Business Owner -->
												<div v-if="isBusinessOwner" class="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
													<button @click="editResponse(review.id, review.responses[0].content)"
														class="flex items-center gap-1 text-gray-600 hover:text-emerald-600 p-1 -m-1 rounded transition-colors">
														<span class="material-icons text-sm">edit</span>
														<span>Edit</span>
													</button>
													<button @click="confirmDeleteResponse(review.id)"
														class="flex items-center gap-1 text-gray-600 hover:text-red-600 p-1 -m-1 rounded transition-colors">
														<span class="material-icons text-sm">delete</span>
														<span>Delete</span>
													</button>
												</div>
											</div>
										</div>
									</div>

									<!-- Business Owner Response Action -->
									<div v-else-if="isBusinessOwner" class="mt-3">
										<button @click="respondToReview(review.id)"
											class="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm p-1 -m-1 rounded transition-colors">
											<span class="material-icons text-sm sm:text-base">reply</span>
											<span>Respond as Business</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-6 text-gray-500">
					<p class="text-sm sm:text-base">No reviews yet. Be the first to write one!</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Review Modal -->
	<div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
		<div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">{{ editingReview ? 'Edit Your Review' : 'Write a Review' }}</h2>
			<form @submit.prevent="submitReview">
				<!-- Rating Input -->
				<div class="mb-4">
					<label class="block text-sm font-medium mb-2">Rating</label>
					<div class="flex justify-center sm:justify-start gap-1 sm:gap-2">
						<button v-for="i in 5" :key="i" type="button" @click="newReview.rating = i"
							class="text-2xl sm:text-3xl transition-colors focus:outline-none p-1" :class="i <= newReview.rating
								? 'text-yellow-400'
								: 'text-gray-300'
							">
							★
						</button>
					</div>
				</div>

				<!-- Comment Input -->
				<div class="mb-6">
					<label class="block text-sm font-medium mb-2">Review</label>
					<textarea v-model="newReview.content" rows="4"
						class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base resize-none"
						placeholder="Share your experience..."></textarea>
				</div>

				<!-- Actions -->
				<div class="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-4">
					<button type="button" @click="cancelReview"
						class="w-full xs:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base border border-gray-300 rounded-md">
						Cancel
					</button>
					<button type="submit" :disabled="isSubmitting"
						class="w-full xs:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 text-sm sm:text-base font-medium">
						{{ isSubmitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review' }}
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Response Modal -->
	<div v-if="showResponseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
		<div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">{{ editingResponse ? 'Edit Response' : 'Respond to Review' }}</h2>
			<form @submit.prevent="submitResponse">
				<!-- Response Input -->
				<div class="mb-6">
					<label class="block text-sm font-medium mb-2">Your Response</label>
					<textarea v-model="newResponse.content" rows="4"
						class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base resize-none"
						placeholder="Write your response as the business owner..."></textarea>
				</div>

				<!-- Actions -->
				<div class="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-4">
					<button type="button" @click="cancelResponse"
						class="w-full xs:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base border border-gray-300 rounded-md">
						Cancel
					</button>
					<button type="submit" :disabled="isSubmitting"
						class="w-full xs:w-auto px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 text-sm sm:text-base font-medium">
						{{ isSubmitting ? 'Submitting...' : editingResponse ? 'Update Response' : 'Submit Response' }}
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Report Modal -->
	<div v-if="showReportReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
		<div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">Report Review</h2>
			<form @submit.prevent="submitReport">
				<!-- Report Reason -->
				<div class="mb-6">
					<label class="block text-sm font-medium mb-2">Reason for Report</label>
					<select v-model="reportReason"
						class="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base">
						<option value="">Select a reason</option>
						<option value="inappropriate">Inappropriate content</option>
						<option value="spam">Spam</option>
						<option value="fake">Fake review</option>
						<option value="offensive">Offensive language</option>
						<option value="other">Other</option>
					</select>
				</div>

				<!-- Actions -->
				<div class="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-4">
					<button type="button" @click="showReportReviewModal = false"
						class="w-full xs:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base border border-gray-300 rounded-md">
						Cancel
					</button>
					<button type="submit" :disabled="isSubmitting || !reportReason"
						class="w-full xs:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300 text-sm sm:text-base font-medium">
						{{ isSubmitting ? 'Submitting...' : 'Submit Report' }}
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Confirmation Modal -->
	<div v-if="showConfirmationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
		<div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
			<h2 class="text-lg sm:text-xl lg:text-2xl font-semibold mb-4">{{ confirmationTitle }}</h2>
			<p class="mb-6 text-gray-600 text-sm sm:text-base">{{ confirmationMessage }}</p>

			<!-- Actions -->
			<div class="flex flex-col-reverse xs:flex-row xs:justify-end gap-2 xs:gap-4">
				<button @click="showConfirmationModal = false"
					class="w-full xs:w-auto px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base border border-gray-300 rounded-md">
					Cancel
				</button>
				<button @click="confirmAction" :disabled="isSubmitting"
					class="w-full xs:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-red-300 text-sm sm:text-base font-medium">
					{{ isSubmitting ? 'Processing...' : 'Confirm' }}
				</button>
			</div>
		</div>
	</div>

</template>

<script setup>
import { useBusiness } from "~/composables/useBusiness";
import { useReviews } from "~/composables/useReviews";
import { useNotification } from "~/composables/useNotification";


// Add Material Icons stylesheet in the head
useHead({
	link: [
		{
			rel: 'stylesheet',
			href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
		},
	],
});

const route = useRoute();
const user = useSupabaseUser();
const client = useSupabaseClient();
const { showSuccess, showError, showInfo } = useNotification();

const { business, loading, error, fetchBusinessBySlug } = useBusiness();
const {
	reviews,
	loading: reviewsLoading,
	error: reviewsError,
	userReview,
	canWriteReview,
	fetchReviews,
	createReview,
	updateReview,
	deleteReview,
	toggleHelpfulVote,
	reportReview,
	respondToReview: apiRespondToReview,
	updateResponse: apiUpdateResponse,
	deleteResponse: apiDeleteResponse
} = useReviews();

// UI State
const showReviewModal = ref(false);
const showResponseModal = ref(false);
const showReportReviewModal = ref(false);
const showConfirmationModal = ref(false);
const isSubmitting = ref(false);
const editingReview = ref(false);
const editingResponse = ref(false);
const currentReviewId = ref(null);
const reportReason = ref('');
const confirmationTitle = ref('');
const confirmationMessage = ref('');
const confirmActionCallback = ref(null);

const loadingVote = ref(null);
const loadingCount = ref({});


// Form Data
const newReview = ref({ rating: 0, content: "" });
const newResponse = ref({ content: "" });


// Check if user is a business owner
const isBusinessOwner = computed(() => {
	if (!user.value || !business.value) return false;
	return business.value.owner_id === user.value.id;
});



// Initialize helpful_votes for each review
const initializeReviews = () => {
	if (reviews.value && reviews.value.length) {
		reviews.value.forEach(review => {
			if (typeof review.helpful_votes === 'undefined') {
				review.helpful_votes = 0;
			}
		});
	}
};


// Fetch business data and reviews
watchEffect(async () => {
	if (route.params.slug && route.params.slug !== "undefined") {
		await fetchBusinessBySlug(route.params.slug);
		if (business.value) {
			await fetchReviews(business.value.id);
			initializeReviews();
			loadVoteCounts();
		}
	}
});

// Helper functions for user data
const getUserName = (review) => {
	return review.user?.full_name || 'Unknown User';
};


const getUserAvatar = (review) => {
	// Use the avatar if available, otherwise generate one
	return review.user?.avatar_url ||
		`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.id || review.user_id || review.id}`;
};

// Formatting functions
const formatDay = (dayNumber) => {
	const days = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	return days[dayNumber];
};

const formatTime = (timeString) => {
	if (!timeString) return "";
	try {
		const [hours, minutes] = timeString.split(":");
		const parsedHours = parseInt(hours);
		const ampm = parsedHours >= 12 ? "PM" : "AM";
		const displayHours = parsedHours % 12 || 12;
		return `${displayHours}:${minutes} ${ampm}`;
	} catch {
		return "Invalid time";
	}
};

const formatDate = (dateString) => {
	try {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return "Invalid date";
	}
};

// Review Actions
const editUserReview = () => {
	if (!userReview.value) return;
	editReview(userReview.value);
};

const editReview = (review) => {
	editingReview.value = true;
	currentReviewId.value = review.id;
	newReview.value = {
		rating: review.rating,
		content: review.content
	};
	showReviewModal.value = true;
};

const cancelReview = () => {
	showReviewModal.value = false;
	editingReview.value = false;
	currentReviewId.value = null;
	newReview.value = { rating: 0, content: "" };
};

const submitReview = async () => {
	if (newReview.value.rating === 0) {
		showError("Please select a rating");
		return;
	}

	try {
		isSubmitting.value = true;

		if (editingReview.value && currentReviewId.value) {
			// Update existing review
			await updateReview(currentReviewId.value, {
				rating: newReview.value.rating,
				content: newReview.value.content
			});
			showSuccess("Review updated successfully");
		} else {
			// Create new review
			await createReview({
				business_id: business.value.id,
				rating: newReview.value.rating,
				content: newReview.value.content,
			});
			showSuccess("Review submitted successfully");
		}

		cancelReview();
	} catch (err) {
		console.error("Review submission error:", err);
		showError(err.message || "Failed to submit review");
	} finally {
		isSubmitting.value = false;
	}
};


const confirmDeleteReview = (reviewId) => {
	currentReviewId.value = reviewId;
	confirmationTitle.value = "Delete Review";
	confirmationMessage.value = "Are you sure you want to delete your review? This action cannot be undone.";
	confirmActionCallback.value = handleDeleteReview;
	showConfirmationModal.value = true;
};

const handleDeleteReview = async () => {
	try {
		isSubmitting.value = true;
		await deleteReview(currentReviewId.value);
		showSuccess("Review deleted successfully");
		showConfirmationModal.value = false;
	} catch (err) {
		console.error("Delete review error:", err);
		showError(err.message || "Failed to delete review");
	} finally {
		isSubmitting.value = false;
	}
};


const loadVoteCounts = async () => {
	if (!reviews.value?.length) return;

	for (const review of reviews.value) {
		try {
			loadingCount.value[review.id] = true;
			const { count } = await $fetch(`/api/reviews/${review.id}/count`);
			review.helpful_votes = count;
		} catch (error) {
			console.error(`Failed loading votes for review ${review.id}:`, error);
		} finally {
			loadingCount.value[review.id] = false;
		}
	}
};

const handleHelpfulVote = async (reviewId) => {
	if (!user.value) {
		showInfo("Please login to mark reviews as helpful");
		return;
	}

	loadingVote.value = reviewId;
	try {
		const newCount = await toggleHelpfulVote(reviewId);

		// Update the local count immediately
		const reviewIndex = reviews.value.findIndex(r => r.id === reviewId);
		if (reviewIndex !== -1) {
			reviews.value[reviewIndex].helpful_votes = newCount;
		}

		// showSuccess(`Vote recorded! Total votes: ${newCount}`);
	} catch (err) {
		console.error("Toggle helpful vote error:", err);
		showError(err.message || "Failed to update vote");
	} finally {
		loadingVote.value = null;
	}
};

// Report Review
const showReportModal = (reviewId) => {
	currentReviewId.value = reviewId;
	reportReason.value = '';
	showReportReviewModal.value = true;
};


const submitReport = async () => {
	if (!reportReason.value) {
		showError("Please select a reason for reporting");
		return;
	}

	try {
		isSubmitting.value = true;
		await reportReview(currentReviewId.value, reportReason.value);
		showSuccess("Review reported successfully");
		showReportReviewModal.value = false;
	} catch (err) {
		console.error("Report review error:", err);
		showError(err.message || "Failed to report review");
	} finally {
		isSubmitting.value = false;
		reportReason.value = '';
	}
};



// Business Owner Response
const respondToReview = (reviewId) => {
	currentReviewId.value = reviewId;
	editingResponse.value = false;
	newResponse.value = { content: "" };
	showResponseModal.value = true;
};

const editResponse = (reviewId, content) => {
	currentReviewId.value = reviewId;
	editingResponse.value = true;
	newResponse.value = { content };
	showResponseModal.value = true;
};

const cancelResponse = () => {
	showResponseModal.value = false;
	editingResponse.value = false;
	currentReviewId.value = null;
	newResponse.value = { content: "" };
};


const submitResponse = async () => {
	if (!newResponse.value.content.trim()) {
		showError("Please enter a response");
		return;
	}

	try {
		isSubmitting.value = true;

		if (editingResponse.value) {
			// Update existing response
			await apiUpdateResponse(currentReviewId.value, newResponse.value.content);
			showSuccess("Response updated successfully");
		} else {
			// Create new response
			await apiRespondToReview(currentReviewId.value, newResponse.value.content);
			showSuccess("Response submitted successfully");
		}

		cancelResponse();
	} catch (err) {
		console.error("Response submission error:", err);
		showError(err.message || "Failed to submit response");
	} finally {
		isSubmitting.value = false;
	}
};


const confirmDeleteResponse = (reviewId) => {
	currentReviewId.value = reviewId;
	confirmationTitle.value = "Delete Response";
	confirmationMessage.value = "Are you sure you want to delete your response? This action cannot be undone.";
	confirmActionCallback.value = handleDeleteResponse;
	showConfirmationModal.value = true;
};

const handleDeleteResponse = async () => {
	try {
		isSubmitting.value = true;
		await apiDeleteResponse(currentReviewId.value);
		showSuccess("Response deleted successfully");
		showConfirmationModal.value = false;
	} catch (err) {
		console.error("Delete response error:", err);
		showError(err.message || "Failed to delete response");
	} finally {
		isSubmitting.value = false;
	}
};


// Confirmation action handler
const confirmAction = () => {
	if (typeof confirmActionCallback.value === 'function') {
		confirmActionCallback.value();
	}
};


</script>