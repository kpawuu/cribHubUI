<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Landlord</p>
      <h1 class="mt-0.5 text-xl font-bold tracking-tight text-gray-900">Portfolio updates</h1>
      <p class="mt-0.5 text-sm text-gray-500">Internal communication timeline for your portfolio</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Post update form -->
      <div class="compact-card rounded bg-white p-5">
        <h2 class="mb-1 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600">
            <i class="las la-edit text-xs text-white"></i>
          </div>
          Post update
        </h2>
        <p class="mb-4 text-xs text-gray-500">Add a timeline entry to your portfolio communications.</p>

        <div v-if="err" class="mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">{{ err }}</div>
        <div v-if="posted" class="mb-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
          <i class="las la-check-circle mr-1"></i>Update posted!
        </div>

        <form class="space-y-3" @submit.prevent="onCreate">
          <div v-if="needsLandlordScope" class="rounded border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-900">
            <label class="mb-1 block font-semibold text-gray-800">Property ID <span class="text-red-500">*</span></label>
            <input
              v-model="scopePropertyId"
              required
              placeholder="Mongo _id of the property (update is filed under its landlord)"
              class="mt-1 w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Type</label>
            <select v-model="entryType" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="update">General update</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="payment">Payment</option>
              <option value="tenant">Tenant notice</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">From (sender name) <span class="text-red-500">*</span></label>
            <input
              v-model="fromName"
              required
              placeholder="e.g. Management office"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Property label <span class="text-red-500">*</span></label>
            <input
              v-model="propertyLabel"
              required
              placeholder="e.g. Tower A — Spintex Road"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Message <span class="text-red-500">*</span></label>
            <textarea
              v-model="message"
              required
              rows="5"
              placeholder="Enter the update message…"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            class="w-full rounded bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="saving"
          >
            <i v-if="saving" class="las la-spinner animate-spin mr-1"></i>
            {{ saving ? 'Posting…' : 'Post update' }}
          </button>
        </form>
      </div>

      <!-- Timeline feed -->
      <div class="lg:col-span-2">
        <div class="compact-card bg-white rounded">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">
              Timeline
              <span class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{{ c.list.length }}</span>
            </h2>
          </div>

          <div v-if="c.isLoading" class="space-y-3 p-4">
            <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded bg-gray-100" />
          </div>

          <div v-else-if="!c.list.length" class="p-8 text-center">
            <i class="las la-stream mb-2 block text-4xl text-gray-200"></i>
            <p class="text-sm font-medium text-gray-700">No updates posted</p>
            <p class="mt-0.5 text-xs text-gray-500">Use the form to log the first entry.</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div v-for="row in c.list" :key="String(row._id)" class="flex gap-3 p-4">
              <!-- Type icon -->
              <div :class="`flex h-9 w-9 shrink-0 items-center justify-center rounded ${entryTypeClass((row as any).type)}`">
                <i :class="entryTypeIcon((row as any).type)" class="text-base"></i>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-gray-900">{{ (row as any).fromName }}</p>
                  <span v-if="(row as any).type" class="rounded bg-gray-100 px-1.5 py-0.5 text-xs capitalize text-gray-500">{{ (row as any).type }}</span>
                </div>
                <p v-if="(row as any).property" class="mt-0.5 text-xs font-medium text-primary-600">
                  <i class="las la-building mr-0.5"></i>{{ (row as any).property }}
                </p>
                <p class="mt-1.5 whitespace-pre-wrap text-sm text-gray-700">{{ (row as any).message }}</p>
                <p class="mt-2 text-xs text-gray-400">
                  <i class="las la-clock mr-0.5"></i>{{ (row as any).createdAt ? new Date((row as any).createdAt).toLocaleString() : '' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useCommunicationsStore } from '@@/stores/operations'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Portfolio updates - CribHub' })

const auth = useAuthStore()
const c = useCommunicationsStore()
const fromName = ref(auth.user?.fullName || '')
const propertyLabel = ref('')
const message = ref('')
const entryType = ref('update')
const saving = ref(false)
const err = ref<string | null>(null)
const posted = ref(false)
const scopePropertyId = ref('')

const needsLandlordScope = computed(
  () => auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin')
)

function entryTypeIcon(type: string) {
  const m: Record<string, string> = { maintenance: 'las la-tools', inspection: 'las la-eye', payment: 'las la-wallet', tenant: 'las la-user', update: 'las la-stream' }
  return m[type] || 'las la-stream'
}

function entryTypeClass(type: string) {
  const m: Record<string, string> = {
    maintenance: 'bg-amber-50 text-amber-600', inspection: 'bg-blue-50 text-blue-600',
    payment: 'bg-emerald-50 text-emerald-600', tenant: 'bg-violet-50 text-violet-600', update: 'bg-gray-100 text-gray-500'
  }
  return m[type] || 'bg-gray-100 text-gray-500'
}

async function onCreate() {
  err.value = null; posted.value = false; saving.value = true
  try {
    const entry: Record<string, any> = {
      fromName: fromName.value.trim(),
      property: propertyLabel.value.trim(),
      message: message.value.trim(),
      type: entryType.value,
      isManualEntry: true
    }
    if (needsLandlordScope.value) {
      const pid = scopePropertyId.value.trim()
      if (!pid) throw new Error('Property ID is required')
      const feathers = useNuxtApp().$feathers as any
      const prop = await feathers.service('properties').get(pid)
      entry.landlordId = String((prop as any).landlordId || '')
      if (!entry.landlordId) throw new Error('Could not resolve landlord for this property')
    }
    await c.createEntry(entry)
    message.value = ''; propertyLabel.value = ''; scopePropertyId.value = ''
    posted.value = true
    setTimeout(() => { posted.value = false }, 4000)
    await c.fetchList({})
  } catch (e: any) {
    err.value = e?.message || 'Failed to post'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (!fromName.value) fromName.value = auth.user?.fullName || auth.user?.email || 'Landlord'
  c.fetchList({ $sort: { createdAt: -1 } } as any)
})
</script>
