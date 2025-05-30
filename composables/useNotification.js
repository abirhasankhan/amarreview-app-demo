// composables/useNotification.js

import { ref, readonly } from 'vue'

// Central reactive state for all notifications
const notifications = ref([]) // Holds list of notifications
const notificationId = ref(0) // Unique ID counter

/**
 * Provides notification handling for the app
 */
export const useNotification = () => {

	/**
	 * Show a new notification
	 * @param {Object} options - Notification options
	 * @param {'success' | 'error' | 'info' | 'warning'} options.type - Type of notification
	 * @param {string} options.message - Message to display
	 * @param {string} [options.title] - Optional title
	 * @param {number} [options.duration=5000] - Duration in milliseconds
	 * @param {boolean} [options.autoClose=true] - Should it auto-close?
	 * @returns {number} id - ID of the created notification
	 */
	const showNotification = (options) => {
		const id = notificationId.value++

		const notification = {
			id,
			type: options.type || 'success',
			title: options.title || (options.type === 'error' ? 'Error' : 'Success'),
			message: options.message,
			duration: options.duration || 5000,
			autoClose: options.autoClose !== undefined ? options.autoClose : true,
			createdAt: new Date()
		}

		notifications.value.push(notification)

		console.log('Notification added:', notification)
		console.log('Current notifications:', notifications.value)

		return id
	}

	/**
	 * Close (remove) a notification by ID
	 * @param {number} id - ID of notification to remove
	 */
	const closeNotification = (id) => {
		const index = notifications.value.findIndex(n => n.id === id)
		if (index !== -1) {
			notifications.value.splice(index, 1)
			console.log('Notification removed, id:', id)
		}
	}

	/**
	 * Show a success notification
	 * @param {string} message
	 * @param {string} [title]
	 * @param {number} [duration]
	 */
	const showSuccess = (message, title = 'Success', duration = 5000) => {
		return showNotification({
			type: 'success',
			title,
			message,
			duration
		})
	}

	/**
	 * Show an error notification
	 * @param {string} message
	 * @param {string} [title]
	 * @param {number} [duration]
	 */
	const showError = (message, title = 'Error', duration = 5000) => {
		return showNotification({
			type: 'error',
			title,
			message,
			duration
		})
	}

	/**
	 * Show an info notification
	 * @param {string} message
	 * @param {string} [title]
	 * @param {number} [duration]
	 */
	const showInfo = (message, title = 'Info', duration = 5000) => {
		return showNotification({
			type: 'info',
			title,
			message,
			duration
		})
	}

	/**
	 * Show a warning notification
	 * @param {string} message
	 * @param {string} [title]
	 * @param {number} [duration]
	 */
	const showWarning = (message, title = 'Warning', duration = 5000) => {
		return showNotification({
			type: 'warning',
			title,
			message,
			duration
		})
	}

	return {
		notifications: readonly(notifications),
		showNotification,
		closeNotification,
		showSuccess,
		showError,
		showInfo,
		showWarning
	}
}
