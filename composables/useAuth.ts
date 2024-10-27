import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const role = ref(null);
  const initialized = ref(false);

  const isAdmin = computed(() => role.value === "admin");
  const isBusinessOwner = computed(() => role.value === "business_owner");
  const isAuthenticated = computed(() => !!user.value);

  function setUser(newUser) {
    user.value = newUser;
  }

  function setRole(newRole) {
    role.value = newRole;
    if (process.client) {
      sessionStorage.setItem("userRole", newRole);
    }
  }

  function clearAuth() {
    user.value = null;
    role.value = null;
    if (process.client) {
      sessionStorage.removeItem("userRole");
    }
  }

  async function initialize() {
    if (initialized.value) return;

    const client = useSupabaseClient();

    try {
      const {
        data: { session },
        error,
      } = await client.auth.getSession();
      if (error) throw error;

      if (session) {
        setUser(session.user);

        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setRole(profile.role);
        }
      }
    } catch (error) {
      console.error("Auth store initialization error:", error);
      clearAuth();
    } finally {
      initialized.value = true;
    }
  }

  return {
    user,
    role,
    initialized,
    isAdmin,
    isBusinessOwner,
    isAuthenticated,
    setUser,
    setRole,
    clearAuth,
    initialize,
  };
});

export function useAuth() {
  const store = useAuthStore();
  const client = useSupabaseClient();

  async function refreshSession() {
    try {
      await store.initialize();
    } catch (error) {
      console.error("Error refreshing session:", error);
      store.clearAuth();
    }
  }

  // Initialize store on first use
  if (!store.initialized) {
    refreshSession();
  }

  return {
    user: computed(() => store.user),
    isAdmin: computed(() => store.isAdmin),
    isBusinessOwner: computed(() => store.isBusinessOwner),
    isAuthenticated: computed(() => store.isAuthenticated),
    refreshSession,
  };
}
