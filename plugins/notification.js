// plugins/notification.js
import { useNotification } from '~/composables/useNotification'

export default defineNuxtPlugin(nuxtApp => {
    const notification = useNotification()

    return {
        provide: {
            notification
        }
    }
})