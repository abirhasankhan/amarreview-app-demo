<!-- NotificationProvider.vue -->
<template>
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :duration="notification.duration"
        :auto-close="notification.autoClose"
        @close="closeNotification(notification.id)"
      />
    </div>
  </template>
  
  <script setup>
  import { useNotification } from '~/composables/useNotification';
  import Notification from '~/components/Notification.vue';
  
  const { notifications, closeNotification } = useNotification();
  </script>