<template>
  <footer class="bg-gray-800 text-white mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 class="text-lg font-semibold mb-4">About AmarReview</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/about" class="hover:text-emerald-400">About Us</NuxtLink></li>
            <li><NuxtLink to="/careers" class="hover:text-emerald-400">Careers</NuxtLink></li>
            <li><NuxtLink to="/press" class="hover:text-emerald-400">Press</NuxtLink></li>
          </ul>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-4">For Businesses</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/business/claim" class="hover:text-emerald-400">Claim Business</NuxtLink></li>
            <li><NuxtLink to="/business/products" class="hover:text-emerald-400">Products</NuxtLink></li>
            <li><NuxtLink to="/business/support" class="hover:text-emerald-400">Support</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">Legal</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/privacy" class="hover:text-emerald-400">Privacy Policy</NuxtLink></li>
            <li><NuxtLink to="/terms" class="hover:text-emerald-400">Terms of Service</NuxtLink></li>
            <li><NuxtLink to="/guidelines" class="hover:text-emerald-400">Guidelines</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4">Connect</h3>
          <ul class="space-y-2">
            <li><NuxtLink to="/contact" class="hover:text-emerald-400">Contact Us</NuxtLink></li>
            <li><a href="#" class="hover:text-emerald-400">Facebook</a></li>
            <li><a href="#" class="hover:text-emerald-400">Twitter</a></li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-gray-700 text-center">
        <p>&copy; {{ new Date().getFullYear() }} TrustReview. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>