import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin(async () => {
	const client = useSupabaseClient();
	const user = useSupabaseUser();
	const router = useRouter();
	const route = useRoute();

	const initializeAuth = async () => {
		try {
			const {
				data: { session },
				error,
			} = await client.auth.getSession();
			if (error) throw error;

			if (session) {
				user.value = session.user;

				const { data: profile, error: profileError } = await client
					.from("profiles")
					.select("role")
					.eq("id", session.user.id)
					.single();

				if (profileError) throw profileError;

				if (profile && process.client) {
					sessionStorage.setItem("userRole", profile.role);
				}

				return { session, profile };
			}

			return null;
		} catch (err) {
			console.error("[Auth Init Error]", err);
			user.value = null;
			if (process.client) sessionStorage.removeItem("userRole");
			return null;
		}
	};

	if (process.client) {
		client.auth.onAuthStateChange(async (event, session) => {
			switch (event) {
				case "SIGNED_IN":
				case "TOKEN_REFRESHED":
					if (session) {
						user.value = session.user;
						await initializeAuth();
						if (route.path.startsWith("/auth/")) {
							router.push("/dashboard");
						}
					}
					break;
				case "SIGNED_OUT":
				case "USER_DELETED":
					user.value = null;
					sessionStorage.removeItem("userRole");
					router.push("/auth/login");
					break;
			}
		});
	}

	const authState = await initializeAuth();

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
