<template>
  <div class="mx-auto max-w-3xl">
    <div class="mb-8">
      <p class="text-sm font-medium text-primary-600">Verification</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Role requests</h1>
      <p class="mt-2 text-sm text-gray-600">
        Approve or reject landlord, agent, and property manager onboarding requests. After a property manager is approved here, landlords can assign them to specific listings or accept their “request to manage” on a property.
      </p>
    </div>

    <div v-if="loading" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-xl bg-gray-100"></div>
    </div>
    <div
      v-else-if="!rows.length"
      class="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-600 shadow-sm"
    >
      <i class="las la-user-shield mb-3 text-4xl text-gray-300"></i>
      <p class="font-medium text-gray-900">No pending requests</p>
    </div>
    <ul v-else class="space-y-4">
      <li v-for="r in rows" :key="r._id" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold capitalize text-gray-900">{{ r.role }}</p>
            <p class="mt-1 font-mono text-xs text-gray-500">User {{ r.userId }}</p>
            <p class="mt-1 text-xs text-gray-500">Status: {{ r.status }}</p>
          </div>
          <div v-if="r.status === 'pending'" class="flex gap-2">
            <button
              type="button"
              class="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
              :disabled="busy === r._id"
              @click="patch(r._id, 'approved')"
            >
              Approve
            </button>
            <button
              type="button"
              class="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
              :disabled="busy === r._id"
              @click="patch(r._id, 'rejected')"
            >
              Reject
            </button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useRoleRequestsStore } from '@@/stores/roleRequests'

definePageMeta({ middleware: ['auth', 'admin'], layout: 'account' })
useHead({ title: 'Verification - CribHub' })

const auth = useAuthStore()
const rrStore = useRoleRequestsStore()

const rows = computed(() => rrStore.list)
const loading = computed(() => rrStore.isLoading)
const busy = ref<string | null>(null)

async function load() {
  await rrStore.fetchList({ status: 'pending', $sort: { createdAt: -1 } })
}

async function patch(id: string, status: 'approved' | 'rejected') {
  busy.value = id
  try {
    await rrStore.patch(id, { status })
  } finally {
    busy.value = null
  }
}

onMounted(load)
</script>
