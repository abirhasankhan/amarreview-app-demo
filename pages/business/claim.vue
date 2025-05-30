<template>
	<div class="max-w-2xl mx-auto">


		<div class="flex items-center justify-between">
			<NuxtLink to="/business"
				class="btn-secondary items-center justify-between bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:bg-gray-50">
				<Icon name="heroicons-outline:arrow-left" class="w-5 h-5" />
				Back to Business profile
			</NuxtLink>
		</div>

		<h1 class="text-3xl font-bold mt-8 mb-8">
			Claim Your Business
		</h1>

		<div v-if="!user" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
			<p class="text-yellow-800">
				Please
				<NuxtLink to="/auth/login" class="text-yellow-900 underline">sign in</NuxtLink>
				or
				<NuxtLink to="/auth/register" class="text-yellow-900 underline">create an account</NuxtLink>
				to claim your business.
			</p>
		</div>

		<div v-else-if="loading" class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto">
			</div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>

		<form v-else @submit.prevent="handleSubmit" class="space-y-6">
			<!-- Business Search -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Find Your Business</label>
				<div class="relative">
					<input v-model="searchQuery" type="text" placeholder="Search by business name..."
						class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
						@input="searchBusinesses" />

					<!-- Search Results -->
					<div v-if="searchResults.length > 0"
						class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
						<ul class="max-h-60 overflow-auto">
							<li v-for="business in searchResults" :key="business.id"
								class="px-4 py-2 hover:bg-gray-50 cursor-pointer" @click="selectBusiness(business)">
								<div class="font-medium">
									{{ business.name }}
								</div>
								<div class="text-sm text-gray-500">
									{{ business.address }}
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- Selected Business Info -->
			<div v-if="selectedBusiness" class="bg-gray-50 p-4 rounded-md">
				<h3 class="font-medium mb-2">Selected Business</h3>
				<p>{{ selectedBusiness.name }}</p>
				<p class="text-sm text-gray-600">
					{{ selectedBusiness.address }}
				</p>
			</div>

			<!-- Or create new business -->
			<div v-if="!selectedBusiness" class="relative">
				<div class="absolute inset-0 flex items-center" aria-hidden="true">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center">
					<span class="px-2 bg-white text-sm text-gray-500">Or</span>
				</div>
			</div>

			<!-- New Business Form -->
			<div v-if="!selectedBusiness" class="space-y-4">
				<div>
					<label class="block text-sm font-medium text-gray-700">Business Name</label>
					<input v-model="form.businessName" type="text" required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Business Address</label>
					<input v-model="form.address" type="text" required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">City</label>
						<input v-model="form.city" type="text" required
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">State</label>
						<input v-model="form.state" type="text" required
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Postal Code</label>
						<input v-model="form.postalCode" type="text" required
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700">Country</label>
						<input v-model="form.country" type="text" required
							class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Business Phone</label>
					<input v-model="form.phone" type="tel" required
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Business Email</label>
					<input v-model="form.email" type="email"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Business Website</label>
					<input v-model="form.website" type="url"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500" />
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Category</label>
					<select v-model="form.categoryId"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
						<option value="">Select category</option>
						<option v-for="category in categories" :key="category.id" :value="category.id">
							{{ category.name }}
						</option>
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Business Description</label>
					<textarea v-model="form.description" rows="4"
						class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"></textarea>
				</div>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700">Your Role at the Business</label>
				<select v-model="form.role" required
					class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500">
					<option value="">Select your role</option>
					<option value="owner">Owner</option>
					<option value="manager">Manager</option>
					<option value="employee">Employee</option>
				</select>
			</div>

			<!-- Verification Method Selection -->
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Verification Method</label>
				<div class="space-y-4">
					<label class="flex items-center">
						<input type="radio" v-model="verificationMethod" value="document"
							class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300" />
						<span class="ml-2">Upload verification document</span>
					</label>
				</div>
			</div>

			<!-- Document Upload -->
			<div v-if="verificationMethod === 'document'">
				<label class="block text-sm font-medium text-gray-700">
					Verification Document
				</label>
				<div class="mt-1">
					<input id="verification" type="file" accept=".pdf,.jpg,.jpeg,.png" @change="handleFileChange"
						required
						class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
					<p class="mt-1 text-sm text-gray-500">
						Upload a business license, utility bill, or other
						document proving your association with the business
					</p>
				</div>
			</div>

			<div v-if="error" class="text-red-600 text-sm">
				{{ error }}
			</div>

			<button type="submit" :disabled="isSubmitting || !verificationMethod"
				class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50">
				{{ isSubmitting ? "Submitting..." : "Submit Claim" }}
			</button>
		</form>

		<div v-if="submitted" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div class="bg-white rounded-lg p-6 max-w-md w-full">
				<h2 class="text-2xl font-semibold mb-4">Claim Submitted!</h2>
				<p class="text-gray-600 mb-6">
					Thank you for submitting your business claim. Our team will
					review your submission and contact you within 2-3 business
					days.
				</p>
				<button @click="handleClose"
					class="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
					Close
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useCategories } from '~/composables/useCategories'
import { useBusinessClaim } from '~/composables/useBusinessClaim'

const {
	isSubmitting: isSubmittingClaim,
	error: businessClaimError,
	submitted: submittedClaim,
	handleSubmit: handleSubmitClaim,
	reset
} = useBusinessClaim()

const {
	categories,
	fetchCategories,
	loading: categoryLoading,
	error: categoryError
} = useCategories()

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const submitted = ref(false)
const existingClaim = ref(null)
const searchQuery = ref("")
const searchResults = ref([])
const selectedBusiness = ref(null)
const verificationMethod = ref(null)

const form = ref({
	businessName: "",
	address: "",
	city: "",
	state: "",
	postalCode: "",
	country: "",
	phone: "",
	email: "",
	website: "",
	description: "",
	categoryId: "",
	role: "",
	verificationFile: null,
})

onMounted(async () => {
	await fetchCategories()
	loading.value = false
})

// Search businesses
const searchBusinesses = useDebounceFn(async () => {
	if (!searchQuery.value || searchQuery.value.length < 2) {
		searchResults.value = []
		return
	}

	try {
		const { data, error: searchError } = await client
			.from("businesses")
			.select("id, name, address")
			.ilike("name", `%${searchQuery.value}%`)
			.limit(5)

		if (searchError) throw searchError
		searchResults.value = data
	} catch (error) {
		console.error("Error searching businesses:", error)
	}
}, 300)

const selectBusiness = (business) => {
	selectedBusiness.value = business
	searchQuery.value = business.name
	searchResults.value = []
}

const handleFileChange = (event) => {
	const file = event.target.files[0]
	if (file) {
		if (file.size > 5 * 1024 * 1024) {
			error.value = "File size must be less than 5MB"
			event.target.value = ""
			return
		}
		form.value.verificationFile = file
	}
}

// Generate a slug from business name
const generateSlug = (name) => {
	return name
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

// ✅ Validate required fields before submission
const validateForm = () => {
	const requiredFields = [
		{ key: "businessName", label: "Business Name" },
		{ key: "address", label: "Address" },
		{ key: "description", label: "Description" },
		{ key: "city", label: "City" },
		{ key: "state", label: "State" },
		{ key: "postalCode", label: "Postal Code" },
		{ key: "country", label: "Country" },
		{ key: "phone", label: "Phone" },
		{ key: "email", label: "Email" },
		{ key: "categoryId", label: "Category" },
		{ key: "role", label: "Role" },
	]

	for (const field of requiredFields) {
		if (!form.value[field.key]) {
			error.value = `${field.label} is required.`
			return false
		}
	}

	return true
}

const handleSubmit = async () => {
	try {
		error.value = null
		if (!validateForm()) return

		isSubmitting.value = true

		let businessId = selectedBusiness.value?.id

		// Create new business if needed
		if (!businessId) {
			const { id } = await $fetch("/api/businesses", {
				method: "POST",
				body: {
					name: form.value.businessName,
					description: form.value.description,
					address: form.value.address,
					city: form.value.city,
					state: form.value.state,
					postal_code: form.value.postalCode,
					country: form.value.country,
					phone: form.value.phone,
					email: form.value.email,
					website: form.value.website,
					category_id: form.value.categoryId,
				},
			})
			businessId = id
		}

		// Create business claim
		const formData = new FormData()
		formData.append("business_id", businessId.toString())
		formData.append("role", form.value.role)

		if (form.value.verificationFile) {
			formData.append("file", form.value.verificationFile)
		}

		await $fetch("/api/businesses/claims", {
			method: "POST",
			body: formData,
		})

		submitted.value = true
	} catch (e) {
		error.value = e.message || "An error occurred during submission."
	} finally {
		isSubmitting.value = false
	}
}

const handleClose = () => {
	submitted.value = false
	router.push("/")
}
</script>

