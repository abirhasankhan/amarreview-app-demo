<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-lg font-semibold">Business Hours</h2>
      <button
        v-if="isEditing"
        @click="saveHours"
        class="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
      >
        Save Changes
      </button>
      <button
        v-else
        @click="isEditing = true"
        class="text-emerald-600 hover:text-emerald-700"
      >
        Edit Hours
      </button>
    </div>

    <div class="space-y-4">
      <div
        v-for="day in daysOfWeek"
        :key="day"
        class="flex items-center justify-between"
      >
        <span class="font-medium w-32">{{ day }}</span>
        <div v-if="isEditing" class="flex items-center space-x-4">
          <select
            v-model="hours[day].open"
            class="px-3 py-1 border border-gray-300 rounded-md"
          >
            <option value="">Closed</option>
            <option
              v-for="time in timeSlots"
              :key="time"
              :value="time"
            >
              {{ time }}
            </option>
          </select>
          <span v-if="hours[day].open">to</span>
          <select
            v-if="hours[day].open"
            v-model="hours[day].close"
            class="px-3 py-1 border border-gray-300 rounded-md"
          >
            <option
              v-for="time in timeSlots"
              :key="time"
              :value="time"
            >
              {{ time }}
            </option>
          </select>
          <label class="flex items-center">
            <input
              type="checkbox"
              v-model="hours[day].closed"
              class="mr-2"
              @change="handleClosedChange(day)"
            />
            Closed
          </label>
        </div>
        <div v-else class="text-gray-600">
          {{ formatHours(hours[day]) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  initialHours: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update'])
const isEditing = ref(false)

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0')
      const formattedMinute = minute.toString().padStart(2, '0')
      slots.push(`${formattedHour}:${formattedMinute}`)
    }
  }
  return slots
})

const hours = ref(
  daysOfWeek.reduce((acc, day) => {
    acc[day] = props.initialHours[day] || {
      open: '09:00',
      close: '17:00',
      closed: false
    }
    return acc
  }, {})
)

const handleClosedChange = (day) => {
  if (hours.value[day].closed) {
    hours.value[day].open = ''
    hours.value[day].close = ''
  } else {
    hours.value[day].open = '09:00'
    hours.value[day].close = '17:00'
  }
}

const formatHours = (dayHours) => {
  if (dayHours.closed) return 'Closed'
  if (!dayHours.open || !dayHours.close) return 'Closed'
  
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const formattedHour = hour % 12 || 12
    return `${formattedHour}:${minutes} ${ampm}`
  }
  
  return `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
}

const saveHours = () => {
  emit('update', hours.value)
  isEditing.value = false
}
</script>