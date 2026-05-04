<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">{{ pageKicker }}</p>
        <h1 class="mt-0.5 text-xl font-bold tracking-tight text-gray-900">{{ pageTitle }}</h1>
        <p class="mt-0.5 text-sm text-gray-500">{{ properties.list.length }} {{ properties.list.length === 1 ? 'property' : 'properties' }} {{ listSubtitle }}</p>
      </div>
      <NuxtLink
        v-if="canAddProperty"
        to="/landlord/properties/new"
        class="inline-flex items-center rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        <i class="las la-plus mr-1.5 text-base"></i>Add property
      </NuxtLink>
    </div>

    <!-- Stats row -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-gray-900">{{ properties.list.length }}</p>
        <p class="text-xs text-gray-500">Properties</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-gray-900">{{ totalUnits }}</p>
        <p class="text-xs text-gray-500">Units</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-emerald-600">{{ occupiedUnits }}</p>
        <p class="text-xs text-gray-500">Occupied</p>
      </div>
      <div class="compact-card rounded bg-white p-3 text-center">
        <p class="text-xl font-bold text-amber-600">{{ vacantUnits }}</p>
        <p class="text-xs text-gray-500">Vacant</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="properties.isLoading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-28 animate-pulse rounded border border-gray-200 bg-white" />
    </div>

    <!-- Empty -->
    <div
      v-else-if="!properties.list.length"
      class="compact-card rounded bg-white p-12 text-center"
    >
      <i class="las la-building mb-3 block text-5xl text-gray-200"></i>
      <p class="font-semibold text-gray-900">No properties yet</p>
      <p class="mt-1 text-sm text-gray-500">{{ emptyStateHint }}</p>
      <NuxtLink
        v-if="canAddProperty"
        to="/landlord/properties/new"
        class="mt-4 inline-flex items-center rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        <i class="las la-plus mr-1.5"></i>Create property
      </NuxtLink>
    </div>

    <!-- Property list -->
    <div v-else class="space-y-3">
      <div
        v-for="p in properties.list"
        :key="String(p._id)"
        class="compact-card bg-white rounded overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-4">
          <!-- Image -->
          <div class="relative h-36 bg-gray-200 md:h-full">
            <img
              :src="(p as any).coverImageUrl || '/images/apartments/1.jpeg'"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
            <div class="absolute bottom-2 left-2">
              <span class="rounded bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-800">
                {{ p.propertyType || 'Property' }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="md:col-span-3">
            <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <h3 class="font-semibold text-gray-900">{{ p.name || 'Unnamed property' }}</h3>
                <p class="mt-0.5 text-sm text-gray-500">
                  <i class="las la-map-marker mr-1"></i>{{ [p.address, p.city, p.country].filter(Boolean).join(', ') || '—' }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span v-if="p.bedrooms != null" class="flex items-center gap-1"><i class="las la-bed"></i>{{ p.bedrooms }} bed</span>
                  <span v-if="p.bathrooms != null" class="flex items-center gap-1"><i class="las la-shower"></i>{{ p.bathrooms }} bath</span>
                  <span v-if="p.totalUnits != null" class="flex items-center gap-1"><i class="las la-layer-group"></i>{{ p.totalUnits }} units</span>
                  <span v-if="p.price != null" class="font-semibold text-primary-700">{{ p.priceCurrency || 'GHS' }} {{ p.price?.toLocaleString() }}<span v-if="p.pricePeriod">/{{ p.pricePeriod }}</span></span>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <NuxtLink
                  :to="`/landlord/properties/${p._id}`"
                  class="rounded bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                >
                  <i class="las la-cog mr-1"></i>Manage
                </NuxtLink>
                <NuxtLink
                  :to="`/properties/${p._id}`"
                  class="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <i class="las la-external-link-alt mr-1"></i>View listing
                </NuxtLink>
              </div>
            </div>

            <!-- Footer bar -->
            <div class="flex items-center justify-between border-t border-gray-100 px-4 py-2">
              <p class="text-xs text-gray-400">
                Added {{ p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—' }}
              </p>
              <div class="flex items-center gap-2">
                <span
                  v-if="(p as any).agent?.name"
                  class="inline-flex items-center gap-1 rounded bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700"
                >
                  <i class="las la-user-tie"></i>{{ (p as any).agent.name }}
                </span>
                <span
                  v-else-if="(p as any).agentUserId"
                  class="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                >
                  <i class="las la-user-tie"></i>Agent assigned
                </span>
                <span v-if="(p as any).verified" class="rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                  <i class="las la-shield-alt mr-0.5"></i>Verified
                </span>
                <button
                  v-if="canRemoveProperty"
                  type="button"
                  class="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600 hover:bg-red-50"
                  @click="confirmRemove(p)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remove confirm modal -->
    <div v-if="removingProperty" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
      <div class="compact-card w-full max-w-sm rounded bg-white p-6">
        <h3 class="font-semibold text-gray-900">Remove property?</h3>
        <p class="mt-2 text-sm text-gray-600">
          <span class="font-medium">{{ removingProperty.name }}</span> will be permanently removed.
        </p>
        <div class="mt-4 flex gap-2">
          <button
            type="button"
            class="flex-1 rounded bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            :disabled="removing"
            @click="doRemove"
          >
            {{ removing ? 'Removing…' : 'Yes, remove' }}
          </button>
          <button
            type="button"
            class="flex-1 rounded border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="removingProperty = null"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePropertiesStore } from '@@/stores/properties'
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'My properties - CribHub' })

const auth = useAuthStore()
const properties = usePropertiesStore()

const isPmOnly = computed(
  () => auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin')
)
const canAddProperty = computed(() => auth.hasRole('landlord', 'admin'))
const canRemoveProperty = computed(() => auth.hasRole('landlord', 'admin'))
const pageKicker = computed(() => (isPmOnly.value ? 'Portfolio' : 'Landlord'))
const pageTitle = computed(() => (isPmOnly.value ? 'Properties' : 'My properties'))
const listSubtitle = computed(() => (isPmOnly.value ? 'on the platform' : 'in your portfolio'))
const emptyStateHint = computed(() =>
  isPmOnly.value
    ? 'You are not assigned to any properties yet, or ask a landlord to accept your request to manage a listing.'
    : 'Add your first building or complex to start managing units.'
)
const removingProperty = ref<any>(null)
const removing = ref(false)

const totalUnits = computed(() => properties.list.reduce((s: number, p: any) => s + (p.totalUnits || 0), 0))
const occupiedUnits = computed(() => 0)
const vacantUnits = computed(() => totalUnits.value)

function confirmRemove(p: any) {
  removingProperty.value = p
}

async function doRemove() {
  if (!removingProperty.value) return
  removing.value = true
  try {
    await properties.removeProperty(String(removingProperty.value._id))
    removingProperty.value = null
    await properties.fetchList({
      ...(canAddProperty.value ? { mine: true } : isPmOnly.value ? { pmPortfolio: true } : {}),
      include: 'agent',
      $sort: { createdAt: -1 } as any
    })
  } catch { /* ignore */ }
  finally { removing.value = false }
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()
  await properties.fetchList({
    ...(canAddProperty.value ? { mine: true } : isPmOnly.value ? { pmPortfolio: true } : {}),
    include: 'agent',
    $sort: { createdAt: -1 } as any
  })
})
</script>
