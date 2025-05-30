// composables/useProfile.js
import { ref, readonly } from 'vue'

export const useProfile = () => {
    const profile = ref(null)
    const isLoading = ref(false)
    const error = ref(null)

    /**
     * Fetch the current user's profile
     */
    const fetchProfile = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/profiles')
            profile.value = response
            return response
        } catch (err) {
            error.value = err.message || 'Failed to fetch profile'
            console.error('Error fetching profile:', err)
            return null
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Update the current user's profile
     * @param {Object} profileData - The profile data to update
     */
    const updateProfile = async (profileData) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/profiles/update', {
                method: 'POST',
                body: profileData
            })

            profile.value = response.profile
            return response
        } catch (err) {
            error.value = err.message || 'Failed to update profile'
            console.error('Error updating profile:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Upload a new avatar
     * @param {File} file - The avatar file to upload
     */
    const uploadAvatar = async (file) => {
        if (!file) return

        isLoading.value = true
        error.value = null

        try {
            const formData = new FormData()
            formData.append('avatar', file)

            const response = await $fetch('/api/profiles/avatar', {
                method: 'POST',
                body: formData
            })

            if (profile.value) {
                profile.value.avatar_url = response.avatar_url
            }

            return response
        } catch (err) {
            error.value = err.message || 'Failed to upload avatar'
            console.error('Error uploading avatar:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Delete the current user's account
     */
    const deleteAccount = async () => {
        isLoading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/profiles/delete', {
                method: 'DELETE'
            })

            profile.value = null
            return response
        } catch (err) {
            error.value = err.message || 'Failed to delete account'
            console.error('Error deleting account:', err)
            throw err
        } finally {
            isLoading.value = false
        }
    }

    /**
     * Check if a username is available
     * @param {string} username - The username to check
     */
    const checkUsernameAvailability = async (username) => {
        try {
            const response = await $fetch(`/api/profiles/username/${username}`)
            return response
        } catch (err) {
            console.error('Error checking username:', err)
            throw err
        }
    }

    return {
        profile: readonly(profile),
        isLoading: readonly(isLoading),
        error: readonly(error),
        fetchProfile,
        updateProfile,
        uploadAvatar,
        deleteAccount,
        checkUsernameAvailability
    }
}

export default useProfile