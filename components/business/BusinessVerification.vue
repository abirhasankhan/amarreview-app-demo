<template>
  <div>
    <h2 class="text-lg font-medium mb-4">Business Verification</h2>

    <div v-if="status === 'unverified'" class="space-y-4">
      <p class="text-gray-600">
        Verify your business to get a "Verified Business" badge and build trust
        with customers.
      </p>

      <form @submit.prevent="submitVerification" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Business Registration Number
          </label>
          <input
            v-model="form.registrationNumber"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">
            Registration Document
          </label>
          <input
            ref="fileInput"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            @change="handleFileChange"
            class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
          />
          <p class="mt-1 text-sm text-gray-500">
            Upload a business registration certificate or license
          </p>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
        >
          {{ isSubmitting ? "Submitting..." : "Submit for Verification" }}
        </button>
      </form>
    </div>

    <div v-else-if="status === 'pending'" class="bg-yellow-50 p-4 rounded-md">
      <p class="text-yellow-800">
        Your verification request is under review. We'll notify you once it's
        processed.
      </p>
    </div>

    <div v-else class="bg-green-50 p-4 rounded-md">
      <div class="flex items-center">
        <svg
          class="h-5 w-5 text-green-400 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <p class="text-green-800">
          Your business is verified! The verification badge is now displayed on
          your profile.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const status = ref("unverified");
const isSubmitting = ref(false);
const fileInput = ref(null);

const form = ref({
  registrationNumber: "",
  document: null,
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.document = file;
  }
};

const submitVerification = async () => {
  try {
    isSubmitting.value = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    status.value = "pending";
    form.value = { registrationNumber: "", document: null };
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  } catch (error) {
    console.error("Error submitting verification:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
