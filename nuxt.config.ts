export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	css: ["~/assets/css/tailwind.css"],
	modules: [
		"@nuxtjs/tailwindcss",
		"@nuxtjs/supabase",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		"@nuxt/content",
		"@nuxt/icon",
	],
	supabase: {
		url: process.env.SUPABASE_URL,
		key: process.env.SUPABASE_KEY,
		serviceKey: process.env.SUPABASE_SERVICE_KEY,
		redirect: false,
		redirectOptions: {
			login: "/auth/login",
			callback: "/auth/confirm",
			exclude: ["/", "/business/*", "/blog/*", "/businesses/*"],
		},
		clientOptions: {
			auth: {
				persistSession: true,
				autoRefreshToken: true,
				detectSessionInUrl: true,
			},
		},
		cookieOptions: {
			maxAge: 60 * 60 * 8,
			sameSite: "lax",
			secure: process.env.NODE_ENV !== "development", // Only require secure in production
		},
	},
	content: {
		highlight: {
			theme: "github-light",
		},
	},
	plugins: ["~/plugins/notification.js", "~/plugins/auth.ts"],
	app: {
		head: {
			title: "AmarReview - Frontend",
			meta: [
				{ charset: "utf-8" },
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
			],
		},
	},
	runtimeConfig: {
		public: {
			apiBase:
				process.env.NODE_ENV === "development"
					? `http://localhost:3000/api` // Backend dev port
					: `${process.env.BACKEND_URL}/api`,
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
		},
	},
});
