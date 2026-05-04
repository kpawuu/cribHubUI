<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Landlord</p>
      <h1 class="mt-0.5 text-xl font-bold tracking-tight text-gray-900">Notices</h1>
      <p class="mt-0.5 text-sm text-gray-500">Board updates and SMS broadcasts for your tenants</p>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Compose -->
      <div class="compact-card rounded bg-white p-5">
        <h2 class="mb-1 text-sm font-semibold text-gray-900 flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600">
            <i class="las la-pen text-xs text-white"></i>
          </div>
          Compose notice
        </h2>
        <p class="mb-4 text-xs text-gray-500">Publish an update visible to tenants on your account.</p>

        <div v-if="err" class="mb-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-800">{{ err }}</div>
        <div v-if="published" class="mb-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
          <i class="las la-check-circle mr-1"></i>Notice published!
        </div>

        <form class="space-y-3" @submit.prevent="onCreate">
          <div v-if="needsLandlordScope" class="rounded border border-amber-100 bg-amber-50/80 p-3 text-xs text-amber-900">
            <label class="mb-1 block font-semibold text-gray-800">Property ID <span class="text-red-500">*</span></label>
            <input
              v-model="scopePropertyId"
              required
              placeholder="Mongo _id of the property (notice is filed under its landlord)"
              class="mt-1 w-full rounded border border-amber-200 bg-white px-3 py-2 text-sm font-mono text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Type</label>
            <select v-model="noticeType" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
              <option value="general">General</option>
              <option value="maintenance">Maintenance</option>
              <option value="payment">Payment reminder</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Title <span class="text-red-500">*</span></label>
            <input
              v-model="title"
              required
              placeholder="e.g. Water shut-off notice"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Message <span class="text-red-500">*</span></label>
            <textarea
              v-model="content"
              required
              rows="5"
              placeholder="Write the notice content…"
              class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <p class="mt-1 text-right text-xs text-gray-400">{{ content.length }} chars</p>
          </div>
          <div>
            <label class="mb-1 flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input v-model="sendSms" type="checkbox" class="h-3.5 w-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Send as SMS broadcast
            </label>
            <div v-if="sendSms">
              <input
                v-model="smsRecipients"
                placeholder="Phone numbers (comma separated)"
                class="mt-1.5 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-amber-600"><i class="las la-exclamation-triangle mr-0.5"></i>Requires SMS integration via MNotify.</p>
            </div>
          </div>
          <button
            type="submit"
            class="w-full rounded bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="saving"
          >
            <i v-if="saving" class="las la-spinner animate-spin mr-1"></i>
            {{ saving ? 'Publishing…' : 'Publish notice' }}
          </button>
        </form>
      </div>

      <!-- Notices list -->
      <div class="lg:col-span-2">
        <div class="compact-card bg-white rounded">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 class="text-sm font-semibold text-gray-900">
              Published notices
              <span class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">{{ n.list.length }}</span>
            </h2>
          </div>

          <div v-if="n.isLoading" class="space-y-3 p-4">
            <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded bg-gray-100" />
          </div>

          <div v-else-if="!n.list.length" class="p-8 text-center">
            <i class="las la-bullhorn mb-2 block text-4xl text-gray-200"></i>
            <p class="text-sm font-medium text-gray-700">No notices yet</p>
            <p class="mt-0.5 text-xs text-gray-500">Compose your first notice on the left.</p>
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div v-for="row in n.list" :key="String(row._id)" class="p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="text-sm font-semibold text-gray-900">{{ row.title }}</p>
                    <span v-if="(row as any).type" class="rounded px-1.5 py-0.5 text-xs font-medium capitalize" :class="noticeTypeClass((row as any).type)">
                      {{ (row as any).type }}
                    </span>
                    <span v-if="(row as any).smsSent" class="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                      <i class="las la-mobile-alt mr-0.5"></i>SMS sent
                    </span>
                  </div>
                  <p class="mt-1.5 whitespace-pre-wrap text-sm text-gray-600">{{ row.content }}</p>
                  <p class="mt-2 text-xs text-gray-400">
                    {{ (row as any).author && `By ${(row as any).author} ·` }} {{ row.createdAt ? new Date(row.createdAt).toLocaleString() : '' }}
                  </p>
                </div>
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
import { useNoticesStore } from '@@/stores/operations'

definePageMeta({ middleware: ['auth', 'landlord'], layout: 'account' })
useHead({ title: 'Notices - CribHub' })

const auth = useAuthStore()
const n = useNoticesStore()
const title = ref('')
const content = ref('')
const noticeType = ref('general')
const sendSms = ref(false)
const smsRecipients = ref('')
const saving = ref(false)
const err = ref<string | null>(null)
const published = ref(false)
const scopePropertyId = ref('')

const needsLandlordScope = computed(
  () => auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin')
)

function noticeTypeClass(type: string) {
  if (type === 'urgent') return 'bg-red-50 text-red-700'
  if (type === 'maintenance') return 'bg-amber-50 text-amber-700'
  if (type === 'payment') return 'bg-blue-50 text-blue-700'
  return 'bg-gray-100 text-gray-600'
}

async function onCreate() {
  err.value = null; published.value = false; saving.value = true
  try {
    const payload: Record<string, any> = {
      title: title.value.trim(),
      content: content.value.trim(),
      author: auth.user?.fullName || auth.user?.email || 'Landlord',
      type: noticeType.value
    }
    if (needsLandlordScope.value) {
      const pid = scopePropertyId.value.trim()
      if (!pid) throw new Error('Property ID is required')
      const feathers = useNuxtApp().$feathers as any
      const prop = await feathers.service('properties').get(pid)
      payload.landlordId = String((prop as any).landlordId || '')
      if (!payload.landlordId) throw new Error('Could not resolve landlord for this property')
    }
    if (sendSms.value && smsRecipients.value.trim()) {
      payload.smsRecipients = smsRecipients.value.split(',').map((s: string) => s.trim()).filter(Boolean)
    }
    await n.createNotice(payload)
    title.value = ''; content.value = ''; smsRecipients.value = ''; sendSms.value = false; scopePropertyId.value = ''
    published.value = true
    setTimeout(() => { published.value = false }, 4000)
    await n.fetchList({ $sort: { createdAt: -1 } })
  } catch (e: any) {
    err.value = e?.message || 'Failed to publish'
  } finally {
    saving.value = false
  }
}

onMounted(() => n.fetchList({ $sort: { createdAt: -1 } }))
</script>
