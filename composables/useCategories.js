import { ref } from "vue";

export const useCategories = () => {
	const categories = ref([]);
	const category = ref(null);
	const loading = ref(false);
	const error = ref(null);

	// Fetch all categories
	const fetchCategories = async () => {
		loading.value = true;
		error.value = null;
		try {
			categories.value = await $fetch("/api/categories");
		} catch (err) {
			error.value = err.data?.message || "Failed to fetch categories";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Fetch single category by slug (with businesses)
	const fetchCategoryBySlug = async (slug) => {
		loading.value = true;
		error.value = null;
		try {
			const response = await $fetch(`/api/categories/slug/${slug}`, {
				onResponseError({ response }) {
					console.error('API Error Response:', {
						status: response.status,
						data: response._data
					})
				}
			})
			category.value = response
			return response
		} catch (err) {
			error.value = err.data?.message || `Error loading "${slug}" category`
			console.error('Fetch Error Details:', {
				url: err.url,
				status: err.statusCode,
				message: err.data?.message,
				error: err.data
			})
			throw err
		} finally {
			loading.value = false
		}
	}

	// Fetch single category by id
	const fetchCategoryById = async (id) => {
		loading.value = true;
		error.value = null;
		try {
			category.value = await $fetch(`/api/categories/${id}`);
		} catch (err) {
			error.value = err.data?.message || "Category not found";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Create new category
	const createCategory = async (categoryData) => {
		loading.value = true;
		error.value = null;
		try {
			const newCategory = await $fetch("/api/categories", {
				method: "POST",
				body: categoryData
			});
			categories.value = [newCategory, ...categories.value];
			return newCategory;
		} catch (err) {
			error.value = err.data?.message || "Failed to create category";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Update existing category
	const updateCategory = async (id, updates) => {
		loading.value = true;
		error.value = null;
		try {
			const updatedCategory = await $fetch(`/api/categories/${id}`, {
				method: "PUT",
				body: updates
			});
			categories.value = categories.value.map(c =>
				c.id === updatedCategory.id ? updatedCategory : c
			);
			if (category.value?.id === updatedCategory.id) {
				category.value = updatedCategory;
			}
			return updatedCategory;
		} catch (err) {
			error.value = err.data?.message || "Failed to update category";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Delete category
	const deleteCategory = async (id) => {
		loading.value = true;
		error.value = null;
		try {
			await $fetch(`/api/categories/${id}`, {
				method: "DELETE"
			});
			categories.value = categories.value.filter(c => c.id !== id);
			if (category.value?.id === id) {
				category.value = null;
			}
		} catch (err) {
			error.value = err.data?.message || "Failed to delete category";
			throw err;
		} finally {
			loading.value = false;
		}
	};


	return {
		categories,
		category,
		loading,
		error,
		fetchCategories,
		fetchCategoryBySlug,
		fetchCategoryById,
		createCategory,
		updateCategory,
		deleteCategory,
	};
};