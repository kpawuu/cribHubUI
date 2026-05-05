<template>
  <div class="min-h-screen bg-gray-50">

    <!-- ══════════════════════════════════════
         LOADING SKELETON
    ══════════════════════════════════════ -->
    <div v-if="loading">
      <div class="h-72 animate-pulse bg-gray-200 w-full"></div>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8">
        <div class="flex items-end gap-5">
          <div class="h-28 w-28 shrink-0 rounded-full animate-pulse bg-gray-300 border-4 border-white"></div>
          <div class="pb-4 flex-1 space-y-2">
            <div class="h-6 w-64 animate-pulse rounded bg-gray-200"></div>
            <div class="h-4 w-40 animate-pulse rounded bg-gray-100"></div>
          </div>
        </div>
        <div class="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="n in 6" :key="n" class="h-52 animate-pulse rounded bg-gray-100"></div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════
         NOT FOUND
    ══════════════════════════════════════ -->
    <div v-else-if="!agent" class="flex flex-col items-center justify-center py-36 text-center px-4">
      <div class="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <svg class="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900">Agent not found</h2>
      <p class="mt-1 text-sm text-gray-500 max-w-xs">This agent profile doesn't exist or has been removed.</p>
      <NuxtLink to="/agents" class="mt-5 inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Back to agents
      </NuxtLink>
    </div>

    <!-- ══════════════════════════════════════
         MAIN PROFILE
    ══════════════════════════════════════ -->
    <template v-else>

      <!-- ── HERO BANNER ── everything lives inside this -->
      <div class="relative w-full bg-gray-900" style="min-height: 26rem;">
        <!-- Background photo -->
        <img
          :src="heroBanner"
          alt=""
          class="absolute inset-0 w-full h-full object-cover"
        />
        <!-- Gradient: heavy at bottom for readability, light at top -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>

        <!-- Top row: breadcrumb -->
        <div class="relative z-10 pt-5">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <NuxtLink
              to="/agents"
              class="inline-flex items-center gap-1.5 rounded bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              All agents
            </NuxtLink>
          </div>
        </div>

        <!-- Bottom content: avatar + identity left, contact buttons right -->
        <div class="relative z-10 pb-8 pt-16 sm:pt-20">
          <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">

              <!-- LEFT: avatar + name block -->
              <div class="flex items-end gap-4 sm:gap-5">
                <!-- Avatar — fully inside the banner -->
                <div class="relative shrink-0">
                  <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] border-white/80 bg-white shadow-2xl">
                    <img
                      v-if="agent.avatarUrl"
                      :src="agent.avatarUrl"
                      :alt="agent.displayName"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center bg-primary-600 text-white text-2xl sm:text-3xl font-extrabold"
                    >
                      {{ initials(agent.displayName) }}
                    </div>
                  </div>
                  <!-- Verified dot -->
                  <span
                    v-if="agent.verified"
                    class="absolute bottom-0.5 right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-md"
                  >
                    <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </span>
                </div>

                <!-- Name + meta -->
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h1 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight drop-shadow">
                      {{ agent.displayName }}
                    </h1>
                    <span
                      v-if="agent.verified"
                      class="inline-flex items-center gap-1 rounded bg-emerald-500/80 backdrop-blur-sm border border-emerald-400/40 px-2 py-0.5 text-[11px] font-bold text-white"
                    >
                      <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                      </svg>
                      Verified
                    </span>
                  </div>
                  <p class="mt-0.5 text-sm text-white/75 font-medium">{{ agent.agency || 'Independent Agent' }}</p>
                  <!-- Stars + quick meta row -->
                  <div class="mt-2 flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-0.5">
                      <svg v-for="s in 5" :key="s" class="w-3.5 h-3.5" :class="s <= Math.round(ratingAvg) ? 'text-yellow-400' : 'text-white/25'" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span class="ml-1 text-sm font-bold text-white">{{ ratingAvg > 0 ? ratingAvg.toFixed(1) : 'No ratings' }}</span>
                      <span v-if="ratingCount > 0" class="ml-1 text-xs text-white/55">({{ ratingCount }})</span>
                    </div>
                    <span v-if="agent.responseTimeMinutes" class="flex items-center gap-1 text-xs text-white/65">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ agent.responseTimeMinutes }} min response
                    </span>
                    <span v-if="(agent.regions || []).length" class="hidden sm:flex items-center gap-1 text-xs text-white/55">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      {{ agent.regions.slice(0, 2).join(', ') }}{{ agent.regions.length > 2 ? ` +${agent.regions.length - 2}` : '' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- RIGHT: contact buttons — frosted glass on the banner -->
              <div class="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  v-if="agent.phone"
                  :href="`tel:${agent.phone}`"
                  class="inline-flex items-center gap-2 rounded bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  Call
                </a>
                <a
                  v-if="agent.whatsapp"
                  :href="`https://wa.me/${agent.whatsapp.replace(/\D/g, '')}`"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center gap-2 rounded bg-emerald-500/80 backdrop-blur-sm border border-emerald-400/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500/95 transition"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
                  </svg>
                  WhatsApp
                </a>
                <a
                  v-if="agent.emailPublic"
                  :href="`mailto:${agent.emailPublic}`"
                  class="inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition shadow-lg"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Email agent
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- ── STATS STRIP ── snaps directly under the banner -->
      <div class="bg-white border-b border-gray-200 shadow-sm">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
            <div class="py-4 px-5 text-center">
              <p class="text-2xl font-extrabold text-gray-900 tabular-nums">{{ properties.length }}</p>
              <p class="mt-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Properties</p>
            </div>
            <div class="py-4 px-5 text-center">
              <p class="text-2xl font-extrabold text-primary-600 tabular-nums">{{ agent.listingsCount ?? properties.length }}</p>
              <p class="mt-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Listings</p>
            </div>
            <div class="py-4 px-5 text-center">
              <p class="text-2xl font-extrabold text-gray-900 tabular-nums">
                {{ agent.responseTimeMinutes ? `${agent.responseTimeMinutes}m` : '—' }}
              </p>
              <p class="mt-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg. Response</p>
            </div>
            <div class="py-4 px-5 text-center">
              <p class="text-2xl font-extrabold text-gray-900 tabular-nums">{{ memberSince(agent.createdAt) }}</p>
              <p class="mt-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           BODY — sidebar + properties
      ══════════════════════════════════════ -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid lg:grid-cols-3 gap-6 xl:gap-8">

          <!-- LEFT SIDEBAR -->
          <div class="lg:col-span-1 space-y-4">

            <!-- About / bio -->
            <div v-if="agent.bio" class="bg-white rounded border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                <svg class="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-700">About</span>
              </div>
              <p class="px-4 py-4 text-sm text-gray-600 leading-relaxed">{{ agent.bio }}</p>
            </div>

            <!-- Quick facts table -->
            <div class="bg-white rounded border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                <svg class="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-700">Quick facts</span>
              </div>
              <div class="divide-y divide-gray-100">
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Agency
                  </span>
                  <span class="text-xs font-semibold text-gray-800 text-right max-w-[55%] truncate">{{ agent.agency || 'Independent' }}</span>
                </div>
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Member since
                  </span>
                  <span class="text-xs font-semibold text-gray-800">{{ memberSince(agent.createdAt) }}</span>
                </div>
                <div v-if="agent.responseTimeMinutes" class="flex items-center justify-between px-4 py-3">
                  <span class="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Avg. response
                  </span>
                  <span class="text-xs font-semibold text-gray-800">{{ agent.responseTimeMinutes }} min</span>
                </div>
                <div class="flex items-center justify-between px-4 py-3">
                  <span class="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Status
                  </span>
                  <span :class="['text-xs font-bold', agent.verified ? 'text-emerald-600' : 'text-amber-600']">
                    {{ agent.verified ? 'Verified ✓' : 'Pending review' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Coverage areas -->
            <div v-if="agent.regions?.length" class="bg-white rounded border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                <svg class="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-700">Coverage areas</span>
              </div>
              <div class="px-4 py-3 flex flex-wrap gap-1.5">
                <span
                  v-for="r in agent.regions"
                  :key="r"
                  class="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 transition"
                >{{ r }}</span>
              </div>
            </div>

            <!-- Languages -->
            <div v-if="agent.languages?.length" class="bg-white rounded border border-gray-200 overflow-hidden">
              <div class="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                <svg class="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
                </svg>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-700">Languages</span>
              </div>
              <div class="px-4 py-3 flex flex-wrap gap-1.5">
                <span
                  v-for="l in agent.languages"
                  :key="l"
                  class="rounded border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700"
                >{{ l }}</span>
              </div>
            </div>

          </div>

          <!-- RIGHT: PROPERTIES -->
          <div class="lg:col-span-2">

            <!-- Section header -->
            <div class="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <svg class="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Properties managed
                </h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{ properties.length }} {{ properties.length === 1 ? 'property' : 'properties' }} listed by this agent
                </p>
              </div>
              <div class="relative w-48">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  v-model="propSearch"
                  type="search"
                  placeholder="Filter properties…"
                  class="w-full rounded border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400"
                />
              </div>
            </div>

            <!-- Properties loading -->
            <div v-if="propsLoading" class="grid sm:grid-cols-2 gap-4">
              <div v-for="n in 4" :key="n" class="h-56 animate-pulse rounded bg-gray-100"></div>
            </div>

            <!-- No properties -->
            <div v-else-if="filteredProperties.length === 0" class="bg-white rounded border border-gray-200 p-12 text-center">
              <svg class="mx-auto mb-3 w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <p class="text-sm font-semibold text-gray-900">No properties yet</p>
              <p class="mt-1 text-xs text-gray-400">
                {{ propSearch ? `No match for "${propSearch}"` : "This agent hasn't listed any properties yet." }}
              </p>
            </div>

            <!-- Property grid -->
            <div v-else class="grid sm:grid-cols-2 gap-4">
              <NuxtLink
                v-for="p in filteredProperties"
                :key="String(p._id)"
                :to="`/properties/${String(p._id)}`"
                class="group block bg-white rounded border border-gray-200 overflow-hidden hover:border-primary-400 hover:shadow-md transition"
              >
                <!-- Cover image -->
                <div class="relative h-44 bg-gray-100 overflow-hidden">
                  <img
                    v-if="p.coverImageUrl"
                    :src="p.coverImageUrl"
                    :alt="p.name"
                    class="w-full h-full object-cover transition duration-300 group-hover:scale-[1.04]"
                  />
                  <div v-else class="flex h-full items-center justify-center bg-gray-50">
                    <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <!-- Status + type badges -->
                  <div class="absolute top-2 left-2 flex gap-1.5">
                    <span v-if="p.status === 'available'" class="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">Available</span>
                    <span v-else-if="p.status" class="rounded bg-gray-700/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">{{ p.status }}</span>
                    <span v-if="p.propertyType" class="rounded bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase text-gray-700 shadow-sm">{{ p.propertyType }}</span>
                  </div>
                  <!-- Price overlay -->
                  <div v-if="p.rentAmount" class="absolute bottom-2 right-2">
                    <span class="rounded bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
                      GHS {{ Number(p.rentAmount).toLocaleString() }}<span class="font-normal opacity-80">/mo</span>
                    </span>
                  </div>
                </div>

                <!-- Card body -->
                <div class="p-3.5">
                  <p class="text-sm font-bold text-gray-900 truncate">{{ p.name || 'Unnamed property' }}</p>
                  <p class="mt-0.5 flex items-center gap-1 text-xs text-gray-500 truncate">
                    <svg class="w-3 h-3 text-primary-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {{ [p.address, p.city].filter(Boolean).join(', ') || 'Location not specified' }}
                  </p>

                  <div class="mt-2.5 flex items-center gap-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500">
                    <span v-if="p.bedrooms" class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                      {{ p.bedrooms }} bd
                    </span>
                    <span v-if="p.bathrooms" class="flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h4l3 9 4-18 3 9h4"></path></svg>
                      {{ p.bathrooms }} ba
                    </span>
                    <span class="ml-auto inline-flex items-center gap-1 text-primary-600 font-semibold text-xs">
                      View
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>

          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           RATINGS & REVIEWS SECTION
      ══════════════════════════════════════ -->
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div class="border-t border-gray-200 pt-8">

          <!-- Section title -->
          <div class="flex items-center gap-2 mb-6">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
            <h2 class="text-base font-bold text-gray-900">Reviews & Ratings</h2>
            <span v-if="ratingCount > 0" class="text-xs font-medium text-gray-400 ml-1">{{ ratingCount }} {{ ratingCount === 1 ? 'review' : 'reviews' }}</span>
          </div>

          <div class="grid lg:grid-cols-3 gap-6 xl:gap-8">

            <!-- LEFT: Rating overview + distribution -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded border border-gray-200 overflow-hidden">
                <!-- Overall score -->
                <div class="px-5 py-5 text-center border-b border-gray-100">
                  <div v-if="ratingsLoading" class="animate-pulse">
                    <div class="h-12 w-20 mx-auto rounded bg-gray-100 mb-2"></div>
                    <div class="h-4 w-32 mx-auto rounded bg-gray-100"></div>
                  </div>
                  <template v-else-if="ratingCount > 0">
                    <p class="text-5xl font-extrabold text-gray-900 tabular-nums leading-none">{{ ratingAvg.toFixed(1) }}</p>
                    <div class="mt-2 flex items-center justify-center gap-0.5">
                      <svg
                        v-for="s in 5" :key="s"
                        class="w-5 h-5"
                        :class="s <= Math.round(ratingAvg) ? 'text-yellow-400' : 'text-gray-200'"
                        fill="currentColor" viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                    <p class="mt-1 text-xs text-gray-400">Based on {{ ratingCount }} {{ ratingCount === 1 ? 'review' : 'reviews' }}</p>
                  </template>
                  <template v-else>
                    <div class="py-2">
                      <svg class="mx-auto w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                      </svg>
                      <p class="mt-2 text-sm font-semibold text-gray-700">No reviews yet</p>
                      <p class="text-xs text-gray-400 mt-0.5">Be the first to rate this agent</p>
                    </div>
                  </template>
                </div>

                <!-- Distribution bars -->
                <div v-if="ratingCount > 0" class="px-4 py-3 space-y-2">
                  <div v-for="row in ratingDistribution" :key="row.star" class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-gray-600 w-3 text-right shrink-0">{{ row.star }}</span>
                    <svg class="w-3 h-3 text-yellow-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <div class="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        class="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        :style="{ width: `${row.pct}%` }"
                      ></div>
                    </div>
                    <span class="text-xs text-gray-400 w-8 text-right shrink-0">{{ row.pct }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT: Write a review + recent reviews -->
            <div class="lg:col-span-2 space-y-4">

              <!-- WRITE / UPDATE REVIEW -->
              <ClientOnly>
                <div v-if="isAuthenticated" class="bg-white rounded border border-gray-200 overflow-hidden">
                  <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3">
                    <span class="text-xs font-bold uppercase tracking-wider text-gray-700">
                      {{ myRating ? 'Your review' : 'Rate this agent' }}
                    </span>
                    <span v-if="myRating" class="text-xs text-gray-400">{{ relativeTime(myRating.updatedAt || myRating.createdAt) }}</span>
                  </div>

                  <div class="px-4 py-4 space-y-4">
                    <!-- Star selector -->
                    <div>
                      <p class="text-xs font-semibold text-gray-600 mb-2">{{ formStar ? `You selected ${formStar} star${formStar > 1 ? 's' : ''}` : 'Tap a star to rate' }}</p>
                      <div class="flex items-center gap-1.5">
                        <button
                          v-for="s in 5" :key="s"
                          type="button"
                          class="transition-transform hover:scale-110"
                          @mouseenter="hoverStar = s"
                          @mouseleave="hoverStar = 0"
                          @click="formStar = s"
                        >
                          <svg
                            class="w-8 h-8 transition-colors"
                            :class="s <= (hoverStar || formStar) ? 'text-yellow-400' : 'text-gray-200'"
                            fill="currentColor" viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Comment -->
                    <div>
                      <label class="text-xs font-semibold text-gray-600 block mb-1.5">Comment <span class="font-normal text-gray-400">(optional)</span></label>
                      <textarea
                        v-model="formComment"
                        rows="3"
                        placeholder="Share your experience with this agent…"
                        class="w-full rounded border border-gray-200 px-3 py-2 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-400"
                        maxlength="1000"
                      ></textarea>
                      <p class="text-right text-xs text-gray-400 mt-0.5">{{ formComment.length }}/1000</p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center justify-between gap-3">
                      <button
                        v-if="myRating"
                        type="button"
                        class="text-xs font-semibold text-red-500 hover:text-red-700 transition"
                        @click="deleteRating"
                      >
                        Delete review
                      </button>
                      <div v-else></div>

                      <div class="flex items-center gap-2">
                        <!-- Success / error feedback -->
                        <span v-if="submitState === 'success'" class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                          Saved!
                        </span>
                        <span v-if="submitState === 'error'" class="text-xs text-red-500 max-w-[200px] truncate">{{ submitError }}</span>

                        <button
                          type="button"
                          :disabled="!formStar || submitState === 'saving'"
                          class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          @click="submitRating"
                        >
                          <svg v-if="submitState === 'saving'" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          {{ myRating ? 'Update review' : 'Submit review' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Not logged in prompt -->
                <div v-else class="bg-white rounded border border-gray-200 p-6 text-center">
                  <svg class="mx-auto mb-3 w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                  <p class="text-sm font-semibold text-gray-800">Sign in to rate this agent</p>
                  <p class="text-xs text-gray-400 mt-0.5 mb-4">Your review helps others find the right agent</p>
                  <NuxtLink to="/auth/login" class="inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition">
                    Sign in
                  </NuxtLink>
                </div>

                <template #fallback>
                  <div class="bg-white rounded border border-gray-200 h-24 animate-pulse"></div>
                </template>
              </ClientOnly>

              <!-- RECENT TEXT REVIEWS -->
              <div v-if="recentReviews.length > 0" class="space-y-3">
                <div
                  v-for="review in recentReviews"
                  :key="String(review._id)"
                  class="bg-white rounded border border-gray-200 px-4 py-3.5"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-2.5">
                      <!-- Reviewer initials avatar -->
                      <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
                        {{ initials(review.reviewerName) }}
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-gray-800 leading-tight">{{ review.reviewerName || 'Anonymous' }}</p>
                        <p class="text-xs text-gray-400">{{ relativeTime(review.createdAt) }}</p>
                      </div>
                    </div>
                    <!-- Stars -->
                    <div class="flex items-center gap-0.5 shrink-0">
                      <svg
                        v-for="s in 5" :key="s"
                        class="w-3.5 h-3.5"
                        :class="s <= review.rating ? 'text-yellow-400' : 'text-gray-200'"
                        fill="currentColor" viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    </div>
                  </div>
                  <p class="mt-2.5 text-sm text-gray-600 leading-relaxed">{{ review.comment }}</p>
                </div>

                <!-- Show more -->
                <button
                  v-if="ratings.filter((r) => r.comment?.trim()).length > 4 && !showAllReviews"
                  type="button"
                  class="w-full rounded border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition"
                  @click="showAllReviews = true"
                >
                  Show all {{ ratings.filter((r) => r.comment?.trim()).length }} reviews
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeFeathersFind } from '../../../utils/feathersNormalize'
import {
  agentProfileHasReviews,
  agentProfileRatingAvg,
  agentProfileRatingCount,
} from '../../composables/useAgentProfileRatings'
import { useAuthStore } from '@@/stores/auth'
import { useSeo, buildAgentSchema, buildBreadcrumbSchema } from '../../composables/useSeo'

definePageMeta({ layout: 'default' })

const { public: { siteUrl } } = useRuntimeConfig()

const route = useRoute()
const auth = useAuthStore()
const id = computed(() => String(route.params.id))

const agent = ref<any | null>(null)
const loading = ref(true)
const properties = ref<any[]>([])
const propsLoading = ref(false)
const propSearch = ref('')

// ─── Rating state ───────────────────────────────────────────────
const ratings = ref<any[]>([])
const ratingsLoading = ref(false)
const myRating = ref<any | null>(null)      // authenticated user's existing review
const hoverStar = ref(0)                    // star hovered in the form
const formStar = ref(0)                     // star selected in the form
const formComment = ref('')
const submitState = ref<'idle' | 'saving' | 'success' | 'error'>('idle')
const submitError = ref('')
const showAllReviews = ref(false)

// Derived rating stats — prefer denormalised profile fields (same source as listing cards)
const ratingAvg = computed(() => {
  if (agent.value && agentProfileHasReviews(agent.value)) {
    const av = agentProfileRatingAvg(agent.value)
    return av != null ? Number(av.toFixed(1)) : 0
  }
  if (!ratings.value.length) return 0
  const sum = ratings.value.reduce((s, r) => s + (r.rating ?? 0), 0)
  return Number((sum / ratings.value.length).toFixed(1))
})

const ratingCount = computed(() => {
  if (agent.value) {
    const n = agentProfileRatingCount(agent.value)
    if (n > 0) return n
  }
  return ratings.value.length
})

const ratingDistribution = computed(() => {
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const count = ratings.value.filter((r) => r.rating === star).length
    const pct = ratingCount.value > 0 ? Math.round((count / ratingCount.value) * 100) : 0
    return { star, count, pct }
  })
  return dist
})

const recentReviews = computed(() => {
  const withComments = ratings.value.filter((r) => r.comment?.trim())
  return showAllReviews.value ? withComments : withComments.slice(0, 4)
})

const isAuthenticated = computed(() => !!auth.user)

// ─── Head / SEO ─────────────────────────────────────────────────
useSeo(computed(() => {
  const a = agent.value
  const name = a?.displayName || a?.name || 'Real Estate Agent'
  const agency = a?.agency ? ` at ${a.agency}` : ''
  const reviewStr = ratingCount.value > 0 ? ` · ${ratingAvg.value}★ (${ratingCount.value} reviews)` : ''
  return {
    title: a ? `${name}${reviewStr}` : 'Agent Profile',
    description: a?.bio
      ? a.bio.slice(0, 155)
      : `${name}${agency} — certified real estate agent on CribHub${reviewStr}. View listings, ratings, and get in touch.`,
    image: a?.avatarUrl || a?.coverImage || undefined,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        buildAgentSchema(a, siteUrl as string),
        buildBreadcrumbSchema([
          { name: 'Home',   url: siteUrl as string },
          { name: 'Agents', url: `${siteUrl}/agents` },
          { name: name,     url: `${siteUrl}/agents/${id.value}` },
        ]),
      ].filter(Boolean),
    },
  }
}))

// ─── Helpers ────────────────────────────────────────────────────
const bannerImages = [
  '/images/apartments/6.jpeg',
  '/images/apartments/1.jpeg',
  '/images/apartments/5.jpeg',
  '/images/apartments/4.jpeg',
]
const heroBanner = computed(() => bannerImages[Math.abs(hashCode(String(id.value))) % bannerImages.length])

function hashCode(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function memberSince(d?: string) {
  if (!d) return '—'
  return new Date(d).getFullYear().toString()
}

function relativeTime(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

const filteredProperties = computed(() => {
  if (!propSearch.value.trim()) return properties.value
  const q = propSearch.value.toLowerCase()
  return properties.value.filter((p) =>
    [p.name, p.address, p.city, p.propertyType].some((s) => (s || '').toLowerCase().includes(q))
  )
})

// ─── Data fetching ──────────────────────────────────────────────
async function fetchAgent() {
  loading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const result = await feathers.service('agent-profiles').get(id.value)
    agent.value = result
  } catch {
    agent.value = null
  } finally {
    loading.value = false
  }
}

async function fetchProperties() {
  if (!agent.value?.userId) return
  propsLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('properties').find({
      query: { agentUserId: agent.value.userId, $limit: 50, $sort: { createdAt: -1 } }
    })
    const norm = normalizeFeathersFind(res)
    properties.value = norm.data
  } catch {
    properties.value = []
  } finally {
    propsLoading.value = false
  }
}

async function fetchRatings() {
  ratingsLoading.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('agent-ratings').find({
      query: { agentProfileId: id.value, $limit: 200, $sort: { createdAt: -1 } }
    })
    const norm = normalizeFeathersFind(res)
    ratings.value = norm.data

    // Check if the current user already rated
    if (auth.user?._id) {
      const userId = String((auth.user as any)._id)
      const mine = norm.data.find((r: any) => String(r.userId) === userId)
      if (mine) {
        myRating.value = mine
        formStar.value = mine.rating
        formComment.value = mine.comment ?? ''
      }
    }
  } catch {
    ratings.value = []
  } finally {
    ratingsLoading.value = false
  }
}

// ─── Rating submission ──────────────────────────────────────────
async function submitRating() {
  if (!formStar.value) return
  submitState.value = 'saving'
  submitError.value = ''
  try {
    const feathers = useNuxtApp().$feathers as any
    const payload = { rating: formStar.value, comment: formComment.value.trim() || undefined }

    if (myRating.value?._id) {
      // Update existing review
      const updated = await feathers.service('agent-ratings').patch(String(myRating.value._id), payload)
      myRating.value = updated
      const idx = ratings.value.findIndex((r) => String(r._id) === String(myRating.value!._id))
      if (idx >= 0) ratings.value[idx] = updated
    } else {
      // Create new review
      const created = await feathers.service('agent-ratings').create({
        agentProfileId: id.value,
        ...payload
      })
      myRating.value = created
      ratings.value.unshift(created)
    }

    // Refresh agent to pick up updated ratingAvg/ratingCount
    const refreshed = await feathers.service('agent-profiles').get(id.value)
    agent.value = refreshed

    submitState.value = 'success'
    setTimeout(() => { submitState.value = 'idle' }, 3000)
  } catch (err: any) {
    submitState.value = 'error'
    submitError.value = err?.message ?? 'Could not save your review. Please try again.'
  }
}

async function deleteRating() {
  if (!myRating.value?._id) return
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('agent-ratings').remove(String(myRating.value._id))
    ratings.value = ratings.value.filter((r) => String(r._id) !== String(myRating.value!._id))
    myRating.value = null
    formStar.value = 0
    formComment.value = ''
    const refreshed = await feathers.service('agent-profiles').get(id.value)
    agent.value = refreshed
  } catch (err: any) {
    submitError.value = err?.message ?? 'Could not delete your review.'
  }
}

// ─── Lifecycle ──────────────────────────────────────────────────
onMounted(async () => {
  await fetchAgent()
  await Promise.all([fetchProperties(), fetchRatings()])
})

watch(id, async () => {
  properties.value = []
  ratings.value = []
  myRating.value = null
  formStar.value = 0
  formComment.value = ''
  await fetchAgent()
  await Promise.all([fetchProperties(), fetchRatings()])
})
</script>
