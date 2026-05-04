<template>
  <div class="bg-gray-50 min-h-screen">

    <!-- ── Sticky tab bar ─────────────────────────────────────────── -->
    <div class="sticky top-0 z-30">
      <div class="mx-auto max-w-5xl px-4">
        <div class="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="flex shrink-0 items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition whitespace-nowrap"
            :class="
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            "
            @click="activeTab = tab.id"
          >
            <i :class="`las ${tab.icon} text-base leading-none`"></i>
            {{ tab.label }}
            <span
              v-if="tab.badge"
              class="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none"
              :class="activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-primary-100 text-primary-700'"
            >{{ tab.badge }}</span>
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-4 py-4">

      <!-- ── Page header ──────────────────────────────────────────── -->
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded border border-primary-200 bg-primary-50 text-primary-700">
            <i class="las la-home text-xl leading-none"></i>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Tenant</p>
            <h1 class="text-xl font-bold text-gray-900">My Home</h1>
            <p class="mt-0.5 text-sm text-gray-500">
              <template v-if="portal.unit">
                Unit {{ portal.unit.unitNumber }}
                <template v-if="portal.property"> · {{ portal.property.name }}</template>
                <template v-if="portal.property?.address"> · {{ portal.property.address }}</template>
              </template>
              <template v-else-if="!portal.isLoadingUnit">No active unit found.</template>
              <template v-else>Loading…</template>
            </p>
          </div>
        </div>

        <!-- Quick action: new maintenance -->
        <button
          v-if="portal.unit"
          type="button"
          class="inline-flex shrink-0 items-center gap-2 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
          @click="openNewMaintenance"
        >
          <i class="las la-tools text-base leading-none"></i>
          Request maintenance
        </button>
      </div>

      <!-- ── Stat cards ────────────────────────────────────────────── -->
      <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="compact-card rounded border border-gray-200 bg-white p-3 text-center">
          <p class="tabular-nums text-lg font-bold" :class="portal.activeContract ? 'text-emerald-600' : 'text-gray-400'">
            {{ portal.activeContract ? 'Active' : '—' }}
          </p>
          <p class="mt-0.5 text-[11px] text-gray-500">Lease status</p>
        </div>
        <div class="compact-card rounded border border-gray-200 bg-white p-3 text-center">
          <p class="tabular-nums text-lg font-bold text-gray-900">{{ portal.contracts.length }}</p>
          <p class="mt-0.5 text-[11px] text-gray-500">Contracts</p>
        </div>
        <div class="compact-card rounded border border-gray-200 bg-white p-3 text-center">
          <p class="tabular-nums text-lg font-bold" :class="portal.openMaintenanceCount > 0 ? 'text-amber-600' : 'text-gray-400'">
            {{ portal.openMaintenanceCount }}
          </p>
          <p class="mt-0.5 text-[11px] text-gray-500">Open tickets</p>
        </div>
        <div class="compact-card rounded border border-gray-200 bg-white p-3 text-center">
          <p class="tabular-nums text-lg font-bold text-gray-900">
            {{ portal.unit?.rentCurrency ?? '' }} {{ portal.unit?.rentAmount ? fmtAmt(portal.unit.rentAmount) : '—' }}
          </p>
          <p class="mt-0.5 text-[11px] text-gray-500">Monthly rent</p>
        </div>
      </div>

      <!-- ── Expiry alert ──────────────────────────────────────────── -->
      <div
        v-if="portal.expiringWithin60Days.length"
        class="mb-4 flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3"
        role="alert"
      >
        <i class="las la-exclamation-triangle mt-0.5 shrink-0 text-lg text-amber-600"></i>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-amber-900">
            Your lease expires {{ fmtDate(portal.expiringWithin60Days[0].endDate) }} — in {{ daysUntilExpiry(portal.expiringWithin60Days[0].endDate) }} days
          </p>
          <p class="mt-0.5 text-xs text-amber-800">You can request a renewal from the Contracts tab below.</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
          @click="activeTab = 'contracts'"
        >
          Renew now
        </button>
      </div>

      <!-- ── Sign prompt ───────────────────────────────────────────── -->
      <div
        v-if="portal.pendingSignatureContracts.length"
        class="mb-4 flex items-start gap-3 rounded border border-blue-200 bg-blue-50 px-4 py-3"
        role="alert"
      >
        <i class="las la-pen-nib mt-0.5 shrink-0 text-lg text-blue-600"></i>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-blue-900">You have a contract awaiting your signature</p>
          <p class="mt-0.5 text-xs text-blue-800">Review and sign to activate your lease.</p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded border border-blue-300 bg-white px-3 py-1 text-xs font-semibold text-blue-800 transition hover:bg-blue-100"
          @click="activeTab = 'contracts'"
        >
          Review
        </button>
      </div>

      <!-- ── Loading skeleton ──────────────────────────────────────── -->
      <div v-if="portal.isLoading && !portal.unit" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded border border-gray-200 bg-white" />
      </div>

      <!-- ── No unit state ─────────────────────────────────────────── -->
      <div
        v-else-if="!portal.isLoadingUnit && !portal.unit"
        class="rounded border border-gray-200 bg-white py-16 text-center"
      >
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-300">
          <i class="las la-home text-3xl leading-none"></i>
        </div>
        <p class="text-sm font-semibold text-gray-900">No active tenancy yet</p>
        <p class="mt-1 text-xs text-gray-500">Once your rental application is approved and a unit is assigned to you, it will appear here.</p>
        <NuxtLink
          to="/listings"
          class="mt-4 inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <i class="las la-compass text-base leading-none"></i>
          Browse properties
        </NuxtLink>
      </div>

      <!-- ══ OVERVIEW tab ══════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'overview'" class="space-y-4">

        <!-- Property card -->
        <div class="overflow-hidden rounded border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <i class="las la-building text-gray-500"></i>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-700">Your property</span>
          </div>
          <div class="p-4">
            <div v-if="portal.property" class="flex gap-4">
              <!-- Property image -->
              <div class="h-24 w-32 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                <img
                  v-if="propertyImage"
                  :src="propertyImage"
                  :alt="portal.property.name"
                  class="h-full w-full object-cover"
                />
                <div v-else class="flex h-full items-center justify-center text-gray-300">
                  <i class="las la-image text-3xl"></i>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold text-gray-900">{{ portal.property.name }}</p>
                <p class="mt-0.5 text-xs text-gray-500">
                  <i class="las la-map-marker-alt mr-0.5"></i>
                  {{ [portal.property.address, portal.property.city, portal.property.country].filter(Boolean).join(', ') }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                    <i class="las la-door-open text-gray-400"></i>Unit {{ portal.unit?.unitNumber }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                    <i class="las la-bed text-gray-400"></i>{{ portal.unit?.bedrooms ?? '—' }} bed
                  </span>
                  <span class="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                    <i class="las la-bath text-gray-400"></i>{{ portal.unit?.bathrooms ?? '—' }} bath
                  </span>
                  <span v-if="portal.unit?.squareFeet" class="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                    <i class="las la-ruler-combined text-gray-400"></i>{{ portal.unit.squareFeet }} sqft
                  </span>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Monthly rent</p>
                    <p class="text-sm font-bold text-gray-900">{{ portal.unit?.rentCurrency }} {{ fmtAmt(portal.unit?.rentAmount) }}</p>
                  </div>
                  <div v-if="portal.activeContract">
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Lease start</p>
                    <p class="text-sm font-semibold text-gray-900">{{ fmtDate(portal.activeContract.startDate) }}</p>
                  </div>
                  <div v-if="portal.activeContract">
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Lease end</p>
                    <p class="text-sm font-semibold" :class="portal.expiringWithin60Days.length ? 'text-amber-700' : 'text-gray-900'">
                      {{ fmtDate(portal.activeContract.endDate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active contract mini-card -->
        <div v-if="portal.activeContract" class="overflow-hidden rounded border border-emerald-200 bg-white">
          <div class="flex items-center justify-between border-b border-emerald-100 bg-emerald-50 px-3 py-2">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <i class="las la-check-circle text-emerald-600"></i>
              Active lease agreement
            </span>
            <button
              type="button"
              class="text-xs font-medium text-emerald-700 hover:underline"
              @click="openContractContent(portal.activeContract)"
            >
              View contract
            </button>
          </div>
          <div class="grid grid-cols-3 gap-0 divide-x divide-gray-100 p-0">
            <div class="px-4 py-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Start</p>
              <p class="text-sm font-semibold text-gray-900">{{ fmtDate(portal.activeContract.startDate) }}</p>
            </div>
            <div class="px-4 py-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">End</p>
              <p class="text-sm font-semibold" :class="portal.expiringWithin60Days.length ? 'text-amber-700' : 'text-gray-900'">
                {{ fmtDate(portal.activeContract.endDate) }}
              </p>
            </div>
            <div class="px-4 py-3">
              <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Monthly</p>
              <p class="text-sm font-bold text-gray-900">{{ portal.activeContract.rentCurrency }} {{ fmtAmt(portal.activeContract.monthlyRent) }}</p>
            </div>
          </div>
        </div>

        <!-- Recent maintenance -->
        <div class="overflow-hidden rounded border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-2">
            <span class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-700">
              <i class="las la-tools text-gray-500"></i> Maintenance
            </span>
            <button type="button" class="text-xs font-medium text-primary-600 hover:underline" @click="activeTab = 'maintenance'">
              View all
            </button>
          </div>
          <div v-if="portal.maintenanceRequests.length === 0" class="px-4 py-8 text-center">
            <i class="las la-tools mb-1 text-2xl text-gray-200"></i>
            <p class="text-xs text-gray-500">No maintenance requests yet.</p>
          </div>
          <div v-else class="divide-y divide-gray-100">
            <div
              v-for="req in portal.maintenanceRequests.slice(0, 3)"
              :key="req._id"
              class="flex items-center gap-3 px-4 py-3"
            >
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded border" :class="maintenanceStatusBg(req.status)">
                <i class="las text-sm" :class="maintenanceStatusIcon(req.status)"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">{{ req.title }}</p>
                <p class="text-xs text-gray-500">{{ req.category }} · {{ fmtDate(req.createdAt) }}</p>
              </div>
              <span
                class="shrink-0 inline-flex rounded border px-1.5 py-0.5 text-[11px] font-medium capitalize"
                :class="maintBadgeClass(req.status)"
              >{{ req.status ?? 'pending' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ CONTRACTS tab ═════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'contracts'" class="space-y-3">
        <div v-if="portal.isLoadingContracts" class="space-y-3">
          <div v-for="n in 3" :key="n" class="h-32 animate-pulse rounded border border-gray-200 bg-white" />
        </div>

        <div v-else-if="portal.contracts.length === 0" class="rounded border border-gray-200 bg-white py-12 text-center">
          <i class="las la-file-contract mb-2 block text-3xl text-gray-200"></i>
          <p class="text-sm font-semibold text-gray-900">No contracts yet</p>
          <p class="mt-1 text-xs text-gray-500">Lease agreements will appear here once approved.</p>
        </div>

        <div v-else>
          <!-- Filter tabs -->
          <div class="mb-3 flex rounded border border-gray-200 bg-white p-0.5 w-fit text-xs font-medium">
            <button
              v-for="tf in contractTabs"
              :key="tf.value"
              type="button"
              class="rounded px-3 py-1.5 transition"
              :class="contractFilter === tf.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
              @click="contractFilter = tf.value"
            >
              {{ tf.label }}
              <span class="ml-1 tabular-nums opacity-75">{{ tf.count }}</span>
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="c in filteredContracts"
              :key="c._id"
              class="overflow-hidden rounded border border-gray-200 bg-white transition hover:border-gray-300"
            >
              <!-- Card header -->
              <div class="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2">
                <div class="flex items-center gap-2">
                  <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded border" :class="contractStatusBg(c.status)">
                    <i class="las text-sm" :class="contractStatusIcon(c.status)"></i>
                  </div>
                  <span class="text-xs font-semibold text-gray-900 capitalize">{{ c.status ?? 'draft' }}</span>
                </div>
                <span
                class="inline-flex rounded border px-1.5 py-0.5 text-[11px] font-medium capitalize"
                :class="contractBadgeClass(c.status)"
              >{{ c.status ?? 'draft' }}</span>
              </div>

              <!-- Card body -->
              <div class="p-4">
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Start</p>
                    <p class="text-sm font-semibold text-gray-900">{{ fmtDate(c.startDate) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">End</p>
                    <p class="text-sm font-semibold text-gray-900">{{ fmtDate(c.endDate) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Monthly rent</p>
                    <p class="text-sm font-bold text-gray-900">{{ c.rentCurrency }} {{ fmtAmt(c.monthlyRent) }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Duration</p>
                    <p class="text-sm font-semibold text-gray-900">{{ contractMonths(c) }} mo.</p>
                  </div>
                </div>

                <!-- Signature status -->
                <div class="mt-3 flex flex-wrap gap-2">
                  <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium"
                    :class="c.tenantSignedAt ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'">
                    <i class="las" :class="c.tenantSignedAt ? 'la-check-circle text-emerald-600' : 'la-clock text-gray-400'"></i>
                    Tenant {{ c.tenantSignedAt ? 'signed' : 'unsigned' }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium"
                    :class="c.landlordSignedAt ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'">
                    <i class="las" :class="c.landlordSignedAt ? 'la-check-circle text-emerald-600' : 'la-clock text-gray-400'"></i>
                    Landlord {{ c.landlordSignedAt ? 'signed' : 'unsigned' }}
                  </span>
                </div>

                <!-- Expiry countdown for active -->
                <div
                  v-if="c.status === 'active' && (daysUntilExpiry(c.endDate) ?? 999) <= 60"
                  class="mt-3 flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs"
                >
                  <i class="las la-hourglass-half text-amber-600"></i>
                  <span class="text-amber-800">Expires in <strong>{{ daysUntilExpiry(c.endDate) }} days</strong> — {{ fmtDate(c.endDate) }}</span>
                </div>
              </div>

              <!-- Card actions -->
              <div class="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50/60 px-4 py-2.5">
                <!-- Sign -->
                <button
                  v-if="!c.tenantSignedAt && (c.status === 'draft' || c.status === 'sent')"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                  :disabled="signingId === String(c._id)"
                  @click="handleSign(c)"
                >
                  <i class="las" :class="signingId === String(c._id) ? 'la-spinner animate-spin' : 'la-pen-nib'"></i>
                  {{ signingId === String(c._id) ? 'Signing…' : 'Sign contract' }}
                </button>

                <!-- Renew -->
                <button
                  v-if="c.status === 'active'"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded border border-primary-300 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50"
                  @click="openRenewModal(c)"
                >
                  <i class="las la-redo-alt"></i>
                  Renew lease
                </button>

                <!-- View content -->
                <button
                  v-if="c.content"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  @click="openContractContent(c)"
                >
                  <i class="las la-file-alt"></i>
                  View contract
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ MAINTENANCE tab ═══════════════════════════════════════ -->
      <div v-else-if="activeTab === 'maintenance'" class="space-y-4">

        <!-- New request form -->
        <div class="overflow-hidden rounded border border-gray-200 bg-white">
          <button
            type="button"
            class="flex w-full items-center justify-between bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
            @click="maintFormOpen = !maintFormOpen"
          >
            <span class="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <i class="las la-plus-circle text-primary-600"></i>
              Submit new maintenance request
            </span>
            <i class="las text-gray-400 transition" :class="maintFormOpen ? 'la-angle-up' : 'la-angle-down'"></i>
          </button>

          <transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="maintFormOpen" class="border-t border-gray-200 p-4">
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="sm:col-span-2">
                  <label class="mb-1 block text-xs font-semibold text-gray-700">
                    <i class="las la-heading mr-1 text-gray-400"></i>Title
                  </label>
                  <input
                    v-model="maintForm.title"
                    type="text"
                    class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="e.g. Leaking kitchen tap"
                  />
                </div>

                <div>
                  <label class="mb-1 block text-xs font-semibold text-gray-700">
                    <i class="las la-tag mr-1 text-gray-400"></i>Category
                  </label>
                  <div class="relative">
                    <select
                      v-model="maintForm.category"
                      class="w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Select category</option>
                      <option v-for="c in maintenanceCategories" :key="c" :value="c">{{ c }}</option>
                    </select>
                    <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-gray-400">
                      <i class="las la-angle-down text-xs"></i>
                    </span>
                  </div>
                </div>

                <div>
                  <label class="mb-1 block text-xs font-semibold text-gray-700">
                    <i class="las la-exclamation-circle mr-1 text-gray-400"></i>Priority
                  </label>
                  <div class="flex gap-1.5">
                    <button
                      v-for="p in priorityOptions"
                      :key="p.value"
                      type="button"
                      class="flex-1 rounded border px-2 py-1.5 text-xs font-medium transition"
                      :class="
                        maintForm.priority === p.value
                          ? p.activeClass
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                      "
                      @click="maintForm.priority = p.value"
                    >
                      {{ p.label }}
                    </button>
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label class="mb-1 block text-xs font-semibold text-gray-700">
                    <i class="las la-align-left mr-1 text-gray-400"></i>Description
                  </label>
                  <textarea
                    v-model="maintForm.description"
                    rows="4"
                    class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Describe the issue in detail — the more info you provide, the faster we can respond."
                  />
                </div>
              </div>

              <div
                v-if="maintError"
                class="mt-3 flex gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                <i class="las la-exclamation-circle mt-0.5 shrink-0 text-red-600"></i>
                <span>{{ maintError }}</span>
              </div>

              <div class="mt-4 flex gap-2">
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                  :disabled="submittingMaint"
                  @click="submitMaintenance"
                >
                  <i class="las text-base" :class="submittingMaint ? 'la-spinner animate-spin' : 'la-paper-plane'"></i>
                  {{ submittingMaint ? 'Submitting…' : 'Submit request' }}
                </button>
                <button
                  type="button"
                  class="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  @click="resetMaintForm"
                >
                  Clear
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Request filter tabs -->
        <div class="flex rounded border border-gray-200 bg-white p-0.5 w-fit text-xs font-medium">
          <button
            v-for="tf in maintStatusTabs"
            :key="tf.value"
            type="button"
            class="rounded px-3 py-1.5 transition"
            :class="maintStatusFilter === tf.value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
            @click="maintStatusFilter = tf.value"
          >
            {{ tf.label }} <span class="ml-1 tabular-nums opacity-75">{{ tf.count }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="portal.isLoadingMaintenance" class="space-y-3">
          <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded border border-gray-200 bg-white" />
        </div>

        <!-- Empty -->
        <div v-else-if="filteredMaintenance.length === 0" class="rounded border border-gray-200 bg-white py-12 text-center">
          <i class="las la-tools mb-2 block text-3xl text-gray-200"></i>
          <p class="text-sm font-semibold text-gray-900">No {{ maintStatusFilter === 'all' ? '' : maintStatusFilter + ' ' }}requests</p>
          <p class="mt-1 text-xs text-gray-500">Use the form above to submit a new request.</p>
        </div>

        <!-- List -->
        <div v-else class="space-y-3">
          <div
            v-for="req in filteredMaintenance"
            :key="req._id"
            class="overflow-hidden rounded border border-gray-200 bg-white transition hover:border-gray-300"
          >
            <div class="flex items-center gap-3 px-4 py-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded border" :class="maintenanceStatusBg(req.status)">
                <i class="las text-base" :class="maintenanceStatusIcon(req.status)"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ req.title }}</p>
                <p class="text-xs text-gray-500">{{ req.category }} · Priority: {{ req.priority ?? 'medium' }} · {{ fmtDate(req.createdAt) }}</p>
              </div>
              <span
                class="shrink-0 inline-flex rounded border px-1.5 py-0.5 text-[11px] font-medium capitalize"
                :class="maintBadgeClass(req.status)"
              >{{ req.status ?? 'pending' }}</span>
            </div>
            <div v-if="req.description" class="border-t border-gray-100 bg-gray-50/60 px-4 py-2.5">
              <p class="text-xs text-gray-600 line-clamp-2">{{ req.description }}</p>
            </div>
            <div v-if="req.estimatedCompletion || req.assignedTo" class="flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 px-4 py-2 text-xs text-gray-500">
              <span v-if="req.assignedTo"><i class="las la-user-hard-hat mr-1"></i>Assigned</span>
              <span v-if="req.estimatedCompletion"><i class="las la-calendar-check mr-1"></i>Est. {{ fmtDate(req.estimatedCompletion) }}</span>
              <span v-if="req.completedAt" class="text-emerald-700"><i class="las la-check-circle mr-1"></i>Completed {{ fmtDate(req.completedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ PAYMENTS tab ══════════════════════════════════════════ -->
      <div v-else-if="activeTab === 'payments'" class="space-y-3">
        <div v-if="portal.isLoadingPayments" class="space-y-3">
          <div v-for="n in 4" :key="n" class="h-16 animate-pulse rounded border border-gray-200 bg-white" />
        </div>

        <div v-else-if="portal.payments.length === 0" class="rounded border border-gray-200 bg-white py-12 text-center">
          <i class="las la-wallet mb-2 block text-3xl text-gray-200"></i>
          <p class="text-sm font-semibold text-gray-900">No payment records</p>
          <p class="mt-1 text-xs text-gray-500">Your rent payment history will appear here.</p>
        </div>

        <div v-else class="overflow-hidden rounded border border-gray-200 bg-white">
          <div class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2">
            <i class="las la-wallet text-gray-500"></i>
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-700">Payment history</span>
            <span class="ml-auto text-xs tabular-nums text-gray-500">{{ portal.payments.length }} records</span>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="pmt in portal.payments"
              :key="pmt._id"
              class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
            >
              <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                <i class="las la-money-check text-base leading-none"></i>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold text-gray-900">{{ pmt.notes ?? pmt.description ?? 'Rent payment' }}</p>
                <p class="text-xs text-gray-500">{{ fmtDate(pmt.createdAt ?? pmt.paidAt) }} <span v-if="pmt.referenceNumber">· Ref: {{ pmt.referenceNumber }}</span></p>
              </div>
              <div class="text-right">
                <p class="text-sm font-bold text-gray-900">{{ pmt.currency ?? '' }} {{ fmtAmt(pmt.amount) }}</p>
                <span
                  class="inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="pmt.status === 'paid' || pmt.status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-600'"
                >{{ pmt.status ?? 'recorded' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- MODALS                                                          -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <Teleport to="body">

      <!-- Renew modal -->
      <transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="renewModal.open"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4"
          @click.self="renewModal.open = false"
        >
          <div class="w-full max-w-md rounded border border-gray-200 bg-white">
            <div class="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <i class="las la-redo-alt text-base"></i>
              </span>
              <h3 class="text-sm font-semibold text-gray-900">Request lease renewal</h3>
              <button
                type="button"
                class="ml-auto rounded p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                @click="renewModal.open = false"
              >
                <i class="las la-times text-xl leading-none"></i>
              </button>
            </div>
            <div class="px-4 py-4">
              <p class="mb-3 text-sm text-gray-700">
                Current lease ends <strong class="text-gray-900">{{ fmtDate(renewModal.contract?.endDate) }}</strong>.
                Select renewal duration:
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="m in renewOptions"
                  :key="m"
                  type="button"
                  class="rounded border px-3 py-2 text-sm font-medium transition"
                  :class="
                    renewModal.months === m
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  "
                  @click="renewModal.months = m"
                >
                  {{ m }} {{ m === 1 ? 'month' : 'months' }}
                </button>
              </div>
              <p v-if="renewModal.months" class="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                New lease period: <strong>{{ renewStartDate }}</strong> → <strong>{{ renewEndDate }}</strong>
              </p>
              <div v-if="renewError" class="mt-3 flex gap-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <i class="las la-exclamation-circle mt-0.5 shrink-0 text-red-600"></i>
                <span>{{ renewError }}</span>
              </div>
            </div>
            <div class="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                @click="renewModal.open = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                :disabled="!renewModal.months || renewingId !== null"
                @click="submitRenewal"
              >
                <i class="las text-base" :class="renewingId ? 'la-spinner animate-spin' : 'la-redo-alt'"></i>
                {{ renewingId ? 'Requesting…' : 'Request renewal' }}
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Contract content modal -->
      <transition
        enter-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="contractContentModal"
          class="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-gray-900/40 p-4 pt-12"
          @click.self="contractContentModal = null"
        >
          <div class="w-full max-w-2xl rounded border border-gray-200 bg-white">
            <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 class="text-sm font-semibold text-gray-900">Lease agreement</h3>
              <button
                type="button"
                class="rounded p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                @click="contractContentModal = null"
              >
                <i class="las la-times text-xl leading-none"></i>
              </button>
            </div>
            <div class="prose prose-sm max-h-[70vh] overflow-y-auto px-6 py-4 text-sm" v-html="contractContentModal.content"></div>
          </div>
        </div>
      </transition>

    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useTenantPortalStore } from '@@/stores/tenantPortal'
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'My Home — CribHub' })

// ─── Store & auth ────────────────────────────────────────────────────
const portal = useTenantPortalStore()
const auth = useAuthStore()

// ─── Tabs ────────────────────────────────────────────────────────────
type TabId = 'overview' | 'contracts' | 'maintenance' | 'payments'
const activeTab = ref<TabId>('overview')

const tabs = computed(() => [
  { id: 'overview' as TabId, label: 'Overview', icon: 'la-home' },
  { id: 'contracts' as TabId, label: 'Contracts', icon: 'la-file-contract', badge: portal.pendingSignatureContracts.length || undefined },
  {
    id: 'maintenance' as TabId,
    label: 'Maintenance',
    icon: 'la-tools',
    badge: portal.openMaintenanceCount || undefined
  },
  { id: 'payments' as TabId, label: 'Payments', icon: 'la-wallet' }
])

// ─── Contracts ────────────────────────────────────────────────────────
type ContractFilter = 'all' | 'active' | 'draft' | 'expired'
const contractFilter = ref<ContractFilter>('all')

const contractTabs = computed(() => [
  { value: 'all', label: 'All', count: portal.contracts.length },
  { value: 'active', label: 'Active', count: portal.contracts.filter((c) => c.status === 'active').length },
  { value: 'draft', label: 'Pending', count: portal.contracts.filter((c) => c.status === 'draft' || c.status === 'sent').length },
  { value: 'expired', label: 'Expired', count: portal.contracts.filter((c) => c.status === 'expired').length }
])

const filteredContracts = computed(() => {
  if (contractFilter.value === 'all') return portal.contracts
  if (contractFilter.value === 'draft') return portal.contracts.filter((c) => c.status === 'draft' || c.status === 'sent')
  return portal.contracts.filter((c) => c.status === contractFilter.value)
})

// ─── Maintenance ─────────────────────────────────────────────────────
type MaintFilter = 'all' | 'pending' | 'in_progress' | 'completed'
const maintStatusFilter = ref<MaintFilter>('all')
const maintFormOpen = ref(false)
const submittingMaint = ref(false)
const maintError = ref('')

const maintenanceCategories = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Pest Control', 'Cleaning', 'Other']
const priorityOptions = [
  { value: 'low', label: 'Low', activeClass: 'border-gray-400 bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', activeClass: 'border-amber-300 bg-amber-50 text-amber-800' },
  { value: 'high', label: 'High', activeClass: 'border-red-300 bg-red-50 text-red-800' },
  { value: 'urgent', label: 'Urgent', activeClass: 'border-red-500 bg-red-100 text-red-900 font-bold' }
]

const maintForm = reactive({
  title: '',
  description: '',
  category: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
})

const maintStatusTabs = computed(() => [
  { value: 'all', label: 'All', count: portal.maintenanceRequests.length },
  { value: 'pending', label: 'Pending', count: portal.maintenanceRequests.filter((r) => r.status === 'pending').length },
  { value: 'in_progress', label: 'In progress', count: portal.maintenanceRequests.filter((r) => r.status === 'in_progress').length },
  { value: 'completed', label: 'Completed', count: portal.maintenanceRequests.filter((r) => r.status === 'completed').length }
])

const filteredMaintenance = computed(() => {
  if (maintStatusFilter.value === 'all') return portal.maintenanceRequests
  return portal.maintenanceRequests.filter((r) => r.status === maintStatusFilter.value)
})

// ─── Renewal modal ───────────────────────────────────────────────────
const renewOptions = [1, 3, 6, 12, 18, 24]
const renewModal = reactive({ open: false, contract: null as any, months: 12 })
const renewingId = ref<string | null>(null)
const renewError = ref('')

const renewStartDate = computed(() => {
  if (!renewModal.contract?.endDate) return ''
  const d = new Date(renewModal.contract.endDate)
  d.setDate(d.getDate() + 1)
  return fmtDate(d.toISOString())
})

const renewEndDate = computed(() => {
  if (!renewModal.contract?.endDate || !renewModal.months) return ''
  const d = new Date(renewModal.contract.endDate)
  d.setDate(d.getDate() + 1)
  d.setMonth(d.getMonth() + renewModal.months)
  return fmtDate(d.toISOString())
})

// ─── Contract content modal ──────────────────────────────────────────
const contractContentModal = ref<any | null>(null)

// ─── Signing ─────────────────────────────────────────────────────────
const signingId = ref<string | null>(null)

// ─── Helpers ─────────────────────────────────────────────────────────
const propertyImage = computed(() => {
  const imgs = portal.property?.images as string[] | undefined
  if (imgs?.length) return imgs[0]
  return null
})

function fmtDate(d?: string | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

function fmtAmt(n?: number | null) {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US')
}

function daysUntilExpiry(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function contractMonths(c: any) {
  if (!c.startDate || !c.endDate) return '—'
  const s = new Date(c.startDate)
  const e = new Date(c.endDate)
  return (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth()
}

function contractStatusBg(status: string) {
  const m: Record<string, string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    signed: 'border-blue-200 bg-blue-50 text-blue-700',
    sent: 'border-violet-200 bg-violet-50 text-violet-700',
    draft: 'border-amber-200 bg-amber-50 text-amber-700',
    expired: 'border-gray-200 bg-gray-100 text-gray-500'
  }
  return m[status] ?? 'border-gray-200 bg-gray-100 text-gray-500'
}

function contractStatusIcon(status: string) {
  const m: Record<string, string> = {
    active: 'la-check-circle',
    signed: 'la-signature',
    sent: 'la-paper-plane',
    draft: 'la-pencil-alt',
    expired: 'la-calendar-times'
  }
  return 'las ' + (m[status] ?? 'la-file-contract')
}

function maintenanceStatusBg(status: string) {
  const m: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700',
    in_progress: 'border-blue-200 bg-blue-50 text-blue-700',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }
  return m[status] ?? 'border-gray-200 bg-gray-100 text-gray-500'
}

function maintenanceStatusIcon(status: string) {
  const m: Record<string, string> = {
    pending: 'la-clock',
    in_progress: 'la-spinner',
    completed: 'la-check-circle'
  }
  return 'las ' + (m[status] ?? 'la-tools')
}

function maintBadgeClass(status: string) {
  const m: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    in_progress: 'border-blue-200 bg-blue-50 text-blue-800',
    completed: 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  return m[status] ?? 'border-gray-200 bg-gray-50 text-gray-600'
}

function contractBadgeClass(status: string) {
  const m: Record<string, string> = {
    active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    signed: 'border-blue-200 bg-blue-50 text-blue-800',
    sent: 'border-violet-200 bg-violet-50 text-violet-800',
    draft: 'border-amber-200 bg-amber-50 text-amber-800',
    expired: 'border-gray-200 bg-gray-100 text-gray-500'
  }
  return m[status] ?? 'border-gray-200 bg-gray-50 text-gray-600'
}

// ─── Actions ─────────────────────────────────────────────────────────
function openNewMaintenance() {
  activeTab.value = 'maintenance'
  maintFormOpen.value = true
  nextTick(() => {
    const el = document.querySelector('[data-maint-form]')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function resetMaintForm() {
  maintForm.title = ''
  maintForm.description = ''
  maintForm.category = ''
  maintForm.priority = 'medium'
  maintError.value = ''
}

async function submitMaintenance() {
  maintError.value = ''
  if (!maintForm.title.trim() || !maintForm.description.trim() || !maintForm.category) {
    maintError.value = 'Please fill in title, category, and description.'
    return
  }
  submittingMaint.value = true
  try {
    await portal.submitMaintenance({ ...maintForm })
    resetMaintForm()
    maintFormOpen.value = false
  } catch (e: any) {
    maintError.value = e?.message || 'Failed to submit. Please try again.'
  } finally {
    submittingMaint.value = false
  }
}

async function handleSign(contract: any) {
  signingId.value = String(contract._id)
  try {
    await portal.signContract(String(contract._id))
  } catch (e: any) {
    alert(e?.message || 'Could not sign contract.')
  } finally {
    signingId.value = null
  }
}

function openRenewModal(contract: any) {
  renewModal.contract = contract
  renewModal.months = 12
  renewModal.open = true
  renewError.value = ''
}

async function submitRenewal() {
  if (!renewModal.contract || !renewModal.months) return
  renewingId.value = String(renewModal.contract._id)
  renewError.value = ''
  try {
    await portal.renewContract(String(renewModal.contract._id), renewModal.months)
    renewModal.open = false
  } catch (e: any) {
    renewError.value = e?.message || 'Renewal request failed. Please try again.'
  } finally {
    renewingId.value = null
  }
}

function openContractContent(contract: any) {
  contractContentModal.value = contract
}

// ─── Boot ────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (!auth.isAuthenticated) return
  const uid = auth.user?._id?.toString?.() ?? auth.user?.id?.toString?.() ?? ''
  if (uid) await portal.fetchAll(uid)
})
</script>
