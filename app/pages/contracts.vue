<template>
  <div class="mx-auto max-w-4xl">

    <!-- Page header -->
    <div class="mb-5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-primary-600 mb-0.5">Lease center</p>
      <h1 class="text-xl font-bold text-gray-900">My contracts</h1>
      <p class="mt-0.5 text-sm text-gray-500">All lease agreements linked to your account.</p>
    </div>

    <!-- Stats row -->
    <div class="mb-4 grid grid-cols-4 gap-2">
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-gray-900 tabular-nums">{{ store.list.length }}</p>
        <p class="text-[11px] text-gray-500">Total</p>
      </div>
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-emerald-600 tabular-nums">{{ countByStatus('active') }}</p>
        <p class="text-[11px] text-gray-500">Active</p>
      </div>
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-amber-600 tabular-nums">{{ needsSignature }}</p>
        <p class="text-[11px] text-gray-500">Needs signature</p>
      </div>
      <div class="compact-card bg-white rounded p-3 text-center">
        <p class="text-lg font-bold text-gray-400 tabular-nums">{{ countByStatus('expired') }}</p>
        <p class="text-[11px] text-gray-500">Expired</p>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="mb-4 flex rounded border border-gray-200 bg-white p-0.5 w-fit text-xs font-medium">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        class="rounded px-3 py-1.5 transition"
        :class="activeTab === tab.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.count !== undefined" class="ml-1 tabular-nums opacity-75">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Loading skeletons -->
    <div v-if="store.isLoading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-36 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredList.length" class="compact-card bg-white rounded p-10 text-center border border-gray-200">
      <i class="las la-file-contract mb-2 block text-4xl text-gray-200"></i>
      <p class="text-sm font-semibold text-gray-900">
        {{ activeTab === 'all' ? 'No contracts yet' : `No ${activeTab} contracts` }}
      </p>
      <p class="mt-1 text-xs text-gray-500">
        {{ activeTab === 'all'
          ? 'Lease agreements will appear here once your application is approved.'
          : 'Switch the filter to see other contracts.' }}
      </p>
    </div>

    <!-- Contract list -->
    <div v-else class="space-y-3">
      <div
        v-for="c in filteredList"
        :key="c._id"
        class="compact-card bg-white rounded overflow-hidden border border-gray-200"
        :data-contract-id="String(c._id)"
      >
        <div class="p-4">

          <!-- Top row -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex items-center gap-2 min-w-0">
              <div :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded', statusIconBg(c.status)]">
                <i :class="['text-sm', statusIcon(c.status)]"></i>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-900 leading-tight">Rental contract</p>
                <p class="text-[11px] text-gray-400 font-mono mt-0.5 truncate">{{ c._id }}</p>
              </div>
            </div>
            <span :class="['shrink-0 rounded px-2 py-0.5 text-xs font-semibold capitalize', statusBadgeClass(c.status)]">
              {{ c.status || 'draft' }}
            </span>
          </div>

          <!-- Unit & Rent info row -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-1.5 text-xs text-gray-700">
              <i class="las la-door-open text-primary-500 text-sm"></i>
              <span class="font-medium">Unit {{ unitLabel(c.unitId) }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-700">
              <i class="las la-coins text-amber-500 text-sm"></i>
              <span class="font-semibold">
                {{ c.rentCurrency || 'GHS' }} {{ (c.monthlyRent || 0).toLocaleString() }}
                <span class="font-normal text-gray-400">/mo</span>
                <span class="ml-1 text-gray-400">×</span>
                <span class="ml-1">{{ leasePeriodMonths(c.startDate, c.endDate) }} months</span>
                <span class="ml-1 text-gray-500">=</span>
                <span class="ml-1 font-bold text-gray-800">{{ c.rentCurrency || 'GHS' }} {{ totalRent(c).toLocaleString() }}</span>
              </span>
            </div>
            <div class="flex items-center gap-1.5 text-xs text-gray-500">
              <i class="las la-calendar-alt text-sm"></i>
              <span>{{ fmtDate(c.startDate) }} → {{ fmtDate(c.endDate) }}</span>
            </div>
            <div v-if="leaseDuration(c)" class="flex items-center gap-1.5 text-xs text-gray-500">
              <i class="las la-hourglass-half text-sm"></i>
              <span>{{ leaseDuration(c) }}</span>
            </div>
          </div>

          <!-- Progress timeline -->
          <div class="mb-3">
            <div class="flex items-center">
              <template v-for="(stage, idx) in getStages(c)" :key="stage.key">
                <div class="flex flex-col items-center" style="min-width: 56px">
                  <div
                    :class="[
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all',
                      stage.done
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : stage.active
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 bg-white text-gray-300'
                    ]"
                  >
                    <i v-if="stage.done" class="las la-check text-[10px]"></i>
                    <span v-else>{{ idx + 1 }}</span>
                  </div>
                  <p :class="['mt-1 text-[10px] text-center leading-tight', stage.done ? 'text-emerald-600 font-medium' : stage.active ? 'text-primary-600 font-medium' : 'text-gray-400']">
                    {{ stage.label }}
                  </p>
                </div>
                <div
                  v-if="idx < getStages(c).length - 1"
                  :class="['flex-1 h-0.5 mb-4', stage.done ? 'bg-emerald-400' : 'bg-gray-200']"
                ></div>
              </template>
            </div>
          </div>

          <!-- Signature info -->
          <div class="mb-3 grid grid-cols-2 gap-2">
            <div class="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Landlord</p>
              <p class="text-xs font-medium text-gray-800 truncate">{{ userName(c.landlordId) }}</p>
              <p v-if="c.landlordSignedAt" class="flex items-center gap-1 text-xs text-emerald-700 mt-0.5">
                <i class="las la-check-circle text-sm"></i>Signed {{ fmtDate(c.landlordSignedAt) }}
              </p>
              <p v-else class="text-xs text-gray-400 italic mt-0.5">Awaiting signature</p>
            </div>
            <div class="rounded border border-gray-100 bg-gray-50 px-3 py-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Tenant</p>
              <p class="text-xs font-medium text-gray-800 truncate">{{ userName(c.tenantId) }}</p>
              <p v-if="c.tenantSignedAt" class="flex items-center gap-1 text-xs text-emerald-700 mt-0.5">
                <i class="las la-check-circle text-sm"></i>Signed {{ fmtDate(c.tenantSignedAt) }}
              </p>
              <p v-else class="text-xs text-gray-400 italic mt-0.5">Awaiting signature</p>
            </div>
          </div>

          <!-- Expiry countdown -->
          <div v-if="c.status === 'active' && daysRemaining(c) !== null" class="mb-3">
            <div
              :class="[
                'flex items-center gap-2 rounded px-3 py-2 text-xs',
                daysRemaining(c)! <= 30
                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'border border-emerald-100 bg-emerald-50 text-emerald-800'
              ]"
            >
              <i :class="['text-sm', daysRemaining(c)! <= 30 ? 'las la-exclamation-triangle text-amber-500' : 'las la-calendar-check text-emerald-500']"></i>
              <span>
                <span class="font-semibold">{{ daysRemaining(c) }} days</span> remaining
                <span class="opacity-70"> · Expires {{ fmtDate(c.endDate) }}</span>
              </span>
            </div>
          </div>

          <!-- Action footer -->
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <!-- Sign contract -->
            <button
              v-if="canSign(c)"
              type="button"
              :disabled="signing === c._id"
              class="inline-flex items-center gap-1.5 rounded border border-primary-600 bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
              @click="onSign(c)"
            >
              <i v-if="signing === c._id" class="las la-spinner animate-spin text-sm"></i>
              <i v-else class="las la-pen text-sm"></i>
              Sign contract
            </button>

            <!-- Pay rent -->
            <template v-if="auth.hasRole('tenant') && (c.status === 'active' || (c.status === 'signed' && c.landlordSignedAt && c.tenantSignedAt))">
              <div v-if="isPaidThisPeriod(c)" class="inline-flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <i class="las la-check-circle text-sm"></i>
                Rent paid · {{ fmtDate(c.lastPaidAt) }}
              </div>
              <button
                v-else
                type="button"
                :disabled="paying === c._id"
                class="inline-flex items-center gap-1.5 rounded border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                @click="onPayRent(c)"
              >
                <i v-if="paying === c._id" class="las la-spinner animate-spin text-sm"></i>
                <i v-else class="las la-credit-card text-sm"></i>
                Pay rent
                <span class="ml-1 rounded bg-emerald-700 px-1.5 py-0.5 font-mono text-[10px]">
                  {{ c.rentCurrency || 'GHS' }} {{ totalRent(c).toLocaleString() }}
                </span>
              </button>
            </template>

            <!-- View / Download -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              @click="openContent(c)"
            >
              <i class="las la-file-contract text-sm"></i>
              Read contract
            </button>

            <p class="ml-auto text-[11px] text-gray-400">
              <i class="las la-clock mr-0.5"></i>{{ fmtDateTime(c.createdAt) }}
            </p>
          </div>

          <p v-if="signError === c._id" class="mt-2 text-xs text-red-600">
            <i class="las la-exclamation-circle mr-1"></i>Failed to sign — please try again.
          </p>
          <p v-if="payError === c._id" class="mt-2 text-xs text-red-600">
            <i class="las la-exclamation-circle mr-1"></i>{{ payErrorMsg || 'Payment initialization failed — try again.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Contract document modal ─────────────────────────────────────── -->
    <Teleport to="body">
      <div
        v-if="contentModal"
        class="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 p-0 sm:items-center sm:p-4"
        @click.self="contentModal = null"
      >
        <div class="flex w-full max-w-2xl flex-col rounded-t-xl border border-gray-200 bg-white shadow-2xl sm:rounded-xl" style="max-height: 90vh">

          <!-- Modal toolbar -->
          <div class="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-3">
            <div class="flex items-center gap-2">
              <div :class="['flex h-7 w-7 items-center justify-center rounded', statusIconBg(contentModal.status)]">
                <i :class="['text-xs', statusIcon(contentModal.status)]"></i>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900">Rental agreement</p>
                <p class="font-mono text-[10px] text-gray-400">{{ contentModal._id }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                @click="printContract(contentModal)"
              >
                <i class="las la-print text-sm"></i>
                Print / Save PDF
              </button>
              <a
                v-if="contentModal.documentUrl"
                :href="contentModal.documentUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <i class="las la-file-pdf text-sm text-red-500"></i>
                PDF
              </a>
              <button type="button" class="rounded p-1.5 text-gray-400 hover:bg-gray-100" @click="contentModal = null">
                <i class="las la-times text-base leading-none"></i>
              </button>
            </div>
          </div>

          <!-- Contract document body -->
          <div class="flex-1 overflow-y-auto">
            <div id="contract-document" class="px-8 py-8 text-gray-800">

              <!-- Letterhead -->
              <div class="mb-6 border-b border-gray-200 pb-5 text-center">
                <p class="text-xs font-bold uppercase tracking-widest text-primary-600">CribHub</p>
                <h1 class="mt-1 text-xl font-bold uppercase tracking-wide text-gray-900">Rental Agreement</h1>
                <p class="mt-1 text-xs text-gray-500">This agreement is entered into by the parties identified below.</p>
              </div>

              <!-- Reference & dates -->
              <div class="mb-5 grid grid-cols-2 gap-3 text-xs">
                <div class="rounded border border-gray-100 bg-gray-50 p-3">
                  <p class="font-semibold uppercase tracking-wider text-gray-400 text-[10px]">Contract reference</p>
                  <p class="mt-0.5 font-mono text-gray-700 break-all">{{ contentModal._id }}</p>
                </div>
                <div class="rounded border border-gray-100 bg-gray-50 p-3">
                  <p class="font-semibold uppercase tracking-wider text-gray-400 text-[10px]">Date issued</p>
                  <p class="mt-0.5 text-gray-700">{{ fmtDate(contentModal.createdAt) }}</p>
                  <p class="mt-1 font-semibold uppercase tracking-wider text-gray-400 text-[10px]">Status</p>
                  <p class="mt-0.5 capitalize text-gray-700">{{ contentModal.status || 'Draft' }}</p>
                </div>
              </div>

              <!-- Section: Parties -->
              <div class="mb-5">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">1. Parties</p>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <!-- Landlord -->
                  <div class="rounded border border-gray-100 p-3">
                    <p class="mb-1.5 font-bold text-gray-500 uppercase text-[10px]">Landlord</p>
                    <p class="font-semibold text-gray-900 text-sm">{{ userName(contentModal.landlordId) }}</p>
                    <p v-if="userEmail(contentModal.landlordId)" class="mt-0.5 flex items-center gap-1 text-gray-500">
                      <i class="las la-envelope text-xs"></i>{{ userEmail(contentModal.landlordId) }}
                    </p>
                    <p v-if="userPhone(contentModal.landlordId)" class="mt-0.5 flex items-center gap-1 text-gray-500">
                      <i class="las la-phone text-xs"></i>{{ userPhone(contentModal.landlordId) }}
                    </p>
                    <p class="mt-1 font-mono text-[10px] text-gray-300">ID: {{ contentModal.landlordId }}</p>
                  </div>
                  <!-- Tenant -->
                  <div class="rounded border border-gray-100 p-3">
                    <p class="mb-1.5 font-bold text-gray-500 uppercase text-[10px]">Tenant</p>
                    <p class="font-semibold text-gray-900 text-sm">{{ userName(contentModal.tenantId) }}</p>
                    <p v-if="userEmail(contentModal.tenantId)" class="mt-0.5 flex items-center gap-1 text-gray-500">
                      <i class="las la-envelope text-xs"></i>{{ userEmail(contentModal.tenantId) }}
                    </p>
                    <p v-if="userPhone(contentModal.tenantId)" class="mt-0.5 flex items-center gap-1 text-gray-500">
                      <i class="las la-phone text-xs"></i>{{ userPhone(contentModal.tenantId) }}
                    </p>
                    <p class="mt-1 font-mono text-[10px] text-gray-300">ID: {{ contentModal.tenantId }}</p>
                  </div>
                </div>
              </div>

              <!-- Section: Property & Unit -->
              <div class="mb-5">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">2. Leased property</p>

                <!-- Property details -->
                <div v-if="contractProperty(contentModal)" class="mb-2 rounded border border-gray-100 bg-gray-50 p-3 text-xs">
                  <p class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Property</p>
                  <p class="font-semibold text-gray-900">{{ contractProperty(contentModal).name }}</p>
                  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-gray-500">
                    <span v-if="contractProperty(contentModal).location?.address || contractProperty(contentModal).address">
                      <i class="las la-map-marker-alt text-xs"></i>
                      {{ contractProperty(contentModal).location?.address || contractProperty(contentModal).address }}
                    </span>
                    <span v-if="contractProperty(contentModal).location?.city || contractProperty(contentModal).city">
                      <i class="las la-city text-xs"></i>
                      {{ contractProperty(contentModal).location?.city || contractProperty(contentModal).city }}
                    </span>
                    <span v-if="contractProperty(contentModal).propertyType">
                      <i class="las la-building text-xs"></i>
                      {{ contractProperty(contentModal).propertyType }}
                    </span>
                  </div>
                </div>

                <!-- Unit details -->
                <div class="rounded border border-gray-100 p-3 text-xs">
                  <p class="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Unit</p>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <span class="text-gray-400">Unit no.</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ unitLabel(contentModal.unitId) }}</span>
                    </div>
                    <div v-if="unitCache[contentModal.unitId]?.bedrooms !== undefined">
                      <span class="text-gray-400">Bedrooms</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ unitCache[contentModal.unitId]?.bedrooms }}</span>
                    </div>
                    <div v-if="unitCache[contentModal.unitId]?.bathrooms !== undefined">
                      <span class="text-gray-400">Bathrooms</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ unitCache[contentModal.unitId]?.bathrooms }}</span>
                    </div>
                    <div v-if="unitCache[contentModal.unitId]?.floor !== undefined">
                      <span class="text-gray-400">Floor</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ unitCache[contentModal.unitId]?.floor }}</span>
                    </div>
                    <div v-if="unitCache[contentModal.unitId]?.size">
                      <span class="text-gray-400">Size</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ unitCache[contentModal.unitId]?.size }} m²</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Lease terms -->
              <div class="mb-5">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">3. Lease term</p>
                <div class="rounded border border-gray-100 p-3 text-xs">
                  <div class="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <span class="text-gray-400">Commencement</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ fmtDate(contentModal.startDate) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Expiry</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ fmtDate(contentModal.endDate) }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Duration</span>
                      <span class="ml-2 font-semibold text-gray-800">{{ leaseDuration(contentModal) || '—' }}</span>
                    </div>
                    <div>
                      <span class="text-gray-400">Type</span>
                      <span class="ml-2 font-semibold capitalize text-gray-800">{{ (contentModal.contractType || 'standard').replace('_', ' ') }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Financial terms -->
              <div class="mb-5">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">4. Financial terms</p>
                <div class="rounded border border-gray-100 p-3 text-xs">
                  <div class="space-y-1.5">
                    <div class="flex justify-between">
                      <span class="text-gray-500">Monthly rent</span>
                      <span class="font-semibold text-gray-800">{{ contentModal.rentCurrency || 'GHS' }} {{ (contentModal.monthlyRent || 0).toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">Lease period</span>
                      <span class="font-semibold text-gray-800">{{ leasePeriodMonths(contentModal.startDate, contentModal.endDate) }} months</span>
                    </div>
                    <div class="my-1 border-t border-gray-100"></div>
                    <div class="flex justify-between text-sm">
                      <span class="font-bold text-gray-700">Total rent payable</span>
                      <span class="font-bold text-gray-900">
                        {{ contentModal.rentCurrency || 'GHS' }} {{ totalRent(contentModal).toLocaleString() }}
                      </span>
                    </div>
                    <p class="text-[10px] text-gray-400">
                      Calculation: {{ contentModal.rentCurrency || 'GHS' }} {{ (contentModal.monthlyRent || 0).toLocaleString() }} × {{ leasePeriodMonths(contentModal.startDate, contentModal.endDate) }} months
                    </p>
                  </div>
                </div>
              </div>

              <!-- Section: Contract text -->
              <div v-if="contentModal.content" class="mb-5">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">5. Terms &amp; conditions</p>
                <pre class="whitespace-pre-wrap rounded border border-gray-100 bg-gray-50 p-4 text-xs text-gray-700 leading-relaxed font-sans">{{ contentModal.content }}</pre>
              </div>

              <!-- Section: Signatures -->
              <div class="mb-2">
                <p class="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">{{ contentModal.content ? '6' : '5' }}. Signatures</p>
                <div class="grid grid-cols-2 gap-3 text-xs">
                  <div class="rounded border border-gray-100 p-3">
                    <p class="text-[10px] font-bold uppercase text-gray-400">Landlord</p>
                    <p class="mt-1 font-semibold text-gray-800">{{ userName(contentModal.landlordId) }}</p>
                    <div v-if="contentModal.landlordSignedAt" class="mt-2 border-t border-gray-100 pt-2">
                      <p class="text-[10px] text-gray-400">Electronically signed</p>
                      <p class="text-gray-600">{{ fmtDateTime(contentModal.landlordSignedAt) }}</p>
                    </div>
                    <div v-else class="mt-2 border-t border-dashed border-gray-200 pt-2">
                      <p class="italic text-gray-300">Not yet signed</p>
                    </div>
                  </div>
                  <div class="rounded border border-gray-100 p-3">
                    <p class="text-[10px] font-bold uppercase text-gray-400">Tenant</p>
                    <p class="mt-1 font-semibold text-gray-800">{{ userName(contentModal.tenantId) }}</p>
                    <div v-if="contentModal.tenantSignedAt" class="mt-2 border-t border-gray-100 pt-2">
                      <p class="text-[10px] text-gray-400">Electronically signed</p>
                      <p class="text-gray-600">{{ fmtDateTime(contentModal.tenantSignedAt) }}</p>
                    </div>
                    <div v-else class="mt-2 border-t border-dashed border-gray-200 pt-2">
                      <p class="italic text-gray-300">Not yet signed</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer note -->
              <p class="mt-6 text-center text-[10px] text-gray-300">
                Generated by CribHub · Contract ID {{ contentModal._id }} · {{ fmtDate(contentModal.createdAt) }}
              </p>

            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRentalContractsStore, leasePeriodMonths } from '@@/stores/rentalContracts'
import { useAuthStore } from '@@/stores/auth'
import { scrollToDataTarget } from '../../utils/scrollToQueryTarget'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Contracts - CribHub' })

const store = useRentalContractsStore()
const auth = useAuthStore()
const route = useRoute()

// ── State ────────────────────────────────────────────────────────────────────
const activeTab = ref('all')
const signing = ref<string | null>(null)
const signError = ref<string | null>(null)
const paying = ref<string | null>(null)
const payError = ref<string | null>(null)
const payErrorMsg = ref<string | null>(null)
const contentModal = ref<any>(null)
const unitCache = ref<Record<string, any>>({})
const userCache = ref<Record<string, any>>({})
const propertyCache = ref<Record<string, any>>({})

// ── Tabs ─────────────────────────────────────────────────────────────────────
const tabs = computed(() => [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active', count: countByStatus('active') },
  { value: 'draft', label: 'Draft', count: countByStatus('draft') },
  { value: 'signed', label: 'Signed', count: countByStatus('signed') },
  { value: 'expired', label: 'Expired', count: countByStatus('expired') },
])

const filteredList = computed(() => {
  if (activeTab.value === 'all') return store.list
  return store.list.filter((c) => (c.status || 'draft') === activeTab.value)
})

// ── Stats ─────────────────────────────────────────────────────────────────────
function countByStatus(s: string) {
  return store.list.filter((c) => (c.status || 'draft') === s).length
}

const needsSignature = computed(() =>
  store.list.filter((c) => {
    const s = c.status || 'draft'
    if (!['draft', 'sent', 'signed'].includes(s)) return false
    if (auth.hasRole('tenant') && !c.tenantSignedAt) return true
    if (auth.hasRole('landlord') && !c.landlordSignedAt) return true
    return false
  }).length
)

// ── Hydration ─────────────────────────────────────────────────────────────────
async function hydrateUnits() {
  const ids = [...new Set(store.list.map((c) => c.unitId).filter(Boolean))]
  const missing = ids.filter((id) => !unitCache.value[id])
  if (!missing.length) return
  const feathers = useNuxtApp().$feathers as any
  for (const id of missing) {
    try { unitCache.value[id] = await feathers.service('units').get(id) } catch { /* deleted */ }
  }
}

async function hydrateUsers() {
  const ids = [...new Set(
    store.list.flatMap((c) => [c.landlordId, c.tenantId]).filter(Boolean)
  )]
  const missing = ids.filter((id) => !userCache.value[id])
  if (!missing.length) return
  const feathers = useNuxtApp().$feathers as any
  for (const id of missing) {
    try { userCache.value[id] = await feathers.service('users').get(id) } catch { /* deleted */ }
  }
}

function unitLabel(unitId: string) {
  const u = unitCache.value[unitId]
  return u?.unitNumber ? `#${u.unitNumber}` : `…${(unitId || '').slice(-6)}`
}

function userName(userId: string) {
  const u = userCache.value[userId]
  return u?.fullName || u?.onboarding?.fullName || u?.email || (userId ? `…${userId.slice(-6)}` : '—')
}

function userEmail(userId: string) {
  return userCache.value[userId]?.email || ''
}

function userPhone(userId: string) {
  const u = userCache.value[userId]
  return u?.onboarding?.phone || u?.phone || ''
}

function contractProperty(c: any) {
  const unit = unitCache.value[c.unitId]
  const propertyId = unit?.propertyId
  return propertyId ? propertyCache.value[propertyId] : null
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function fmtDate(d?: string) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }
  catch { return d }
}

function fmtDateTime(d?: string) {
  if (!d) return '—'
  try { return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return d }
}

function leaseDuration(c: any) {
  if (!c.startDate || !c.endDate) return null
  try {
    const months = Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    if (months >= 12) {
      const yrs = Math.floor(months / 12)
      const rem = months % 12
      return rem > 0 ? `${yrs}yr ${rem}mo` : `${yrs}yr`
    }
    return `${months}mo`
  } catch { return null }
}

function daysRemaining(c: any): number | null {
  if (!c.endDate || c.status !== 'active') return null
  try {
    const diff = new Date(c.endDate).getTime() - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  } catch { return null }
}

function totalRent(c: any): number {
  return (c.monthlyRent || 0) * leasePeriodMonths(c.startDate, c.endDate)
}

function isPaidThisPeriod(c: any): boolean {
  if (!c.lastPaidAt) return false
  try {
    const paid = new Date(c.lastPaidAt)
    const now = new Date()
    return paid.getFullYear() === now.getFullYear() && paid.getMonth() === now.getMonth()
  } catch { return false }
}

// ── Status styles ─────────────────────────────────────────────────────────────
function statusIcon(s?: string) {
  switch (s) {
    case 'active': return 'las la-check-circle text-emerald-600'
    case 'signed': return 'las la-pen-nib text-primary-600'
    case 'sent': return 'las la-paper-plane text-blue-500'
    case 'expired': return 'las la-calendar-times text-gray-400'
    default: return 'las la-file-alt text-amber-600'
  }
}

function statusIconBg(s?: string) {
  switch (s) {
    case 'active': return 'bg-emerald-50'
    case 'signed': return 'bg-primary-50'
    case 'sent': return 'bg-blue-50'
    case 'expired': return 'bg-gray-100'
    default: return 'bg-amber-50'
  }
}

function statusBadgeClass(s?: string) {
  switch (s) {
    case 'active': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    case 'signed': return 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
    case 'sent': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    case 'expired': return 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
    default: return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  }
}

// ── Progress stages ──────────────────────────────────────────────────────────
function getStages(c: any) {
  const s = c.status || 'draft'
  const order = ['draft', 'sent', 'signed', 'active', 'expired']
  const idx = order.indexOf(s)
  return [
    { key: 'created', label: 'Created', done: idx >= 0, active: idx === 0 },
    { key: 'sent', label: 'Sent', done: idx >= order.indexOf('sent'), active: idx === order.indexOf('sent') },
    { key: 'signed', label: 'Signed',
      done: !!(c.landlordSignedAt && c.tenantSignedAt) || idx >= order.indexOf('signed'),
      active: idx === order.indexOf('signed') || (!!(c.landlordSignedAt || c.tenantSignedAt) && idx < order.indexOf('active')) },
    { key: 'active', label: 'Active', done: s === 'active' || s === 'expired', active: s === 'active' },
  ]
}

// ── Actions ───────────────────────────────────────────────────────────────────
function canSign(c: any) {
  const s = c.status || 'draft'
  if (!['draft', 'sent', 'signed'].includes(s)) return false
  if (auth.hasRole('landlord') && !c.landlordSignedAt) return true
  if (auth.hasRole('tenant') && !c.tenantSignedAt) return true
  return false
}

function signingRole(): 'landlord' | 'tenant' {
  return auth.hasRole('landlord') ? 'landlord' : 'tenant'
}

async function onSign(c: any) {
  signing.value = c._id
  signError.value = null
  try {
    await store.signContract(String(c._id), signingRole())
  } catch {
    signError.value = c._id
    setTimeout(() => { signError.value = null }, 4000)
  } finally {
    signing.value = null
  }
}

async function onPayRent(c: any) {
  paying.value = c._id
  payError.value = null
  payErrorMsg.value = null
  try {
    const email = auth.user?.email
    if (!email) throw new Error('Your account has no email address')
    const result = await store.initializePayment(c, email)
    if (result?.authorization_url) {
      window.location.href = result.authorization_url
    } else {
      throw new Error('No checkout URL returned')
    }
  } catch (e: any) {
    payError.value = c._id
    payErrorMsg.value = e?.message || null
    setTimeout(() => { payError.value = null; payErrorMsg.value = null }, 6000)
  } finally {
    paying.value = null
  }
}

async function openContent(c: any) {
  contentModal.value = c
  const feathers = useNuxtApp().$feathers as any

  // Hydrate users for landlord/tenant details
  const userIds = [c.landlordId, c.tenantId].filter((id) => id && !userCache.value[id])
  for (const id of userIds) {
    try { userCache.value[id] = await feathers.service('users').get(id) } catch { /* ignored */ }
  }

  // Hydrate property from the unit's propertyId
  const unit = unitCache.value[c.unitId]
  const propertyId = unit?.propertyId
  if (propertyId && !propertyCache.value[propertyId]) {
    try { propertyCache.value[propertyId] = await feathers.service('properties').get(propertyId) } catch { /* ignored */ }
  }
}

function printContract(c: any) {
  const landlordName = userName(c.landlordId)
  const tenantName = userName(c.tenantId)
  const landlordEmail = userEmail(c.landlordId)
  const tenantEmail = userEmail(c.tenantId)
  const landlordPhone = userPhone(c.landlordId)
  const tenantPhone = userPhone(c.tenantId)
  const unit = unitCache.value[c.unitId]
  const prop = contractProperty(c)
  const months = leasePeriodMonths(c.startDate, c.endDate)
  const total = totalRent(c)
  const currency = c.rentCurrency || 'GHS'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Rental Agreement – ${c._id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 13px; color: #1a1a1a; padding: 40px 56px; line-height: 1.6; }
    h1 { font-size: 22px; text-align: center; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
    .brand { text-align: center; font-size: 11px; font-family: sans-serif; letter-spacing: 0.2em; text-transform: uppercase; color: #4f46e5; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 11px; color: #777; margin-bottom: 24px; }
    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    .section-title { font-family: sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #888; margin-bottom: 8px; margin-top: 20px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .box { border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; }
    .label { font-family: sans-serif; font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; }
    .value { font-weight: 600; margin-top: 2px; }
    .fin-row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f3f4f6; }
    .fin-total { display: flex; justify-content: space-between; padding: 8px 0 4px; font-size: 15px; font-weight: 700; }
    .sig-box { border: 1px solid #e5e7eb; border-radius: 4px; padding: 12px; min-height: 80px; }
    .sig-line { border-top: 1px solid #aaa; margin-top: 32px; padding-top: 4px; font-size: 11px; color: #aaa; }
    .footer { text-align: center; font-family: sans-serif; font-size: 10px; color: #ccc; margin-top: 32px; }
    pre { font-family: Georgia, serif; font-size: 12px; white-space: pre-wrap; background: #f9f9f9; border: 1px solid #eee; padding: 12px; border-radius: 4px; }
    @media print { body { padding: 20px 36px; } }
  </style>
</head>
<body>
  <p class="brand">CribHub</p>
  <h1>Rental Agreement</h1>
  <p class="subtitle">This agreement is entered into by the parties identified below.</p>
  <hr>

  <div class="grid2">
    <div><span class="label">Contract reference</span><div class="value" style="font-family:monospace;font-size:11px">${c._id}</div></div>
    <div>
      <span class="label">Date issued</span><div class="value">${fmtDate(c.createdAt)}</div>
      <span class="label" style="margin-top:6px;display:block">Status</span><div class="value" style="text-transform:capitalize">${c.status || 'Draft'}</div>
    </div>
  </div>

  <p class="section-title">1. Parties</p>
  <div class="grid2">
    <div class="box">
      <span class="label">Landlord</span>
      <div class="value">${landlordName}</div>
      <div style="font-size:11px;color:#555;margin-top:2px">${landlordEmail}</div>
      ${landlordPhone ? `<div style="font-size:11px;color:#555">${landlordPhone}</div>` : ''}
    </div>
    <div class="box">
      <span class="label">Tenant</span>
      <div class="value">${tenantName}</div>
      <div style="font-size:11px;color:#555;margin-top:2px">${tenantEmail}</div>
      ${tenantPhone ? `<div style="font-size:11px;color:#555">${tenantPhone}</div>` : ''}
    </div>
  </div>

  <p class="section-title">2. Leased property</p>
  ${prop ? `
  <div class="box" style="margin-bottom:8px">
    <span class="label">Property</span>
    <div class="value">${prop.name || '—'}</div>
    ${(prop.location?.address || prop.address) ? `<div style="font-size:11px;color:#555;margin-top:2px">📍 ${prop.location?.address || prop.address}</div>` : ''}
    ${(prop.location?.city || prop.city) ? `<div style="font-size:11px;color:#555">${prop.location?.city || prop.city}</div>` : ''}
    ${prop.propertyType ? `<div style="font-size:11px;color:#777;margin-top:2px">${prop.propertyType}</div>` : ''}
  </div>` : ''}
  <div class="box">
    <span class="label">Unit</span> <strong>${unitLabel(c.unitId)}</strong>
    ${unit?.bedrooms !== undefined ? `&nbsp;&nbsp;<span class="label">Bedrooms</span> <strong>${unit.bedrooms}</strong>` : ''}
    ${unit?.bathrooms !== undefined ? `&nbsp;&nbsp;<span class="label">Bathrooms</span> <strong>${unit.bathrooms}</strong>` : ''}
    ${unit?.floor !== undefined ? `&nbsp;&nbsp;<span class="label">Floor</span> <strong>${unit.floor}</strong>` : ''}
    ${unit?.size ? `&nbsp;&nbsp;<span class="label">Size</span> <strong>${unit.size} m²</strong>` : ''}
  </div>

  <p class="section-title">3. Lease term</p>
  <div class="box">
    <div class="grid2">
      <div><span class="label">Commencement</span><div class="value">${fmtDate(c.startDate)}</div></div>
      <div><span class="label">Expiry</span><div class="value">${fmtDate(c.endDate)}</div></div>
      <div><span class="label">Duration</span><div class="value">${leaseDuration(c) || '—'}</div></div>
    </div>
  </div>

  <p class="section-title">4. Financial terms</p>
  <div class="box">
    <div class="fin-row"><span>Monthly rent</span><strong>${currency} ${(c.monthlyRent || 0).toLocaleString()}</strong></div>
    <div class="fin-row"><span>Lease period</span><strong>${months} months</strong></div>
    <div class="fin-total"><span>Total rent payable</span><strong>${currency} ${total.toLocaleString()}</strong></div>
    <div style="font-size:10px;color:#aaa;padding-top:4px">Calculation: ${currency} ${(c.monthlyRent || 0).toLocaleString()} × ${months} months</div>
  </div>

  ${c.content ? `<p class="section-title">5. Terms &amp; conditions</p><pre>${c.content}</pre>` : ''}

  <p class="section-title">${c.content ? '6' : '5'}. Signatures</p>
  <div class="grid2">
    <div class="sig-box">
      <span class="label">Landlord</span>
      <div class="value" style="margin-top:4px">${landlordName}</div>
      ${c.landlordSignedAt
        ? `<div class="sig-line">Electronically signed on ${fmtDateTime(c.landlordSignedAt)}</div>`
        : `<div class="sig-line">Not yet signed</div>`}
    </div>
    <div class="sig-box">
      <span class="label">Tenant</span>
      <div class="value" style="margin-top:4px">${tenantName}</div>
      ${c.tenantSignedAt
        ? `<div class="sig-line">Electronically signed on ${fmtDateTime(c.tenantSignedAt)}</div>`
        : `<div class="sig-line">Not yet signed</div>`}
    </div>
  </div>

  <p class="footer">Generated by CribHub &nbsp;·&nbsp; Contract ID ${c._id} &nbsp;·&nbsp; ${fmtDate(c.createdAt)}</p>

  <script>window.onload=()=>{window.print();}<\/script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}

async function focusContractFromQuery() {
  const id = route.query.contract
  if (typeof id !== 'string' || !id) return
  try {
    const feathers = useNuxtApp().$feathers as any
    const c = await feathers.service('rental-contracts').get(id)
    const st = String((c as any)?.status || 'draft')
    if (['active', 'draft', 'signed', 'expired', 'sent'].includes(st)) activeTab.value = st
    else activeTab.value = 'all'
    scrollToDataTarget('contract-id', id)
  } catch {
    activeTab.value = 'all'
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await store.fetchList()
  await Promise.all([hydrateUnits(), hydrateUsers()])
  await focusContractFromQuery()
})

watch(() => store.list, async () => {
  await Promise.all([hydrateUnits(), hydrateUsers()])
}, { deep: false })

watch(
  () => route.query.contract,
  () => {
    void focusContractFromQuery()
  }
)
</script>
