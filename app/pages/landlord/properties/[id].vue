<template>
  <div>
    <!-- Breadcrumb + actions -->
    <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <NuxtLink to="/landlord/properties" class="inline-flex items-center text-xs font-medium text-gray-500 hover:text-primary-600">
          <i class="las la-arrow-left mr-1"></i>{{ backToListLabel }}
        </NuxtLink>
        <h1 class="mt-1 text-xl font-bold tracking-tight text-gray-900">
          {{ properties.selected?.name || 'Manage property' }}
        </h1>
      </div>
      <div class="flex gap-2">
        <NuxtLink
          :to="`/properties/${id}`"
          class="inline-flex items-center rounded border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <i class="las la-external-link-alt mr-1"></i>Public listing
        </NuxtLink>
        <button
          v-if="canDestroyPortfolio"
          type="button"
          class="inline-flex items-center rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          :disabled="deleting"
          @click="removeProperty"
        >
          <i class="las la-trash mr-1"></i>{{ deleting ? 'Removing…' : 'Delete' }}
        </button>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="pageError" class="mb-4 flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <i class="las la-exclamation-circle mt-0.5 text-red-500"></i><span>{{ pageError }}</span>
    </div>
    <div v-if="saveSuccess" class="mb-4 flex items-start gap-2 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
      <i class="las la-check-circle mt-0.5 text-emerald-600"></i><span>Saved successfully.</span>
    </div>

    <!-- Role context banner for PM / Agent viewing a landlord's property -->
    <div
      v-if="roleContextBanner"
      class="mb-4 flex flex-wrap items-start gap-3 rounded border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-900"
    >
      <i :class="`${roleContextBanner.icon} mt-0.5 text-base text-primary-600`"></i>
      <div class="flex-1 min-w-0">
        <div class="font-semibold">{{ roleContextBanner.title }}</div>
        <div class="text-xs text-primary-800/90">{{ roleContextBanner.body }}</div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-if="roleContextBanner.messageThreadId || roleContextBanner.openMessageHandler"
          type="button"
          class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-100"
          @click="openRoleContextMessage"
        >
          <i class="las la-comment-dots"></i> Message landlord
        </button>
        <NuxtLink
          v-if="roleContextBanner.profileLink"
          :to="roleContextBanner.profileLink"
          class="inline-flex items-center gap-1 rounded bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 ring-1 ring-primary-200 transition hover:bg-primary-100"
        >
          <i class="las la-user-cog"></i> My profile
        </NuxtLink>
      </div>
    </div>

    <div v-if="properties.isLoading && !properties.selected" class="space-y-4">
      <div class="h-48 animate-pulse rounded border border-gray-200 bg-white" />
      <div class="h-48 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <template v-else-if="properties.selected">
      <!-- Tab navigation -->
      <div class="mb-5 flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="rounded px-4 py-2 transition"
          :class="activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
          @click="activeTab = tab.id"
        >
          <i :class="`${tab.icon} mr-1`"></i>{{ tab.label }}
        </button>
      </div>

      <!-- ── TAB: Details ── -->
      <div v-show="activeTab === 'details'">
        <form class="space-y-4" @submit.prevent="saveProperty">
          <!-- Listing info -->
          <div class="compact-card rounded bg-white p-5">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600"><i class="las la-tag text-xs text-white"></i></div>
              <h2 class="text-sm font-semibold text-gray-900">Listing info</h2>
            </div>
            <div class="space-y-3">
              <div>
                <label class="field-label">Listing label</label>
                <input v-model="edit.listingLabel" placeholder="e.g. APARTMENT FOR RENT IN EAST LEGON" class="field-input" />
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="field-label">Property name</label>
                  <input v-model="edit.name" class="field-input" />
                </div>
                <div>
                  <label class="field-label">Sub-title</label>
                  <input v-model="edit.title" placeholder="e.g. Fully Furnished" class="field-input" />
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="field-label">Property type</label>
                  <select v-model="edit.propertyType" class="field-input">
                    <option>Apartment</option><option>House</option><option>Villa</option>
                    <option>Townhouse</option><option>Duplex</option><option>Penthouse</option>
                    <option>Land</option><option>Commercial</option><option>Mixed-use</option>
                  </select>
                </div>
                <div>
                  <label class="field-label">Listing type</label>
                  <select v-model="edit.listingType" class="field-input">
                    <option value="rent">For rent</option><option value="buy">For sale</option>
                    <option value="commercial">Commercial</option><option value="new">New build</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="field-label">Description</label>
                <textarea v-model="edit.description" rows="4" class="field-input" />
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="compact-card rounded bg-white p-5">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-blue-600"><i class="las la-map-marker text-xs text-white"></i></div>
              <h2 class="text-sm font-semibold text-gray-900">Location</h2>
            </div>
            <div class="space-y-3">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="field-label">Street address</label>
                  <UiAddressAutocomplete
                    v-model="edit.address"
                    placeholder="Search address…"
                    @place-selected="onPlaceSelected"
                  />
                  <p class="mt-0.5 text-xs text-gray-400">Select from the dropdown to auto-fill location fields.</p>
                </div>
                <div>
                  <label class="field-label">Building name</label>
                  <input v-model="edit.buildingName" placeholder="e.g. Tower 108" class="field-input" />
                </div>
                <div>
                  <label class="field-label">Area / District</label>
                  <input v-model="edit.area" placeholder="e.g. Spintex" class="field-input" />
                </div>
                <div>
                  <label class="field-label">Neighbourhood</label>
                  <input v-model="edit.neighborhood" class="field-input" />
                </div>
                <div>
                  <label class="field-label">Postal code</label>
                  <input v-model="edit.postalCode" class="field-input" />
                </div>
              </div>

              <!-- City / Region / Country — from Google Maps -->
              <div class="sm:col-span-2">
                <div class="mb-1.5 flex items-center justify-between">
                  <label class="field-label mb-0">City · Region · Country</label>
                  <button type="button" class="text-xs text-primary-600 hover:underline" @click="manualGeo = !manualGeo">
                    <i :class="manualGeo ? 'las la-lock-open' : 'las la-pen'" class="mr-0.5"></i>
                    {{ manualGeo ? 'Use map values' : 'Edit manually' }}
                  </button>
                </div>

                <!-- Chip display -->
                <div v-if="!manualGeo">
                  <div
                    v-if="edit.city || edit.state || edit.country"
                    class="flex flex-wrap items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2.5"
                  >
                    <i class="las la-map-marker text-emerald-600 shrink-0"></i>
                    <span v-if="edit.city" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <i class="las la-city mr-0.5 text-emerald-500"></i>{{ edit.city }}
                    </span>
                    <span v-if="edit.state" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <i class="las la-map mr-0.5 text-emerald-500"></i>{{ edit.state }}
                    </span>
                    <span v-if="edit.country" class="rounded bg-white border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <i class="las la-globe mr-0.5 text-emerald-500"></i>{{ edit.country }}
                    </span>
                    <span class="ml-auto text-xs text-emerald-600 flex items-center gap-0.5">
                      <i class="las la-check-circle"></i> from Google Maps
                    </span>
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-2 rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-3 text-xs text-gray-400"
                  >
                    <i class="las la-map-marker text-lg text-gray-300"></i>
                    <span>Search a new address above to update city, region and country.</span>
                  </div>
                </div>

                <!-- Manual override -->
                <div v-else class="grid gap-2 sm:grid-cols-3">
                  <div>
                    <label class="mb-1 block text-xs text-gray-500">City</label>
                    <input v-model="edit.city" class="field-input" />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-gray-500">Region / State</label>
                    <input v-model="edit.state" class="field-input" />
                  </div>
                  <div>
                    <label class="mb-1 block text-xs text-gray-500">Country</label>
                    <input v-model="edit.country" class="field-input" />
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="field-label">Latitude</label>
                  <input v-model.number="edit.geoLat" type="number" step="any" class="field-input bg-gray-50 font-mono text-xs" />
                </div>
                <div>
                  <label class="field-label">Longitude</label>
                  <input v-model.number="edit.geoLng" type="number" step="any" class="field-input bg-gray-50 font-mono text-xs" />
                </div>
              </div>
              <!-- Mini map preview -->
              <div v-if="edit.geoLat && edit.geoLng" class="overflow-hidden rounded border border-gray-200">
                <iframe
                  :src="`https://www.google.com/maps?q=${edit.geoLat},${edit.geoLng}&z=16&output=embed`"
                  class="h-40 w-full border-0"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          <!-- Property details -->
          <div class="compact-card rounded bg-white p-5">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-violet-600"><i class="las la-home text-xs text-white"></i></div>
              <h2 class="text-sm font-semibold text-gray-900">Property details</h2>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div><label class="field-label">Bedrooms</label><input v-model.number="edit.bedrooms" type="number" min="0" class="field-input" /></div>
              <div><label class="field-label">Bathrooms</label><input v-model.number="edit.bathrooms" type="number" min="0" class="field-input" /></div>
              <div><label class="field-label">Total units</label><input v-model.number="edit.totalUnits" type="number" min="1" class="field-input" /></div>
              <div><label class="field-label">Size (sq ft)</label><input v-model.number="edit.sizeSqft" type="number" min="0" class="field-input" /></div>
              <div><label class="field-label">Size (sq m)</label><input v-model.number="edit.sizeSqm" type="number" min="0" class="field-input" /></div>
              <div><label class="field-label">Age (years)</label><input v-model.number="edit.propertyAgeYears" type="number" min="0" class="field-input" /></div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="compact-card rounded bg-white p-5">
            <div class="mb-4 flex items-center gap-2">
              <div class="flex h-6 w-6 items-center justify-center rounded bg-emerald-600"><i class="las la-tag text-xs text-white"></i></div>
              <h2 class="text-sm font-semibold text-gray-900">Pricing</h2>
            </div>
            <div class="space-y-3">
              <div class="grid gap-3 sm:grid-cols-3">
                <div><label class="field-label">Price</label><input v-model.number="edit.price" type="number" min="0" class="field-input" /></div>
                <div>
                  <label class="field-label">Currency</label>
                  <select v-model="edit.priceCurrency" class="field-input"><option>GHS</option><option>USD</option><option>EUR</option><option>GBP</option></select>
                </div>
                <div>
                  <label class="field-label">Period</label>
                  <select v-model="edit.pricePeriod" class="field-input">
                    <option value="month">Per month</option><option value="year">Per year</option>
                    <option value="week">Per week</option><option value="day">Per day</option>
                  </select>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div><label class="field-label">Est. mortgage (monthly)</label><input v-model.number="edit.estimatedMortgageMonthly" type="number" min="0" class="field-input" /></div>
                <div>
                  <label class="field-label">Mortgage currency</label>
                  <select v-model="edit.mortgageCurrency" class="field-input"><option>GHS</option><option>USD</option></select>
                </div>
              </div>
              <div><label class="field-label">Price trends note</label><input v-model="edit.priceTrendsNote" placeholder="e.g. Prices in this area rose 8% last year" class="field-input" /></div>
            </div>
          </div>

          <div class="flex gap-2 pb-4">
            <button type="submit" class="rounded bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50" :disabled="savingProp">
              {{ savingProp ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- ── TAB: Amenities ── -->
      <div v-show="activeTab === 'amenities'" class="compact-card rounded bg-white p-5">
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded bg-amber-600"><i class="las la-list-alt text-xs text-white"></i></div>
            <h2 class="text-sm font-semibold text-gray-900">Amenities</h2>
          </div>
          <button
            type="button"
            class="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="savingAmenities"
            @click="saveAmenities"
          >
            {{ savingAmenities ? 'Saving…' : 'Save amenities' }}
          </button>
        </div>
        <UiTagInput v-model="edit.amenities" placeholder="e.g. Swimming pool" :show-suggestions="true" />
        <p v-if="amenitiesSaved" class="mt-3 text-xs text-emerald-600"><i class="las la-check-circle mr-1"></i>Amenities saved.</p>
      </div>

      <!-- ── TAB: Images ── -->
      <div v-show="activeTab === 'images'" class="compact-card rounded bg-white p-5">
        <div class="mb-4 flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-blue-600"><i class="las la-images text-xs text-white"></i></div>
          <h2 class="text-sm font-semibold text-gray-900">Property photos</h2>
        </div>
        <p class="mb-4 text-xs text-gray-500">Upload high-quality photos. The first image is used as the cover photo on listings.</p>
        <UiImageUploader
          entity-type="properties"
          :entity-id="id"
          :images="edit.images"
          @update:images="onImagesUpdate"
        />
        <div v-if="edit.images.length" class="mt-4 flex justify-end">
          <button
            type="button"
            class="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="savingImages"
            @click="saveImageOrder"
          >
            {{ savingImages ? 'Saving…' : 'Save order / removals' }}
          </button>
        </div>
      </div>

      <!-- ── TAB: Units ── -->
      <div v-show="activeTab === 'units'">
        <div class="compact-card rounded bg-white">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">
              Units
              <span class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{{ units.length }}</span>
            </h2>
            <button type="button" class="inline-flex items-center rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700" @click="openNewUnit">
              <i class="las la-plus mr-1"></i>Add unit
            </button>
          </div>
          <div v-if="unitsLoading" class="p-4 text-center text-sm text-gray-500"><i class="las la-spinner animate-spin mr-1"></i>Loading…</div>
          <div v-else-if="!units.length" class="p-8 text-center">
            <i class="las la-layer-group mb-2 block text-4xl text-gray-200"></i>
            <p class="text-sm font-medium text-gray-700">No units yet</p>
            <p class="mt-0.5 text-xs text-gray-500">Add units so tenants can apply.</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div v-for="u in units" :key="String(u._id)" class="flex items-start gap-3 px-4 py-3">
              <!-- Unit image -->
              <div class="h-12 w-12 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                <img v-if="u.images?.[0]" :src="u.images[0]" alt="" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">{{ u.unitNumber }}</div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900">Unit #{{ u.unitNumber }}</p>
                <p class="text-xs text-gray-500">
                  {{ u.bedrooms }}bd · {{ u.bathrooms }}ba
                  <span v-if="u.squareFeet"> · {{ u.squareFeet }} sq ft</span>
                  <span v-if="u.rentAmount"> · {{ u.rentCurrency || 'GHS' }} {{ u.rentAmount?.toLocaleString() }}/mo</span>
                </p>
                <p v-if="u.listingType === 'sale' && u.salePrice" class="text-xs text-primary-700">
                  Sale: {{ u.rentCurrency || 'GHS' }} {{ u.salePrice?.toLocaleString() }}
                  <span v-if="u.mortgageEligible" class="ml-1 text-emerald-600">· Mortgage eligible</span>
                </p>
                <p v-if="u.leaseEnd" class="text-xs text-gray-400">Lease ends: {{ new Date(u.leaseEnd).toLocaleDateString() }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <span class="rounded px-2 py-0.5 text-xs font-medium capitalize" :class="unitStatusClass(u.status)">{{ u.status }}</span>
                <button type="button" class="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" @click="editUnit(u)">
                  <i class="las la-pen"></i>
                </button>
                <NuxtLink v-if="u.status === 'vacant'" :to="`/apply/${u._id}`" class="rounded border border-primary-200 px-2 py-1 text-xs text-primary-700 hover:bg-primary-50">
                  Apply
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TAB: Summary ── -->
      <!-- ── TAB: Agent & commissions ── -->
      <div v-show="activeTab === 'agent'" class="space-y-4">
        <div v-if="agentTabError" class="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <i class="las la-exclamation-circle mr-1.5"></i>{{ agentTabError }}
        </div>

        <!-- Incoming requests -->
        <div class="compact-card rounded bg-white">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
            <div class="flex items-center gap-2">
              <i class="las la-inbox text-sm text-primary-600"></i>
              <h2 class="text-sm font-semibold text-gray-900">Incoming requests</h2>
            </div>
            <span
              v-if="!agentTabLoading && incomingAgentRequests.length"
              class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
              {{ incomingAgentRequests.length }} pending
            </span>
          </div>
          <div class="p-4">
            <p class="mb-3 text-xs text-gray-500">Agents who want to represent this listing. Accept or decline below, or open a profile for full details.</p>
            <div v-if="agentTabLoading" class="flex items-center gap-2 py-6 text-sm text-gray-500">
              <i class="las la-spinner animate-spin text-primary-600"></i> Loading agent activity…
            </div>
            <div v-else-if="!incomingAgentRequests.length" class="rounded border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
              <i class="las la-user-clock mb-1.5 block text-2xl text-gray-300"></i>
              <p class="text-sm font-medium text-gray-700">No pending requests</p>
              <p class="mt-0.5 text-xs text-gray-500">When an agent requests this listing, their card will appear here.</p>
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="r in incomingAgentRequests"
                :key="String(r._id)"
                class="rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex min-w-0 gap-3">
                    <button
                      type="button"
                      class="shrink-0"
                      :title="'View ' + (getAgentProfile(r.agentUserId)?.displayName || 'agent') + ' profile'"
                      @click="openAgentDetail(String(r.agentUserId), { request: r })"
                    >
                      <img
                        v-if="getAgentProfile(r.agentUserId)?.avatarUrl"
                        :src="getAgentProfile(r.agentUserId).avatarUrl"
                        :alt="getAgentProfile(r.agentUserId)?.displayName || 'Agent'"
                        class="h-12 w-12 rounded object-cover"
                      />
                      <span v-else class="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-gray-400">
                        <i class="las la-user text-2xl"></i>
                      </span>
                    </button>
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <p class="text-sm font-semibold text-gray-900">{{ getAgentProfile(r.agentUserId)?.displayName || 'Agent' }}</p>
                        <span
                          v-if="getAgentProfile(r.agentUserId)?.verified"
                          class="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
                        >
                          <i class="las la-check-circle"></i> Verified
                        </span>
                      </div>
                      <p v-if="getAgentProfile(r.agentUserId)?.agency" class="text-xs text-gray-500">
                        {{ getAgentProfile(r.agentUserId).agency }}
                      </p>
                      <div class="mt-1.5 flex flex-wrap gap-1.5">
                        <span
                          v-if="r.status === 'countered'"
                          class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-800"
                        >Countered</span>
                        <span
                          v-if="r.commissionPercent != null && !r.proposal"
                          class="rounded bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-800"
                        >
                          <i class="las la-percent"></i>{{ r.commissionPercent }}% proposed
                        </span>
                      </div>
                      <div class="mt-2 grid gap-1.5 sm:grid-cols-2">
                        <div v-if="r.proposal" class="rounded border border-primary-100 bg-primary-50/40 px-2.5 py-1.5 text-xs">
                          <p class="font-semibold text-primary-800"><i class="las la-arrow-down text-primary-600"></i> Their proposal</p>
                          <p class="mt-0.5 text-primary-700">{{ summarizeProposal(r.proposal) }}</p>
                        </div>
                        <div v-if="r.counter" class="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs">
                          <p class="font-semibold text-amber-800"><i class="las la-arrow-up text-amber-600"></i> Your counter</p>
                          <p class="mt-0.5 text-amber-800">{{ summarizeProposal(r.counter) }}</p>
                        </div>
                      </div>
                      <p
                        v-if="r.message"
                        class="mt-2 rounded border border-gray-100 bg-white px-2.5 py-1.5 text-xs italic text-gray-700"
                      >"{{ r.message }}"</p>
                      <button
                        type="button"
                        class="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
                        @click="openAgentDetail(String(r.agentUserId), { request: r })"
                      >
                        View full profile <i class="las la-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2 sm:w-32 sm:flex-col">
                    <button
                      type="button"
                      class="flex-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                      :disabled="requestActionId === String(r._id)"
                      @click="decideAgentRequest(r, 'accepted')"
                    >
                      <i class="las la-check mr-0.5"></i> Accept
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 sm:flex-none"
                      :disabled="requestActionId === String(r._id)"
                      @click="openCounterEditor('agent', r)"
                    >
                      <i class="las la-handshake mr-0.5"></i> Counter
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                      @click="startThreadFromAgentRequest(r)"
                    >
                      <i class="las la-comment mr-0.5"></i> Message
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                      :disabled="requestActionId === String(r._id)"
                      @click="decideAgentRequest(r, 'rejected')"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Assigned agents -->
        <div class="compact-card rounded bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <i class="las la-user-tie text-sm text-gray-600"></i>
            <h2 class="text-sm font-semibold text-gray-900">Assigned agents</h2>
          </div>
          <div class="p-4">
            <p class="mb-3 text-xs text-gray-500">Active representation on this property.</p>
            <div
              v-if="!assignments.length"
              class="rounded border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500"
            >
              No agents assigned yet.
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="a in assignments"
                :key="String(a._id)"
                class="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <img
                    v-if="getAgentProfile(a.agentUserId)?.avatarUrl"
                    :src="getAgentProfile(a.agentUserId).avatarUrl"
                    :alt="getAgentProfile(a.agentUserId)?.displayName || 'Agent'"
                    class="h-10 w-10 shrink-0 rounded object-cover"
                  />
                  <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
                    <i class="las la-user text-xl"></i>
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ getAgentProfile(a.agentUserId)?.displayName || 'Agent' }}
                    </p>
                    <p v-if="getAgentProfile(a.agentUserId)?.agency" class="truncate text-xs text-gray-500">
                      {{ getAgentProfile(a.agentUserId).agency }}
                    </p>
                    <p v-if="a.commissionPercent != null" class="text-xs text-gray-500">{{ a.commissionPercent }}% commission</p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    class="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                    @click="openAgentDetail(String(a.agentUserId), { assignment: a })"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    class="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    :disabled="removingAssignmentId === String(a._id)"
                    @click="removeAssignment(a)"
                  >
                    Remove
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Assign form -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-1 text-sm font-semibold text-gray-900">Assign an agent</h2>
          <p class="mb-4 text-xs text-gray-500">Choose a profile and optional commission — or wait for incoming requests above.</p>
          <div class="grid max-w-lg gap-3">
            <div>
              <label class="field-label">Agent</label>
              <select v-model="assignForm.agentUserId" class="field-input">
                <option value="">Select agent…</option>
                <option v-for="p in agentProfiles" :key="String(p._id)" :value="p.userId">
                  {{ p.displayName }} ({{ p.userId }})
                </option>
              </select>
            </div>
            <div>
              <label class="field-label">Commission % (optional)</label>
              <input v-model.number="assignForm.commissionPercent" type="number" min="0" max="100" step="0.5" class="field-input" placeholder="e.g. 2.5" />
            </div>
            <div>
              <label class="field-label">Agreement note (optional)</label>
              <textarea v-model="assignForm.agreementNote" rows="2" class="field-input" placeholder="Terms, split, marketing responsibilities…" />
            </div>
            <button
              type="button"
              class="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="assignSaving || !assignForm.agentUserId"
              @click="submitAssignAgent"
            >
              <i class="las la-user-plus"></i>
              {{ assignSaving ? 'Saving…' : 'Assign agent' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── TAB: Property managers ── -->
      <div v-show="activeTab === 'pm'" class="space-y-4">
        <div v-if="pmTabError" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <i class="las la-exclamation-circle mr-1.5"></i>{{ pmTabError }}
        </div>

        <!-- Incoming requests -->
        <div class="compact-card rounded bg-white">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 px-4 py-3">
            <div class="flex items-center gap-2">
              <i class="las la-inbox text-sm text-primary-600"></i>
              <h2 class="text-sm font-semibold text-gray-900">Incoming manager requests</h2>
            </div>
            <span
              v-if="!pmTabLoading && incomingPmRequests.length"
              class="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
            >
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500"></span>
              {{ incomingPmRequests.length }} open
            </span>
          </div>
          <div class="p-4">
            <p class="mb-3 text-xs text-gray-500">
              Approved property managers asking to run this listing. Review their profile, accept, counter their terms, or decline.
            </p>
            <div v-if="pmTabLoading" class="flex items-center gap-2 py-6 text-sm text-gray-500">
              <i class="las la-spinner animate-spin text-primary-600"></i> Loading manager activity…
            </div>
            <div v-else-if="!incomingPmRequests.length" class="rounded border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
              <i class="las la-user-clock mb-1.5 block text-2xl text-gray-300"></i>
              <p class="text-sm font-medium text-gray-700">No open requests</p>
              <p class="mt-0.5 text-xs text-gray-500">When a property manager requests this listing, their card will appear here.</p>
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="r in incomingPmRequests"
                :key="String(r._id)"
                class="rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex min-w-0 gap-3">
                    <button
                      type="button"
                      class="shrink-0"
                      :title="'View ' + (getPmProfile(r.managerUserId)?.displayName || 'manager') + ' profile'"
                      @click="openPmDetail(String(r.managerUserId), { request: r })"
                    >
                      <img
                        v-if="getPmProfile(r.managerUserId)?.avatarUrl"
                        :src="getPmProfile(r.managerUserId).avatarUrl"
                        :alt="getPmProfile(r.managerUserId)?.displayName || 'Manager'"
                        class="h-12 w-12 rounded object-cover"
                      />
                      <span v-else class="flex h-12 w-12 items-center justify-center rounded bg-gray-200 text-gray-400">
                        <i class="las la-user-cog text-2xl"></i>
                      </span>
                    </button>
                    <div class="min-w-0">
                      <div class="flex flex-wrap items-center gap-1.5">
                        <p class="text-sm font-semibold text-gray-900">
                          {{ getPmProfile(r.managerUserId)?.displayName || 'Property manager' }}
                        </p>
                        <span
                          v-if="getPmProfile(r.managerUserId)?.verified"
                          class="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
                        >
                          <i class="las la-check-circle"></i> Verified
                        </span>
                        <span
                          v-if="r.status === 'countered'"
                          class="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-800"
                        >Countered</span>
                      </div>
                      <p v-if="getPmProfile(r.managerUserId)?.companyName" class="text-xs text-gray-500">
                        {{ getPmProfile(r.managerUserId).companyName }}
                      </p>
                      <div class="mt-2 grid gap-1.5 sm:grid-cols-2">
                        <div v-if="r.proposal" class="rounded border border-primary-100 bg-primary-50/40 px-2.5 py-1.5 text-xs">
                          <p class="font-semibold text-primary-800"><i class="las la-arrow-down text-primary-600"></i> Their proposal</p>
                          <p class="mt-0.5 text-primary-700">{{ summarizeProposal(r.proposal) }}</p>
                        </div>
                        <div v-if="r.counter" class="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs">
                          <p class="font-semibold text-amber-800"><i class="las la-arrow-up text-amber-600"></i> Your counter</p>
                          <p class="mt-0.5 text-amber-800">{{ summarizeProposal(r.counter) }}</p>
                        </div>
                      </div>
                      <p
                        v-if="r.message"
                        class="mt-2 rounded border border-gray-100 bg-white px-2.5 py-1.5 text-xs italic text-gray-700"
                      >"{{ r.message }}"</p>
                      <button
                        type="button"
                        class="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700"
                        @click="openPmDetail(String(r.managerUserId), { request: r })"
                      >
                        View full profile <i class="las la-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2 sm:w-32 sm:flex-col">
                    <button
                      type="button"
                      class="flex-1 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                      :disabled="pmRequestActionId === String(r._id)"
                      @click="decidePmRequest(r, 'accepted')"
                    >
                      <i class="las la-check mr-0.5"></i> Accept
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 sm:flex-none"
                      :disabled="pmRequestActionId === String(r._id)"
                      @click="openCounterEditor('pm', r)"
                    >
                      <i class="las la-handshake mr-0.5"></i> Counter
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                      @click="startThreadFromPmRequest(r)"
                    >
                      <i class="las la-comment mr-0.5"></i> Message
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                      :disabled="pmRequestActionId === String(r._id)"
                      @click="decidePmRequest(r, 'rejected')"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Assigned managers -->
        <div class="compact-card rounded bg-white">
          <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
            <i class="las la-user-cog text-sm text-gray-600"></i>
            <h2 class="text-sm font-semibold text-gray-900">Assigned property managers</h2>
          </div>
          <div class="p-4">
            <p class="mb-3 text-xs text-gray-500">Approved property managers actively running this listing.</p>
            <div
              v-if="!pmAssignments.length"
              class="rounded border border-dashed border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-500"
            >
              No property managers assigned yet.
            </div>
            <ul v-else class="space-y-2">
              <li
                v-for="a in pmAssignments"
                :key="String(a._id)"
                class="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <img
                    v-if="getPmProfile(a.managerUserId)?.avatarUrl"
                    :src="getPmProfile(a.managerUserId).avatarUrl"
                    :alt="getPmProfile(a.managerUserId)?.displayName || 'Manager'"
                    class="h-10 w-10 shrink-0 rounded object-cover"
                  />
                  <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
                    <i class="las la-user-cog text-xl"></i>
                  </span>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-gray-900">
                      {{ getPmProfile(a.managerUserId)?.displayName || 'Property manager' }}
                    </p>
                    <p v-if="getPmProfile(a.managerUserId)?.companyName" class="truncate text-xs text-gray-500">
                      {{ getPmProfile(a.managerUserId).companyName }}
                    </p>
                    <p v-if="a.acceptedTerms" class="mt-0.5 text-xs text-emerald-700">
                      <i class="las la-handshake"></i> {{ summarizeProposal(a.acceptedTerms) }}
                    </p>
                    <p v-else-if="a.assignedBy" class="text-xs text-gray-500">Assigned by {{ a.assignedBy }}</p>
                  </div>
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    class="rounded border border-gray-300 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:border-primary-300 hover:bg-primary-50"
                    @click="openPmDetail(String(a.managerUserId), { assignment: a })"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    class="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    :disabled="pmRemovingAssignmentId === String(a._id)"
                    @click="removePmAssignment(a)"
                  >
                    Remove
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Manual assign -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-1 text-sm font-semibold text-gray-900">Manually assign a property manager</h2>
          <p class="mb-4 text-xs text-gray-500">Only approved property managers appear in the list. They can also send a "request to manage" from the public listing.</p>
          <div class="grid max-w-lg gap-3">
            <div>
              <label class="field-label">Property manager</label>
              <select v-model="assignPmForm.managerUserId" class="field-input">
                <option value="">Select manager…</option>
                <option v-for="uid in assignablePmUserIds" :key="uid" :value="uid">
                  {{ getPmProfile(uid)?.displayName || uid }}
                  <template v-if="getPmProfile(uid)?.companyName">— {{ getPmProfile(uid).companyName }}</template>
                </option>
              </select>
            </div>
            <button
              type="button"
              class="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="assignPmSaving || !assignPmForm.managerUserId"
              @click="submitAssignPm"
            >
              <i class="las la-user-plus"></i>
              {{ assignPmSaving ? 'Saving…' : 'Assign manager' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── TAB: Payouts ── -->
      <div v-show="activeTab === 'payouts'" class="space-y-6">
        <div>
          <h2 class="mb-2 text-sm font-semibold text-gray-900">
            <i class="las la-user-tie text-primary-600"></i> Agent commissions
          </h2>
          <p class="mb-3 text-xs text-gray-500">
            Record, approve, mark paid, or cancel commissions owed to agents representing this property.
          </p>
          <div class="mb-3 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
              @click="openNewPayoutModal('agent')"
            >
              <i class="las la-plus-circle text-sm"></i> Record commission
            </button>
          </div>
          <UiPayoutsTable kind="agent" :property-id="id" :can-manage="true" />
        </div>

        <div>
          <h2 class="mb-2 text-sm font-semibold text-gray-900">
            <i class="las la-user-cog text-primary-600"></i> Property manager fees
          </h2>
          <p class="mb-3 text-xs text-gray-500">
            Record, approve, mark paid, or cancel management fees owed to property managers running this property.
          </p>
          <div class="mb-3 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
              @click="openNewPayoutModal('pm')"
            >
              <i class="las la-plus-circle text-sm"></i> Record fee
            </button>
          </div>
          <UiPayoutsTable kind="pm" :property-id="id" :can-manage="true" />
        </div>
      </div>

      <div v-show="activeTab === 'summary'" class="grid gap-4 sm:grid-cols-2">
        <!-- Info card -->
        <div class="compact-card rounded bg-white overflow-hidden">
          <div class="relative h-40 bg-gray-200">
            <img
              :src="edit.images[0] || '/images/apartments/1.jpeg'"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div class="p-4 space-y-2 text-sm">
            <p class="font-semibold text-gray-900">{{ properties.selected?.name }}</p>
            <p class="text-xs text-gray-500"><i class="las la-map-marker mr-1"></i>{{ [properties.selected?.city, properties.selected?.country].filter(Boolean).join(', ') }}</p>
            <div class="grid grid-cols-3 gap-2 pt-2 text-center">
              <div class="rounded bg-gray-50 p-2"><p class="text-base font-bold text-gray-900">{{ units.length }}</p><p class="text-xs text-gray-500">Units</p></div>
              <div class="rounded bg-emerald-50 p-2"><p class="text-base font-bold text-emerald-700">{{ units.filter((u) => u.status === 'occupied').length }}</p><p class="text-xs text-gray-500">Occupied</p></div>
              <div class="rounded bg-amber-50 p-2"><p class="text-base font-bold text-amber-700">{{ units.filter((u) => u.status === 'vacant').length }}</p><p class="text-xs text-gray-500">Vacant</p></div>
            </div>
          </div>
        </div>
        <!-- Quick links -->
        <div class="compact-card rounded bg-white p-4">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Quick links</h3>
          <div class="space-y-1">
            <NuxtLink to="/landlord/maintenance" class="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"><i class="las la-tools text-gray-400 w-4 text-center"></i>Maintenance</NuxtLink>
            <NuxtLink to="/landlord/payments" class="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"><i class="las la-wallet text-gray-400 w-4 text-center"></i>Payments</NuxtLink>
            <NuxtLink to="/landlord/review-applications" class="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"><i class="las la-clipboard-check text-gray-400 w-4 text-center"></i>Review applications</NuxtLink>
            <NuxtLink to="/landlord/notices" class="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-50"><i class="las la-bullhorn text-gray-400 w-4 text-center"></i>Notices</NuxtLink>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Unit modal ── -->
    <div v-if="unitModal" class="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 p-4 sm:items-center" @click.self="unitModal = false">
      <div class="w-full max-w-lg overflow-y-auto rounded border border-gray-200 bg-white shadow-xl" style="max-height:90vh" @click.stop>
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 class="text-sm font-semibold text-gray-900">{{ unitForm._id ? 'Edit unit' : 'New unit' }}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600" @click="unitModal = false"><i class="las la-times text-xl"></i></button>
        </div>

        <!-- Unit form tabs -->
        <div class="flex gap-0.5 border-b border-gray-100 bg-gray-50 px-4 pt-3 pb-0">
          <button v-for="t in unitTabs" :key="t.id" type="button"
            class="rounded-t px-3 py-1.5 text-xs font-medium transition"
            :class="unitActiveTab === t.id ? 'bg-white text-primary-700 border border-gray-200 border-b-0 -mb-px' : 'text-gray-500 hover:text-gray-700'"
            @click="unitActiveTab = t.id"
          >{{ t.label }}</button>
        </div>

        <div class="p-5">
          <div v-if="unitError" class="mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">{{ unitError }}</div>

          <!-- Unit tab: Basic -->
          <div v-show="unitActiveTab === 'basic'" class="space-y-3">
            <div>
              <label class="field-label">Unit number <span class="text-red-500">*</span></label>
              <input v-model="unitForm.unitNumber" placeholder="e.g. A1, 101" class="field-input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="field-label">Bedrooms</label><input v-model.number="unitForm.bedrooms" type="number" min="0" class="field-input" /></div>
              <div><label class="field-label">Bathrooms</label><input v-model.number="unitForm.bathrooms" type="number" min="0" class="field-input" /></div>
            </div>
            <div>
              <label class="field-label">Square feet</label>
              <input v-model.number="unitForm.squareFeet" type="number" min="0" class="field-input" />
            </div>
            <div>
              <label class="field-label">Status</label>
              <select v-model="unitForm.status" class="field-input">
                <option value="vacant">Vacant</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <!-- Unit tab: Pricing -->
          <div v-show="unitActiveTab === 'pricing'" class="space-y-3">
            <div>
              <label class="field-label">Listing type</label>
              <select v-model="unitForm.listingType" class="field-input">
                <option value="rental">For rent</option>
                <option value="sale">For sale</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="field-label">Rent amount</label><input v-model.number="unitForm.rentAmount" type="number" min="0" class="field-input" /></div>
              <div>
                <label class="field-label">Currency</label>
                <select v-model="unitForm.rentCurrency" class="field-input"><option>GHS</option><option>USD</option><option>EUR</option></select>
              </div>
            </div>
            <template v-if="unitForm.listingType === 'sale'">
              <div>
                <label class="field-label">Sale price</label>
                <input v-model.number="unitForm.salePrice" type="number" min="0" class="field-input" />
              </div>
              <label class="flex items-center gap-2 text-xs font-medium text-gray-700">
                <input v-model="unitForm.mortgageEligible" type="checkbox" class="h-3.5 w-3.5 rounded border-gray-300 text-primary-600" />
                Mortgage eligible
              </label>
              <div v-if="unitForm.mortgageEligible">
                <label class="field-label">Mortgage partner</label>
                <input v-model="unitForm.mortgagePartner" placeholder="e.g. Ghana Home Loans" class="field-input" />
              </div>
            </template>
          </div>

          <!-- Unit tab: Lease -->
          <div v-show="unitActiveTab === 'lease'" class="space-y-3">
            <div>
              <label class="field-label">Lease start</label>
              <input v-model="unitForm.leaseStart" type="date" class="field-input" />
            </div>
            <div>
              <label class="field-label">Lease end</label>
              <input v-model="unitForm.leaseEnd" type="date" class="field-input" />
            </div>
            <div v-if="unitForm.leaseEnd && daysUntilLeaseEnd !== null" class="rounded border px-3 py-2 text-xs" :class="daysUntilLeaseEnd < 30 ? 'border-red-200 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-600'">
              <i :class="daysUntilLeaseEnd < 30 ? 'las la-exclamation-triangle' : 'las la-calendar'" class="mr-1"></i>
              <span v-if="daysUntilLeaseEnd < 0">Lease expired {{ Math.abs(daysUntilLeaseEnd) }} days ago</span>
              <span v-else>{{ daysUntilLeaseEnd }} days until lease ends</span>
            </div>
          </div>

          <!-- Unit tab: Images -->
          <div v-show="unitActiveTab === 'images'">
            <div v-if="!unitForm._id" class="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <i class="las la-info-circle mr-1"></i>Save the unit first to enable image uploads.
            </div>
            <UiImageUploader
              v-else
              entity-type="units"
              :entity-id="unitForm._id"
              :images="unitForm.images"
              @update:images="onUnitImagesUpdate"
            />
          </div>
        </div>

        <div class="flex justify-between gap-2 border-t border-gray-100 px-5 py-4">
          <button
            v-if="unitForm._id && canDestroyPortfolio"
            type="button"
            class="rounded border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            :disabled="unitSaving"
            @click="deleteUnit"
          >
            Delete unit
          </button>
          <div class="flex gap-2 ml-auto">
            <button type="button" class="rounded border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="unitModal = false">Cancel</button>
            <button type="button" class="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50" :disabled="unitSaving" @click="saveUnit">
              {{ unitSaving ? 'Saving…' : 'Save unit' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent profile (full detail) -->
    <Teleport to="body">
      <div
        v-if="agentDetailModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-detail-title"
        @click.self="closeAgentDetail"
      >
        <div
          class="flex max-h-[min(90vh,680px)] w-full max-w-md flex-col overflow-hidden rounded border border-gray-200 bg-white"
          @click.stop
        >
          <!-- Header -->
          <div class="flex shrink-0 items-start gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <img
              v-if="agentDetailProfile?.avatarUrl"
              :src="agentDetailProfile.avatarUrl"
              :alt="agentDetailProfile?.displayName || 'Agent'"
              class="h-14 w-14 shrink-0 rounded object-cover"
            />
            <span v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
              <i class="las la-user text-3xl"></i>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Agent profile</p>
              <h3 id="agent-detail-title" class="mt-0.5 text-base font-bold text-gray-900">
                {{ agentDetailProfile?.displayName || 'Agent' }}
              </h3>
              <p v-if="agentDetailProfile?.agency" class="text-sm text-gray-600">{{ agentDetailProfile.agency }}</p>
              <span
                v-if="agentDetailProfile?.verified"
                class="mt-1 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
              >
                <i class="las la-shield-alt"></i> Verified
              </span>
            </div>
            <button
              type="button"
              class="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              aria-label="Close"
              @click="closeAgentDetail"
            >
              <i class="las la-times text-xl"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm">
            <div v-if="agentTabError" class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {{ agentTabError }}
            </div>

            <!-- Stats -->
            <div
              v-if="agentDetailProfile?.listingsCount != null || typeof agentDetailProfile?.responseTimeMinutes === 'number'"
              class="mb-4 grid grid-cols-2 gap-2"
            >
              <div v-if="agentDetailProfile?.listingsCount != null" class="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Listings</p>
                <p class="mt-0.5 text-lg font-bold text-gray-900">{{ agentDetailProfile.listingsCount }}</p>
              </div>
              <div v-if="typeof agentDetailProfile?.responseTimeMinutes === 'number'" class="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Response</p>
                <p class="mt-0.5 text-sm font-semibold text-gray-900">~{{ agentDetailProfile.responseTimeMinutes }} min</p>
              </div>
            </div>

            <!-- About -->
            <div v-if="agentDetailProfile?.bio" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">About</p>
              <p class="whitespace-pre-wrap leading-relaxed text-gray-700">{{ agentDetailProfile.bio }}</p>
            </div>

            <!-- Contact -->
            <div class="mb-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
              <div class="space-y-1.5">
                <div v-if="agentDetailProfile?.emailPublic" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">Email</span>
                  <a :href="'mailto:' + agentDetailProfile.emailPublic" class="min-w-0 break-all font-medium text-primary-600 hover:underline">{{ agentDetailProfile.emailPublic }}</a>
                </div>
                <div v-if="agentDetailProfile?.phone" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">Phone</span>
                  <span class="text-gray-900">{{ agentDetailProfile.phone }}</span>
                </div>
                <div v-if="agentDetailProfile?.whatsapp" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">WhatsApp</span>
                  <span class="text-gray-900">{{ agentDetailProfile.whatsapp }}</span>
                </div>
                <p v-if="!agentDetailProfile?.emailPublic && !agentDetailProfile?.phone && !agentDetailProfile?.whatsapp" class="text-xs text-gray-500">
                  No public contact details shared.
                </p>
              </div>
            </div>

            <!-- Regions & Languages -->
            <div v-if="formatAgentRegions(agentDetailProfile?.regions)" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Regions</p>
              <p class="text-gray-700">{{ formatAgentRegions(agentDetailProfile?.regions) }}</p>
            </div>
            <div v-if="formatAgentLanguages(agentDetailProfile?.languages)" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Languages</p>
              <p class="text-gray-700">{{ formatAgentLanguages(agentDetailProfile?.languages) }}</p>
            </div>

            <!-- Terms for this property -->
            <div v-if="agentDetailRequest || agentDetailAssignment" class="mb-4 rounded border border-gray-200 bg-gray-50 p-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Terms for this property</p>
              <div v-if="agentDetailRequest?.proposal" class="mb-2 rounded border border-primary-100 bg-primary-50/40 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-primary-800"><i class="las la-arrow-down text-primary-600"></i> Their proposal</p>
                <p class="mt-0.5 text-primary-700">{{ summarizeProposal(agentDetailRequest.proposal) }}</p>
              </div>
              <div v-if="agentDetailRequest?.counter" class="mb-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-amber-800"><i class="las la-arrow-up text-amber-600"></i> Your counter</p>
                <p class="mt-0.5 text-amber-800">{{ summarizeProposal(agentDetailRequest.counter) }}</p>
              </div>
              <div v-if="agentDetailAssignment?.acceptedTerms" class="mb-2 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-emerald-800"><i class="las la-handshake text-emerald-600"></i> Agreed terms</p>
                <p class="mt-0.5 text-emerald-800">{{ summarizeProposal(agentDetailAssignment.acceptedTerms) }}</p>
              </div>
              <dl class="space-y-2">
                <div v-if="agentDetailRequest && agentDetailRequest.commissionPercent != null && !agentDetailRequest.proposal" class="flex justify-between gap-3">
                  <dt class="text-gray-600">Proposed commission</dt>
                  <dd class="font-semibold text-gray-900">{{ agentDetailRequest.commissionPercent }}%</dd>
                </div>
                <div v-if="agentDetailAssignment && agentDetailAssignment.commissionPercent != null && !agentDetailAssignment.acceptedTerms" class="flex justify-between gap-3">
                  <dt class="text-gray-600">Agreed commission</dt>
                  <dd class="font-semibold text-gray-900">{{ agentDetailAssignment.commissionPercent }}%</dd>
                </div>
                <div v-if="agentDetailRequest?.message" class="border-t border-gray-200 pt-2">
                  <dt class="text-xs font-semibold text-gray-600">Message from agent</dt>
                  <dd class="mt-1 whitespace-pre-wrap leading-relaxed text-gray-700">{{ agentDetailRequest.message }}</dd>
                </div>
                <div v-if="agentDetailAssignment?.agreementNote" class="border-t border-gray-200 pt-2">
                  <dt class="text-xs font-semibold text-gray-600">Agreement note</dt>
                  <dd class="mt-1 whitespace-pre-wrap leading-relaxed text-gray-700">{{ agentDetailAssignment.agreementNote }}</dd>
                </div>
              </dl>
            </div>

            <!-- Verification documents -->
            <div v-if="agentDetailProfile?.files?.length" class="mb-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Verification documents</p>
              <UiVerificationDocsList :files="agentDetailProfile.files" />
            </div>

            <p class="font-mono text-[11px] text-gray-400">ID <span class="text-gray-600">{{ agentDetailUserId }}</span></p>
          </div>

          <!-- Footer -->
          <div class="flex flex-wrap items-center gap-2 border-t border-gray-200 px-5 py-3">
            <template v-if="agentDetailRequest">
              <button
                type="button"
                class="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                :disabled="!!requestActionId"
                @click="decideAgentRequestFromModal('rejected')"
              >
                Decline
              </button>
              <button
                type="button"
                class="flex-1 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 sm:flex-none"
                :disabled="!!requestActionId"
                @click="closeAgentDetail(); openCounterEditor('agent', agentDetailRequest)"
              >
                <i class="las la-handshake mr-0.5"></i> Counter
              </button>
              <button
                type="button"
                class="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                @click="startThreadFromAgentRequest(agentDetailRequest)"
              >
                <i class="las la-comment mr-0.5"></i> Message
              </button>
              <button
                type="button"
                class="flex-1 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                :disabled="!!requestActionId"
                @click="decideAgentRequestFromModal('accepted')"
              >
                <i class="las la-check mr-0.5"></i> Accept
              </button>
            </template>
            <button
              type="button"
              class="ml-auto rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closeAgentDetail"
            >
              {{ agentDetailRequest ? 'Cancel' : 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Property manager profile (full detail) -->
    <Teleport to="body">
      <div
        v-if="pmDetailModalOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-detail-title"
        @click.self="closePmDetail"
      >
        <div
          class="flex max-h-[min(90vh,720px)] w-full max-w-md flex-col overflow-hidden rounded border border-gray-200 bg-white"
          @click.stop
        >
          <div class="flex shrink-0 items-start gap-4 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <img
              v-if="pmDetailProfile?.avatarUrl"
              :src="pmDetailProfile.avatarUrl"
              :alt="pmDetailProfile?.displayName || 'Property manager'"
              class="h-14 w-14 shrink-0 rounded object-cover"
            />
            <span v-else class="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-gray-200 text-gray-400">
              <i class="las la-user-cog text-3xl"></i>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Property manager profile</p>
              <h3 id="pm-detail-title" class="mt-0.5 text-base font-bold text-gray-900">
                {{ pmDetailProfile?.displayName || 'Property manager' }}
              </h3>
              <p v-if="pmDetailProfile?.companyName" class="text-sm text-gray-600">{{ pmDetailProfile.companyName }}</p>
              <span
                v-if="pmDetailProfile?.verified"
                class="mt-1 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
              >
                <i class="las la-shield-alt"></i> Verified
              </span>
            </div>
            <button
              type="button"
              class="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              aria-label="Close"
              @click="closePmDetail"
            >
              <i class="las la-times text-xl"></i>
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm">
            <div v-if="pmTabError" class="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {{ pmTabError }}
            </div>

            <div
              v-if="pmDetailProfile?.portfolioSize != null || pmDetailProfile?.yearsManaging != null"
              class="mb-4 grid grid-cols-2 gap-2"
            >
              <div v-if="pmDetailProfile?.portfolioSize != null" class="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Portfolio</p>
                <p class="mt-0.5 text-lg font-bold text-gray-900">{{ pmDetailProfile.portfolioSize }}</p>
              </div>
              <div v-if="pmDetailProfile?.yearsManaging != null" class="rounded border border-gray-200 bg-gray-50 px-3 py-2.5">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Experience</p>
                <p class="mt-0.5 text-sm font-semibold text-gray-900">{{ pmDetailProfile.yearsManaging }} yrs</p>
              </div>
            </div>

            <div v-if="pmDetailProfile?.bio" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">About</p>
              <p class="whitespace-pre-wrap leading-relaxed text-gray-700">{{ pmDetailProfile.bio }}</p>
            </div>

            <div class="mb-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
              <div class="space-y-1.5">
                <div v-if="pmDetailProfile?.emailPublic" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">Email</span>
                  <a :href="'mailto:' + pmDetailProfile.emailPublic" class="min-w-0 break-all font-medium text-primary-600 hover:underline">{{ pmDetailProfile.emailPublic }}</a>
                </div>
                <div v-if="pmDetailProfile?.phone" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">Phone</span>
                  <span class="text-gray-900">{{ pmDetailProfile.phone }}</span>
                </div>
                <div v-if="pmDetailProfile?.whatsapp" class="flex items-center gap-2">
                  <span class="w-20 shrink-0 text-xs text-gray-500">WhatsApp</span>
                  <span class="text-gray-900">{{ pmDetailProfile.whatsapp }}</span>
                </div>
                <p v-if="!pmDetailProfile?.emailPublic && !pmDetailProfile?.phone && !pmDetailProfile?.whatsapp" class="text-xs text-gray-500">
                  No public contact details shared.
                </p>
              </div>
            </div>

            <div v-if="pmDetailProfile?.services?.length" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Services</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(s, i) in pmDetailProfile.services"
                  :key="'svc-' + i"
                  class="rounded bg-primary-50 px-2 py-0.5 text-xs text-primary-800"
                >{{ s }}</span>
              </div>
            </div>

            <div v-if="pmDetailProfile?.regions?.length" class="mb-4">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">Regions</p>
              <p class="text-gray-700">{{ pmDetailProfile.regions.join(', ') }}</p>
            </div>

            <!-- Terms for this property -->
            <div v-if="pmDetailRequest || pmDetailAssignment" class="mb-4 rounded border border-gray-200 bg-gray-50 p-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Terms for this property</p>
              <div v-if="pmDetailRequest?.proposal" class="mb-2 rounded border border-primary-100 bg-primary-50/40 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-primary-800"><i class="las la-arrow-down text-primary-600"></i> Their proposal</p>
                <p class="mt-0.5 text-primary-700">{{ summarizeProposal(pmDetailRequest.proposal) }}</p>
              </div>
              <div v-if="pmDetailRequest?.counter" class="mb-2 rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-amber-800"><i class="las la-arrow-up text-amber-600"></i> Your counter</p>
                <p class="mt-0.5 text-amber-800">{{ summarizeProposal(pmDetailRequest.counter) }}</p>
              </div>
              <div v-if="pmDetailAssignment?.acceptedTerms" class="mb-2 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs">
                <p class="font-semibold text-emerald-800"><i class="las la-handshake text-emerald-600"></i> Agreed terms</p>
                <p class="mt-0.5 text-emerald-800">{{ summarizeProposal(pmDetailAssignment.acceptedTerms) }}</p>
              </div>
              <div v-if="pmDetailRequest?.message" class="border-t border-gray-200 pt-2">
                <p class="text-xs font-semibold text-gray-600">Message from manager</p>
                <p class="mt-1 whitespace-pre-wrap leading-relaxed text-gray-700">{{ pmDetailRequest.message }}</p>
              </div>
            </div>

            <!-- Verification documents -->
            <div v-if="pmDetailProfile?.files?.length" class="mb-4">
              <p class="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Verification documents</p>
              <UiVerificationDocsList :files="pmDetailProfile.files" />
            </div>

            <p class="font-mono text-[11px] text-gray-400">ID <span class="text-gray-600">{{ pmDetailUserId }}</span></p>
          </div>

          <div class="flex flex-wrap items-center gap-2 border-t border-gray-200 px-5 py-3">
            <template v-if="pmDetailRequest">
              <button
                type="button"
                class="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:flex-none"
                :disabled="!!pmRequestActionId"
                @click="decidePmRequest(pmDetailRequest, 'rejected'); closePmDetail()"
              >
                Decline
              </button>
              <button
                type="button"
                class="flex-1 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50 sm:flex-none"
                :disabled="!!pmRequestActionId"
                @click="closePmDetail(); openCounterEditor('pm', pmDetailRequest)"
              >
                <i class="las la-handshake mr-0.5"></i> Counter
              </button>
              <button
                type="button"
                class="flex-1 rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:flex-none"
                @click="startThreadFromPmRequest(pmDetailRequest)"
              >
                <i class="las la-comment mr-0.5"></i> Message
              </button>
              <button
                type="button"
                class="flex-1 rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 sm:flex-none"
                :disabled="!!pmRequestActionId"
                @click="decidePmRequest(pmDetailRequest, 'accepted'); closePmDetail()"
              >
                <i class="las la-check mr-0.5"></i> Accept
              </button>
            </template>
            <button
              type="button"
              class="ml-auto rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              @click="closePmDetail"
            >
              {{ pmDetailRequest ? 'Cancel' : 'Close' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- New payout modal -->
    <Teleport to="body">
      <div
        v-if="newPayoutOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="newPayoutOpen = false"
      >
        <div class="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded border border-gray-200 bg-white" @click.stop>
          <div class="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 class="text-sm font-bold text-gray-900">
                Record {{ newPayoutKind === 'agent' ? 'agent commission' : 'manager fee' }}
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">
                Logged payouts can be approved, marked paid, or cancelled at any time.
              </p>
            </div>
            <button type="button" class="text-gray-400 hover:text-gray-600" @click="newPayoutOpen = false">
              <i class="las la-times text-xl"></i>
            </button>
          </div>
          <div class="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <p v-if="newPayoutError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{{ newPayoutError }}</p>
            <div>
              <label class="field-label">Recipient</label>
              <select v-model="newPayoutForm.recipientUserId" class="field-input">
                <option value="">Select…</option>
                <option v-for="r in newPayoutRecipients" :key="r.userId" :value="r.userId">{{ r.label }}</option>
              </select>
              <p v-if="!newPayoutRecipients.length" class="mt-1 text-xs text-amber-700">
                No {{ newPayoutKind === 'agent' ? 'agents' : 'property managers' }} assigned yet. Accept a request or assign one above.
              </p>
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="field-label">Amount</label>
                <input v-model.number="newPayoutForm.amount" type="number" min="0" step="0.01" class="field-input" placeholder="e.g. 2500" />
              </div>
              <div>
                <label class="field-label">Currency</label>
                <select v-model="newPayoutForm.currency" class="field-input">
                  <option>GHS</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
            <div>
              <label class="field-label">Trigger</label>
              <select v-model="newPayoutForm.trigger" class="field-input">
                <option value="rent_consummated">Rent consummated</option>
                <option value="sale_consummated">Sale consummated</option>
                <option value="first_month_paid">First month rent paid</option>
                <option value="each_renewal">On lease renewal</option>
                <option value="monthly_rent_collected">Monthly rent collected</option>
              </select>
            </div>
            <div>
              <label class="field-label">Note (optional)</label>
              <textarea v-model="newPayoutForm.note" rows="2" maxlength="2000" class="field-input" placeholder="Tenant moved in 1 Aug, contract signed 15 Jul…" />
            </div>
          </div>
          <div class="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
            <button type="button" class="rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="newPayoutOpen = false">Cancel</button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="newPayoutSubmitting"
              @click="submitNewPayout"
            >
              <i v-if="newPayoutSubmitting" class="las la-circle-notch la-spin text-sm"></i>
              <i v-else class="las la-check text-sm"></i>
              {{ newPayoutSubmitting ? 'Saving…' : 'Record payout' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Counter editor modal (shared for agent + PM requests) -->
    <Teleport to="body">
      <div
        v-if="counterModalOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
        @click.self="closeCounterEditor"
      >
        <div class="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded border border-gray-200 bg-white" @click.stop>
          <div class="flex shrink-0 items-start justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 class="text-sm font-bold text-gray-900">
                Counter {{ counterRequestKind === 'agent' ? 'agent' : 'manager' }} proposal
              </h3>
              <p class="mt-0.5 text-[11px] text-gray-500">
                Propose terms you would accept; the {{ counterRequestKind === 'agent' ? 'agent' : 'manager' }} can accept, decline or send back a new proposal.
              </p>
            </div>
            <button type="button" class="text-gray-400 hover:text-gray-600" @click="closeCounterEditor">
              <i class="las la-times text-xl"></i>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-3">
            <p v-if="counterError" class="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">{{ counterError }}</p>
            <UiFeeProposalEditor v-model="counterProposal" />
          </div>
          <div class="flex shrink-0 items-center justify-end gap-2 border-t border-gray-200 px-5 py-3">
            <button type="button" class="rounded border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="closeCounterEditor">Cancel</button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="counterSubmitting"
              @click="submitCounter"
            >
              <i v-if="counterSubmitting" class="las la-circle-notch la-spin text-sm"></i>
              <i v-else class="las la-paper-plane text-sm"></i>
              {{ counterSubmitting ? 'Sending…' : 'Send counter' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { usePropertiesStore } from '@@/stores/properties'
import { useUnitsStore } from '@@/stores/units'
import { useAuthStore } from '@@/stores/auth'
import {
  summarizeProposal,
  emptyProposal,
  type FeeProposal
} from '../../../composables/useFeeProposal'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Manage property - CribHub' })

const route = useRoute()
const id = computed(() => String(route.params.id || ''))
const properties = usePropertiesStore()
const unitsStore = useUnitsStore()
const auth = useAuthStore()

const canDestroyPortfolio = computed(() => auth.hasRole('landlord', 'admin'))
const backToListLabel = computed(() =>
  auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin') ? 'Properties' : 'My properties'
)

const isOwnerLandlord = computed(() => {
  const uid = String((auth.user as any)?._id || '')
  return !!uid && String((properties.selected as any)?.landlordId || '') === uid
})

const roleContextBanner = computed(() => {
  if (isOwnerLandlord.value) return null
  if (auth.hasRole('admin') && !auth.hasRole('property_manager', 'agent')) return null
  const isPm = auth.hasRole('property_manager') && !auth.hasRole('landlord')
  const isAg = auth.hasRole('agent') && !auth.hasRole('landlord')
  if (!isPm && !isAg) return null
  if (isPm) {
    return {
      icon: 'las la-user-tie',
      title: 'You are viewing this property as a property manager',
      body: 'You can browse the listing and coordinate with the landlord. Landlord-only edits are hidden.',
      profileLink: '/pm/profile',
      openMessageHandler: true as const,
      messageThreadId: pmActiveThreadId.value
    }
  }
  return {
    icon: 'las la-user-tag',
    title: 'You are viewing this property as the assigned agent',
    body: 'Coordinate the listing, share updates, and message the landlord directly.',
    profileLink: '/agent/profile',
    openMessageHandler: true as const,
    messageThreadId: agentActiveThreadId.value
  }
})

const pmActiveThreadId = ref<string | null>(null)
const agentActiveThreadId = ref<string | null>(null)

async function openRoleContextMessage() {
  try {
    const banner = roleContextBanner.value
    if (!banner) return
    let tid = banner.messageThreadId
    if (!tid) {
      const landlordId = String((properties.selected as any)?.landlordId || '')
      const myId = String((auth.user as any)?._id || '')
      if (!landlordId || !myId) return
      const isPm = auth.hasRole('property_manager') && !auth.hasRole('landlord')
      const kind = isPm ? 'landlord-pm' : 'landlord-agent'
      const feathers = useNuxtApp().$feathers as any
      const created = await feathers.service('threads').create({
        kind,
        participantIds: [landlordId, myId],
        subject: { type: 'property', id: id.value },
        propertyId: id.value,
        title: (properties.selected as any)?.name
          ? `${isPm ? 'Manage' : 'Represent'}: ${(properties.selected as any).name}`
          : isPm
            ? 'Property management'
            : 'Property representation'
      })
      tid = String((created as any)?._id || '')
      if (isPm) pmActiveThreadId.value = tid
      else agentActiveThreadId.value = tid
    }
    if (tid) await navigateTo(`/messages/${tid}`)
  } catch (e: any) {
    pageError.value = e?.message || 'Failed to open conversation'
  }
}

// Page state
const pageError = ref<string | null>(null)
const saveSuccess = ref(false)
const savingProp = ref(false)
const savingAmenities = ref(false)
const amenitiesSaved = ref(false)
const savingImages = ref(false)
const deleting = ref(false)
const units = ref<any[]>([])
const unitsLoading = ref(false)
const activeTab = ref('summary')
const manualGeo = ref(false)

const agentTabLoading = ref(false)
const agentTabError = ref<string | null>(null)
const assignments = ref<any[]>([])
const incomingAgentRequests = ref<any[]>([])
const agentProfiles = ref<any[]>([])
const assignForm = reactive({
  agentUserId: '',
  commissionPercent: null as number | null,
  agreementNote: ''
})
const assignSaving = ref(false)
const requestActionId = ref<string | null>(null)
const removingAssignmentId = ref<string | null>(null)


function getAgentProfile(userId: string | undefined | null) {
  if (userId == null || String(userId).trim() === '') return null
  const u = String(userId)
  return agentProfiles.value.find((p: any) => String(p.userId) === u) ?? null
}

function formatAgentRegions(regions: unknown): string {
  if (!Array.isArray(regions)) return ''
  const parts = regions.filter((x) => typeof x === 'string' && String(x).trim().length > 0) as string[]
  return parts.map((x) => x.trim()).join(', ')
}

function formatAgentLanguages(langs: unknown): string {
  if (!Array.isArray(langs)) return ''
  const parts = langs.filter((x) => typeof x === 'string' && String(x).trim().length > 0) as string[]
  return parts.map((x) => x.trim()).join(', ')
}

const agentDetailModalOpen = ref(false)
const agentDetailUserId = ref<string | null>(null)
const agentDetailRequest = ref<any>(null)
const agentDetailAssignment = ref<any>(null)

const agentDetailProfile = computed(() => {
  const uid = agentDetailUserId.value
  if (!uid) return null
  return agentProfiles.value.find((p: any) => String(p.userId) === String(uid)) ?? null
})

function openAgentDetail(userId: string, opts?: { request?: any; assignment?: any }) {
  agentTabError.value = null
  agentDetailUserId.value = userId
  agentDetailRequest.value = opts?.request ?? null
  agentDetailAssignment.value = opts?.assignment ?? null
  agentDetailModalOpen.value = true
}

function closeAgentDetail() {
  agentDetailModalOpen.value = false
  agentDetailUserId.value = null
  agentDetailRequest.value = null
  agentDetailAssignment.value = null
}

const pmTabLoading = ref(false)
const pmTabError = ref<string | null>(null)
const pmAssignments = ref<any[]>([])
const incomingPmRequests = ref<any[]>([])
const pmRoleUserIds = ref<string[]>([])
const pmProfiles = ref<any[]>([])
const assignPmForm = reactive({ managerUserId: '' })
const assignPmSaving = ref(false)
const pmRequestActionId = ref<string | null>(null)
const pmRemovingAssignmentId = ref<string | null>(null)

function getPmProfile(userId: string | undefined | null) {
  if (userId == null || String(userId).trim() === '') return null
  const u = String(userId)
  return pmProfiles.value.find((p: any) => String(p.userId) === u) ?? null
}

// PM detail modal (mirrors agent detail modal)
const pmDetailModalOpen = ref(false)
const pmDetailUserId = ref<string | null>(null)
const pmDetailRequest = ref<any>(null)
const pmDetailAssignment = ref<any>(null)
const pmDetailProfile = computed(() => {
  const uid = pmDetailUserId.value
  if (!uid) return null
  return pmProfiles.value.find((p: any) => String(p.userId) === String(uid)) ?? null
})

function openPmDetail(userId: string, opts?: { request?: any; assignment?: any }) {
  pmTabError.value = null
  pmDetailUserId.value = userId
  pmDetailRequest.value = opts?.request ?? null
  pmDetailAssignment.value = opts?.assignment ?? null
  pmDetailModalOpen.value = true
}

function closePmDetail() {
  pmDetailModalOpen.value = false
  pmDetailUserId.value = null
  pmDetailRequest.value = null
  pmDetailAssignment.value = null
}

// Shared counter editor (for both agent + PM requests)
const counterModalOpen = ref(false)
const counterRequestRow = ref<any>(null)
const counterRequestKind = ref<'agent' | 'pm'>('agent')
const counterProposal = ref<FeeProposal | null>(null)
const counterSubmitting = ref(false)
const counterError = ref<string | null>(null)

// New payout modal
const newPayoutOpen = ref(false)
const newPayoutKind = ref<'agent' | 'pm'>('agent')
const newPayoutSubmitting = ref(false)
const newPayoutError = ref<string | null>(null)
const newPayoutForm = reactive<{
  recipientUserId: string
  amount: number | null
  currency: string
  trigger: 'rent_consummated' | 'sale_consummated' | 'first_month_paid' | 'each_renewal' | 'monthly_rent_collected'
  note: string
}>({
  recipientUserId: '',
  amount: null,
  currency: 'GHS',
  trigger: 'rent_consummated',
  note: ''
})

const newPayoutRecipients = computed(() => {
  if (newPayoutKind.value === 'agent') {
    return assignments.value.map((a: any) => ({
      userId: String(a.agentUserId),
      label: getAgentProfile(a.agentUserId)?.displayName || a.agentUserId
    }))
  }
  return pmAssignments.value.map((a: any) => ({
    userId: String(a.managerUserId),
    label: getPmProfile(a.managerUserId)?.displayName || a.managerUserId
  }))
})

function openNewPayoutModal(kind: 'agent' | 'pm') {
  newPayoutKind.value = kind
  newPayoutError.value = null
  newPayoutForm.recipientUserId = newPayoutRecipients.value[0]?.userId || ''
  newPayoutForm.amount = null
  newPayoutForm.currency = 'GHS'
  newPayoutForm.trigger = 'rent_consummated'
  newPayoutForm.note = ''
  newPayoutOpen.value = true
}

async function submitNewPayout() {
  newPayoutError.value = null
  if (!newPayoutForm.recipientUserId) {
    newPayoutError.value = 'Pick a recipient.'
    return
  }
  if (!newPayoutForm.amount || newPayoutForm.amount <= 0) {
    newPayoutError.value = 'Amount must be greater than zero.'
    return
  }
  newPayoutSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const svc = newPayoutKind.value === 'agent' ? 'agent-payouts' : 'pm-payouts'
    const payload: Record<string, any> = {
      propertyId: id.value,
      amount: Number(newPayoutForm.amount),
      currency: newPayoutForm.currency,
      trigger: newPayoutForm.trigger,
      status: 'pending'
    }
    if (newPayoutKind.value === 'agent') payload.agentUserId = newPayoutForm.recipientUserId
    else payload.managerUserId = newPayoutForm.recipientUserId
    if (newPayoutForm.note.trim()) payload.note = newPayoutForm.note.trim()
    await feathers.service(svc).create(payload)
    newPayoutOpen.value = false
  } catch (e: any) {
    newPayoutError.value = e?.message || 'Could not create payout'
  } finally {
    newPayoutSubmitting.value = false
  }
}

function openCounterEditor(kind: 'agent' | 'pm', row: any) {
  counterError.value = null
  counterRequestRow.value = row
  counterRequestKind.value = kind
  counterProposal.value = row?.proposal
    ? JSON.parse(JSON.stringify(row.proposal))
    : (row?.counter ? JSON.parse(JSON.stringify(row.counter)) : emptyProposal())
  counterModalOpen.value = true
}

function closeCounterEditor() {
  counterModalOpen.value = false
  counterRequestRow.value = null
  counterProposal.value = null
}

async function submitCounter() {
  if (!counterRequestRow.value || !counterProposal.value) return
  if (!counterProposal.value.rent && !counterProposal.value.sale) {
    counterError.value = 'Add at least one fee (rent or sale) before sending.'
    return
  }
  counterSubmitting.value = true
  counterError.value = null
  try {
    const ok = counterRequestKind.value === 'agent'
      ? await counterAgentRequest(counterRequestRow.value, counterProposal.value)
      : await counterPmRequest(counterRequestRow.value, counterProposal.value)
    if (ok) closeCounterEditor()
  } finally {
    counterSubmitting.value = false
  }
}

const assignablePmUserIds = computed(() => {
  const assigned = new Set(pmAssignments.value.map((a) => String(a.managerUserId)))
  return pmRoleUserIds.value.filter((uid) => !assigned.has(uid))
})

const tabs = [
  { id: 'summary', label: 'Overview', icon: 'las la-th-large' },
  { id: 'details', label: 'Details', icon: 'las la-edit' },
  { id: 'amenities', label: 'Amenities', icon: 'las la-list-alt' },
  { id: 'images', label: 'Images', icon: 'las la-images' },
  { id: 'units', label: 'Units', icon: 'las la-layer-group' },
  { id: 'agent', label: 'Agent', icon: 'las la-user-tie' },
  { id: 'pm', label: 'Managers', icon: 'las la-user-cog' },
  { id: 'payouts', label: 'Payouts', icon: 'las la-coins' },
]

// Edit form
const edit = reactive({
  name: '', title: '', listingLabel: '', propertyType: 'Apartment', listingType: 'rent',
  description: '', address: '', buildingName: '', area: '', neighborhood: '', postalCode: '',
  city: '', state: '', country: '', geoLat: null as number | null, geoLng: null as number | null,
  bedrooms: null as number | null, bathrooms: null as number | null, totalUnits: null as number | null,
  sizeSqft: null as number | null, sizeSqm: null as number | null, propertyAgeYears: null as number | null,
  price: null as number | null, priceCurrency: 'GHS', pricePeriod: 'month',
  estimatedMortgageMonthly: null as number | null, mortgageCurrency: 'GHS', priceTrendsNote: '',
  amenities: [] as string[],
  images: [] as string[]
})

// Unit modal
const unitModal = ref(false)
const unitSaving = ref(false)
const unitError = ref<string | null>(null)
const unitActiveTab = ref('basic')
const unitTabs = [
  { id: 'basic', label: 'Basic' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'lease', label: 'Lease' },
  { id: 'images', label: 'Images' }
]
const unitForm = reactive({
  _id: '', unitNumber: '', bedrooms: 1, bathrooms: 1, squareFeet: null as number | null,
  rentAmount: 0, rentCurrency: 'GHS', status: 'vacant' as 'vacant' | 'occupied' | 'maintenance',
  listingType: 'rental' as 'rental' | 'sale', salePrice: null as number | null,
  mortgageEligible: false, mortgagePartner: '',
  leaseStart: '', leaseEnd: '', images: [] as string[]
})

const daysUntilLeaseEnd = computed(() => {
  if (!unitForm.leaseEnd) return null
  const diff = new Date(unitForm.leaseEnd).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
})

function unitStatusClass(status: string) {
  if (status === 'occupied') return 'bg-emerald-50 text-emerald-700'
  if (status === 'maintenance') return 'bg-amber-50 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

function syncEditFromSelected() {
  const p = properties.selected as any
  if (!p) return
  // If the property already has city/country, stay in chip view
  if (p.city || p.country) manualGeo.value = false
  edit.name = p.name || ''; edit.title = p.title || ''; edit.listingLabel = p.listingLabel || ''
  edit.propertyType = p.propertyType || 'Apartment'; edit.listingType = p.listingType || 'rent'
  edit.description = p.description || ''; edit.address = p.address || ''
  edit.buildingName = p.buildingName || ''; edit.area = p.area || ''
  edit.neighborhood = p.neighborhood || ''; edit.postalCode = p.postalCode || ''
  edit.city = p.city || ''; edit.state = p.state || ''; edit.country = p.country || ''
  edit.geoLat = p.geo?.lat ?? null; edit.geoLng = p.geo?.lng ?? null
  edit.bedrooms = p.bedrooms ?? null; edit.bathrooms = p.bathrooms ?? null
  edit.totalUnits = p.totalUnits ?? null; edit.sizeSqft = p.sizeSqft ?? null
  edit.sizeSqm = p.sizeSqm ?? null; edit.propertyAgeYears = p.propertyAgeYears ?? null
  edit.price = p.price ?? null; edit.priceCurrency = p.priceCurrency || 'GHS'
  edit.pricePeriod = p.pricePeriod || 'month'
  edit.estimatedMortgageMonthly = p.estimatedMortgageMonthly ?? null
  edit.mortgageCurrency = p.mortgageCurrency || 'GHS'
  edit.priceTrendsNote = p.priceTrendsNote || ''
  edit.amenities = Array.isArray(p.amenities) ? [...p.amenities] : []
  edit.images = Array.isArray(p.images) ? [...p.images] : []
}

async function reloadUnits() {
  unitsLoading.value = true
  try { units.value = await unitsStore.fetchForProperty(id.value) }
  catch (e: any) { pageError.value = e?.message || 'Failed to load units' }
  finally { unitsLoading.value = false }
}

watch(() => properties.selected, () => syncEditFromSelected(), { immediate: true })

watch(activeTab, (t) => {
  if (t === 'agent') void loadAgentTab()
  if (t === 'pm') void loadPmTab()
})

async function loadAgentTab() {
  agentTabError.value = null
  agentTabLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const pid = id.value
    const [asRes, reqRes, profRes] = await Promise.all([
      feathers.service('agent-assignments').find({ query: { propertyId: pid, $limit: 50, $sort: { createdAt: -1 } } }),
      feathers.service('agent-listing-requests').find({ query: { propertyId: pid, status: { $in: ['pending', 'countered'] }, $limit: 50, $sort: { createdAt: -1 } } }),
      feathers.service('agent-profiles').find({ query: { $limit: 80, $sort: { createdAt: -1 }, $include: ['files'] } })
    ])
    const norm = (res: any) => {
      const d = res?.data
      return Array.isArray(d) ? d : Array.isArray(res) ? res : []
    }
    assignments.value = norm(asRes)
    incomingAgentRequests.value = norm(reqRes)
    let merged = norm(profRes)
    const uidSet = new Set<string>()
    for (const r of incomingAgentRequests.value) {
      if (r?.agentUserId) uidSet.add(String(r.agentUserId))
    }
    for (const a of assignments.value) {
      if (a?.agentUserId) uidSet.add(String(a.agentUserId))
    }
    const have = new Set(merged.map((p: any) => String(p.userId || '')))
    const needIds = [...uidSet].filter((id) => id && !have.has(id))
    if (needIds.length) {
      const extraRes = await feathers.service('agent-profiles').find({
        query: { userId: { $in: needIds }, $limit: 100, $include: ['files'] }
      })
      merged = [...merged, ...norm(extraRes)]
    }
    const seen = new Set<string>()
    agentProfiles.value = merged.filter((p: any) => {
      const u = String(p?.userId || '')
      if (!u || seen.has(u)) return false
      seen.add(u)
      return true
    })
  } catch (e: any) {
    agentTabError.value = e?.message || 'Failed to load agent data'
  } finally {
    agentTabLoading.value = false
  }
}

async function submitAssignAgent() {
  if (!assignForm.agentUserId) return
  assignSaving.value = true
  agentTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    const payload: Record<string, any> = {
      propertyId: id.value,
      agentUserId: assignForm.agentUserId.trim()
    }
    if (assignForm.commissionPercent != null && assignForm.commissionPercent !== ('' as any)) {
      payload.commissionPercent = Number(assignForm.commissionPercent)
    }
    if (assignForm.agreementNote.trim()) payload.agreementNote = assignForm.agreementNote.trim()
    await feathers.service('agent-assignments').create(payload)
    assignForm.agentUserId = ''
    assignForm.commissionPercent = null
    assignForm.agreementNote = ''
    await loadAgentTab()
  } catch (e: any) {
    agentTabError.value = e?.message || 'Assignment failed'
  } finally {
    assignSaving.value = false
  }
}

async function decideAgentRequest(row: any, status: 'accepted' | 'rejected'): Promise<boolean> {
  requestActionId.value = String(row._id)
  agentTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('agent-listing-requests').patch(String(row._id), { status })
    await loadAgentTab()
    return true
  } catch (e: any) {
    agentTabError.value = e?.message || 'Could not update request'
    return false
  } finally {
    requestActionId.value = null
  }
}

async function counterAgentRequest(row: any, counter: FeeProposal): Promise<boolean> {
  requestActionId.value = String(row._id)
  agentTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('agent-listing-requests').patch(String(row._id), { counter, status: 'countered' })
    await loadAgentTab()
    return true
  } catch (e: any) {
    agentTabError.value = e?.message || 'Could not send counter'
    return false
  } finally {
    requestActionId.value = null
  }
}

async function startThreadFromAgentRequest(row: any) {
  try {
    const feathers = useNuxtApp().$feathers as any
    const t = await feathers.service('threads').create({
      kind: 'landlord-agent',
      subject: 'property',
      propertyId: row.propertyId,
      participantIds: [String(row.landlordId), String(row.agentUserId)],
      title: properties.selected?.name || 'Listing chat'
    })
    await navigateTo(`/messages/${t._id}`)
  } catch (e: any) {
    agentTabError.value = e?.message || 'Could not start chat'
  }
}

async function decideAgentRequestFromModal(status: 'accepted' | 'rejected') {
  const row = agentDetailRequest.value
  if (!row) return
  const ok = await decideAgentRequest(row, status)
  if (ok) closeAgentDetail()
}

async function removeAssignment(row: any) {
  if (!confirm('Remove this agent from the property?')) return
  removingAssignmentId.value = String(row._id)
  agentTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('agent-assignments').remove(String(row._id))
    await loadAgentTab()
  } catch (e: any) {
    agentTabError.value = e?.message || 'Remove failed'
  } finally {
    removingAssignmentId.value = null
  }
}

function normFeathersRows(res: any): any[] {
  const d = res?.data
  return Array.isArray(d) ? d : Array.isArray(res) ? res : []
}

async function loadPmTab() {
  pmTabError.value = null
  pmTabLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const pid = id.value
    const [asRes, reqRes, rolesRes] = await Promise.all([
      feathers.service('property-manager-assignments').find({ query: { propertyId: pid, $limit: 50, $sort: { createdAt: -1 } } }),
      feathers.service('property-manager-listing-requests').find({
        query: { propertyId: pid, status: { $in: ['pending', 'countered'] }, $limit: 50, $sort: { createdAt: -1 } }
      }),
      feathers.service('user-roles').find({
        query: { role: 'property_manager', $limit: 200, $sort: { createdAt: -1 } }
      })
    ])
    pmAssignments.value = normFeathersRows(asRes)
    incomingPmRequests.value = normFeathersRows(reqRes)
    const roleRows = normFeathersRows(rolesRes)
    const ids = roleRows.map((r: any) => String(r.userId || '').trim()).filter(Boolean)
    pmRoleUserIds.value = [...new Set(ids)]

    // Fetch property-manager profiles (with verification files) for everyone shown in requests + assignments
    const uidSet = new Set<string>()
    for (const r of incomingPmRequests.value) if (r?.managerUserId) uidSet.add(String(r.managerUserId))
    for (const a of pmAssignments.value) if (a?.managerUserId) uidSet.add(String(a.managerUserId))
    const uidArr = [...uidSet]
    if (uidArr.length) {
      const profRes = await feathers.service('property-manager-profiles').find({
        query: { userId: { $in: uidArr }, $limit: 200, $include: ['files'] }
      })
      pmProfiles.value = normFeathersRows(profRes)
    } else {
      pmProfiles.value = []
    }
  } catch (e: any) {
    pmTabError.value = e?.message || 'Failed to load property manager data'
  } finally {
    pmTabLoading.value = false
  }
}

async function submitAssignPm() {
  if (!assignPmForm.managerUserId) return
  assignPmSaving.value = true
  pmTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('property-manager-assignments').create({
      propertyId: id.value,
      managerUserId: assignPmForm.managerUserId.trim()
    })
    assignPmForm.managerUserId = ''
    await loadPmTab()
  } catch (e: any) {
    pmTabError.value = e?.message || 'Assignment failed'
  } finally {
    assignPmSaving.value = false
  }
}

async function decidePmRequest(row: any, status: 'accepted' | 'rejected') {
  pmRequestActionId.value = String(row._id)
  pmTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('property-manager-listing-requests').patch(String(row._id), { status })
    await loadPmTab()
  } catch (e: any) {
    pmTabError.value = e?.message || 'Could not update request'
  } finally {
    pmRequestActionId.value = null
  }
}

async function counterPmRequest(row: any, counter: FeeProposal): Promise<boolean> {
  pmRequestActionId.value = String(row._id)
  pmTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('property-manager-listing-requests').patch(String(row._id), { counter, status: 'countered' })
    await loadPmTab()
    return true
  } catch (e: any) {
    pmTabError.value = e?.message || 'Could not send counter'
    return false
  } finally {
    pmRequestActionId.value = null
  }
}

async function startThreadFromPmRequest(row: any) {
  try {
    const feathers = useNuxtApp().$feathers as any
    const t = await feathers.service('threads').create({
      kind: 'landlord-pm',
      subject: 'property',
      propertyId: row.propertyId,
      participantIds: [String(row.landlordId), String(row.managerUserId)],
      title: properties.selected?.name || 'Management chat'
    })
    await navigateTo(`/messages/${t._id}`)
  } catch (e: any) {
    pmTabError.value = e?.message || 'Could not start chat'
  }
}

async function removePmAssignment(row: any) {
  if (!confirm('Remove this property manager from the property?')) return
  pmRemovingAssignmentId.value = String(row._id)
  pmTabError.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('property-manager-assignments').remove(String(row._id))
    await loadPmTab()
  } catch (e: any) {
    pmTabError.value = e?.message || 'Remove failed'
  } finally {
    pmRemovingAssignmentId.value = null
  }
}

// ── Real-time: keep agent/PM tab local lists in sync via socket events ──────
// We maintain our own listeners (not store) because this page uses local refs
// filtered to the current propertyId.
onMounted(async () => {
  pageError.value = null
  try {
    await properties.fetchById(id.value, ['units'])
    if ((properties.selected as any)?.units) units.value = (properties.selected as any).units
    else await reloadUnits()
    syncEditFromSelected()
  } catch (e: any) { pageError.value = e?.message || 'Failed to load property' }

  // For PM/agent viewers: prefetch their existing thread with the landlord (if any).
  try {
    const banner = roleContextBanner.value
    if (banner) {
      const myId = String((auth.user as any)?._id || '')
      const landlordId = String((properties.selected as any)?.landlordId || '')
      const isPm = auth.hasRole('property_manager') && !auth.hasRole('landlord')
      if (myId && landlordId) {
        const feathers = useNuxtApp().$feathers as any
        const res = await feathers.service('threads').find({
          query: {
            kind: isPm ? 'landlord-pm' : 'landlord-agent',
            participantIds: myId,
            propertyId: id.value,
            $limit: 1
          }
        })
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        const tid = arr[0]?._id ? String(arr[0]._id) : null
        if (tid) {
          if (isPm) pmActiveThreadId.value = tid
          else agentActiveThreadId.value = tid
        }
      }
    }
  } catch {}

  const feathers = useNuxtApp().$feathers as any
  const pid = id.value

  function upsertById<T extends { _id?: string }>(list: Ref<T[]>, row: T) {
    const rowId = String((row as any)?._id || '')
    if (!rowId) return
    const i = list.value.findIndex((x: any) => String(x._id) === rowId)
    if (i >= 0) list.value[i] = row
    else list.value.unshift(row)
  }
  function removeById<T>(list: Ref<T[]>, row: any) {
    const rowId = String(row?._id || '')
    list.value = list.value.filter((x: any) => String(x._id) !== rowId)
  }

  // Agent assignments (created/patched/removed for this property)
  const aaSvc = feathers.service('agent-assignments')
  const onAaUpsert = (row: any) => { if (String(row?.propertyId) === pid) upsertById(assignments, row) }
  const onAaRemove = (row: any) => { if (String(row?.propertyId) === pid) removeById(assignments, row) }
  aaSvc.on('created', onAaUpsert); aaSvc.on('patched', onAaUpsert); aaSvc.on('updated', onAaUpsert)
  aaSvc.on('removed', onAaRemove)

  // Agent listing requests (pending requests from agents for this property)
  const alrSvc = feathers.service('agent-listing-requests')
  const onAlrUpsert = (row: any) => { if (String(row?.propertyId) === pid) upsertById(incomingAgentRequests, row) }
  const onAlrRemove = (row: any) => { if (String(row?.propertyId) === pid) removeById(incomingAgentRequests, row) }
  alrSvc.on('created', onAlrUpsert); alrSvc.on('patched', onAlrUpsert); alrSvc.on('updated', onAlrUpsert)
  alrSvc.on('removed', onAlrRemove)

  // Property-manager assignments for this property
  const pmaSvc = feathers.service('property-manager-assignments')
  const onPmaUpsert = (row: any) => { if (String(row?.propertyId) === pid) upsertById(pmAssignments, row) }
  const onPmaRemove = (row: any) => { if (String(row?.propertyId) === pid) removeById(pmAssignments, row) }
  pmaSvc.on('created', onPmaUpsert); pmaSvc.on('patched', onPmaUpsert); pmaSvc.on('updated', onPmaUpsert)
  pmaSvc.on('removed', onPmaRemove)

  // PM listing requests for this property
  const pmlrSvc = feathers.service('property-manager-listing-requests')
  const onPmlrUpsert = (row: any) => { if (String(row?.propertyId) === pid) upsertById(incomingPmRequests, row) }
  const onPmlrRemove = (row: any) => { if (String(row?.propertyId) === pid) removeById(incomingPmRequests, row) }
  pmlrSvc.on('created', onPmlrUpsert); pmlrSvc.on('patched', onPmlrUpsert); pmlrSvc.on('updated', onPmlrUpsert)
  pmlrSvc.on('removed', onPmlrRemove)

  onBeforeUnmount(() => {
    aaSvc.off('created', onAaUpsert); aaSvc.off('patched', onAaUpsert); aaSvc.off('updated', onAaUpsert)
    aaSvc.off('removed', onAaRemove)
    alrSvc.off('created', onAlrUpsert); alrSvc.off('patched', onAlrUpsert); alrSvc.off('updated', onAlrUpsert)
    alrSvc.off('removed', onAlrRemove)
    pmaSvc.off('created', onPmaUpsert); pmaSvc.off('patched', onPmaUpsert); pmaSvc.off('updated', onPmaUpsert)
    pmaSvc.off('removed', onPmaRemove)
    pmlrSvc.off('created', onPmlrUpsert); pmlrSvc.off('patched', onPmlrUpsert); pmlrSvc.off('updated', onPmlrUpsert)
    pmlrSvc.off('removed', onPmlrRemove)
  })
})

function onPlaceSelected(place: import('@@/components/UiAddressAutocomplete.vue').PlaceResult) {
  edit.address = place.address || edit.address
  if (place.buildingName) edit.buildingName = place.buildingName
  if (place.area) edit.area = place.area
  if (place.neighborhood) edit.neighborhood = place.neighborhood
  // Always overwrite city/state/country from Google, revert to chip view
  edit.city = place.city || edit.city
  edit.state = place.state || edit.state
  edit.country = place.country || edit.country
  manualGeo.value = false
  if (place.postalCode) edit.postalCode = place.postalCode
  if (place.lat !== null) edit.geoLat = place.lat
  if (place.lng !== null) edit.geoLng = place.lng
}

async function saveProperty() {
  savingProp.value = true; pageError.value = null; saveSuccess.value = false
  try {
    const payload: Record<string, any> = {
      name: edit.name.trim(), address: edit.address.trim(), city: edit.city.trim(),
      country: edit.country.trim(), propertyType: edit.propertyType,
      listingType: edit.listingType,
      ...(edit.title.trim() && { title: edit.title.trim() }),
      ...(edit.listingLabel.trim() && { listingLabel: edit.listingLabel.trim() }),
      ...(edit.description.trim() && { description: edit.description.trim() }),
      ...(edit.buildingName.trim() && { buildingName: edit.buildingName.trim() }),
      ...(edit.area.trim() && { area: edit.area.trim() }),
      ...(edit.neighborhood.trim() && { neighborhood: edit.neighborhood.trim() }),
      ...(edit.postalCode.trim() && { postalCode: edit.postalCode.trim() }),
      ...(edit.state.trim() && { state: edit.state.trim() }),
      ...(edit.priceTrendsNote.trim() && { priceTrendsNote: edit.priceTrendsNote.trim() }),
      ...(edit.bedrooms != null && { bedrooms: edit.bedrooms }),
      ...(edit.bathrooms != null && { bathrooms: edit.bathrooms }),
      ...(edit.totalUnits != null && { totalUnits: edit.totalUnits }),
      ...(edit.sizeSqft != null && { sizeSqft: edit.sizeSqft }),
      ...(edit.sizeSqm != null && { sizeSqm: edit.sizeSqm }),
      ...(edit.propertyAgeYears != null && { propertyAgeYears: edit.propertyAgeYears }),
      ...(edit.price != null && { price: edit.price, priceCurrency: edit.priceCurrency, pricePeriod: edit.pricePeriod }),
      ...(edit.estimatedMortgageMonthly != null && { estimatedMortgageMonthly: edit.estimatedMortgageMonthly, mortgageCurrency: edit.mortgageCurrency }),
      ...(edit.geoLat && edit.geoLng ? { geo: { lat: edit.geoLat, lng: edit.geoLng } } : {}),
    }
    await properties.patchProperty(id.value, payload)
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 3000)
  } catch (e: any) { pageError.value = e?.message || 'Save failed' }
  finally { savingProp.value = false }
}

async function saveAmenities() {
  savingAmenities.value = true; amenitiesSaved.value = false
  try {
    await properties.patchProperty(id.value, { amenities: edit.amenities })
    amenitiesSaved.value = true
    setTimeout(() => { amenitiesSaved.value = false }, 3000)
  } catch (e: any) { pageError.value = e?.message || 'Failed to save amenities' }
  finally { savingAmenities.value = false }
}

function onImagesUpdate(imgs: string[]) {
  edit.images = imgs
}

async function saveImageOrder() {
  savingImages.value = true
  try { await properties.patchProperty(id.value, { images: edit.images }) }
  catch (e: any) { pageError.value = e?.message || 'Failed to save images' }
  finally { savingImages.value = false }
}

async function removeProperty() {
  if (!confirm('Delete this property and unlink all units? This cannot be undone.')) return
  deleting.value = true
  try { await properties.removeProperty(id.value); await navigateTo('/landlord/properties') }
  catch (e: any) { pageError.value = e?.message || 'Delete failed' }
  finally { deleting.value = false }
}

function openNewUnit() {
  unitError.value = null; unitActiveTab.value = 'basic'
  Object.assign(unitForm, { _id: '', unitNumber: '', bedrooms: 1, bathrooms: 1, squareFeet: null,
    rentAmount: 0, rentCurrency: 'GHS', status: 'vacant', listingType: 'rental', salePrice: null,
    mortgageEligible: false, mortgagePartner: '', leaseStart: '', leaseEnd: '', images: [] })
  unitModal.value = true
}

function editUnit(u: any) {
  unitError.value = null; unitActiveTab.value = 'basic'
  Object.assign(unitForm, {
    _id: String(u._id), unitNumber: String(u.unitNumber || ''), bedrooms: Number(u.bedrooms) || 0,
    bathrooms: Number(u.bathrooms) || 0, squareFeet: u.squareFeet ?? null,
    rentAmount: Number(u.rentAmount) || 0, rentCurrency: String(u.rentCurrency || 'GHS'),
    status: u.status || 'vacant', listingType: u.listingType || 'rental',
    salePrice: u.salePrice ?? null, mortgageEligible: Boolean(u.mortgageEligible),
    mortgagePartner: u.mortgagePartner || '', leaseStart: u.leaseStart ? u.leaseStart.slice(0, 10) : '',
    leaseEnd: u.leaseEnd ? u.leaseEnd.slice(0, 10) : '', images: Array.isArray(u.images) ? [...u.images] : []
  })
  unitModal.value = true
}

function onUnitImagesUpdate(imgs: string[]) {
  unitForm.images = imgs
}

async function saveUnit() {
  unitError.value = null; unitSaving.value = true
  try {
    if (!unitForm.unitNumber.trim()) throw new Error('Unit number is required')
    const payload: Record<string, any> = {
      unitNumber: unitForm.unitNumber.trim(), bedrooms: unitForm.bedrooms, bathrooms: unitForm.bathrooms,
      rentAmount: unitForm.rentAmount, rentCurrency: unitForm.rentCurrency, status: unitForm.status,
      listingType: unitForm.listingType,
      ...(unitForm.squareFeet ? { squareFeet: unitForm.squareFeet } : {}),
      ...(unitForm.listingType === 'sale' && unitForm.salePrice ? { salePrice: unitForm.salePrice } : {}),
      mortgageEligible: unitForm.mortgageEligible,
      ...(unitForm.mortgagePartner.trim() ? { mortgagePartner: unitForm.mortgagePartner.trim() } : {}),
      ...(unitForm.leaseStart ? { leaseStart: unitForm.leaseStart } : {}),
      ...(unitForm.leaseEnd ? { leaseEnd: unitForm.leaseEnd } : {}),
    }
    if (unitForm._id) await unitsStore.patchUnit(unitForm._id, payload)
    else await unitsStore.createUnit({ propertyId: id.value, ...payload })
    unitModal.value = false
    await reloadUnits()
  } catch (e: any) { unitError.value = e?.message || 'Unit save failed' }
  finally { unitSaving.value = false }
}

async function deleteUnit() {
  if (!unitForm._id || !confirm('Delete this unit? This cannot be undone.')) return
  unitSaving.value = true
  try {
    await unitsStore.removeUnit(unitForm._id)
    unitModal.value = false
    await reloadUnits()
  } catch (e: any) { unitError.value = e?.message || 'Delete failed' }
  finally { unitSaving.value = false }
}
</script>

<style scoped>
.field-label { @apply mb-1 block text-xs font-semibold text-gray-700; }
.field-input { @apply w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500; }
</style>
