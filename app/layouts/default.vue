<template>
  <div class="min-h-dvh flex flex-col">
    <!-- Navigation -->
    <!-- z-50: above page sticky chrome (e.g. listings filters at z-30) so dropdowns are not covered -->
    <nav class="relative z-50 border-b border-gray-200 bg-white">
      <div class="mx-auto max-w-7xl px-4">
        <div class="relative flex h-16 items-center justify-between">
          <!-- Logo -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center space-x-2">
              <img src="/images/logo/logo.png" alt="CribHub" class="h-7 w-auto" />
            </NuxtLink>
          </div>

          <!-- Desktop navigation: z-20 so dropdowns paint above the actions column (later sibling). -->
          <div class="relative z-20 hidden items-center space-x-6 lg:flex">
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'buy' } }"
              class="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >Buy</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'rent' } }"
              class="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >Rent</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'commercial' } }"
              class="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >Commercial</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'new' } }"
              class="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >New Projects</NuxtLink
            >
            <NuxtLink to="/agents" class="text-sm font-medium text-gray-700 hover:text-primary-600 transition">Find Agent</NuxtLink>
            <NuxtLink to="/property-managers" class="text-sm font-medium text-gray-700 hover:text-primary-600 transition">Find Manager</NuxtLink>
            <!-- Property Price dropdown -->
            <div class="group relative">
              <button
                type="button"
                class="flex items-center text-sm font-medium text-gray-700 transition hover:text-primary-600"
              >
                Property Price
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div
                class="invisible absolute left-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 opacity-0 shadow-lg ring-1 ring-black/5 transition-all duration-200 group-hover:visible group-hover:opacity-100"
              >
                <NuxtLink to="/tools/price-calculator" class="block px-4 py-2 text-sm hover:bg-gray-50">Price calculator</NuxtLink>
                <NuxtLink to="/tools/market-trends" class="block px-4 py-2 text-sm hover:bg-gray-50">Market trends</NuxtLink>
                <NuxtLink to="/tools/valuation" class="block px-4 py-2 text-sm hover:bg-gray-50">Valuation</NuxtLink>
              </div>
            </div>

            <!-- Explore dropdown -->
            <div class="group relative">
              <button
                type="button"
                class="flex items-center text-sm font-medium text-gray-700 transition hover:text-primary-600"
              >
                Explore
                <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div
                class="invisible absolute left-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 opacity-0 shadow-lg ring-1 ring-black/5 transition-all duration-200 group-hover:visible group-hover:opacity-100"
              >
                <NuxtLink to="/explore/neighborhoods" class="block px-4 py-2 text-sm hover:bg-gray-50">Neighborhoods</NuxtLink>
                <NuxtLink to="/explore/virtual-tours" class="block px-4 py-2 text-sm hover:bg-gray-50">Virtual tours</NuxtLink>
                <NuxtLink to="/blog" class="block px-4 py-2 text-sm hover:bg-gray-50">Blog</NuxtLink>
              </div>
            </div>
          </div>

          <!-- Actions (below nav dropdowns in paint order when overlapping) -->
          <div class="relative z-10 hidden items-center space-x-3 lg:flex">
            <ClientOnly>
              <NuxtLink
                :to="auth.isAuthenticated ? '/notifications' : '/auth/login'"
                class="relative p-2 hover:bg-gray-100 rounded transition inline-flex"
                aria-label="Notifications"
              >
                <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  ></path>
                </svg>
                <span
                  v-if="auth.isAuthenticated && notifications.unreadTotal > 0"
                  class="absolute -top-0.5 -right-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white"
                >
                  {{ notifications.unreadTotal > 99 ? '99+' : notifications.unreadTotal }}
                </span>
              </NuxtLink>

              <template v-if="!auth.isAuthenticated">
                <NuxtLink
                  to="/auth/signup"
                  class="px-6 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition inline-block"
                >
                  Sign Up
                </NuxtLink>
                <NuxtLink
                  to="/auth/login"
                  class="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition inline-block"
                >
                  Login
                </NuxtLink>
              </template>
              <template v-else>
                <NuxtLink
                  to="/dashboard"
                  class="px-6 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition inline-block"
                >
                  Dashboard
                </NuxtLink>
                <NuxtLink
                  v-if="auth.hasRole('landlord', 'admin')"
                  to="/landlord/properties"
                  class="hidden lg:inline-flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 rounded transition"
                >
                  Landlord hub
                </NuxtLink>
                <button
                  class="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition inline-block"
                  type="button"
                  @click="onLogout"
                >
                  Logout
                </button>
              </template>

              <!-- SSR fallback: always show Login/Sign Up while auth is resolving -->
              <template #fallback>
                <NuxtLink
                  to="/auth/login"
                  class="relative p-2 hover:bg-gray-100 rounded transition inline-flex"
                  aria-label="Notifications"
                >
                  <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    ></path>
                  </svg>
                </NuxtLink>
                <NuxtLink to="/auth/signup" class="px-6 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition inline-block">Sign Up</NuxtLink>
                <NuxtLink to="/auth/login" class="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition inline-block">Login</NuxtLink>
              </template>
            </ClientOnly>
          </div>

          <!-- Mobile actions: search shortcut + hamburger -->
          <div class="flex items-center gap-1 lg:hidden">
            <ClientOnly>
              <NuxtLink
                :to="auth.isAuthenticated ? '/notifications' : '/auth/login'"
                class="relative p-2 text-gray-700 hover:bg-gray-100 rounded transition"
                aria-label="Notifications"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span v-if="auth.isAuthenticated && notifications.unreadTotal > 0" class="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white">
                  {{ notifications.unreadTotal > 9 ? '9+' : notifications.unreadTotal }}
                </span>
              </NuxtLink>
            </ClientOnly>
            <button
              type="button"
              class="p-2 text-gray-700 rounded hover:bg-gray-100 transition"
              :aria-expanded="mobileMenuOpen"
              aria-controls="mobile-menu"
              @click="mobileMenuOpen = !mobileMenuOpen"
            >
              <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
        <div v-show="mobileMenuOpen" id="mobile-menu" class="lg:hidden border-t border-gray-200">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'buy' } }"
              class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100"
              @click="mobileMenuOpen = false"
              >Buy</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'rent' } }"
              class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100"
              @click="mobileMenuOpen = false"
              >Rent</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'commercial' } }"
              class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100"
              @click="mobileMenuOpen = false"
              >Commercial</NuxtLink
            >
            <NuxtLink
              :to="{ path: '/listings', query: { type: 'new' } }"
              class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100"
              @click="mobileMenuOpen = false"
              >New Projects</NuxtLink
            >
            <NuxtLink to="/agents" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Find Agent</NuxtLink>
            <NuxtLink to="/property-managers" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Find Property Manager</NuxtLink>
            <p class="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Property price</p>
            <NuxtLink to="/tools/price-calculator" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Price calculator</NuxtLink>
            <NuxtLink to="/tools/market-trends" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Market trends</NuxtLink>
            <NuxtLink to="/tools/valuation" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Valuation</NuxtLink>
            <p class="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Explore</p>
            <NuxtLink to="/explore/neighborhoods" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Neighborhoods</NuxtLink>
            <NuxtLink to="/explore/virtual-tours" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Virtual tours</NuxtLink>
            <NuxtLink to="/blog" class="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded active:bg-gray-100" @click="mobileMenuOpen = false">Blog</NuxtLink>
            <div class="pt-3 border-t border-gray-200 mt-3 space-y-2">
              <ClientOnly>
                <template v-if="!auth.isAuthenticated">
                  <NuxtLink
                    to="/auth/signup"
                    class="block w-full px-3 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition text-center"
                    @click="mobileMenuOpen = false"
                  >
                    Sign Up
                  </NuxtLink>
                  <NuxtLink
                    to="/auth/login"
                    class="block w-full px-3 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition text-center"
                    @click="mobileMenuOpen = false"
                  >
                    Login
                  </NuxtLink>
                </template>
                <template v-else>
                  <NuxtLink
                    to="/notifications"
                    class="flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition"
                    @click="mobileMenuOpen = false"
                  >
                    <span>Notifications</span>
                    <span
                      v-if="notifications.unreadTotal > 0"
                      class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-white"
                    >
                      {{ notifications.unreadTotal > 99 ? '99+' : notifications.unreadTotal }}
                    </span>
                  </NuxtLink>
                  <NuxtLink
                    to="/dashboard"
                    class="block w-full px-3 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition text-center"
                    @click="mobileMenuOpen = false"
                  >
                    Dashboard
                  </NuxtLink>
                  <NuxtLink
                    v-if="auth.hasRole('landlord', 'admin')"
                    to="/landlord/properties"
                    class="block w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition text-center"
                    @click="mobileMenuOpen = false"
                  >
                    Landlord hub
                  </NuxtLink>
                  <NuxtLink
                    v-if="auth.hasRole('landlord', 'admin')"
                    to="/verification/role-requests"
                    class="block w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded transition text-center"
                    @click="mobileMenuOpen = false"
                  >
                    Role requests
                  </NuxtLink>
                  <button
                    class="block w-full px-3 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition text-center"
                    type="button"
                    @click="onLogout"
                  >
                    Logout
                  </button>
                </template>

                <template #fallback>
                  <NuxtLink to="/auth/signup" class="block w-full px-3 py-2.5 text-sm font-semibold text-primary-600 border border-primary-600 hover:bg-primary-50 rounded transition text-center" @click="mobileMenuOpen = false">Sign Up</NuxtLink>
                  <NuxtLink to="/auth/login" class="block w-full px-3 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition text-center" @click="mobileMenuOpen = false">Login</NuxtLink>
                </template>
              </ClientOnly>
            </div>
          </div>
        </div>
        </Transition>
      </div>
    </nav>

    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h6 class="text-white font-semibold text-sm mb-4">Popular Searches</h6>
            <ul class="space-y-2">
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Achimota' } }" class="text-sm hover:text-primary-400 transition">Apartments in Achimota</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Accra' } }" class="text-sm hover:text-primary-400 transition">Flats in Accra</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'East Legon' } }" class="text-sm hover:text-primary-400 transition">Villas in East Legon</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Spintex' } }" class="text-sm hover:text-primary-400 transition">Houses in Spintex</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h6 class="text-white font-semibold text-sm mb-4">Popular Areas</h6>
            <ul class="space-y-2">
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'East Legon' } }" class="text-sm hover:text-primary-400 transition">East Legon</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Cantonments' } }" class="text-sm hover:text-primary-400 transition">Cantonments</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Spintex' } }" class="text-sm hover:text-primary-400 transition">Spintex</NuxtLink>
              </li>
              <li>
                <NuxtLink :to="{ path: '/listings', query: { type: 'rent', location: 'Airport Residential' } }" class="text-sm hover:text-primary-400 transition">Airport Residential</NuxtLink>
              </li>
            </ul>
          </div>
          <div>
            <h6 class="text-white font-semibold text-sm mb-4">Quick Links</h6>
            <ul class="space-y-2">
              <li><NuxtLink to="/p/about-us" class="text-sm hover:text-primary-400 transition">About Us</NuxtLink></li>
              <li><NuxtLink to="/p/contact" class="text-sm hover:text-primary-400 transition">Contact</NuxtLink></li>
              <li><NuxtLink to="/agents" class="text-sm hover:text-primary-400 transition">Agent Hub</NuxtLink></li>
              <li><NuxtLink to="/property-managers" class="text-sm hover:text-primary-400 transition">Property Managers</NuxtLink></li>
              <li><NuxtLink to="/blog" class="text-sm hover:text-primary-400 transition">Blog</NuxtLink></li>
            </ul>
          </div>
          <div>
            <h6 class="text-white font-semibold text-sm mb-4">Legal</h6>
            <ul class="space-y-2">
              <li><NuxtLink to="/p/terms-of-service" class="text-sm hover:text-primary-400 transition">Terms of Service</NuxtLink></li>
              <li><NuxtLink to="/p/privacy-policy" class="text-sm hover:text-primary-400 transition">Privacy Policy</NuxtLink></li>
              <li><NuxtLink to="/p/cookie-policy" class="text-sm hover:text-primary-400 transition">Cookie Policy</NuxtLink></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div class="flex items-center space-x-2">
            <img src="/images/logo/logo.png" alt="CribHub" class="footer-brand-logo h-7 w-auto" />
          </div>
          <p class="text-sm text-gray-400">&copy; 2026 CribHub Inc. All rights reserved.</p>
          <div class="flex space-x-4">
            <a href="#" class="text-gray-400 hover:text-primary-400 transition">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                ></path>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-primary-400 transition">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                ></path>
              </svg>
            </a>
            <a href="#" class="text-gray-400 hover:text-primary-400 transition">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useUserNotificationsStore } from '@@/stores/userNotifications'

const route = useRoute()
const pinia = usePinia()
const auth = useAuthStore(pinia)
const notifications = useUserNotificationsStore()
const mobileMenuOpen = ref(false)

// Close menu on route change
watch(() => route.fullPath, () => { mobileMenuOpen.value = false })

async function refreshNavNotifications() {
  if (!auth.isAuthenticated) return
  try {
    await notifications.fetchRecent(12)
  } catch {
    /* ignore */
  }
}

watch(
  () => auth.isAuthenticated,
  (v) => {
    if (v) void refreshNavNotifications()
  },
)

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()
  await refreshNavNotifications()
})

async function onLogout() {
  mobileMenuOpen.value = false
  await auth.logout()
  await navigateTo('/')
}
</script>

