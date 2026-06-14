<template>
  <!-- Hero Section -->
  <section class="relative hero-gradient pt-20 pb-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-12 gap-10 items-center">
        <!-- Copy -->
        <div class="lg:col-span-7 animate-slide-in-up">
          <h1 class="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Your Complete Property<br class="hidden sm:block" />
            <span class="text-white">Management Solution</span>
          </h1>
          <p class="mt-5 text-base sm:text-xl text-gray-200 max-w-2xl leading-relaxed">
            From verified listings to contracts, payments, and maintenance everything stays organized.
          </p>

          <div class="mt-7 flex flex-col sm:flex-row gap-3">
            <NuxtLink
              to="/listings"
              class="px-7 py-3 bg-white text-primary-700 font-semibold rounded border border-white/20 hover:bg-gray-100 transition inline-flex items-center justify-center"
            >
              Browse listings
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </NuxtLink>
            <NuxtLink
              to="/agents"
              class="px-7 py-3 bg-transparent text-white font-semibold rounded border border-white/30 hover:bg-white/10 transition inline-flex items-center justify-center"
            >
              Find an agent
            </NuxtLink>
          </div>
        </div>

        <!-- Search -->
        <div class="lg:col-span-5 animate-slide-in-up">
          <div class="bg-white rounded border border-gray-200 p-4">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-sm font-bold text-gray-900">Find a property</p>
                <p class="text-xs text-gray-600">Search listings with clean, fast filters.</p>
              </div>
              <span class="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded">
                Verified-first
              </span>
            </div>

            <div class="inline-flex rounded border border-gray-200 overflow-hidden mb-4 w-full">
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-semibold transition"
                :class="intent === 'rent' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                @click="intent = 'rent'"
              >
                Rent
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-semibold transition border-l border-gray-200"
                :class="intent === 'buy' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                @click="intent = 'buy'"
              >
                Buy
              </button>
              <button
                type="button"
                class="flex-1 px-4 py-2 text-sm font-semibold transition border-l border-gray-200"
                :class="intent === 'commercial' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
                @click="intent = 'commercial'"
              >
                Commercial
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <input
                    v-model="location"
                    type="text"
                    placeholder="Search city, neighborhood..."
                    class="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Property Type</label>
                <select
                  v-model="propertyType"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50"
                >
                  <option value="">All Types</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Townhouse</option>
                  <option>Penthouse</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1.5">Price Range</label>
                <select
                  v-model="priceRange"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent transition bg-gray-50"
                >
                  <option value="">Any Budget</option>
                  <option value="500-1000">$500 - $1,000</option>
                  <option value="1000-2000">$1,000 - $2,000</option>
                  <option value="2000-5000">$2,000 - $5,000</option>
                  <option value="5000+">$5,000+</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-gray-100">
              <div class="flex items-center gap-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    v-model="verifiedOnly"
                    type="checkbox"
                    class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span class="text-sm text-gray-700 font-medium">Verified Only</span>
                </label>
                <button type="button" class="text-sm text-primary-600 hover:text-primary-700 font-semibold flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    ></path>
                  </svg>
                  More Filters
                </button>
              </div>
              <button
                type="button"
                class="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition flex items-center justify-center space-x-2"
                @click="onSearch"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <span>Search Properties</span>
              </button>
            </div>

            <p class="mt-3 text-[11px] text-gray-500">Tip: Try “Cantonments” or “East Legon” for featured areas.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Featured Properties -->
  <section class="py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
        <div>
          <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded mb-3">FEATURED LISTINGS</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Premium Properties</h2>
          <p class="text-sm text-gray-600">Discover our hand-picked collection of exceptional homes</p>
        </div>
        <NuxtLink
          to="/listings"
          class="mt-4 sm:mt-0 px-5 py-2.5 text-sm font-semibold text-primary-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition flex items-center"
        >
          View All Properties
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <NuxtLink
          v-for="(p, idx) in featuredCards"
          :key="String(p._id || idx)"
          :to="p._id ? `/properties/${p._id}` : '/listings'"
          class="property-card block bg-white rounded overflow-hidden"
        >
          <div class="relative h-56">
            <img :src="p.coverImageUrl || p.image || fallbackImages[idx % fallbackImages.length]" alt="Property" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            <div v-if="p.verified !== false" class="absolute top-3 left-3">
              <span class="px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded flex items-center">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                VERIFIED
              </span>
            </div>
            <button type="button" class="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white rounded flex items-center justify-center transition">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </button>
          </div>
          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-xl font-bold text-gray-900">
                {{ formatPrice(p.price, p.priceCurrency) }}<span v-if="p.pricePeriod" class="text-sm font-normal text-gray-600">/{{ p.pricePeriod }}</span>
              </h3>
              <span class="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded">{{ (p.intent || 'FOR RENT').toUpperCase() }}</span>
            </div>
            <p class="text-sm font-semibold text-gray-900 mb-1">{{ p.name || 'Premium property' }}</p>
            <p class="text-xs text-gray-500 mb-3 flex items-center">
              <svg class="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span class="truncate">{{ p.address || 'Accra' }}</span>
            </p>
            <div class="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
              <div class="flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                <span class="whitespace-nowrap">{{ p.bedrooms ?? 2 }} Beds</span>
              </div>
              <div class="flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h4l3 9 4-18 3 9h4"></path>
                </svg>
                <span class="whitespace-nowrap">{{ p.bathrooms ?? 2 }} Baths</span>
              </div>
              <div class="flex items-center">
                <svg class="w-3.5 h-3.5 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  ></path>
                </svg>
                <span class="whitespace-nowrap">{{ p.sizeLabel || '1,011 sqft' }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- Super Agents -->
  <section id="agents" class="py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10">
        <div>
          <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded mb-3">TOP PERFORMERS</span>
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Meet Our Elite Agents</h2>
          <p class="text-sm text-gray-600">Certified professionals with proven track records in real estate</p>
        </div>
        <NuxtLink to="/agents" class="mt-4 sm:mt-0 px-5 py-2.5 text-sm font-semibold text-primary-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition flex items-center">
          View All Agents
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </NuxtLink>
      </div>

      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div class="inline-flex w-full lg:w-auto rounded border border-gray-200 bg-white overflow-x-auto">
          <button
            v-for="tab in homeAgentTabs"
            :key="tab.key"
            type="button"
            class="px-4 py-2 text-sm font-semibold transition border-l border-gray-200 first:border-l-0 first:rounded-l shrink-0"
            :class="homeSpecialty === tab.key ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-50'"
            @click="homeSpecialty = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div class="relative w-full sm:w-72">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              v-model="homeAgentSearch"
              type="search"
              placeholder="Search agents by name or specialty..."
              class="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <select
            v-model="homeAgentSort"
            class="w-full sm:w-44 px-3 py-2.5 text-sm border border-gray-200 rounded bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
          >
            <option value="rating">Top rated</option>
            <option value="response">Fast response</option>
            <option value="listings">Most listings</option>
            <option value="experience">Most experience</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div v-if="eliteSectionBusy" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article v-for="n in 3" :key="'elite-sk-' + n" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div class="relative h-28 animate-pulse bg-gray-100"></div>
          <div class="pt-10 p-5 space-y-3">
            <div class="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
            <div class="h-3 w-1/2 animate-pulse rounded bg-gray-100"></div>
            <div class="h-3 w-full animate-pulse rounded bg-gray-100"></div>
            <div class="h-8 w-full animate-pulse rounded bg-gray-100 mt-4"></div>
          </div>
        </article>
      </div>

      <div v-else-if="eliteAgents.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <UiAgentProfileCard v-for="(a, idx) in eliteAgents" :key="String(a._id) + '-' + idx" :agent="a" :card-index="idx" />
      </div>

      <div v-else class="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-600">
        <p>No agents to highlight yet.</p>
        <NuxtLink to="/agents" class="mt-3 inline-block font-semibold text-primary-600 hover:text-primary-700">Browse all agents</NuxtLink>
      </div>

      <div class="text-center mt-10">
        <NuxtLink
          to="/agents"
          class="px-8 py-3 bg-white text-gray-700 font-semibold border border-gray-200 rounded hover:bg-gray-50 transition inline-flex items-center"
        >
          Load More Agents
          <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded mb-3">COMPLETE SOLUTION</span>
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything You Need in One Platform</h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          From property search to contract signing, payments, and maintenance - we've got you covered
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="bg-white border border-gray-200 rounded p-6 hover:border-primary-600 transition-colors">
          <div class="w-14 h-14 bg-blue-600 rounded flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Properties & Units</h3>
          <p class="text-sm text-gray-600 mb-4">
            Comprehensive property listings with detailed unit management, specifications, availability tracking, and real-time updates.
          </p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Multi-property management</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Individual unit tracking</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Availability status</span>
            </li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded p-6 hover:border-primary-600 transition-colors">
          <div class="w-14 h-14 bg-purple-600 rounded flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Rental Applications</h3>
          <p class="text-sm text-gray-600 mb-4">Digital application process with document uploads, background checks, and automated approval workflows.</p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Online application forms</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Document verification</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Application status tracking</span>
            </li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded p-6 hover:border-primary-600 transition-colors">
          <div class="w-14 h-14 bg-green-600 rounded flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Digital Contracts</h3>
          <p class="text-sm text-gray-600 mb-4">Legally binding digital contracts with e-signatures, automatic renewals, and secure document storage.</p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Electronic signatures</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Contract templates</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Auto-renewal notifications</span>
            </li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded p-6 hover:border-primary-600 transition-colors">
          <div class="w-14 h-14 bg-yellow-600 rounded flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              ></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Payment Processing</h3>
          <p class="text-sm text-gray-600 mb-4">Integrated payment system with Paystack, multi-currency support, automatic receipts, and payment reminders.</p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Secure Paystack integration</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Multi-currency support</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Automatic payment tracking</span>
            </li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 rounded p-6 hover:border-primary-600 transition-colors">
          <div class="w-14 h-14 bg-red-600 rounded flex items-center justify-center mb-5">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">Maintenance Requests</h3>
          <p class="text-sm text-gray-600 mb-4">Submit, track, and manage maintenance requests with photo uploads, priority levels, and real-time updates.</p>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Online request submission</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Photo & video attachments</span>
            </li>
            <li class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Status tracking & updates</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="py-20 md:py-24 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-12 md:mb-14">
        <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded mb-3">ROLES &amp; ACCESS</span>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Built for every user</h2>
        <p class="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
          One platform with role-based onboarding—pick your path and use the workflows that match how you operate.
        </p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="group relative flex flex-col bg-white rounded p-5 border border-gray-200 hover:border-primary-600 transition-colors overflow-hidden">
          <div class="relative flex items-start gap-3 mb-4">
            <div class="w-12 h-12 shrink-0 bg-blue-600 rounded flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-gray-900 leading-tight">Tenants</h3>
              <p class="text-xs text-gray-500 mt-1 leading-snug">Find space, apply, pay rent, and stay on top of upkeep.</p>
            </div>
          </div>
          <div class="relative flex flex-wrap gap-1.5 mb-5 flex-1">
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Verified listings</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Applications</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Paystack rent</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Maintenance</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Documents</span>
          </div>
          <NuxtLink
            to="/auth/signup"
            class="relative mt-auto block w-full py-2.5 text-center text-sm font-semibold rounded bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            Join as tenant
          </NuxtLink>
        </div>

        <div class="group relative flex flex-col bg-white rounded p-5 border border-gray-200 hover:border-primary-600 transition-colors overflow-hidden">
          <div class="relative flex items-start gap-3 mb-4">
            <div class="w-12 h-12 shrink-0 bg-green-600 rounded flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-gray-900 leading-tight">Landlords</h3>
              <p class="text-xs text-gray-500 mt-1 leading-snug">List units, screen tenants, and collect rent with clarity.</p>
            </div>
          </div>
          <div class="relative flex flex-wrap gap-1.5 mb-5 flex-1">
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Multi-property</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Screening</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Contracts</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Payments</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Insights</span>
          </div>
          <NuxtLink
            to="/auth/signup"
            class="relative mt-auto block w-full py-2.5 text-center text-sm font-semibold rounded bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            Join as landlord
          </NuxtLink>
        </div>

        <div class="group relative flex flex-col bg-white rounded p-5 border border-gray-200 hover:border-primary-600 transition-colors overflow-hidden">
          <div class="relative flex items-start gap-3 mb-4">
            <div class="w-12 h-12 shrink-0 bg-purple-600 rounded flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-gray-900 leading-tight">Agents</h3>
              <p class="text-xs text-gray-500 mt-1 leading-snug">Verified profiles, deals, and client coordination in one place.</p>
            </div>
          </div>
          <div class="relative flex flex-wrap gap-1.5 mb-5 flex-1">
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Listings</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">CRM-style pipeline</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Virtual tours</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Verification</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Messaging</span>
          </div>
          <NuxtLink
            to="/auth/signup"
            class="relative mt-auto block w-full py-2.5 text-center text-sm font-semibold rounded bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            Join as agent
          </NuxtLink>
        </div>

        <div class="group relative flex flex-col bg-white rounded p-5 border border-gray-200 hover:border-primary-600 transition-colors overflow-hidden">
          <div class="relative flex items-start gap-3 mb-4">
            <div class="w-12 h-12 shrink-0 bg-primary-600 rounded flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h3 class="text-lg font-bold text-gray-900 leading-tight">Managers</h3>
              <p class="text-xs text-gray-500 mt-1 leading-snug">Operate portfolios with maintenance, money, and messaging aligned.</p>
            </div>
          </div>
          <div class="relative flex flex-wrap gap-1.5 mb-5 flex-1">
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Portfolio ops</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Maintenance</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Reporting</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Notifications</span>
            <span class="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded border border-gray-100">Compliance</span>
          </div>
          <NuxtLink
            to="/auth/signup"
            class="relative mt-auto block w-full py-2.5 text-center text-sm font-semibold rounded bg-primary-600 hover:bg-primary-700 text-white transition-colors"
          >
            Join as manager
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>

  <section class="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center text-white">
        <h2 class="text-2xl sm:text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
        <p class="text-base text-primary-50 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of satisfied clients who found their perfect property with CribHub. Start your journey today!
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <NuxtLink
            to="/listings"
            class="px-8 py-4 bg-white text-primary-600 font-bold rounded hover:bg-gray-100 transition flex items-center justify-center border border-white/30"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Browse Properties
          </NuxtLink>
          <a
            href="#"
            class="px-8 py-4 bg-transparent text-white font-bold border-2 border-white rounded hover:bg-white hover:text-primary-600 transition flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            List Your Property
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePropertiesStore } from '@@/stores/properties'
import { useAgentsStore } from '@@/stores/agents'
import { useSeo, buildOrganizationSchema, buildWebSiteSchema } from '../composables/useSeo'

type FeaturedCard = {
  _id?: string
  name?: string
  address?: string
  bedrooms?: number
  bathrooms?: number
  price?: number
  priceCurrency?: string
  pricePeriod?: string
  coverImageUrl?: string
  image?: string
  verified?: boolean
  intent?: string
  sizeLabel?: string
}

const { public: { siteUrl } } = useRuntimeConfig()

useSeo(computed(() => ({
  title: 'CribHub – Find Your Perfect Home in Ghana',
  description: "Ghana's #1 property platform. Browse thousands of verified homes, apartments, and commercial spaces for rent or sale in Accra and beyond. Find certified agents today.",
  type: 'website',
  structuredData: {
    '@context': 'https://schema.org',
    '@graph': [
      buildOrganizationSchema(siteUrl as string),
      buildWebSiteSchema(siteUrl as string),
    ],
  },
})))

const properties = usePropertiesStore()
const agents = useAgentsStore()

/** First load of agent spotlight (avoid skeleton flash when store already has rows). */
const homeAgentsBootstrapped = ref(false)

const homeAgentTabs = [
  { key: 'all' as const, label: 'All Agents' },
  { key: 'residential' as const, label: 'Residential' },
  { key: 'commercial' as const, label: 'Commercial' },
  { key: 'luxury' as const, label: 'Luxury Homes' },
]

const homeSpecialty = ref<'all' | 'residential' | 'commercial' | 'luxury'>('all')
const homeAgentSearch = ref('')
const homeAgentSort = ref<'rating' | 'response' | 'listings' | 'experience' | 'newest'>('rating')

const eliteSectionBusy = computed(
  () => !homeAgentsBootstrapped.value || (agents.isLoading && agents.list.length === 0),
)

/** Same filter rules as `/agents` (regions, bio, agency substring). */
const filteredHomeAgents = computed(() => {
  let list = [...agents.list]

  if (homeSpecialty.value !== 'all') {
    const f = homeSpecialty.value.toLowerCase()
    list = list.filter((a) => {
      const regions = (a.regions || []).join(' ').toLowerCase()
      const bio = (a.bio || '').toLowerCase()
      const agency = (a.agency || '').toLowerCase()
      return regions.includes(f) || bio.includes(f) || agency.includes(f)
    })
  }

  if (homeAgentSearch.value.trim()) {
    const q = homeAgentSearch.value.toLowerCase()
    list = list.filter((a) =>
      [a.displayName, a.agency, a.bio, ...(a.regions || []), ...(a.languages || [])].some((s) =>
        (s || '').toLowerCase().includes(q),
      ),
    )
  }

  switch (homeAgentSort.value) {
    case 'rating':
      list = [...list].sort((a, b) => {
        const avg = (x: any) => Number(x.ratingAvg) || 0
        const cnt = (x: any) => Number(x.ratingCount) || 0
        if (avg(b) !== avg(a)) return avg(b) - avg(a)
        return cnt(b) - cnt(a)
      })
      break
    case 'response':
      list = [...list].sort((a, b) => (a.responseTimeMinutes ?? 9999) - (b.responseTimeMinutes ?? 9999))
      break
    case 'listings':
      list = [...list].sort((a, b) => (b.listingsCount ?? 0) - (a.listingsCount ?? 0))
      break
    case 'experience':
      list = [...list].sort(
        (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      )
      break
    case 'newest':
      list = [...list].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      break
  }

  return list
})

/** Top three from the filtered + sorted Pinia list (updates live with socket events). */
const eliteAgents = computed(() => filteredHomeAgents.value.slice(0, 3))

const intent = ref<'rent' | 'buy' | 'commercial'>('rent')
const location = ref('')
const propertyType = ref('')
const priceRange = ref('')
const verifiedOnly = ref(false)

const fallbackImages = ['/images/apartments/6.jpeg', '/images/apartments/1.jpeg', '/images/apartments/5.jpeg', '/images/apartments/4.jpeg']

const fallbackFeatured: FeaturedCard[] = [
  {
    name: 'Modern Apartment in Downtown',
    address: 'Abelenkpe, Accra',
    bedrooms: 2,
    bathrooms: 2,
    price: 1200,
    priceCurrency: 'USD',
    pricePeriod: 'mo',
    image: '/images/apartments/6.jpeg',
    verified: true,
    intent: 'FOR RENT',
    sizeLabel: '1,011 sqft'
  },
  {
    name: 'Luxury Villa with Pool',
    address: 'East Legon, Accra',
    bedrooms: 4,
    bathrooms: 3,
    price: 2500,
    priceCurrency: 'USD',
    pricePeriod: 'mo',
    image: '/images/apartments/1.jpeg',
    verified: true,
    intent: 'FOR RENT',
    sizeLabel: '2,800 sqft'
  },
  {
    name: 'Cozy Studio Apartment',
    address: 'Spintex, Accra',
    bedrooms: 1,
    bathrooms: 1,
    price: 850,
    priceCurrency: 'USD',
    pricePeriod: 'mo',
    image: '/images/apartments/5.jpeg',
    verified: false,
    intent: 'FOR RENT',
    sizeLabel: '650 sqft'
  },
  {
    name: 'Spacious Penthouse',
    address: 'Cantonments, Accra',
    bedrooms: 3,
    bathrooms: 3,
    price: 1800,
    priceCurrency: 'USD',
    pricePeriod: 'mo',
    image: '/images/apartments/4.jpeg',
    verified: true,
    intent: 'FOR RENT',
    sizeLabel: '1,850 sqft'
  }
]

const featuredCards = computed<FeaturedCard[]>(() => {
  const apiCards = (properties.list || []).slice(0, 4) as any[]
  if (apiCards.length) return apiCards
  return fallbackFeatured
})

onMounted(async () => {
  try {
    await properties.fetchList({ $limit: 4 })
  } catch {
    // keep fallbackFeatured
  }
  try {
    await agents.fetchList({ $limit: 96 })
  } catch {
    // empty spotlight
  } finally {
    homeAgentsBootstrapped.value = true
  }
})

function formatPrice(price?: number, currency?: string) {
  if (typeof price !== 'number') return '$—'
  const symbol = currency === 'GHS' ? '₵' : currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.toLocaleString()}`
}

async function onSearch() {
  const query: Record<string, any> = {}
  if (intent.value) query.type = intent.value
  if (location.value.trim()) query.location = location.value.trim()
  if (propertyType.value) query.propertyType = propertyType.value
  if (priceRange.value) query.price = priceRange.value
  if (verifiedOnly.value) query.verified = 'true'
  await navigateTo({ path: '/listings', query })
}
</script>

