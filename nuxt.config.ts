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
		cookieOptions: {
			maxAge: 60 * 60 * 8, // 8 hours
			sameSite: "lax",
			secure: true,
		},
	},
	content: {
		highlight: {
			theme: "github-light",
		},
	},
	plugins: ["~/plugins/notification.js"],
	app: {
		head: {
			title: "AmarReview - Only trusted source of real reviews for Bangladeshi Businesses",
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
		// Private keys (server-side)
		// apiSecret: process.env.NUXT_API_SECRET,

		// Public keys (exposed to the client)
		public: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseKey: process.env.SUPABASE_KEY,
		},
	},
});