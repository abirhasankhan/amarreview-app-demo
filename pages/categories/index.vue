<template>
	<div class="max-w-7xl mx-auto px-4">
		<!-- Error Message -->
		<div v-if="error" class="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
			{{ error }}
		</div>

		<header class="mb-12 text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">
				Business Categories
			</h1>
			<p class="text-xl text-gray-600">
				Find trusted businesses by category
			</p>
		</header>

		<LoadingState v-if="loading" size="lg" text="Loading categories..." />

		<!-- Category Grid -->
		<div v-if="!loading && categories.length" class="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			<NuxtLink v-for="category in categories" :key="category.id" :to="`/categories/${category.slug}`"
				class="group block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
				:aria-label="`View ${category.name} businesses`">
				<div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full">
					<div class="relative aspect-video">
						<img :src="category.image || '/placeholder-category.jpg'"
							:alt="`${category.name} category image`" class="w-full h-full object-cover"
							loading="lazy" />
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
						<div class="absolute bottom-4 left-4 right-4">
							<h2 class="text-2xl font-bold text-white mb-1">
								{{ category.name }}
							</h2>
							<p class="text-white/90 text-sm">
								{{ category.businessCount }} businesses
							</p>
						</div>
					</div>
					<div class="p-6">
						<p class="text-gray-600 mb-4 line-clamp-3">
							{{ category.description || 'No description available' }}
						</p>
					</div>
				</div>
			</NuxtLink>
		</div>

		<!-- Empty State -->
		<div v-if="!loading && !categories.length" class="text-center py-12">
			<p class="text-gray-500">No categories found</p>
		</div>

		<!-- Featured Categories -->
		<section v-if="!loading" class="mt-16">
			<h2 class="text-2xl font-semibold mb-8">Featured Categories</h2>
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div v-for="category in featuredCategories" :key="category.id"
					class="bg-emerald-50 p-4 rounded-lg text-center hover:bg-emerald-100 transition-colors h-full">
					<NuxtLink :to="`/categories/${category.slug}`"
						class="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg">
						<span class="text-4xl mb-2 block">{{ category.icon || '📁' }}</span>
						<h3 class="font-medium text-gray-900">
							{{ category.name }}
						</h3>
						<p class="text-sm text-gray-600">
							{{ category.businessCount }} businesses
						</p>
					</NuxtLink>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
import { useCategories } from "@/composables/useCategories";
import LoadingState from "@/components/LoadingState.vue";

const {
	categories,
	category,
	loading,
	error,
	fetchCategories
} = useCategories();

onMounted(() => {
	fetchCategories();
});


const featuredCategories = computed(() => {
	const base = [
		{
			name: "Restaurants",
			slug: "restaurants",
			icon: "🍽️"
		},
		{
			name: "Healthcare",
			slug: "healthcare",
			icon: "⚕️"
		},
		{
			name: "Home Services",
			slug: "home-services",
			icon: "🏠"
		},
		{
			name: "Retail",
			slug: "retail",
			icon: "🛍️"
		}
	];

	return base.map((item) => {
		const match = categories.value.find(c => c.slug === item.slug);
		return {
			...item,
			id: match?.id ?? null,
			businessCount: match?.businessCount ?? 0
		};
	});
});

useHead({
	title: "Business Categories - AmarReview",
	meta: [
		{
			name: "description",
			content:
				"Browse businesses by category. Find and review local businesses in your area.",
		},
	],
});
</script>
