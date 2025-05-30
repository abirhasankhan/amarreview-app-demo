// composables/useReviews.js
import { ref, computed } from 'vue'
import { useSupabaseUser } from '#imports'

export function useReviews() {
    const reviews = ref([])
    const loading = ref(false)
    const error = ref(null)
    const user = useSupabaseUser()

    // Current user's review (if they have one)
    const userReview = computed(() => {
        if (!user.value) return null
        return reviews.value.find(review => review.user_id === user.value.id)
    })

    // Check if user can write a review (has not already reviewed)
    const canWriteReview = computed(() => {
        return !userReview.value
    })

    // Generic fetch handler (similar to useBusiness)
    const handleFetch = async (fn) => {
        loading.value = true
        error.value = null
        try {
            return await fn()
        } catch (err) {
            error.value = {
                message: err.data?.message || err.message || 'An error occurred',
                details: err.data?.data || null,
                status: err.statusCode || 500
            }
            console.error('API Error:', error.value)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Fetch reviews for a business
    async function fetchReviews(businessId, options = {}) {
        return handleFetch(async () => {
            if (!businessId) {
                throw new Error('Business ID is required')
            }

            const data = await $fetch('/api/reviews', {
                method: 'GET',
                query: {
                    business_id: businessId,
                    ...options
                }
            })

            if (!data?.reviews) {
                throw new Error('Invalid response format')
            }

            // Process reviews to ensure consistent structure
            reviews.value = data.reviews.map(review => ({
                ...review,
                user: review.user || {
                    id: review.user_id,
                    full_name: 'Unknown User',
                    avatar_url: null
                },
                photos: review.photos || [],
                responses: Array.isArray(review.responses)
                    ? review.responses
                    : review.responses ? [review.responses] : [],                
                helpful_votes: review.helpful_votes || [],
                current_user_voted_helpful: review.current_user_voted_helpful || false
            }))

            return reviews.value
        })
    }


    // Create a new review
    async function createReview(reviewData) {
        return handleFetch(async () => {
            if (!user.value) throw new Error('Authentication required')

            const data = await $fetch('/api/reviews', {
                method: 'POST',
                body: reviewData
            })

            if (data?.review) {
                // Add user info to the new review
                const newReview = {
                    ...data.review,
                    user: {
                        id: user.value.id,
                        full_name: user.value.user_metadata?.full_name || 'You',
                        avatar_url: user.value.user_metadata?.avatar_url || null
                    }
                }
                reviews.value.unshift(newReview)
                return newReview
            }

            throw new Error('Failed to create review')
        })
    }

    // Update existing review
    async function updateReview(reviewId, updateData) {
        return handleFetch(async () => {
            const data = await $fetch('/api/reviews', {
                method: 'PUT',
                body: {
                    id: reviewId,
                    ...updateData
                }
            })

            if (data?.review) {
                const index = reviews.value.findIndex(r => r.id === reviewId)
                if (index !== -1) {
                    reviews.value[index] = {
                        ...reviews.value[index],
                        ...data.review
                    }
                }
                return data.review
            }

            throw new Error('Failed to update review')
        })
    }

    // Delete review
    async function deleteReview(reviewId) {
        return handleFetch(async () => {
            await $fetch('/api/reviews', {
                method: 'DELETE',
                query: { id: reviewId }
            })

            reviews.value = reviews.value.filter(r => r.id !== reviewId)
            return true
        })
    }

    // Toggle helpful vote
    // composables/useReviews.js
    async function getVoteCount(reviewId) {
        return handleFetch(async () => {
            const { count } = await $fetch(`/api/reviews/${reviewId}/count`)
            return count
        })
    }

    // Toggle helpful vote
    async function toggleHelpfulVote(reviewId) {
        return handleFetch(async () => {
            if (!user.value) {
                throw new Error('You must be logged in to vote')
            }

            const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
            if (reviewIndex === -1) throw new Error('Review not found')

            const hasVoted = reviews.value[reviewIndex].current_user_voted_helpful

            const { helpful_votes, user_voted } = await $fetch(
                `/api/reviews/${reviewId}/vote`,
                {
                    method: hasVoted ? 'DELETE' : 'POST',
                    credentials: 'include'
                }
            )

            // Update local state
            reviews.value[reviewIndex] = {
                ...reviews.value[reviewIndex],
                helpful_votes,
                current_user_voted_helpful: user_voted
            }

            return helpful_votes
        })
    }

    // Report review
    async function reportReview(reviewId, reason) {
        return handleFetch(async () => {
            if (!user.value) {
                throw new Error('You must be logged in to report reviews')
            }

            try {
                await $fetch(`/api/reviews/${reviewId}/report`, {
                    method: 'POST',
                    body: { reason },
                    credentials: 'include'
                })

                // Update local state
                const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
                if (reviewIndex !== -1) {
                    reviews.value[reviewIndex].reported = true
                }

                return true
            } catch (error) {
                console.error('Report error:', error)
                throw new Error(error.data?.message || 'Failed to report review')
            }
        })
    }


    // Respond to review (for business owners)
    async function respondToReview(reviewId, content) {
        return handleFetch(async () => {
            if (!user.value) throw new Error('Authentication required')

            const data = await $fetch(`/api/reviews/${reviewId}/respond`, {
                method: 'POST',
                body: { content }
            })

            if (data?.response) {
                const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
                if (reviewIndex !== -1) {
                    reviews.value[reviewIndex].responses = [
                        ...(reviews.value[reviewIndex].responses || []),
                        {
                            ...data.response,
                            user: {
                                id: user.value.id,
                                full_name: user.value.user_metadata?.full_name || 'You',
                                avatar_url: user.value.user_metadata?.avatar_url || null
                            }
                        }
                    ]
                }
                return data.response
            }

            throw new Error('Failed to respond to review')
        })
    }

    // Update response to review
    async function updateResponse(reviewId, content) {
        return handleFetch(async () => {
            const data = await $fetch(`/api/reviews/${reviewId}/respond`, {
                method: 'PUT',
                body: { content }
            })

            if (data?.response) {
                const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
                if (reviewIndex !== -1 && reviews.value[reviewIndex].responses?.length) {
                    reviews.value[reviewIndex].responses = [data.response]
                }
                return data.response
            }

            throw new Error('Failed to update response')
        })
    }

    // Delete response to review
    async function deleteResponse(reviewId) {
        return handleFetch(async () => {
            await $fetch(`/api/reviews/${reviewId}/respond`, {
                method: 'DELETE'
            })

            const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
            if (reviewIndex !== -1) {
                reviews.value[reviewIndex].responses = []
            }

            return true
        })
    }

    return {
        reviews,
        loading,
        error,
        userReview,
        canWriteReview,
        fetchReviews,
        createReview,
        updateReview,
        deleteReview,
        getVoteCount,
        toggleHelpfulVote,
        reportReview,
        respondToReview,
        updateResponse,
        deleteResponse
    }
}