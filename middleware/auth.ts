export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/verify-email",
    "/businesses",
    "/categories",
    "/blog",
  ];

  // Check if the route is public
  if (
    publicRoutes.includes(to.path) ||
    to.path.startsWith("/businesses/") ||
    to.path.startsWith("/blog/")
  ) {
    return;
  }

  // Check authentication
  if (!isAuthenticated.value) {
    return navigateTo("/auth/login");
  }

  // Check admin routes
  if (to.path.startsWith("/admin") && !isAdmin.value) {
    return navigateTo("/");
  }
});
