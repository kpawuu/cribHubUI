<template>
  <div class="mx-auto max-w-3xl">
    <!-- Page header -->
    <div class="mb-5">
      <p class="text-[10px] font-bold uppercase tracking-widest text-primary-600">My account</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-900">Role applications</h1>
      <p class="mt-1 text-sm text-gray-500">
        Track every application you have submitted for an elevated CribHub role and respond to reviewer requests.
      </p>
    </div>

    <!-- Rental applications cross-link (sibling to this page) -->
    <div class="mb-4 flex items-center gap-2.5 rounded border border-gray-200 bg-white px-3 py-2.5">
      <i class="las la-file-signature text-base text-gray-500 shrink-0"></i>
      <p class="text-xs text-gray-700">
        Looking for a property you applied to?
        <NuxtLink to="/applications" class="font-semibold text-primary-700 hover:underline">
          See my rental applications <i class="las la-arrow-right"></i>
        </NuxtLink>
      </p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !list.length" class="space-y-3">
      <div v-for="n in 2" :key="n" class="h-48 animate-pulse rounded border border-gray-200 bg-white"></div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!list.length"
      class="rounded border border-dashed border-gray-200 bg-white p-10 text-center"
    >
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-gray-100">
        <i class="las la-id-badge text-2xl text-gray-400"></i>
      </div>
      <p class="text-sm font-semibold text-gray-800">You haven't applied for any roles yet</p>
      <p class="mt-1 text-xs text-gray-500">
        Want to list properties or represent landlords? Pick a role to get started.
      </p>
      <NuxtLink
        to="/onboarding/role"
        class="mt-4 inline-flex items-center rounded bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-700"
      >
        <i class="las la-plus-circle mr-1.5"></i>Apply for a role
      </NuxtLink>
    </div>

    <!-- Each application -->
    <div v-else class="space-y-5">
      <section
        v-for="app in list"
        :key="app._id"
        class="overflow-hidden rounded border border-gray-200 bg-white shadow-sm"
      >
        <!-- Banner reused from dashboard -->
        <UiRoleApplicationStatus :app="app" />

        <!-- Documents panel -->
        <div class="border-t border-gray-100 px-4 pb-5 pt-4 sm:px-5">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-xs font-bold uppercase tracking-wider text-gray-500">
              <i class="las la-folder-open mr-1 text-gray-400"></i>Verification documents
            </h3>
            <span class="text-[11px] text-gray-400">
              {{ app.documents.length }} uploaded · {{ app.missingDocumentTypes.length }} missing
            </span>
          </div>

          <!-- Document checklist -->
          <ul class="divide-y divide-gray-100 rounded border border-gray-100">
            <li
              v-for="type in checklistFor(app)"
              :key="type.key"
              class="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs',
                    type.uploaded
                      ? 'bg-emerald-50 text-emerald-600'
                      : type.requested
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-400'
                  ]"
                >
                  <i :class="type.uploaded ? 'las la-check' : type.requested ? 'las la-exclamation' : 'las la-file'"></i>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-900">{{ type.label }}</p>
                  <p
                    class="text-[11px]"
                    :class="type.uploaded ? 'text-emerald-700' : type.requested ? 'text-amber-700' : 'text-gray-500'"
                  >
                    <template v-if="type.uploaded">
                      Uploaded {{ humanRelative(type.uploadedAt) }}
                    </template>
                    <template v-else-if="type.requested">
                      Reviewer asked for this document
                    </template>
                    <template v-else>
                      Required for {{ app.roleLabel }} verification
                    </template>
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2 sm:justify-end">
                <a
                  v-if="type.uploaded && type.uploadedUrl"
                  :href="type.uploadedUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  <i class="las la-external-link-alt mr-1"></i>View
                </a>
                <label
                  v-if="app.status === 'pending'"
                  class="inline-flex cursor-pointer items-center rounded bg-primary-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-primary-700"
                  :class="busyTypeKey === `${app._id}:${type.key}` ? 'pointer-events-none opacity-60' : ''"
                >
                  <i
                    :class="
                      busyTypeKey === `${app._id}:${type.key}`
                        ? 'las la-circle-notch la-spin'
                        : 'las la-cloud-upload-alt'
                    "
                    class="mr-1"
                  ></i>
                  {{ type.uploaded ? 'Replace' : 'Upload' }}
                  <input
                    type="file"
                    class="sr-only"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp"
                    @change="onPick($event, app, type.key)"
                  />
                </label>
              </div>
            </li>
          </ul>

          <p v-if="errorByApp[app._id]" class="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <i class="las la-exclamation-circle mr-1"></i>{{ errorByApp[app._id] }}
          </p>

          <!-- Cancel pending application -->
          <div v-if="app.status === 'pending'" class="mt-4 border-t border-gray-100 pt-3">
            <button
              type="button"
              class="text-[11px] font-medium text-red-600 hover:text-red-700"
              :disabled="cancellingId === app._id"
              @click="cancelApplication(app)"
            >
              <i
                :class="cancellingId === app._id ? 'las la-circle-notch la-spin' : 'las la-times-circle'"
                class="mr-1"
              ></i>
              {{ cancellingId === app._id ? 'Cancelling…' : 'Cancel application' }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import type { RoleApplicationView } from '../../composables/useRoleApplications'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'My role applications — CribHub' })

const auth = useAuthStore()
const { list, isLoading, fetch: refreshApplications, ensureRealtime } = useRoleApplications()
const { uploadOne } = useVerificationUpload()

const busyTypeKey = ref<string | null>(null)
const cancellingId = ref<string | null>(null)
const errorByApp = reactive<Record<string, string | null>>({})

const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  national_id: 'National ID (Ghana Card)',
  proof_of_ownership: 'Proof of ownership',
  business_registration: 'Business registration',
  agent_license: 'Agent licence',
  pm_certificate: 'PM certification (optional)'
}

type ChecklistRow = {
  key: string
  label: string
  uploaded: boolean
  uploadedAt?: string
  uploadedUrl?: string
  requested: boolean
}

function checklistFor(app: RoleApplicationView): ChecklistRow[] {
  const merged = Array.from(
    new Set([...app.requiredDocumentTypes, ...app.requestedDocumentTypes])
  )
  return merged.map((key) => {
    const uploaded = app.documents.find((d) => d.documentType === key)
    return {
      key,
      label: DOCUMENT_TYPE_LABEL[key] ?? key,
      uploaded: !!uploaded,
      uploadedAt: uploaded?.uploadedAt,
      uploadedUrl: uploaded?.documentUrl,
      requested: app.requestedDocumentTypes.includes(key) && !uploaded
    }
  })
}

async function onPick(e: Event, app: RoleApplicationView, documentType: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  errorByApp[app._id] = null
  busyTypeKey.value = `${app._id}:${documentType}`
  try {
    const existing = app.documents.find((d) => d.documentType === documentType) ?? null
    const result = await uploadOne(app._id, documentType, file, existing)
    if (!result.ok) errorByApp[app._id] = result.errorMessage || 'Upload failed.'
    // Realtime listener in useRoleApplications will refetch the view.
  } finally {
    busyTypeKey.value = null
  }
}

async function cancelApplication(app: RoleApplicationView) {
  if (!confirm(`Cancel your ${app.roleLabel} application? You can re-apply later.`)) return
  cancellingId.value = app._id
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('role-requests').remove(app._id)
    // Realtime listener will drop it from the list.
  } catch (err: any) {
    errorByApp[app._id] = err?.message || 'Could not cancel application.'
  } finally {
    cancellingId.value = null
  }
}

function humanRelative(d?: string) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(d).toLocaleDateString()
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()
  await refreshApplications(true)
  ensureRealtime(auth.user?._id)
})
</script>
