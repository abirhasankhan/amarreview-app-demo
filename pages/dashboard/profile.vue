<template>
    <!-- Error State -->
    <div v-if="error" class="max-w-3xl mx-auto p-8 text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
            <Icon name="heroicons-outline:exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <p class="text-red-600 text-lg font-medium">{{ error }}</p>
        <NuxtLink to="/dashboard" class="btn-secondary">
            <Icon name="heroicons-outline:arrow-left" class="w-5 h-5" />
            Back to Dashboard
        </NuxtLink>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="isLoading" size="xl" :text="`Loading ${profile?.full_name || 'profile'}...`" />

    <!-- Main Content -->
    <div v-if="profile" class="max-w-7xl mx-auto p-4 lg:p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- Left Column - Profile Overview -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Profile Card -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

                    <div class="flex items-center justify-between">
                        <NuxtLink to="/dashboard" class="btn-secondary">
                            <Icon name="heroicons-outline:arrow-left" class="w-5 h-5" />
                            Back to Dashboard
                        </NuxtLink>
                    </div>

                    <div class="flex flex-col items-center text-center space-y-4">


                        <div class="relative group">
                            <img :src="profile.avatar_url"
                                class="w-32 h-32 rounded-full object-cover border-4 border-emerald-50 shadow-sm"
                                alt="Profile picture" />
                            <input type="file" ref="avatarInput" class="hidden" accept="image/*"
                                @change="handleAvatarUpload" />
                            <button @click="$refs.avatarInput.click()"
                                class="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-transform hover:scale-105">
                                <Icon name="heroicons-outline:camera" class="w-6 h-6 text-gray-600" />
                            </button>
                        </div>

                        <div class="space-y-2">
                            <h2 class="text-2xl font-bold text-gray-900">{{ profile.full_name }}</h2>
                            <p class="text-gray-600">@{{ profile.username }}</p>
                            <div class="flex items-center justify-center space-x-2">
                                <span v-if="profile.status" class="badge-success">
                                    {{ profile.status }}
                                </span>
                                <span v-if="profile.role" class="badge-info">
                                    {{ profile.role }}
                                </span>
                            </div>
                        </div>

                        <div class="w-full pt-4 space-y-3">
                            <ProfileInfoItem label="Member Since" :value="formatDate(profile.created_at)" />
                            <ProfileInfoItem label="Last Updated" :value="formatDate(profile.updated_at)" />
                            <ProfileInfoItem label="Email" :value="profile.email" />
                            <ProfileInfoItem label="Gender" :value="formatGender(profile.gender)" />
                        </div>
                    </div>
                </div>

                <!-- Social Connections Card -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Social Connections</h3>
                        <button @click="editSections.socials = !editSections.socials" class="btn-edit-sm">
                            {{ editSections.socials ? 'Save' : 'Edit' }}
                        </button>
                    </div>

                    <div v-if="!editSections.socials" class="flex flex-wrap gap-3">
                        <a v-for="(social, index) in profile.socials" :key="index" :href="social.url" target="_blank"
                            class="social-link">
                            <span class="text-xl">{{ social.icon }}</span>
                            <span class="text-sm">{{ formatPlatformName(social.platform) }}</span>
                        </a>
                        <div v-if="!profile.socials?.length" class="text-gray-400 text-sm">
                            No social connections added
                        </div>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="(social, index) in editProfile.socials" :key="index"
                            class="flex items-center gap-2">
                            <select :value="social.platform" @change="updateSocialPlatform(index, $event.target.value)"
                                class="select-field flex-shrink-0 w-32">
                                <option v-for="platform in socialPlatforms" :key="platform.value"
                                    :value="platform.value">
                                    {{ platform.icon }} {{ platform.name }}
                                </option>
                            </select>
                            <input v-model="social.url" type="url" placeholder="Profile URL"
                                class="input-field flex-1" />
                            <button @click="removeSocial(index)" class="btn-icon-danger">
                                <Icon name="heroicons-outline:trash" class="w-4 h-4" />
                            </button>
                        </div>

                        <button @click="addSocial" class="btn-outline w-full">
                            <Icon name="heroicons-outline:plus" class="w-5 h-5" />
                            Add Connection
                        </button>

                        <div class="flex justify-end gap-2 pt-4">
                            <button @click="cancelEdit('socials')" class="btn-secondary">
                                Cancel
                            </button>
                            <button @click="saveSection('socials')" class="btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column - Settings -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Profile Information Card -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
                        <button @click="editSections.basicInfo = !editSections.basicInfo" class="btn-edit">
                            {{ editSections.basicInfo ? 'Save Changes' : 'Edit Profile' }}
                        </button>
                    </div>

                    <div v-if="!editSections.basicInfo" class="space-y-4">
                        <ProfileInfoItem label="Full Name" :value="profile.full_name" />
                        <ProfileInfoItem label="Bio" :value="profile.bio || 'Not provided'" />
                        <ProfileInfoItem label="Gender" :value="formatGender(profile.gender)" />
                    </div>

                    <div v-else class="space-y-4">
                        <div class="space-y-4">
                            <FormInput label="Full Name" v-model="editProfile.full_name" />
                            <FormTextarea label="Bio" v-model="editProfile.bio" placeholder="Tell your story..."
                                rows="3" />
                            <FormSelect label="Gender" v-model="editProfile.gender" :options="genderOptions" />
                        </div>

                        <div class="flex justify-end gap-2 pt-4">
                            <button @click="cancelEdit('basicInfo')" class="btn-secondary">
                                Cancel
                            </button>
                            <button @click="saveSection('basicInfo')" class="btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Account Settings Card -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Account Settings</h3>
                        <button @click="editSections.account = !editSections.account" class="btn-edit">
                            {{ editSections.account ? 'Save Changes' : 'Edit Settings' }}
                        </button>
                    </div>

                    <div v-if="!editSections.account" class="space-y-4">
                        <ProfileInfoItem label="Username" :value="'@' + profile.username" />
                        <ProfileInfoItem label="Email" :value="profile.email" />
                    </div>

                    <div v-else class="space-y-4">
                        <FormInput label="Username" v-model="editProfile.username" disabled
                            helper-text="Username cannot be changed" />
                        <FormInput label="Email Address" type="email" v-model="editProfile.email" />

                        <div class="flex justify-end gap-2 pt-4">
                            <button @click="cancelEdit('account')" class="btn-secondary">
                                Cancel
                            </button>
                            <button @click="saveSection('account')" class="btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Security Card -->
                <div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Security</h3>
                        <button @click="editSections.security = !editSections.security" class="btn-edit">
                            {{ editSections.security ? 'Save Changes' : 'Update Security' }}
                        </button>
                    </div>

                    <div v-if="!editSections.security" class="space-y-4">
                        <ProfileInfoItem label="Password" value="••••••••" helper-text="Last changed 2 weeks ago" />
                    </div>

                    <div v-else class="space-y-4">
                        <FormInput label="Current Password" type="password" v-model="securityData.currentPassword" />
                        <FormInput label="New Password" type="password" v-model="securityData.newPassword" />
                        <FormInput label="Confirm New Password" type="password"
                            v-model="securityData.confirmPassword" />

                        <div class="flex justify-end gap-2 pt-4">
                            <button @click="cancelEdit('security')" class="btn-secondary">
                                Cancel
                            </button>
                            <button @click="saveSection('security')" class="btn-primary">
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Danger Zone Card -->
                <div class="rounded-xl shadow-sm p-6 border border-red-200 bg-red-50">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-red-700">
                            <Icon name="heroicons-outline:exclamation-triangle" class="w-5 h-5 inline-block mr-2" />
                            Danger Zone
                        </h3>
                    </div>

                    <div class="space-y-4">
                        <div class="p-4 bg-white rounded-lg border border-red-100">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium text-red-700">Delete Account</h4>
                                    <p class="text-sm text-red-600">Permanently remove your account and all data</p>
                                </div>
                                <button @click="showDeleteConfirmation = true" class="btn-danger">
                                    Delete Account
                                </button>
                            </div>
                        </div>

                        <div class="p-4 bg-white rounded-lg border border-orange-100">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h4 class="font-medium text-orange-700">Export Data</h4>
                                    <p class="text-sm text-orange-600">Download all your personal data</p>
                                </div>
                                <button @click="exportUserData" class="btn-warning">
                                    Export Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <ModalConfirmDelete v-if="showDeleteConfirmation" @close="showDeleteConfirmation = false"
            @confirm="handleDeleteAccount" :is-loading="isLoading" />
    </div>
</template>

<script setup>
// Import Components

import LoadingState from '@/components/LoadingState.vue'
import ModalConfirmDelete from '@/components/ModalConfirmDelete.vue'
import ProfileInfoItem from '~/components/Profile/ProfileInfoItem.vue'
import FormInput from '~/components/Form/FormInput.vue'
import FormSelect from '~/components/Form/FormSelect.vue'
import FormTextarea from '~/components/Form/FormTextarea.vue'

// Import Compositions
import { useProfile } from '~/composables/useProfile'
import { useNotification } from '~/composables/useNotification'
import { useFormatters } from '~/composables/useFormatters'

const { formatDate, formatGender, formatPlatformName } = useFormatters()
const { showNotification } = useNotification()
const router = useRouter()

// Profile Data
const { profile, isLoading, error, fetchProfile, updateProfile, uploadAvatar, deleteAccount, changePassword } = useProfile()
const editProfile = ref({ socials: [] })
const originalProfile = ref({})

// Edit State Management
const editSections = ref({
    basicInfo: false,
    socials: false,
    account: false,
    security: false
})

// Security Data
const securityData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// Social Platforms
const socialPlatforms = ref([
    { name: 'Facebook', icon: '📘', value: 'facebook' },
    { name: 'Instagram', icon: '📸', value: 'instagram' },
    { name: 'Website', icon: '🌐', value: 'website' },
    { name: 'YouTube', icon: '▶️', value: 'youtube' },
    { name: 'Discord', icon: '🎮', value: 'discord' },
    { name: 'Twitter', icon: '🐦', value: 'twitter' },
    { name: 'GitHub', icon: '💻', value: 'github' },
    { name: 'LinkedIn', icon: '🔗', value: 'linkedin' },
])

// Gender Options
const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

// Lifecycle Hooks
onMounted(async () => {
    await fetchProfile()
    if (profile.value) {
        editProfile.value = { ...profile.value, socials: [...profile.value.socials || []] }
        originalProfile.value = JSON.parse(JSON.stringify(profile.value))
    }
})

// Section Handlers
const saveSection = async (section) => {
    try {
        if (section === 'security') {
            if (securityData.value.newPassword !== securityData.value.confirmPassword) {
                throw new Error('Passwords do not match')
            }
            await changePassword(securityData.value.currentPassword, securityData.value.newPassword)
            securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
            showNotification('success', 'Password updated successfully')
        } else {
            const updateData = {}
            switch (section) {
                case 'basicInfo':
                    updateData.full_name = editProfile.value.full_name
                    updateData.bio = editProfile.value.bio
                    updateData.gender = editProfile.value.gender
                    break
                case 'socials':
                    updateData.socials = editProfile.value.socials
                    break
                case 'account':
                    updateData.email = editProfile.value.email
                    break
            }
            await updateProfile(updateData)
            showNotification('success', 'Changes saved successfully')
        }
        editSections.value[section] = false
    } catch (error) {
        showNotification('error', error.message || 'Failed to save changes')
    }
}

const cancelEdit = (section) => {
    editProfile.value = JSON.parse(JSON.stringify(originalProfile.value))
    if (section === 'security') securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    editSections.value[section] = false
}

// Social Media Management
const addSocial = () => {
    editProfile.value.socials.push({
        platform: socialPlatforms.value[0].value,
        icon: socialPlatforms.value[0].icon,
        url: ''
    })
}

const removeSocial = (index) => {
    editProfile.value.socials.splice(index, 1)
}

const updateSocialPlatform = (index, platformValue) => {
    const platform = socialPlatforms.value.find(p => p.value === platformValue)
    if (platform) {
        editProfile.value.socials[index].platform = platform.value
        editProfile.value.socials[index].icon = platform.icon
    }
}

// Avatar Upload
const avatarInput = ref(null)
const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
        await uploadAvatar(file)
        showNotification('success', 'Avatar updated successfully')
    } catch (error) {
        showNotification('error', error.message || 'Failed to upload avatar')
    }
}

// Account Deletion
const showDeleteConfirmation = ref(false)
const handleDeleteAccount = async () => {
    try {
        await deleteAccount()
        showNotification('success', 'Account deleted successfully')
        router.push('/auth/login')
    } catch (error) {
        showNotification('error', error.message || 'Failed to delete account')
        showDeleteConfirmation.value = false
    }
}

// Data Export
const exportUserData = async () => {
    try {
        // Implementation would go here
        showNotification('info', 'Preparing your data export...')
    } catch (error) {
        showNotification('error', error.message || 'Failed to export data')
    }
}
</script>

<style scoped>
/* Custom Transitions */
.social-link {
    @apply flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200;
}

.btn-edit {
    @apply px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors;
}

.btn-primary {
    @apply px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2;
}

.btn-secondary {
    @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2;
}

.btn-danger {
    @apply px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors;
}

.input-field {
    @apply w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm;
}

.select-field {
    @apply px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white;
}

.badge-success {
    @apply px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full;
}

.badge-info {
    @apply px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full;
}
</style>