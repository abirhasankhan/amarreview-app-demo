import { defineStore } from "pinia";

export const useBusinessStore = defineStore("business", () => {
  const client = useSupabaseClient();
  const business = ref(null);
  const loading = ref(false);
  const error = ref(null);

  async function fetchBusiness(businessId) {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: fetchError } = await client
        .from("businesses")
        .select(
          `
          *,
          category:categories(*),
          reviews(
            id,
            rating,
            content,
            created_at,
            user:profiles(id, full_name, avatar_url)
          ),
          business_hours(*)
        `
        )
        .eq("id", businessId)
        .single();

      if (fetchError) throw fetchError;
      business.value = data;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching business:", err);
    } finally {
      loading.value = false;
    }
  }

  async function updateBusiness(businessId, data) {
    try {
      loading.value = true;
      error.value = null;

      const { error: updateError } = await client
        .from("businesses")
        .update(data)
        .eq("id", businessId);

      if (updateError) throw updateError;

      // Refresh business data
      await fetchBusiness(businessId);
    } catch (err) {
      error.value = err.message;
      console.error("Error updating business:", err);
    } finally {
      loading.value = false;
    }
  }

  async function updateBusinessHours(businessId, hours) {
    try {
      loading.value = true;
      error.value = null;

      // Delete existing hours
      const { error: deleteError } = await client
        .from("business_hours")
        .delete()
        .eq("business_id", businessId);

      if (deleteError) throw deleteError;

      // Insert new hours
      const hoursData = Object.entries(hours).map(([day, data]) => ({
        business_id: businessId,
        day,
        open_time: data.open,
        close_time: data.close,
        is_closed: data.closed,
      }));

      const { error: insertError } = await client
        .from("business_hours")
        .insert(hoursData);

      if (insertError) throw insertError;

      // Refresh business data
      await fetchBusiness(businessId);
    } catch (err) {
      error.value = err.message;
      console.error("Error updating business hours:", err);
    } finally {
      loading.value = false;
    }
  }

  async function uploadPhoto(businessId, file) {
    try {
      loading.value = true;
      error.value = null;

      // Upload file to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${businessId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await client.storage
        .from("business-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = client.storage.from("business-photos").getPublicUrl(fileName);

      // Add photo to database
      const { error: dbError } = await client.from("business_photos").insert({
        business_id: businessId,
        url: publicUrl,
        file_name: fileName,
      });

      if (dbError) throw dbError;

      // Refresh business data
      await fetchBusiness(businessId);
    } catch (err) {
      error.value = err.message;
      console.error("Error uploading photo:", err);
    } finally {
      loading.value = false;
    }
  }

  async function deletePhoto(photoId, fileName) {
    try {
      loading.value = true;
      error.value = null;

      // Delete from database
      const { error: dbError } = await client
        .from("business_photos")
        .delete()
        .eq("id", photoId);

      if (dbError) throw dbError;

      // Delete from storage
      const { error: storageError } = await client.storage
        .from("business-photos")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Refresh business data
      await fetchBusiness(business.value.id);
    } catch (err) {
      error.value = err.message;
      console.error("Error deleting photo:", err);
    } finally {
      loading.value = false;
    }
  }

  return {
    business,
    loading,
    error,
    fetchBusiness,
    updateBusiness,
    updateBusinessHours,
    uploadPhoto,
    deletePhoto,
  };
});

export function useBusiness() {
  const store = useBusinessStore();
  return store;
}
