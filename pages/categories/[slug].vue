<template>
	<div class="max-w-7xl mx-auto">


		<!-- Error Message -->
		<div v-if="error" class="p-8 text-center">
			<p class="text-red-500 text-xl">{{ error }}</p>
			<NuxtLink to="/categories" class="text-emerald-600 hover:underline mt-4 inline-block">
				Back to Categories
			</NuxtLink>
		</div>

		<!-- Loading State -->
		<LoadingState v-if="loading" size="lg" :text="`Loading ${category?.name || 'category'}...`" />


		<div v-else-if="category">
			<header class="mb-8">
				<div class="relative h-64 mb-8">
					<img :src="category.image || '/images/default-category.jpg'" :alt="category.name"
						class="w-full h-full object-cover rounded-lg" />
					<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
					<div class="absolute bottom-6 left-6 right-6">
						<h1 class="text-4xl font-bold text-white mb-2">
							{{ category.name }}
						</h1>
						<p class="text-white/90 text-lg">
							{{ category.description }}
						</p>
					</div>
				</div>

				<div class="flex flex-wrap gap-4 items-center justify-between">
					<p class="text-gray-600">
						{{ filteredBusinesses.length }} businesses found
					</p>

					<div class="flex flex-wrap gap-4">
						<div class="relative">
							<input v-model="filters.search" type="text" placeholder="Search in this category..."
								class="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
							<span class="absolute left-3 top-2.5 text-gray-400">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
									stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
									<path stroke-linecap="round" stroke-linejoin="round"
										d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
								</svg>
							</span>
						</div>

						<select v-model="filters.sort"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
							<option value="rating">Sort by Rating</option>
							<option value="review_count">
								Sort by Review Count
							</option>
							<option value="name">Sort by Name</option>
							<option value="newest">Sort by Newest</option>
						</select>

						<select v-model="filters.status"
							class="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
							<option value="">All Businesses</option>
							<option value="active">Active Only</option>
							<option value="verified">Verified Only</option>
						</select>
					</div>
				</div>
			</header>

			<div v-if="filteredBusinesses.length === 0" class="p-8 text-center bg-gray-50 rounded-lg">
				<p class="text-lg text-gray-600">
					No businesses found in this category.
				</p>
				<p class="mt-2 text-gray-500">
					Try adjusting your search filters or check back later.
				</p>
			</div>

			<div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div v-for="business in paginatedBusinesses" :key="business.id"
					class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
					<NuxtLink :to="`/businesses/${business.slug}`">
						<img :src="
								business.image || '/images/default-business.jpg'
							" :alt="business.name" class="w-full h-48 object-cover rounded-t-lg" />
						<div class="p-6">
							<div class="flex items-center justify-between mb-2">
								<h2 class="text-xl font-semibold">
									{{ business.name }}
								</h2>
								<span v-if="business.verified"
									class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
									Verified
								</span>
							</div>
							<p class="text-gray-600 mb-4 line-clamp-2">
								{{ business.description }}
							</p>
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<div class="flex">
										<span v-for="i in 5" :key="i">
											<span :class="
													i <=
													(business.avg_rating || 0)
														? 'text-yellow-400'
														: 'text-gray-300'
												">
												★
											</span>
										</span>
									</div>
									<span class="ml-2 text-sm text-gray-600">
										({{
										business.review_count || 0
										}}
										reviews)
									</span>
								</div>
								<span class="text-sm text-gray-500">{{
									business.city
									}}</span>
							</div>
						</div>
					</NuxtLink>
				</div>
			</div>

			<!-- Pagination -->
			<div class="mt-8 flex justify-center" v-if="totalPages > 1">
				<nav class="flex items-center gap-2">
					<button @click="currentPage--" :disabled="currentPage === 1"
						class="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
						aria-label="Previous page">
						Previous
					</button>
					<div class="flex gap-1">
						<button v-for="page in displayedPageNumbers" :key="page" @click="currentPage = page" :class="[
								'px-3 py-1 rounded border',
								currentPage === page
									? 'bg-emerald-600 text-white'
									: 'hover:bg-gray-100',
							]" :aria-label="`Page ${page}`" :aria-current="
								currentPage === page ? 'page' : undefined
							">
							{{ page }}
						</button>
					</div>
					<button @click="currentPage++" :disabled="currentPage === totalPages"
						class="px-3 py-1 rounded border enabled:hover:bg-gray-100 disabled:opacity-50"
						aria-label="Next page">
						Next
					</button>
				</nav>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { useCategories } from "@/composables/useCategories";
import LoadingState from "@/components/LoadingState.vue";

const route = useRoute();
const { category, fetchCategoryBySlug, loading, error } = useCategories();

// Filters and pagination
const filters = ref({
	search: "",
	sort: "rating",
	status: "",
});
const currentPage = ref(1);
const itemsPerPage = 9;

// Filtered businesses
const filteredBusinesses = computed(() => {
	if (!category.value?.businesses) return [];

	let results = [...category.value.businesses];

	// Search filter
	if (filters.value.search) {
		const searchTerm = filters.value.search.toLowerCase();
		results = results.filter(
			(b) =>
				b.name.toLowerCase().includes(searchTerm) ||
				b.description?.toLowerCase().includes(searchTerm)
		);
	}

	// Status filter
	if (filters.value.status === "active") {
		results = results.filter((b) => b.status === "active");
	} else if (filters.value.status === "verified") {
		results = results.filter((b) => b.verified);
	}

	// Sorting
	switch (filters.value.sort) {
		case "rating":
			return results.sort((a, b) => b.avg_rating - a.avg_rating);
		case "review_count":
			return results.sort((a, b) => b.review_count - a.review_count);
		case "name":
			return results.sort((a, b) => a.name.localeCompare(b.name));
		case "newest":
			return results.sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			);
		default:
			return results;
	}
});

// Pagination
const totalPages = computed(() =>
	Math.ceil(filteredBusinesses.value.length / itemsPerPage)
);
const paginatedBusinesses = computed(() => {
	const start = (currentPage.value - 1) * itemsPerPage;
	return filteredBusinesses.value.slice(start, start + itemsPerPage);
});

// Watch for route changes
watch(
	() => route.params.slug,
	(newSlug) => {
		if (newSlug) fetchCategoryBySlug(newSlug);
	}
);

// Initial fetch
onMounted(() => {
	fetchCategoryBySlug(route.params.slug);
});

// SEO
const updateSEO = () => {
	if (category.value) {
		useHead({
			title: `${category.value.name} - AmarReview`,
			meta: [
				{
					name: "description",
					content:
						category.value.description ||
						`Browse businesses in the ${category.value.name} category`,
				},
			],
		});
	}
};

watch(category, updateSEO, { immediate: true });
</script>
