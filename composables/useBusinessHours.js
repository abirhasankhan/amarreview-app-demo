export const useBusinessHours = () => {
    const supabase = useSupabaseClient()

    const getBusinessHours = async (businessId) => {
        try {
            const data = await $fetch(`/api/business-hours/${businessId}`)
            return Array.isArray(data?.data) ? data.data : []
        } catch (error) {
            console.error('Error fetching business hours:', error)
            return []
        }
    }

    const createBusinessHours = async (payload) => {
        try {
            return await $fetch('/api/business-hours', {
                method: 'POST',
                body: payload
            })
        } catch (error) {
            console.error('Error creating business hours:', error)
            throw new Error(error.data?.message || 'Failed to create hours')
        }
    }

    const updateBusinessHours = async (id, payload) => {
        try {
            return await $fetch(`/api/business-hours/${id}`, {
                method: 'PUT',
                body: payload
            })
        } catch (error) {
            console.error('Error updating business hours:', error)
            throw new Error(error.data?.message || 'Failed to update hours')
        }
    }

    const deleteBusinessHours = async (id) => {
        try {
            return await $fetch(`/api/business-hours/${id}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Error deleting business hours:', error)
            throw new Error(error.data?.message || 'Failed to delete hours')
        }
    }

    return {
        getBusinessHours,
        createBusinessHours,
        updateBusinessHours,
        deleteBusinessHours
    }
  }