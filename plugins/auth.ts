import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(async (nuxtApp) => {
  const client = useSupabaseClient();
  const user = useSupabaseUser();
  const router = useRouter();
  const route = useRoute();

  // Initialize auth state
  const initializeAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await client.auth.getSession();
      if (error) throw error;

      if (session) {
        user.value = session.user;

        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile && process.client) {
          sessionStorage.setItem("userRole", profile.role);
        }

        return { session, profile };
      }

      return null;
    } catch (error) {
      console.error("Auth initialization error:", error);
      user.value = null;
      if (process.client) {
        sessionStorage.removeItem("userRole");
      }
      return null;
    }
  };

  // Handle auth state changes only on client side
  if (process.client) {
    client.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session) {
          user.value = session.user;
          await initializeAuth();

          if (route.path.startsWith("/auth/")) {
            router.push("/dashboard");
          }
        }
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        user.value = null;
        sessionStorage.removeItem("userRole");
        router.push("/auth/login");
      }
    });
  }

  // Initialize auth state
  const authState = await initializeAuth();

  // Provide auth state
  return {
    provide: {
      auth: {
        user,
        session: authState?.session,
        profile: authState?.profile,
      },
    },
  };
});
