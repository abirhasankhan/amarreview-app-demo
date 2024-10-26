export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxt/content",
  ],
  supabase: {
    redirect: false,
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      exclude: ["/", "/business/*", "/blog/*", "/businesses/*"],
    },
  },
  content: {
    highlight: {
      theme: "github-light",
    },
  },
  app: {
    head: {
      title:
        "AmarReview - Only trusted source of real reviews for Bangladeshi Businesses",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
