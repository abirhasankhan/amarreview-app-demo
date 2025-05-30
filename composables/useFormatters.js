// ~/composables/useFormatters.js

import { ref } from 'vue'

export const useFormatters = () => {
    /**
     * Format a date string to a readable format
     * @param {string} dateString - The date string to format
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'Not available'

        const date = new Date(dateString)
        if (isNaN(date)) return 'Invalid date'

        // Format as "Month Day, Year"
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date)
    }

    /**
     * Format gender values to be more readable
     * @param {string} gender - The gender value to format
     * @returns {string} Formatted gender string
     */
    const formatGender = (gender) => {
        if (!gender) return 'Not specified'

        const genderMap = {
            'male': 'Male',
            'female': 'Female',
            'non-binary': 'Non-binary',
            'prefer_not_to_say': 'Prefer not to say'
        }

        return genderMap[gender] || gender
    }

    /**
     * Format social media platform names
     * @param {string} platform - The platform name to format
     * @returns {string} Formatted platform name
     */
    const formatPlatformName = (platform) => {
        if (!platform) return ''

        const platformMap = {
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            'website': 'Website',
            'youtube': 'YouTube',
            'discord': 'Discord',
            'twitter': 'Twitter',
            'github': 'GitHub',
            'linkedin': 'LinkedIn'
        }

        return platformMap[platform] || platform.charAt(0).toUpperCase() + platform.slice(1)
    }

    return {
        formatDate,
        formatGender,
        formatPlatformName
    }
}