<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Claim Your Business</h1>

    <div
      v-if="!user"
      class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8"
    >
      <p class="text-yellow-800">
        Please
        <NuxtLink to="/auth/login" class="text-yellow-900 underline"
          >sign in</NuxtLink
        >
        or
        <NuxtLink to="/auth/register" class="text-yellow-900 underline"
          >create an account</NuxtLink
        >
        to claim your business.
      </p>
    </div>

    <div v-else-if="loading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"
      ></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>

    <div v-else-if="existingClaim" class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-xl font-semibold mb-4">Claim Status</h2>
      <div
        :class="{
          'bg-yellow-50 text-yellow-800': existingClaim.status === 'pending',
          'bg-green-50 text-green-800': existingClaim.status === 'approved',
          'bg-red-50 text-red-800': existingClaim.status === 'rejected',
        }"
        class="p-4 rounded-md"
      >
        <p v-if="existingClaim.status === 'pending'">
          Your claim is currently under review. We'll notify you once it's
          processed.
        </p>
        <p v-else-if="existingClaim.status === 'approved'">
          Your claim has been approved! You can now manage your business
          profile.
        </p>
        <p v-else>
          Your claim was rejected. Reason: {{ existingClaim.rejection_reason }}
          <button
            @click="existingClaim = null"
            class="block mt-4 text-sm underline"
          >
            Submit a new claim
          </button>
        </p>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Business Search -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Find Your Business</label
        >
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by business name..."
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            @input="searchBusinesses"
          />

          <!-- Search Results -->
          <div
            v-if="searchResults.length > 0"
            class="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200"
          >
            <ul class="max-h-60 overflow-auto">
              <li
                v-for="business in searchResults"
                :key="business.id"
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer"
                @click="selectBusiness(business)"
              >
                <div class="font-medium">{{ business.name }}</div>
                <div class="text-sm text-gray-500">{{ business.address }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Selected Business Info -->
      <div v-if="selectedBusiness" class="bg-gray-50 p-4 rounded-md">
        <h3 class="font-medium mb-2">Selected Business</h3>
        <p>{{ selectedBusiness.name }}</p>
        <p class="text-sm text-gray-600">{{ selectedBusiness.address }}</p>
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
      <div v-if="!selectedBusiness">
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Business Name</label
          >
          <input
            v-model="form.businessName"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Business Address</label
          >
          <input
            v-model="form.address"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Business Phone</label
          >
          <input
            v-model="form.phone"
            type="tel"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Business Website</label
          >
          <input
            v-model="form.website"
            type="url"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700"
          >Your Role at the Business</label
        >
        <select
          v-model="form.role"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">Select your role</option>
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <!-- Verification Method Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Verification Method</label
        >
        <div class="space-y-4">
          <label class="flex items-center">
            <input
              type="radio"
              v-model="verificationMethod"
              value="facebook"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <span class="ml-2">Verify through Facebook</span>
          </label>
          <label class="flex items-center">
            <input
              type="radio"
              v-model="verificationMethod"
              value="document"
              class="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
            />
            <span class="ml-2">Upload verification document</span>
          </label>
        </div>
      </div>

      <!-- Facebook Verification -->
      <div v-if="verificationMethod === 'facebook'" class="space-y-4">
        <div class="bg-blue-50 p-4 rounded-md">
          <h4 class="font-medium text-blue-800 mb-2">
            Facebook Verification Steps:
          </h4>
          <ol class="list-decimal list-inside text-blue-700 space-y-2">
            <li>Go to your business Facebook page</li>
            <li>Create a public post with the text "We are on AmarReview"</li>
            <li>Copy the post URL and paste it below</li>
          </ol>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Facebook Post URL</label
          >
          <input
            v-model="form.facebookPostUrl"
            type="url"
            placeholder="https://facebook.com/..."
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <!-- Document Upload -->
      <div v-if="verificationMethod === 'document'">
        <label class="block text-sm font-medium text-gray-700">
          Verification Document
        </label>
        <div class="mt-1">
          <input
            id="verification"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileChange"
            required
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p class="mt-1 text-sm text-gray-500">
            Upload a business license, utility bill, or other document proving
            your association with the business
          </p>
        </div>
      </div>

      <div v-if="error" class="text-red-600 text-sm">
        {{ error }}
      </div>

      <button
        type="submit"
        :disabled="isSubmitting || !verificationMethod"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
      >
        {{ isSubmitting ? "Submitting..." : "Submit Claim" }}
      </button>
    </form>

    <div
      v-if="submitted"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-2xl font-semibold mb-4">Claim Submitted!</h2>
        <p class="text-gray-600 mb-6">
          Thank you for submitting your business claim. Our team will review
          your submission and contact you within 2-3 business days.
        </p>
        <button
          @click="handleClose"
          class="w-full py-2 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const client = useSupabaseClient();
const router = useRouter();

const loading = ref(true);
const error = ref(null);
const isSubmitting = ref(false);
const submitted = ref(false);
const existingClaim = ref(null);
const searchQuery = ref("");
const searchResults = ref([]);
const selectedBusiness = ref(null);
const verificationMethod = ref(null);

const form = ref({
  businessName: "",
  address: "",
  phone: "",
  website: "",
  role: "",
  verificationFile: null,
  facebookPostUrl: "",
});

// Search businesses
const searchBusinesses = useDebounceFn(async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = [];
    return;
  }

  try {
    const { data, error: searchError } = await client
      .from("businesses")
      .select("id, name, address")
      .ilike("name", `%${searchQuery.value}%`)
      .limit(5);

    if (searchError) throw searchError;
    searchResults.value = data;
  } catch (error) {
    console.error("Error searching businesses:", error);
  }
}, 300);

const selectBusiness = (business) => {
  selectedBusiness.value = business;
  searchQuery.value = business.name;
  searchResults.value = [];
};

// Check for existing claim
const checkExistingClaim = async () => {
  try {
    const { data, error: claimError } = await client
      .from("business_claims")
      .select("*")
      .eq("user_id", user.value?.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (claimError && claimError.code !== "PGRST116") throw claimError;
    existingClaim.value = data;
  } catch (error) {
    console.error("Error checking existing claim:", error);
  } finally {
    loading.value = false;
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      error.value = "File size must be less than 5MB";
      event.target.value = "";
      return;
    }
    form.value.verificationFile = file;
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    error.value = null;

    let businessId = selectedBusiness.value?.id;

    if (!businessId) {
      // Create new business if none selected
      const businessData = {
        name: form.value.businessName,
        address: form.value.address,
        phone: form.value.phone,
        website: form.value.website,
        status: "pending",
      };

      const { data: business, error: businessError } = await client
        .from("businesses")
        .insert(businessData)
        .select()
        .single();

      if (businessError) throw businessError;
      businessId = business.id;
    }

    let verificationDocument = null;
    let facebookPostUrl = null;

    if (
      verificationMethod.value === "document" &&
      form.value.verificationFile
    ) {
      // Upload verification document
      const fileExt = form.value.verificationFile.name.split(".").pop();
      const fileName = `${user.value.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from("verification-docs")
        .upload(fileName, form.value.verificationFile);

      if (uploadError) throw uploadError;
      verificationDocument = fileName;
    } else if (verificationMethod.value === "facebook") {
      facebookPostUrl = form.value.facebookPostUrl;
    }

    // Create business claim
    const { error: claimError } = await client.from("business_claims").insert({
      business_id: businessId,
      user_id: user.value.id,
      status: "pending",
      verification_method: verificationMethod.value,
      verification_document: verificationDocument,
      facebook_post_url: facebookPostUrl,
    });

    if (claimError) throw claimError;

    submitted.value = true;
  } catch (e) {
    error.value = e.message;
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  submitted.value = false;
  router.push("/");
};

// Check for existing claim on mount
onMounted(async () => {
  if (user.value) {
    await checkExistingClaim();
  } else {
    loading.value = false;
  }
});

// Watch for user changes
watch(
  () => user.value,
  async (newUser) => {
    if (newUser) {
      await checkExistingClaim();
    }
  }
);
</script>
