<template>
  <div class="bg-gray-50">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-3">
        <div class="flex items-center justify-between gap-2 text-sm">
          <NuxtLink to="/listings" class="shrink-0 text-gray-600 hover:text-primary-600 flex items-center">
            <i class="las la-angle-left mr-1"></i> Back
          </NuxtLink>
          <div class="flex items-center gap-1 text-gray-500 overflow-hidden min-w-0">
            <a href="#" class="hidden sm:inline truncate hover:text-primary-600">{{ property?.country || 'Greater Accra' }}</a>
            <i class="las la-angle-right hidden sm:inline text-gray-400"></i>
            <a href="#" class="hidden xs:inline truncate hover:text-primary-600">{{ property?.city || 'Tema' }}</a>
            <i class="las la-angle-right hidden xs:inline text-gray-400"></i>
            <span class="truncate text-gray-900 font-medium">{{ property?.address || 'Spintex' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Property images: at most 5 on the page; full set opens in VueEasyLightbox (nuxt-easy-lightbox) -->
    <div class="max-w-7xl mx-auto px-4 py-4 w-full">
      <div v-if="properties.isLoading && !property" class="w-full h-[min(70vh,480px)] min-h-[280px] rounded bg-gray-200 animate-pulse" />

      <div
        v-else-if="!allPropertyImages.length"
        class="w-full min-h-[200px] rounded bg-gray-100 flex items-center justify-center text-sm text-gray-500"
      >
        No photos for this listing.
      </div>

      <!-- 1 image: full width -->
      <div
        v-else-if="displayImages.length === 1"
        class="relative w-full h-[min(70vh,520px)] min-h-[260px] rounded overflow-hidden bg-gray-200 cursor-pointer"
        role="button"
        tabindex="0"
        @click="openPhotoLightbox(0)"
        @keydown.enter.prevent="openPhotoLightbox(0)"
        @keydown.space.prevent="openPhotoLightbox(0)"
      >
        <img :src="displayImages[0]" alt="" class="w-full h-full object-cover pointer-events-none" />
        <PropertyGalleryOverlays
          :verified="property?.verified"
          :maps-url="googleMapsUrl"
          :total-photo-count="allPropertyImages.length"
          @show-photos="openPhotoLightbox(0)"
        />
      </div>

      <!-- 2 images: full-width two columns -->
      <div v-else-if="displayImages.length === 2" class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full h-[min(60vh,440px)] min-h-[220px] sm:min-h-[320px]">
        <div
          class="relative min-h-[200px] sm:min-h-0 rounded overflow-hidden bg-gray-200 cursor-pointer"
          role="button"
          tabindex="0"
          @click="openPhotoLightbox(0)"
          @keydown.enter.prevent="openPhotoLightbox(0)"
          @keydown.space.prevent="openPhotoLightbox(0)"
        >
          <img :src="displayImages[0]" alt="" class="w-full h-full object-cover min-h-[200px] sm:min-h-full pointer-events-none" />
          <PropertyGalleryOverlays
            :verified="property?.verified"
            :maps-url="googleMapsUrl"
            :total-photo-count="allPropertyImages.length"
            @show-photos="openPhotoLightbox(0)"
          />
        </div>
        <div
          class="relative min-h-[200px] sm:min-h-0 rounded overflow-hidden bg-gray-200 cursor-pointer"
          role="button"
          tabindex="0"
          @click="openPhotoLightbox(1)"
          @keydown.enter.prevent="openPhotoLightbox(1)"
          @keydown.space.prevent="openPhotoLightbox(1)"
        >
          <img :src="displayImages[1]" alt="" class="w-full h-full object-cover min-h-[200px] sm:min-h-full pointer-events-none" />
        </div>
      </div>

      <!-- 3 images: full-width three columns -->
      <div v-else-if="displayImages.length === 3" class="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full h-auto sm:h-[380px]">
        <div
          v-for="(src, i) in displayImages"
          :key="'g3-' + i"
          class="relative aspect-[4/3] sm:aspect-auto sm:h-full min-h-[180px] rounded overflow-hidden bg-gray-200 cursor-pointer"
          role="button"
          tabindex="0"
          @click="openPhotoLightbox(i)"
          @keydown.enter.prevent="openPhotoLightbox(i)"
          @keydown.space.prevent="openPhotoLightbox(i)"
        >
          <img :src="src" alt="" class="w-full h-full object-cover pointer-events-none" />
          <PropertyGalleryOverlays
            v-if="i === 0"
            :verified="property?.verified"
            :maps-url="googleMapsUrl"
            :total-photo-count="allPropertyImages.length"
            @show-photos="openPhotoLightbox(0)"
          />
        </div>
      </div>

      <!-- 4 images: full-width 2×2 -->
      <div v-else-if="displayImages.length === 4" class="grid grid-cols-2 gap-2 w-full h-auto sm:h-[400px]">
        <div
          v-for="(src, i) in displayImages"
          :key="'g4-' + i"
          class="relative aspect-[4/3] sm:aspect-auto sm:h-full min-h-[160px] rounded overflow-hidden bg-gray-200 cursor-pointer"
          role="button"
          tabindex="0"
          @click="openPhotoLightbox(i)"
          @keydown.enter.prevent="openPhotoLightbox(i)"
          @keydown.space.prevent="openPhotoLightbox(i)"
        >
          <img :src="src" alt="" class="w-full h-full object-cover pointer-events-none" />
          <PropertyGalleryOverlays
            v-if="i === 0"
            :verified="property?.verified"
            :maps-url="googleMapsUrl"
            :total-photo-count="allPropertyImages.length"
            @show-photos="openPhotoLightbox(0)"
          />
        </div>
      </div>

      <!-- 5 images on page: hero + four tiles (more photos only in lightbox) -->
      <!-- On mobile: show only hero + 1 tile (2-col); on sm+ show full 4-col grid -->
      <div v-else class="w-full">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 h-auto sm:h-[min(55vh,420px)] sm:min-h-[360px]">
          <div
            class="col-span-2 row-span-2 relative rounded overflow-hidden bg-gray-200 min-h-[200px] sm:min-h-0 cursor-pointer"
            role="button"
            tabindex="0"
            @click="openPhotoLightbox(0)"
            @keydown.enter.prevent="openPhotoLightbox(0)"
            @keydown.space.prevent="openPhotoLightbox(0)"
          >
            <img :src="displayImages[0]" alt="" class="w-full h-full object-cover pointer-events-none" />
            <PropertyGalleryOverlays
              :verified="property?.verified"
              :maps-url="googleMapsUrl"
              :total-photo-count="allPropertyImages.length"
              @show-photos="openPhotoLightbox(0)"
            />
          </div>
          <div
            v-for="thumbIdx in 4"
            :key="'th-' + thumbIdx"
            class="rounded overflow-hidden bg-gray-200 min-h-0 cursor-pointer"
            :class="thumbIdx > 1 ? 'hidden sm:block' : ''"
            role="button"
            tabindex="0"
            @click="openPhotoLightbox(thumbIdx)"
            @keydown.enter.prevent="openPhotoLightbox(thumbIdx)"
            @keydown.space.prevent="openPhotoLightbox(thumbIdx)"
          >
            <img
              v-if="displayImages[thumbIdx]"
              :src="galleryThumbSrc(thumbIdx)"
              alt=""
              class="w-full h-full object-cover pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>

    <ClientOnly>
      <VueEasyLightbox
        :visible="photoLightboxOpen"
        :imgs="allPropertyImages"
        :index="photoLightboxIndex"
        :loop="true"
        :scroll-disabled="true"
        teleport="body"
        @hide="onPhotoLightboxHide"
      />
    </ClientOnly>

    <!-- Property Details -->
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div v-if="properties.isLoading" class="text-sm text-gray-600">Loading…</div>
      <div v-else-if="!property" class="text-sm text-gray-600">Not found.</div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2">
          <div class="mb-4">
            <p class="text-xs text-gray-600 uppercase mb-1">
              {{ (property.propertyType || 'PROPERTY').toUpperCase() }} {{ property.pricePeriod ? `FOR ${property.pricePeriod.toUpperCase()}` : '' }}
            </p>
            <h1 class="text-2xl font-bold text-gray-900">{{ property.name || 'Fully Furnished | Ready to Move | Spacious Living' }}</h1>
          </div>

          <div class="compact-card bg-white rounded p-4 mb-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="flex items-center">
                <i class="las la-building text-lg mr-2 text-gray-500"></i>
                <span>Property Type: <span class="font-medium">{{ property.propertyType || 'Apartment' }}</span></span>
              </div>
              <div class="flex items-center">
                <i class="las la-compress-arrows-alt text-lg mr-2 text-gray-500"></i>
                <span>Size: <span class="font-medium">{{ property.sizeLabel || '1,011 sqft / 94 sqm' }}</span></span>
              </div>
              <div class="flex items-center">
                <i class="las la-city text-lg mr-2 text-gray-500"></i>
                <span>City: <span class="font-medium">{{ property.city || 'Accra' }}</span></span>
              </div>
              <div class="flex items-center">
                <i class="las la-bed text-lg mr-2 text-gray-500"></i>
                <span>Bedrooms: <span class="font-medium">{{ property.bedrooms ?? 2 }}</span></span>
              </div>
              <div class="flex items-center">
                <i class="las la-shower text-lg mr-2 text-gray-500"></i>
                <span>Bathrooms: <span class="font-medium">{{ property.bathrooms ?? 2 }}</span></span>
              </div>
            </div>
          </div>

          <div v-if="property.verified !== false" class="compact-card bg-green-50 rounded p-4 mb-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <span class="inline-block px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
                  <i class="las la-star"></i> VERIFIED
                </span>
              </div>
              <p class="ml-3 text-sm text-gray-700">
                Verified listings have passed through our verification process, where the authenticity of the documentation, location, and price are all checked.
              </p>
            </div>
          </div>

          <div
            class="mb-4"
            :class="propertyAgent ? 'grid grid-cols-1 gap-4 md:grid-cols-2' : ''"
          >
            <div class="compact-card bg-white rounded p-4">
              <h3 class="text-lg font-bold mb-3">Location</h3>
              <a
                :href="googleMapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="group flex rounded -m-1 p-1 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                :class="propertyAgent ? 'items-start gap-3' : 'items-start gap-4 sm:flex-row sm:items-center sm:gap-6'"
                :aria-label="'Open location in Google Maps: ' + (mapsQueryLabel || 'map')"
              >
                <div
                  class="rounded-full overflow-hidden flex-shrink-0 bg-gray-200 ring-1 ring-gray-100 group-hover:ring-primary-200 transition"
                  :class="propertyAgent ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32'"
                >
                  <img src="/images/svg/map.svg" alt="" class="h-full w-full object-cover" />
                </div>
                <div class="min-w-0 flex-1 text-sm">
                  <p class="mb-1 flex items-start gap-1 text-gray-900">
                    <i class="las la-map-marker-alt mt-0.5 flex-shrink-0 text-primary-600"></i>
                    <span class="leading-snug">{{ property.address || 'Tower 108' }}</span>
                  </p>
                  <p class="flex items-start gap-1 text-gray-600">
                    <i class="las la-city mt-0.5 flex-shrink-0 text-primary-600"></i>
                    <span class="leading-snug">{{ [property.city, property.country].filter(Boolean).join(', ') || 'Accra, Ghana' }}</span>
                  </p>
                  <p
                    class="mt-3 inline-flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700 group-hover:underline underline-offset-2"
                  >
                    <i class="las la-external-link-alt mr-1.5 text-base" aria-hidden="true"></i>
                    Open in Google Maps
                  </p>
                </div>
              </a>
            </div>

            <div v-if="propertyAgent" class="compact-card bg-white rounded p-4">
              <h3 class="text-lg font-bold mb-3">Agent</h3>
              <div class="flex items-start gap-3">
                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-primary-600 bg-gray-100">
                  <img
                    v-if="propertyAgent.avatarUrl"
                    :src="propertyAgent.avatarUrl"
                    :alt="propertyAgent.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <i class="las la-user text-4xl"></i>
                  </span>
                </div>
                <div class="min-w-0 flex-1 text-sm">
                  <p class="text-base font-bold text-gray-900">{{ propertyAgent.name }}</p>
                  <p v-if="propertyAgent.agency" class="mt-1 flex items-center gap-1.5 text-gray-600">
                    <i class="las la-briefcase flex-shrink-0 text-base text-gray-500"></i>
                    <span class="leading-snug">{{ propertyAgent.agency }}</span>
                  </p>
                  <p
                    v-if="typeof propertyAgent.listingsCount === 'number'"
                    class="mt-2 text-sm font-semibold text-primary-600"
                  >
                    {{ propertyAgent.listingsCount.toLocaleString() }} listings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="compact-card bg-white rounded p-4 mb-4">
            <h3 class="text-lg font-bold text-gray-900 mb-3">Amenities</h3>
            <p
              v-if="!propertyAmenities.length"
              class="text-sm text-gray-600 rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center leading-relaxed"
            >
              No amenities listed for this property.
            </p>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-sm">
              <div
                v-for="(label, i) in propertyAmenities"
                :key="'amenity-' + i"
                class="flex items-center gap-2.5 min-h-[2.5rem] rounded border border-transparent px-1 -mx-1 py-0.5 hover:border-gray-100 hover:bg-gray-50/80 transition-colors"
              >
                <span
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded text-gray-600 bg-gray-100 ring-1 ring-gray-200/70"
                  aria-hidden="true"
                >
                  <i :class="[amenityIconClass(label, i), 'text-lg leading-none']"></i>
                </span>
                <span class="min-w-0 text-gray-800 leading-snug">{{ label }}</span>
              </div>
            </div>
          </div>

          <div class="compact-card bg-white rounded p-4 mb-4">
            <h3 class="text-lg font-bold mb-3">Description</h3>
            <p class="text-sm text-gray-700">
              {{ property.description || 'No description provided for this property yet.' }}
            </p>
          </div>

          <div v-if="unitsOnProperty.length" class="compact-card bg-white rounded p-4 mb-4">
            <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h3 class="text-lg font-bold text-gray-900">Units</h3>
              <span class="text-xs font-medium text-gray-500 tabular-nums">{{ unitsOnProperty.length }} on this property</span>
            </div>
            <div class="space-y-3">
              <article
                v-for="u in unitsOnProperty"
                :key="unitRowId(u)"
                class="flex flex-col gap-3 rounded border border-gray-100 bg-gray-50/50 p-3 sm:p-4 sm:flex-row sm:items-stretch sm:justify-between hover:border-gray-200 hover:bg-gray-50/90 transition-colors"
              >
                <div class="flex gap-3 min-w-0 flex-1">
                  <div
                    v-if="unitCoverSrc(u)"
                    class="relative h-20 w-28 shrink-0 overflow-hidden rounded bg-gray-200 ring-1 ring-gray-100 sm:h-[5.5rem] sm:w-32"
                  >
                    <img :src="unitCoverSrc(u)" alt="" class="h-full w-full object-cover" />
                  </div>
                  <div
                    v-else
                    class="flex h-20 w-28 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400 ring-1 ring-gray-100 sm:h-[5.5rem] sm:w-32"
                    aria-hidden="true"
                  >
                    <i class="las la-door-open text-3xl leading-none"></i>
                  </div>
                  <div class="min-w-0 flex flex-col justify-center gap-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-base font-bold text-gray-900">#{{ unitField(u, 'unitNumber') || '—' }}</span>
                      <span
                        v-if="unitListingLabel(u)"
                        class="text-[10px] font-semibold uppercase tracking-wide text-primary-800 bg-primary-50 px-2 py-0.5 rounded ring-1 ring-primary-100"
                      >
                        {{ unitListingLabel(u) }}
                      </span>
                      <span
                        v-if="unitField(u, 'status')"
                        class="text-[10px] font-semibold uppercase tracking-wide rounded px-2 py-0.5 ring-1"
                        :class="unitStatusPillClass(u)"
                      >
                        {{ unitField(u, 'status') }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-600">
                      {{ unitField(u, 'bedrooms') }} bed · {{ unitField(u, 'bathrooms') }} bath
                    </p>
                    <p class="text-lg font-bold text-gray-900 tabular-nums">
                      <template v-if="unitField(u, 'listingType') === 'sale'">
                        {{ formatPrice(unitMoney(u, 'salePrice'), unitCurrency(u)) }}
                        <span class="text-xs font-semibold text-gray-500 ml-1">sale</span>
                      </template>
                      <template v-else>
                        {{ formatPrice(unitMoney(u, 'rentAmount'), unitCurrency(u)) }}
                        <span class="text-sm font-normal text-gray-600">/mo</span>
                      </template>
                    </p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center sm:items-end sm:justify-end sm:flex-col sm:gap-2 sm:pl-2">
                  <!-- Already approved -->
                  <span
                    v-if="unitField(u, 'status') === 'vacant' && unitApplyStatus(u) === 'approved'"
                    class="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded cursor-default"
                  >
                    <i class="las la-check-circle text-base"></i>
                    Application approved
                  </span>
                  <!-- Already pending -->
                  <span
                    v-else-if="unitField(u, 'status') === 'vacant' && unitApplyStatus(u) === 'pending'"
                    class="inline-flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded cursor-default"
                  >
                    <i class="las la-clock text-base"></i>
                    Application pending
                  </span>
                  <!-- Available to apply -->
                  <button
                    v-else-if="unitField(u, 'status') === 'vacant'"
                    type="button"
                    class="inline-flex w-full sm:w-auto justify-center items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded shadow-sm transition"
                    @click="openApply(u)"
                  >
                    <i class="las la-file-alt text-base"></i>
                    Apply for this unit
                  </button>
                  <p
                    v-else-if="unitField(u, 'status') === 'maintenance'"
                    class="text-xs font-medium text-amber-800 text-center sm:text-right w-full sm:w-auto"
                  >
                    Under maintenance
                  </p>
                  <p v-else class="text-xs text-gray-500 text-center sm:text-right w-full sm:w-auto">No vacancy</p>
                </div>
              </article>
            </div>
          </div>

          <div class="compact-card bg-white rounded p-4">
            <h3 class="text-lg font-bold mb-3">Price Trends</h3>
            <p class="text-sm text-gray-600">Sorry, no price data was found for this property.</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="compact-card bg-white rounded p-4 sticky top-20">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-2xl font-bold text-gray-900">{{ formatPrice(property.price, property.priceCurrency) }}</p>
                <p class="text-sm text-gray-600">{{ property.priceCurrency || 'USD' }} / {{ property.pricePeriod || 'yearly' }}</p>
              </div>
              <button class="p-2 hover:bg-gray-100 rounded" type="button">
                <i class="las la-ellipsis-h text-xl"></i>
              </button>
            </div>

            <p class="text-xs text-gray-600 mb-4">
              Estimated Mortgage <a href="#" class="text-primary-600"><i class="las la-calculator"></i> GHC 2,697/month</a>
            </p>

            <div class="space-y-2 mb-4">
              <button
                class="w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition flex items-center justify-center gap-2"
                type="button"
                @click="openInquiry"
              >
                <i class="las la-comment-dots text-lg"></i> Message listing
              </button>
              <div class="grid grid-cols-3 gap-2">
                <button
                  class="flex-1 px-3 py-2.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded transition flex items-center justify-center gap-1"
                  type="button"
                  @click="requireAuth('call')"
                >
                  <i class="las la-phone text-base"></i> Call
                </button>
                <button
                  class="flex-1 px-3 py-2.5 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded transition flex items-center justify-center gap-1"
                  type="button"
                  @click="requireAuth('email')"
                >
                  <i class="las la-envelope text-base"></i> Email
                </button>
                <button
                  class="flex-1 px-3 py-2.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition flex items-center justify-center gap-1"
                  type="button"
                  @click="requireAuth('whatsapp')"
                >
                  <i class="lab la-whatsapp text-base"></i> WA
                </button>
              </div>
            </div>

            <div
              v-if="auth.hasRole('property_manager') && property && !pmAssignedHere && !isOwnListingAsPm"
              class="border-t border-gray-200 pt-4 space-y-2"
            >
              <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">For property managers</p>
              <p v-if="pmListingPending" class="text-xs text-amber-700">Your request to manage this listing is pending landlord approval.</p>
              <template v-else>
                <p class="text-xs text-gray-600">Ask the landlord to grant you access to help run this listing (you must already be approved as a property manager by an admin).</p>
                <button
                  type="button"
                  class="w-full rounded border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
                  @click="openPmListingRequest"
                >
                  Request to manage
                </button>
              </template>
            </div>

            <div
              v-if="auth.hasRole('agent') && property && !propertyAgent && !isOwnListingAsAgent"
              class="border-t border-gray-200 pt-4 space-y-2"
            >
              <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">For agents</p>
              <p v-if="agentListingPending" class="text-xs text-amber-700">Your request to represent this listing is pending.</p>
              <template v-else>
                <p class="text-xs text-gray-600">Offer to represent the landlord on this property (commission is agreed with the owner).</p>
                <button
                  type="button"
                  class="w-full rounded border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800 transition hover:bg-primary-100"
                  @click="openAgentListingRequest"
                >
                  Request to represent
                </button>
              </template>
            </div>

            <div v-if="propertyAgent" class="border-t border-gray-200 pt-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
                  <img
                    v-if="propertyAgent.avatarUrl"
                    :src="propertyAgent.avatarUrl"
                    :alt="propertyAgent.name"
                    class="h-full w-full object-cover"
                  />
                  <span v-else class="flex h-full w-full items-center justify-center text-gray-400">
                    <i class="las la-user text-2xl"></i>
                  </span>
                </div>
                <p class="text-xs leading-relaxed text-gray-600">
                  <template v-if="typeof propertyAgent.responseTimeMinutes === 'number'">
                    {{ propertyAgent.name }} usually responds within {{ propertyAgent.responseTimeMinutes }} minutes.
                  </template>
                  <template v-else>
                    {{ propertyAgent.name }} is the assigned agent for this listing.
                  </template>
                </p>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4">
              <button
                type="button"
                class="w-full px-4 py-3 text-sm font-semibold rounded transition flex items-center justify-center"
                :class="
                  favorites.isFavorited(id)
                    ? 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                "
                @click="toggleFavorite"
              >
                <i class="lar la-heart text-lg mr-2"></i>
                {{ favorites.isFavorited(id) ? 'Saved' : 'Save to favourite' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Property manager: request to manage modal -->
    <div
      v-if="pmRequestOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-4 sm:items-center"
      @click.self="pmRequestOpen = false"
    >
      <div class="w-full max-w-md rounded border border-gray-200 bg-white shadow-xl" @click.stop>
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 class="text-sm font-bold text-gray-900">Request to manage listing</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="pmRequestOpen = false">
            <i class="las la-times text-xl"></i>
          </button>
        </div>
        <div class="px-5 py-4">
          <p v-if="pmReqError" class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{{ pmReqError }}</p>
          <p v-if="pmReqSuccess" class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">{{ pmReqSuccess }}</p>
          <form class="space-y-3" @submit.prevent="submitPmListingRequest">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Note to the landlord <span class="font-normal text-gray-400">(optional)</span></label>
              <textarea v-model="pmMessage" rows="3" maxlength="2000" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="How you can help, availability, experience…" />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <button type="button" class="rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="pmRequestOpen = false">Cancel</button>
              <button type="submit" class="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="pmReqSubmitting">
                {{ pmReqSubmitting ? 'Sending…' : 'Submit request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Agent: request to represent modal -->
    <div
      v-if="agentRequestOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-4 sm:items-center"
      @click.self="agentRequestOpen = false"
    >
      <div class="w-full max-w-md rounded border border-gray-200 bg-white shadow-xl" @click.stop>
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 class="text-sm font-bold text-gray-900">Request to represent listing</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" aria-label="Close" @click="agentRequestOpen = false">
            <i class="las la-times text-xl"></i>
          </button>
        </div>
        <div class="px-5 py-4">
          <p v-if="agentReqError" class="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{{ agentReqError }}</p>
          <p v-if="agentReqSuccess" class="mb-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">{{ agentReqSuccess }}</p>
          <form class="space-y-3" @submit.prevent="submitAgentListingRequest">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Proposed commission % <span class="font-normal text-gray-400">(optional)</span></label>
              <input v-model.number="agentCommission" type="number" min="0" max="100" step="0.5" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="e.g. 3" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Pitch to the landlord <span class="font-normal text-gray-400">(optional)</span></label>
              <textarea v-model="agentPitch" rows="3" maxlength="2000" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Experience, marketing plan, timeline…" />
            </div>
            <div class="flex justify-end gap-2 pt-1">
              <button type="button" class="rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="agentRequestOpen = false">Cancel</button>
              <button type="submit" class="rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50" :disabled="agentReqSubmitting">
                {{ agentReqSubmitting ? 'Sending…' : 'Submit request' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Live Chat Box -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="chatOpen"
          class="fixed inset-0 z-[60] flex items-end justify-center bg-gray-900/60 p-0 sm:p-6 sm:items-center"
          @click.self="closeChat"
        >
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
            enter-to-class="translate-y-0 opacity-100 sm:scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="translate-y-0 opacity-100 sm:scale-100"
            leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="chatOpen"
              class="flex w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-xl"
              style="height: min(88vh, 620px)"
              @click.stop
            >
              <!-- Chat header -->
              <div class="flex shrink-0 items-center gap-3 rounded-t-2xl border-b border-gray-100 bg-white px-4 py-3 sm:rounded-t-xl">
                <!-- Property thumbnail -->
                <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                  <img
                    v-if="property?.images?.[0]"
                    :src="String(property.images[0])"
                    class="h-full w-full object-cover"
                    alt=""
                  />
                  <div v-else class="flex h-full w-full items-center justify-center bg-gray-100">
                    <i class="las la-building text-gray-400"></i>
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-gray-900 leading-tight">{{ property?.name || 'Property' }}</p>
                  <!-- Contact person -->
                  <div class="mt-0.5 flex items-center gap-1.5">
                    <div class="relative">
                      <img
                        v-if="propertyAgent?.avatarUrl"
                        :src="propertyAgent.avatarUrl"
                        class="h-4 w-4 rounded-full object-cover"
                        alt=""
                      />
                      <span
                        v-else
                        class="flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[8px] font-bold text-white"
                      >{{ contactInitial }}</span>
                      <span class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-green-400"></span>
                    </div>
                    <span class="truncate text-xs text-gray-500">{{ propertyAgent?.name || 'Property Owner' }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                  @click="closeChat"
                >
                  <i class="las la-times text-lg"></i>
                </button>
              </div>

              <!-- Messages area -->
              <div ref="chatScrollEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                <!-- Loading skeleton -->
                <div v-if="chatLoading" class="flex flex-col gap-3">
                  <div class="flex justify-end"><div class="h-9 w-44 animate-pulse rounded-2xl rounded-br-sm bg-primary-100"></div></div>
                  <div class="flex justify-start"><div class="h-9 w-52 animate-pulse rounded-2xl rounded-bl-sm bg-gray-100"></div></div>
                  <div class="flex justify-end"><div class="h-9 w-36 animate-pulse rounded-2xl rounded-br-sm bg-primary-100"></div></div>
                </div>

                <!-- Empty: no prior conversation -->
                <div
                  v-else-if="!chatInquiry && !chat.messages.length"
                  class="flex h-full flex-col items-center justify-center py-10 text-center"
                >
                  <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                    <i class="las la-comment-dots text-3xl text-primary-400"></i>
                  </div>
                  <p class="text-sm font-semibold text-gray-700">Start a conversation</p>
                  <p class="mt-1 max-w-[220px] text-xs text-gray-400 leading-relaxed">
                    Ask about availability, pricing, or viewings for this property.
                  </p>
                  <!-- Contact card -->
                  <div class="mt-5 flex items-center gap-3 rounded border border-gray-100 bg-gray-50 px-4 py-3 text-left w-full max-w-[260px]">
                    <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary-600 ring-2 ring-primary-100">
                      <img v-if="propertyAgent?.avatarUrl" :src="propertyAgent.avatarUrl" class="h-full w-full object-cover" alt="" />
                      <span v-else class="flex h-full w-full items-center justify-center text-sm font-bold text-white">{{ contactInitial }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-xs font-semibold text-gray-800">{{ propertyAgent?.name || 'Property Owner' }}</p>
                      <p class="text-[11px] text-gray-500">
                        <template v-if="propertyAgent?.responseTimeMinutes">
                          Responds in ~{{ propertyAgent.responseTimeMinutes }}m
                        </template>
                        <template v-else>Usually responds quickly</template>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Thread messages -->
                <template v-else>
                  <!-- Original inquiry message as first bubble -->
                  <div v-if="chatInquiry?.message" class="flex justify-end">
                    <div class="max-w-[78%]">
                      <div class="rounded-2xl rounded-br-sm bg-primary-600 px-4 py-2.5 text-sm text-white leading-relaxed shadow-sm">
                        {{ chatInquiry.message }}
                      </div>
                      <p class="mt-1 text-right text-[10px] text-gray-400">
                        {{ fmtTime(chatInquiry.createdAt) }} · inquiry
                      </p>
                    </div>
                  </div>

                  <!-- Chat message bubbles -->
                  <template v-for="(msg, idx) in chat.messages" :key="msg._id">
                    <!-- Date separator -->
                    <div v-if="showDateSep(idx)" class="flex items-center gap-2 py-1">
                      <div class="flex-1 border-t border-gray-100"></div>
                      <span class="text-[10px] font-medium text-gray-400">{{ dateSepLabel(msg.createdAt) }}</span>
                      <div class="flex-1 border-t border-gray-100"></div>
                    </div>

                    <div class="flex" :class="isOwn(msg) ? 'justify-end' : 'justify-start'">
                      <!-- Other party avatar -->
                      <div v-if="!isOwn(msg)" class="mr-2 mt-auto h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-200">
                        <img v-if="propertyAgent?.avatarUrl" :src="propertyAgent.avatarUrl" class="h-full w-full object-cover" alt="" />
                        <span v-else class="flex h-full w-full items-center justify-center text-[9px] font-bold text-gray-600">
                          {{ (msg.senderName || 'O')[0].toUpperCase() }}
                        </span>
                      </div>

                      <div class="max-w-[72%]">
                        <p v-if="!isOwn(msg)" class="mb-0.5 text-[10px] font-semibold text-gray-500">{{ msg.senderName || 'Owner' }}</p>
                        <div
                          class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm"
                          :class="isOwn(msg) ? 'rounded-br-sm bg-primary-600 text-white' : 'rounded-bl-sm bg-gray-100 text-gray-800'"
                        >
                          {{ msg.body }}
                        </div>
                        <p
                          class="mt-1 text-[10px] text-gray-400"
                          :class="isOwn(msg) ? 'text-right' : ''"
                        >{{ fmtTime(msg.createdAt) }}</p>
                      </div>
                    </div>
                  </template>
                </template>
              </div>

              <!-- Composer -->
              <div class="shrink-0 border-t border-gray-100 bg-white p-3 pb-4 sm:pb-3 rounded-b-xl">
                <p v-if="chatError" class="mb-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  <i class="las la-exclamation-circle mr-1"></i>{{ chatError }}
                </p>
                <div class="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-100">
                  <textarea
                    ref="chatComposerEl"
                    v-model="chatText"
                    rows="1"
                    placeholder="Type a message…"
                    maxlength="2000"
                    class="max-h-28 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                    @keydown.enter.exact.prevent="sendChat"
                    @input="growChatComposer"
                  ></textarea>
                  <button
                    type="button"
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition"
                    :class="chatText.trim() && !chatStarting && !chat.isSending ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
                    :disabled="!chatText.trim() || chatStarting || chat.isSending"
                    @click="sendChat"
                  >
                    <i v-if="chatStarting || chat.isSending" class="las la-circle-notch la-spin text-base"></i>
                    <i v-else class="las la-paper-plane text-base"></i>
                  </button>
                </div>
                <p class="mt-2 text-center text-[10px] text-gray-400">
                  <i class="las la-lock text-xs"></i> Messages stay within CribHub
                </p>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- Apply for Unit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="applyOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" @mousedown.self="closeApply">
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-3 sm:scale-95" enter-to-class="opacity-100 translate-y-0 sm:scale-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0 sm:scale-100" leave-to-class="opacity-0 translate-y-3 sm:scale-95">
            <div v-if="applyOpen" class="relative w-full sm:max-w-xl bg-white rounded-t sm:rounded border border-gray-200 shadow-xl flex flex-col max-h-[93dvh] sm:max-h-[88vh] overflow-hidden">

              <!-- Header -->
              <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div class="min-w-0">
                  <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 leading-none mb-0.5">Rental application</p>
                  <h2 class="text-sm font-bold text-gray-900 truncate">
                    Unit #{{ unitField(applyUnit, 'unitNumber') || '—' }}
                    <span class="font-normal text-gray-400 ml-1">· {{ property?.name }}</span>
                  </h2>
                </div>
                <button type="button" class="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition ml-3 shrink-0" @click="closeApply" aria-label="Close">
                  <i class="las la-times"></i>
                </button>
              </div>

              <!-- Unit summary bar -->
              <div class="shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-2.5">
                <div class="flex items-center gap-3">
                  <div v-if="unitCoverSrc(applyUnit)" class="h-12 w-16 shrink-0 rounded overflow-hidden border border-gray-200">
                    <img :src="unitCoverSrc(applyUnit)" alt="" class="h-full w-full object-cover" />
                  </div>
                  <div v-else class="h-12 w-16 shrink-0 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
                    <i class="las la-door-open text-xl"></i>
                  </div>
                  <div class="flex-1 min-w-0 flex flex-wrap gap-x-5 gap-y-0.5">
                    <div>
                      <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Beds / Baths</p>
                      <p class="text-xs font-semibold text-gray-800">{{ unitField(applyUnit, 'bedrooms') ?? '—' }} / {{ unitField(applyUnit, 'bathrooms') ?? '—' }}</p>
                    </div>
                    <div>
                      <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{{ unitField(applyUnit, 'listingType') === 'sale' ? 'Price' : 'Rent' }}</p>
                      <p class="text-xs font-bold text-gray-900 tabular-nums">
                        <template v-if="unitField(applyUnit, 'listingType') === 'sale'">{{ formatPrice(unitMoney(applyUnit, 'salePrice'), unitCurrency(applyUnit)) }}</template>
                        <template v-else>{{ formatPrice(unitMoney(applyUnit, 'rentAmount'), unitCurrency(applyUnit)) }}<span class="font-normal text-gray-500">/mo</span></template>
                      </p>
                    </div>
                    <div v-if="unitField(applyUnit, 'floor')">
                      <p class="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Floor</p>
                      <p class="text-xs font-semibold text-gray-800">{{ unitField(applyUnit, 'floor') }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scrollable body -->
              <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4">

                <!-- Auth gate -->
                <div v-if="!auth.isAuthenticated" class="rounded border border-amber-200 bg-amber-50 p-3 flex items-start gap-2.5">
                  <i class="las la-lock text-lg text-amber-600 shrink-0 mt-0.5"></i>
                  <div>
                    <p class="text-xs font-semibold text-amber-800 mb-0.5">Sign in required</p>
                    <p class="text-xs text-amber-700 mb-2.5">You need to be signed in as a tenant to apply.</p>
                    <NuxtLink :to="{ path: '/auth/login', query: { redirect: route.fullPath } }" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition">
                      Sign in
                    </NuxtLink>
                  </div>
                </div>

                <!-- Role gate -->
                <div v-else-if="!auth.hasRole('tenant', 'admin')" class="rounded border border-amber-200 bg-amber-50 p-3 flex items-start gap-2.5">
                  <i class="las la-user-tag text-lg text-amber-600 shrink-0 mt-0.5"></i>
                  <div>
                    <p class="text-xs font-semibold text-amber-800 mb-0.5">Tenant role required</p>
                    <p class="text-xs text-amber-700">Your account needs the <strong>tenant</strong> role to apply. Complete tenant onboarding from your dashboard.</p>
                  </div>
                </div>

                <!-- Success state -->
                <div v-else-if="applySuccess" class="text-center py-6">
                  <div class="mx-auto mb-3 w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                    <i class="las la-check-circle text-3xl text-green-500"></i>
                  </div>
                  <h3 class="text-sm font-bold text-gray-900 mb-1">Application submitted!</h3>
                  <p class="text-xs text-gray-500 mb-4">The landlord will review your application and get back to you.</p>
                  <div class="flex gap-2 justify-center">
                    <NuxtLink to="/applications" class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-700 border border-primary-300 rounded hover:bg-primary-50 transition" @click="closeApply">
                      <i class="las la-clipboard-list"></i> View my applications
                    </NuxtLink>
                    <button type="button" class="px-3 py-2 text-xs font-semibold text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition" @click="closeApply">
                      Close
                    </button>
                  </div>
                </div>

                <!-- Application form -->
                <form v-else id="apply-form" @submit.prevent="submitApply" class="space-y-4">

                  <!-- Applying as (identity row — no fields needed) -->
                  <div class="flex items-center gap-2.5 px-3 py-2.5 rounded border border-gray-300 bg-gray-50">
                    <div class="w-7 h-7 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center shrink-0">
                      <span class="text-xs font-bold text-primary-700 uppercase leading-none">
                        {{ ((auth.user as any)?.name || (auth.user as any)?.email || 'U').charAt(0) }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] text-gray-400 leading-none mb-0.5">Applying as</p>
                      <p class="text-xs font-semibold text-gray-800 truncate">
                        {{ (auth.user as any)?.name || (auth.user as any)?.onboarding?.fullName || (auth.user as any)?.email }}
                        <span v-if="(auth.user as any)?.email && ((auth.user as any)?.name || (auth.user as any)?.onboarding?.fullName)" class="font-normal text-gray-500 ml-1">· {{ (auth.user as any)?.email }}</span>
                      </p>
                    </div>
                    <NuxtLink to="/account/profile" class="shrink-0 text-[11px] text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap" @click="closeApply">Edit profile</NuxtLink>
                  </div>

                  <!-- Tenancy preferences -->
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Tenancy preferences</p>
                    <div class="grid grid-cols-2 gap-2.5">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Move-in date</label>
                        <input v-model="applyForm.moveInDate" type="date" :min="todayIso" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Occupants</label>
                        <select v-model="applyForm.occupants" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition">
                          <option value="">Select</option>
                          <option v-for="n in 8" :key="n" :value="n">{{ n }} {{ n === 1 ? 'person' : 'people' }}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Employment & income -->
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Employment & income</p>
                    <div class="grid grid-cols-2 gap-2.5">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Employer / income source</label>
                        <input v-model="applyForm.employer" type="text" placeholder="e.g. Acme Corp, self-employed" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 mb-1">Monthly income</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none select-none">{{ unitCurrency(applyUnit) }}</span>
                          <input v-model.number="applyForm.monthlyIncome" type="number" min="0" step="1" placeholder="0" class="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Cover letter -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">
                      Cover letter <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="applyForm.message" required rows="4" placeholder="Tell the landlord why you're a great fit for this unit…" class="w-full px-3 py-2.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition resize-none" />
                    <p class="text-[11px] text-gray-400 mt-0.5 text-right">{{ applyForm.message.length }} / 1000</p>
                  </div>

                  <!-- Terms -->
                  <label class="flex items-start gap-2.5 cursor-pointer select-none">
                    <input id="apply-terms" v-model="applyForm.acceptTerms" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0" />
                    <span class="text-xs text-gray-600 leading-relaxed">
                      I confirm the information is accurate and agree to the
                      <a href="/terms" target="_blank" class="text-primary-600 hover:underline font-medium">terms and conditions</a>.
                      Submission does not guarantee tenancy.
                    </span>
                  </label>

                  <p v-if="applyError" class="text-xs text-red-600 flex items-center gap-1.5">
                    <i class="las la-exclamation-circle text-base"></i>{{ applyError }}
                  </p>
                </form>
              </div>

              <!-- Footer -->
              <div v-if="auth.isAuthenticated && auth.hasRole('tenant', 'admin') && !applySuccess" class="shrink-0 border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 bg-white">
                <button type="button" class="px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition" :disabled="applySubmitting" @click="closeApply">
                  Cancel
                </button>
                <button type="submit" form="apply-form" class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded transition disabled:opacity-50 disabled:cursor-not-allowed" :disabled="applySubmitting || !applyForm.acceptTerms || !applyForm.message.trim()">
                  <i v-if="applySubmitting" class="las la-circle-notch la-spin"></i>
                  <i v-else class="las la-paper-plane"></i>
                  {{ applySubmitting ? 'Submitting…' : 'Submit application' }}
                </button>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useFavoritesStore } from '@@/stores/favorites'
import { usePropertiesStore, type PropertyAgent } from '@@/stores/properties'
import { useInquiriesStore, useChatMessagesStore } from '@@/stores/operations'
import { useRentalApplicationsStore } from '@@/stores/rentalApplications'
import { useSeo, buildListingSchema, buildBreadcrumbSchema } from '../../composables/useSeo'

const auth = useAuthStore()
const favorites = useFavoritesStore()
const properties = usePropertiesStore()
const inqStore = useInquiriesStore()
const chat = useChatMessagesStore()
const apps = useRentalApplicationsStore()

const route = useRoute()
const id = computed(() => String(route.params.id))
const { public: { siteUrl } } = useRuntimeConfig()

const FALLBACK_IMAGE = '/images/apartments/6.jpeg'

const property = computed(() => properties.selected)

useSeo(computed(() => {
  const p = property.value
  const location = [p?.city, p?.country].filter(Boolean).join(', ')
  const intentLabel = p?.intent === 'rent' ? 'for Rent' : p?.intent === 'buy' ? 'for Sale' : ''
  const title = p
    ? `${p.name || 'Property'} ${intentLabel ? `${intentLabel} ` : ''}${location ? `in ${location}` : ''}`.trim()
    : 'Property Listing'
  const bedsLabel = p?.bedrooms ? `${p.bedrooms}-bed ` : ''
  const description = p?.description
    ? p.description.slice(0, 155)
    : `${bedsLabel}${p?.propertyType || 'property'} ${intentLabel} ${location ? `in ${location}` : 'in Ghana'} — listed on CribHub.`
  const images: string[] = Array.isArray(p?.images) ? p.images : p?.coverImageUrl ? [p.coverImageUrl] : []
  return {
    title,
    description,
    image: images[0],
    type: 'website',
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        buildListingSchema(p, siteUrl as string),
        buildBreadcrumbSchema([
          { name: 'Home',       url: siteUrl as string },
          { name: 'Listings',   url: `${siteUrl}/listings` },
          { name: p?.city || 'Property', url: `${siteUrl}/listings?city=${encodeURIComponent(p?.city || '')}` },
          { name: title,        url: `${siteUrl}/properties/${id.value}` },
        ]),
      ].filter(Boolean),
    },
  }
}))

/** Assigned agent from API (`include=agent`); null if missing or invalid. */
const propertyAgent = computed((): PropertyAgent | null => {
  const a = property.value?.agent
  if (!a || typeof a !== 'object') return null
  const name = (a as PropertyAgent).name
  if (typeof name !== 'string' || !name.trim()) return null
  return a as PropertyAgent
})
const unitsOnProperty = computed(() => {
  const u = property.value?.units
  return Array.isArray(u) ? u : []
})

/** Human-readable place string for map link aria-label. */
const mapsQueryLabel = computed(() => {
  const p = property.value
  if (!p) return ''
  const parts = [p.address, p.city, p.state, p.country].filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
  return parts.join(', ')
})

/** Google Maps URL: coordinates when available, otherwise search by address. */
const googleMapsUrl = computed(() => {
  const p = property.value
  if (!p) return 'https://www.google.com/maps'
  const geo = p.geo
  if (
    geo &&
    typeof geo.lat === 'number' &&
    typeof geo.lng === 'number' &&
    Number.isFinite(geo.lat) &&
    Number.isFinite(geo.lng)
  ) {
    return `https://www.google.com/maps?q=${geo.lat},${geo.lng}`
  }
  const label = mapsQueryLabel.value.trim()
  if (!label) return 'https://www.google.com/maps'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`
})

/** Non-empty amenity labels from `property.amenities`. */
const propertyAmenities = computed((): string[] => {
  const raw = property.value?.amenities
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a): a is string => typeof a === 'string' && a.trim().length > 0)
    .map((a) => a.trim())
})

const MAX_GALLERY_IMAGES_ON_PAGE = 5

/** Full listing gallery from the API (any length); falls back to cover or placeholder when none. */
const allPropertyImages = computed((): string[] => {
  const p = property.value
  if (!p) return []
  const raw = Array.isArray(p.images) ? p.images : []
  const urls = raw.filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
  if (urls.length) return urls
  const cover = p.coverImageUrl
  if (typeof cover === 'string' && cover.trim()) return [cover.trim()]
  return [FALLBACK_IMAGE]
})

/** At most five images on the property details hero grid; use the lightbox for the full set. */
const displayImages = computed(() => allPropertyImages.value.slice(0, MAX_GALLERY_IMAGES_ON_PAGE))

const photoLightboxOpen = ref(false)
const photoLightboxIndex = ref(0)

const agentRequestOpen = ref(false)
const agentCommission = ref<number | null>(null)
const agentPitch = ref('')
const agentReqSubmitting = ref(false)
const agentReqError = ref<string | null>(null)
const agentReqSuccess = ref<string | null>(null)
const agentListingPending = ref(false)

const isOwnListingAsAgent = computed(() => {
  const lid = (property.value as any)?.landlordId
  const uid = (auth.user as any)?._id
  if (!lid || !uid) return false
  return String(lid) === String(uid)
})

const isOwnListingAsPm = computed(() => {
  const lid = (property.value as any)?.landlordId
  const uid = (auth.user as any)?._id
  if (!lid || !uid) return false
  return String(lid) === String(uid)
})

const pmAssignedHere = ref(false)
const pmRequestOpen = ref(false)
const pmMessage = ref('')
const pmReqSubmitting = ref(false)
const pmReqError = ref<string | null>(null)
const pmReqSuccess = ref<string | null>(null)
const pmListingPending = ref(false)

function openAgentListingRequest() {
  agentReqError.value = null
  agentReqSuccess.value = null
  agentCommission.value = null
  agentPitch.value = ''
  agentRequestOpen.value = true
}

async function refreshAgentListingPending() {
  if (!auth.isAuthenticated || !auth.hasRole('agent') || !id.value) {
    agentListingPending.value = false
    return
  }
  try {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('agent-listing-requests').find({
      query: { propertyId: id.value, status: 'pending', $limit: 1 }
    })
    const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
    agentListingPending.value = rows.length > 0
  } catch {
    agentListingPending.value = false
  }
}

function openPmListingRequest() {
  pmReqError.value = null
  pmReqSuccess.value = null
  pmMessage.value = ''
  pmRequestOpen.value = true
}

async function refreshPmListingState() {
  pmListingPending.value = false
  pmAssignedHere.value = false
  if (!auth.isAuthenticated || !auth.hasRole('property_manager') || !id.value) return
  try {
    const feathers = useNuxtApp().$feathers as any
    const [pendingRes, assignRes] = await Promise.all([
      feathers.service('property-manager-listing-requests').find({
        query: { propertyId: id.value, status: 'pending', $limit: 1 }
      }),
      feathers.service('property-manager-assignments').find({
        query: { propertyId: id.value, $limit: 1 }
      })
    ])
    const pendRows = Array.isArray(pendingRes?.data) ? pendingRes.data : Array.isArray(pendingRes) ? pendingRes : []
    const assignRows = Array.isArray(assignRes?.data) ? assignRes.data : Array.isArray(assignRes) ? assignRes : []
    pmListingPending.value = pendRows.length > 0
    pmAssignedHere.value = assignRows.length > 0
  } catch {
    pmListingPending.value = false
    pmAssignedHere.value = false
  }
}

async function submitPmListingRequest() {
  pmReqError.value = null
  pmReqSuccess.value = null
  pmReqSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const payload: Record<string, any> = { propertyId: id.value }
    if (pmMessage.value.trim()) payload.message = pmMessage.value.trim()
    await feathers.service('property-manager-listing-requests').create(payload)
    pmReqSuccess.value = 'Request sent. The landlord will be notified.'
    pmListingPending.value = true
    setTimeout(() => {
      pmRequestOpen.value = false
      pmReqSuccess.value = null
    }, 1600)
  } catch (e: any) {
    pmReqError.value = e?.message || 'Could not submit request'
  } finally {
    pmReqSubmitting.value = false
  }
}

async function submitAgentListingRequest() {
  agentReqError.value = null
  agentReqSuccess.value = null
  agentReqSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const payload: Record<string, any> = { propertyId: id.value }
    if (agentCommission.value != null && Number.isFinite(Number(agentCommission.value))) {
      payload.commissionPercent = Number(agentCommission.value)
    }
    if (agentPitch.value.trim()) payload.message = agentPitch.value.trim()
    await feathers.service('agent-listing-requests').create(payload)
    agentReqSuccess.value = 'Request sent. The landlord will be notified.'
    agentListingPending.value = true
    setTimeout(() => {
      agentRequestOpen.value = false
      agentReqSuccess.value = null
    }, 1600)
  } catch (e: any) {
    agentReqError.value = e?.message || 'Could not submit request'
  } finally {
    agentReqSubmitting.value = false
  }
}

function openPhotoLightbox(index = 0) {
  const all = allPropertyImages.value
  if (!all.length) return
  photoLightboxIndex.value = Math.min(Math.max(0, index), all.length - 1)
  photoLightboxOpen.value = true
}

function onPhotoLightboxHide() {
  photoLightboxOpen.value = false
}

function galleryThumbSrc(index: number) {
  const u = displayImages.value[index]
  return typeof u === 'string' ? u : ''
}

type UnitRow = Record<string, unknown>

function asUnit(u: unknown): UnitRow {
  return u && typeof u === 'object' ? (u as UnitRow) : {}
}

const AMENITY_ICON_ROTATION = [
  'las la-couch',
  'las la-swimming-pool',
  'las la-parking',
  'las la-shield-alt',
  'las la-dumbbell',
  'las la-utensils',
  'las la-concierge-bell',
  'las la-leaf',
  'las la-fan',
  'las la-door-open',
  'las la-hamburger',
  'las la-gamepad',
  'las la-swimmer',
  'las la-walking'
]

function amenityIconClass(label: string, index: number): string {
  const t = label.toLowerCase()
  if (/(pool|swim)/.test(t)) return 'las la-swimming-pool'
  if (/(barbecue|bbq|grill)/.test(t)) return 'las la-hamburger'
  if (/(park|garage|parking)/.test(t)) return 'las la-parking'
  if (/(gym|fitness)/.test(t)) return 'las la-dumbbell'
  if (/(security|gate|fence|cctv|24h)/.test(t)) return 'las la-shield-alt'
  if (/(elevator|lift)/.test(t)) return 'las la-angle-double-up'
  if (/(generator|power|backup)/.test(t)) return 'las la-bolt'
  if (/(^ac\b|\bac\b|air cond|hvac|cool)/.test(t)) return 'las la-fan'
  if (/(furnish|furniture)/.test(t)) return 'las la-couch'
  if (/(kitchen|appliance)/.test(t)) return 'las la-utensils'
  if (/(balcony|terrace|deck|patio)/.test(t)) return 'las la-door-open'
  if (/(concierge|reception|lobby)/.test(t)) return 'las la-concierge-bell'
  if (/(garden|lawn|irrigation|plant)/.test(t)) return 'las la-leaf'
  if (/(wifi|wi-fi|fibre|fiber|internet)/.test(t)) return 'las la-wifi'
  if (/(water|borehole|storage)/.test(t)) return 'las la-tint'
  if (/(pet)/.test(t)) return 'las la-paw'
  if (/(play|children|kid)/.test(t)) return 'las la-gamepad'
  return AMENITY_ICON_ROTATION[index % AMENITY_ICON_ROTATION.length] ?? 'las la-couch'
}

function unitRowId(u: unknown): string {
  const id = asUnit(u)._id
  return id != null ? String(id) : ''
}

function unitField(u: unknown, key: string): string | number | undefined {
  const v = asUnit(u)[key]
  if (typeof v === 'string' || typeof v === 'number') return v
  return undefined
}

function unitMoney(u: unknown, field: 'rentAmount' | 'salePrice'): number | undefined {
  const n = asUnit(u)[field]
  return typeof n === 'number' ? n : undefined
}

function unitCurrency(u: unknown): string | undefined {
  const c = asUnit(u).rentCurrency
  return typeof c === 'string' ? c : undefined
}

function unitCoverSrc(u: unknown): string {
  const imgs = asUnit(u).images
  if (!Array.isArray(imgs) || !imgs.length) return ''
  const first = imgs[0]
  return typeof first === 'string' && first.trim() ? first.trim() : ''
}

function unitListingLabel(u: unknown): string | null {
  const lt = asUnit(u).listingType
  if (lt === 'sale') return 'For sale'
  if (lt === 'rental') return 'For rent'
  return null
}

function unitStatusPillClass(u: unknown): string {
  const s = String(asUnit(u).status ?? '').toLowerCase()
  if (s === 'vacant') return 'text-emerald-900 bg-emerald-50 ring-emerald-100'
  if (s === 'occupied') return 'text-gray-700 bg-white ring-gray-200'
  if (s === 'maintenance') return 'text-amber-900 bg-amber-50 ring-amber-100'
  return 'text-gray-600 bg-gray-100 ring-gray-200'
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await properties.fetchById(id.value, ['units', 'agent'])
  if (auth.isAuthenticated) {
    try {
      await favorites.syncFavoriteIds()
    } catch {
      /* ignore */
    }
    await refreshAgentListingPending()
    await refreshPmListingState()
    if (auth.hasRole('tenant', 'admin')) {
      void apps.fetchList({})
    }
  }
})

watch(
  () => id.value,
  () => {
    void refreshAgentListingPending()
    void refreshPmListingState()
  }
)

async function toggleFavorite() {
  if (!auth.isAuthenticated) {
    await navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  await favorites.toggle(id.value)
}

function formatPrice(price?: number, currency?: string) {
  if (typeof price !== 'number') return '$—'
  const symbol = currency === 'GHS' ? '₵' : currency === 'EUR' ? '€' : '$'
  return `${symbol}${price.toLocaleString()}`
}

async function requireAuth(_action: 'call' | 'email' | 'whatsapp') {
  if (!auth.isAuthenticated) await navigateTo('/auth/login')
}

// ── Apply for Unit Modal ────────────────────────────────────────────────────
const applyOpen = ref(false)
const applyUnit = ref<any>(null)
const applySuccess = ref(false)
const applySubmitting = ref(false)
const applyError = ref<string | null>(null)
const todayIso = new Date().toISOString().split('T')[0]

/** Unit IDs the current tenant already has a pending or approved application for */
const appliedUnitIds = computed(() => {
  const s = new Set<string>()
  for (const a of apps.list as any[]) {
    if (a.status === 'pending' || a.status === 'approved') {
      s.add(String(a.unitId))
    }
  }
  return s
})

function unitApplyStatus(unit: any): 'approved' | 'pending' | null {
  const uid = String(unitRowId(unit))
  for (const a of apps.list as any[]) {
    if (String(a.unitId) === uid) {
      if (a.status === 'approved') return 'approved'
      if (a.status === 'pending') return 'pending'
    }
  }
  return null
}

const applyForm = reactive({
  moveInDate: '',
  occupants: '' as string | number,
  employer: '',
  monthlyIncome: null as number | null,
  message: '',
  acceptTerms: false,
})

function openApply(unit: any) {
  applyUnit.value = unit
  applySuccess.value = false
  applyError.value = null
  applySubmitting.value = false
  applyForm.moveInDate = ''
  applyForm.occupants = ''
  applyForm.employer = (auth.user as any)?.onboarding?.employer || ''
  applyForm.monthlyIncome = null
  applyForm.message = ''
  applyForm.acceptTerms = false
  applyOpen.value = true
}

function closeApply() {
  if (applySubmitting.value) return
  applyOpen.value = false
}

async function submitApply() {
  if (!applyUnit.value) return
  applyError.value = null
  applySubmitting.value = true
  try {
    await apps.createApplication({
      unitId: String(unitRowId(applyUnit.value)),
      applicationData: {
        fullName: (auth.user as any)?.name || (auth.user as any)?.onboarding?.fullName || (auth.user as any)?.email || '',
        phone: (auth.user as any)?.onboarding?.phone || '',
        moveInDate: applyForm.moveInDate || undefined,
        occupants: applyForm.occupants || undefined,
        employer: applyForm.employer.trim(),
        monthlyIncome: applyForm.monthlyIncome || undefined,
        message: applyForm.message.trim(),
      },
    })
    applySuccess.value = true
  } catch (e: any) {
    applyError.value = e?.message || 'Failed to submit application. Please try again.'
  } finally {
    applySubmitting.value = false
  }
}

// ── In-app Chat Box ────────────────────────────────────────────────────────
const chatOpen = ref(false)
const chatLoading = ref(false)
const chatInquiry = ref<any>(null)
const chatError = ref<string | null>(null)
const chatText = ref('')
const chatStarting = ref(false)
const chatScrollEl = ref<HTMLElement | null>(null)
const chatComposerEl = ref<HTMLTextAreaElement | null>(null)

const myUserId = computed(() => String((auth.user as any)?._id || ''))

const contactInitial = computed(() => {
  const name = propertyAgent.value?.name || 'O'
  return name[0].toUpperCase()
})

async function openInquiry() {
  if (!auth.isAuthenticated) {
    await navigateTo({ path: '/auth/login', query: { redirect: route.fullPath } })
    return
  }
  void reqPerm() // ask for browser notification permission once
  chatError.value = null
  chatOpen.value = true
  chatLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const uid = myUserId.value
    if (uid) {
      const res = await feathers.service('inquiries').find({
        query: { propertyId: id.value, createdByUserId: uid, $limit: 1, $sort: { createdAt: -1 } }
      })
      const list = Array.isArray(res) ? res : res?.data ?? []
      if (list[0]) {
        chatInquiry.value = list[0]
        await chat.openThread(String(list[0]._id))
      }
    }
  } catch { /* ignore — user will start fresh */ }
  finally {
    chatLoading.value = false
    scrollChatToBottom()
  }
}

function closeChat() {
  chatOpen.value = false
  chat.closeThread()
  chatInquiry.value = null
  chatText.value = ''
  chatError.value = null
}

async function sendChat() {
  if (!chatText.value.trim()) return
  chatError.value = null
  const body = chatText.value.trim()
  chatText.value = ''
  if (chatComposerEl.value) chatComposerEl.value.style.height = 'auto'

  if (!chatInquiry.value) {
    // First message — create the inquiry
    chatStarting.value = true
    try {
      const payload: Record<string, any> = {
        propertyId: id.value,
        message: body,
        contactMethod: 'message' as const,
      }
      // Pre-fill sender details from auth profile silently
      const user = auth.user as any
      if (user?.fullName) payload.name = user.fullName
      if (user?.email) payload.email = user.email
      if (user?.phone) payload.phone = user.phone

      const inquiry = await inqStore.create(payload)
      chatInquiry.value = inquiry
      await chat.openThread(String(inquiry._id))
    } catch (e: any) {
      chatError.value = e?.message || 'Failed to start conversation.'
      chatText.value = body // restore text so user can retry
    } finally {
      chatStarting.value = false
      scrollChatToBottom()
    }
  } else {
    await chat.sendMessage(body)
    scrollChatToBottom()
  }
}

function growChatComposer(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 112)}px`
}

function scrollChatToBottom() {
  nextTick(() => {
    if (chatScrollEl.value) chatScrollEl.value.scrollTop = chatScrollEl.value.scrollHeight
  })
}

// Auto-scroll when new messages arrive
watch(() => chat.messages.length, () => { if (chatOpen.value) scrollChatToBottom() })

// Notify on incoming messages (not sent by current user)
const { notify, requestNotifPermission: reqPerm } = useMessageNotifier()
watch(() => chat.messages.length, (newLen, oldLen) => {
  if (!chatOpen.value || newLen <= (oldLen ?? 0)) return
  const last = chat.messages[newLen - 1]
  if (!last || String(last.senderUserId) === myUserId.value) return
  notify({
    senderName: last.senderName || propertyAgent.value?.name || 'Property Owner',
    body: last.body,
    avatarUrl: propertyAgent.value?.avatarUrl,
    propertyName: property.value?.name,
    href: '/messages',
  })
})

function isOwn(msg: any) {
  return String(msg?.senderUserId) === myUserId.value
}

function showDateSep(idx: number): boolean {
  if (idx === 0) return true
  const curr = chat.messages[idx]?.createdAt
  const prev = chat.messages[idx - 1]?.createdAt
  if (!curr || !prev) return false
  return new Date(curr).toDateString() !== new Date(prev).toDateString()
}

function dateSepLabel(iso: string): string {
  try {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

onBeforeUnmount(() => { chat.closeThread() })
</script>

