import { ref } from "vue";
import { useApi } from "./useApi"; // adjust path if needed

export const useCategories = () => {
	const { get, post, put, del } = useApi();

	const categories = ref([]);
	const category = ref(null);
	const loading = ref(false);
	const error = ref(null);

	const clearError = () => {
		error.value = null;
	};

	// Fetch all categories
	const fetchCategories = async () => {
		loading.value = true;
		clearError();
		try {
			categories.value = await get("/categories");
			return categories.value;
		} catch (err) {
			error.value = err?.message || "Failed to fetch categories";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Fetch single category by slug (with businesses)
	const fetchCategoryBySlug = async (slug) => {
		loading.value = true;
		clearError();
		try {
			const response = await get(`/categories/slug/${slug}`);
			category.value = response;
			return response;
		} catch (err) {
			error.value = err?.message || `Error loading "${slug}" category`;
			console.error('Fetch Error Details:', err);
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Fetch single category by id
	const fetchCategoryById = async (id) => {
		loading.value = true;
		clearError();
		try {
			category.value = await get(`/categories/${id}`);
			return category.value;
		} catch (err) {
			error.value = err?.message || "Category not found";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Create new category
	const createCategory = async (categoryData) => {
		loading.value = true;
		clearError();
		try {
			const newCategory = await post("/categories", categoryData);
			categories.value = [newCategory, ...categories.value];
			return newCategory;
		} catch (err) {
			error.value = err?.message || "Failed to create category";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Update existing category
	const updateCategory = async (id, updates) => {
		loading.value = true;
		clearError();
		try {
			const updatedCategory = await put(`/categories/${id}`, updates);
			categories.value = categories.value.map((c) =>
				c.id === updatedCategory.id ? updatedCategory : c
			);
			if (category.value?.id === updatedCategory.id) {
				category.value = updatedCategory;
			}
			return updatedCategory;
		} catch (err) {
			error.value = err?.message || "Failed to update category";
			throw err;
		} finally {
			loading.value = false;
		}
	};

	// Delete category
	const deleteCategory = async (id) => {
		loading.value = true;
		clearError();
		try {
			await del(`/categories/${id}`);
			categories.value = categories.value.filter((c) => c.id !== id);
			if (category.value?.id === id) {
				category.value = null;
			}
		} catch (err) {
			error.value = err?.message || "Failed to delete category";
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
