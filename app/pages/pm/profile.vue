<template>
  <div>
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Property Manager Profile</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Your public profile shown to landlords reviewing your management requests.
        </p>
      </div>
      <span
        v-if="profile"
        class="inline-flex items-center gap-1.5 rounded border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
      >
        <i class="las la-check-circle text-base"></i> Profile active
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
      >
        <i class="las la-exclamation-circle text-base"></i> No profile yet
      </span>
    </div>

    <div
      v-if="successMsg"
      class="mb-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      <i class="las la-check-circle text-lg text-green-600"></i>{{ successMsg }}
    </div>
    <div
      v-if="errorMsg"
      class="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <i class="las la-exclamation-circle text-lg text-red-500"></i>{{ errorMsg }}
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>

    <form v-else class="grid gap-4 lg:grid-cols-3" @submit.prevent="onSave">
      <div class="space-y-4 lg:col-span-2">
        <div class="rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-id-badge text-base text-gray-500"></i> Identity
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Display name <span class="text-red-500">*</span></label>
              <input v-model="form.displayName" required class="field-input" />
            </div>
            <div>
              <label class="field-label">Company / portfolio</label>
              <input v-model="form.companyName" class="field-input" />
            </div>
            <div>
              <label class="field-label">Registration ID</label>
              <input v-model="form.registrationId" class="field-input" />
            </div>
            <div>
              <label class="field-label">Tax ID</label>
              <input v-model="form.taxId" class="field-input" />
            </div>
            <div>
              <label class="field-label">Phone</label>
              <input v-model="form.phone" type="tel" class="field-input" />
            </div>
            <div>
              <label class="field-label">WhatsApp</label>
              <input v-model="form.whatsapp" type="tel" class="field-input" />
            </div>
            <div>
              <label class="field-label">Public email</label>
              <input v-model="form.emailPublic" type="email" class="field-input" />
            </div>
            <div>
              <label class="field-label">Website</label>
              <input v-model="form.websiteUrl" type="url" class="field-input" placeholder="https://" />
            </div>
          </div>
        </div>

        <div class="rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-align-left text-base text-gray-500"></i> About
          </h2>
          <textarea v-model="form.bio" rows="5" class="field-input"></textarea>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label class="field-label">Services (comma-separated)</label>
              <input v-model="servicesRaw" class="field-input" />
            </div>
            <div>
              <label class="field-label">Regions covered</label>
              <input v-model="regionsRaw" class="field-input" />
            </div>
            <div>
              <label class="field-label">Languages</label>
              <input v-model="languagesRaw" class="field-input" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="field-label">Portfolio (units)</label>
                <input v-model.number="form.portfolioSize" type="number" min="0" class="field-input" />
              </div>
              <div>
                <label class="field-label">Years managing</label>
                <input v-model.number="form.yearsManaging" type="number" min="0" class="field-input" />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-tag text-base text-gray-500"></i> Default rate card
          </h2>
          <p class="mb-3 text-xs text-gray-500">
            Pre-fills the fee proposal whenever you send a "request to manage" to a landlord.
            You can always adjust it per listing.
          </p>
          <UiFeeProposalEditor v-model="form.defaultFee" />
        </div>

        <div class="rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-shield-alt text-base text-gray-500"></i> Verification documents
            <span
              v-if="profile?.verified"
              class="ml-auto inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800"
            >
              <i class="las la-check-circle"></i> Verified
            </span>
          </h2>
          <p class="mb-3 text-xs text-gray-500">
            Upload business registration, manager license, ID, or portfolio references.
            Landlords and the CribHub team can review these to verify your profile.
          </p>
          <p v-if="!profile" class="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <i class="las la-info-circle mr-1"></i>Save your profile first to enable document uploads.
          </p>
          <UiDocumentsUploader
            v-else
            entity-type="property-manager-profiles"
            :entity-id="String(profile._id)"
            :files="verificationFiles"
            label="verification documents"
            purpose="verification"
            @update:files="verificationFiles = $event"
          />
        </div>
      </div>

      <div class="space-y-4">
        <!-- Avatar -->
        <div class="rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-camera text-base text-gray-500"></i> Profile Photo
          </h2>
          <div class="mb-3 flex justify-center">
            <div class="relative h-24 w-24">
              <div class="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                <img
                  v-if="form.avatarUrl"
                  :src="form.avatarUrl"
                  alt="Profile photo"
                  class="h-full w-full object-cover"
                />
                <span v-else class="flex h-full w-full items-center justify-center text-gray-400">
                  <i class="las la-user text-4xl"></i>
                </span>
              </div>
              <button
                v-if="form.avatarUrl"
                type="button"
                class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                title="Remove photo"
                @click="form.avatarUrl = ''"
              >
                <i class="las la-times text-xs"></i>
              </button>
            </div>
          </div>
          <label
            class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition hover:border-primary-400 hover:bg-primary-50/30"
            :class="{ 'opacity-50 cursor-not-allowed': !profile }"
            @drop.prevent="profile ? onAvatarDrop($event) : null"
            @dragover.prevent
          >
            <input ref="avatarInput" type="file" accept="image/*" class="sr-only" :disabled="!profile" @change="onAvatarFileChange" />
            <div v-if="avatarUploading" class="flex items-center gap-2 text-sm text-primary-600">
              <i class="las la-circle-notch la-spin text-lg"></i> Uploading…
            </div>
            <template v-else>
              <i class="las la-cloud-upload-alt text-2xl text-gray-400"></i>
              <span class="text-xs font-medium text-gray-600">
                {{ profile ? 'Click or drag to upload' : 'Save profile first' }}
              </span>
              <span class="text-xs text-gray-400">PNG, JPG · max 5 MB</span>
            </template>
          </label>
          <p v-if="avatarError" class="mt-1.5 text-xs text-red-600">
            <i class="las la-exclamation-triangle mr-0.5"></i>{{ avatarError }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isSaving"
          class="flex w-full items-center justify-center gap-2 rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          <i v-if="isSaving" class="las la-circle-notch la-spin text-base"></i>
          <i v-else class="las la-save text-base"></i>
          {{ isSaving ? 'Saving…' : profile ? 'Save changes' : 'Create profile' }}
        </button>

        <div v-if="profile" class="rounded bg-gray-50 p-3 text-xs">
          <p class="font-semibold text-gray-600">Reference email</p>
          <p class="mt-0.5 break-all font-mono text-gray-700">{{ auth.user?.email }}</p>
          <p class="mt-1 text-gray-400">Landlords can find you by email.</p>
        </div>
      </div>
    </form>

    <!-- Assigned properties -->
    <div class="mt-6 rounded bg-white p-4">
      <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
        <i class="las la-building text-base text-gray-500"></i>
        Properties you manage
        <span
          v-if="assignedProperties.length"
          class="ml-auto rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600"
        >{{ assignedProperties.length }}</span>
      </h2>

      <div v-if="isLoadingProperties" class="flex items-center justify-center py-8 text-gray-400">
        <i class="las la-circle-notch la-spin text-2xl"></i>
      </div>
      <p
        v-else-if="!assignedProperties.length"
        class="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500"
      >
        You haven't been assigned to any properties yet.
        <br />
        <NuxtLink to="/listings" class="mt-1 inline-block text-primary-600 hover:underline">
          Browse listings to send a management request →
        </NuxtLink>
      </p>
      <div v-else class="divide-y divide-gray-100">
        <NuxtLink
          v-for="p in assignedProperties"
          :key="String(p._id)"
          :to="`/landlord/properties/${p._id}`"
          class="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
            <img v-if="p.images?.[0]" :src="p.images[0]" :alt="p.name" class="h-full w-full object-cover" />
            <span v-else class="flex h-full w-full items-center justify-center text-gray-300">
              <i class="las la-building text-lg"></i>
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 group-hover:text-primary-700">{{ p.name }}</p>
            <p class="truncate text-xs text-gray-500">{{ p.city || p.address || '—' }}</p>
          </div>
          <i class="las la-angle-right text-sm text-gray-400 group-hover:text-primary-600"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { usePropertyManagerProfilesStore, usePropertyManagerAssignmentsStore } from '@@/stores/operations'
import type { FeeProposal } from '../../composables/useFeeProposal'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Property Manager Profile – CribHub' })

const auth = useAuthStore()
const pmProfiles = usePropertyManagerProfilesStore()
const pmAssignments = usePropertyManagerAssignmentsStore()
const feathers = useNuxtApp().$feathers as any
const config = useRuntimeConfig()

interface PmProfile {
  _id: string
  userId: string
  displayName: string
  companyName?: string
  registrationId?: string
  taxId?: string
  phone?: string
  whatsapp?: string
  emailPublic?: string
  websiteUrl?: string
  bio?: string
  services?: string[]
  regions?: string[]
  languages?: string[]
  portfolioSize?: number
  yearsManaging?: number
  avatarUrl?: string
  verified?: boolean
  defaultFee?: FeeProposal
}

const isLoading = ref(true)
const isSaving = ref(false)
const isLoadingProperties = ref(true)
const profile = ref<PmProfile | null>(null)
const assignedProperties = ref<any[]>([])
const successMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)
const verificationFiles = ref<any[]>([])

const form = reactive<{
  displayName: string
  companyName: string
  registrationId: string
  taxId: string
  phone: string
  whatsapp: string
  emailPublic: string
  websiteUrl: string
  bio: string
  avatarUrl: string
  portfolioSize: number | undefined
  yearsManaging: number | undefined
  defaultFee: FeeProposal | null
}>({
  displayName: '',
  companyName: '',
  registrationId: '',
  taxId: '',
  phone: '',
  whatsapp: '',
  emailPublic: '',
  websiteUrl: '',
  bio: '',
  avatarUrl: '',
  portfolioSize: undefined,
  yearsManaging: undefined,
  defaultFee: null
})

const servicesRaw = ref('')
const regionsRaw = ref('')
const languagesRaw = ref('')

const avatarInput = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)
const avatarError = ref<string | null>(null)

function onAvatarDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadAvatar(file)
}
function onAvatarFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) uploadAvatar(file)
  input.value = ''
}

async function uploadAvatar(file: File) {
  if (!profile.value?._id) {
    avatarError.value = 'Save your profile first.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'File exceeds 5 MB limit.'
    return
  }
  avatarError.value = null
  avatarUploading.value = true
  try {
    const token = (auth as any).accessToken || localStorage.getItem('accessToken') || ''
    const fd = new FormData()
    fd.append('file', file, file.name)
    fd.append('entityType', 'property-manager-profiles')
    fd.append('entityId', profile.value._id)
    fd.append('purpose', 'avatar')
    const res = await fetch(`${config.public.apiBaseUrl}/file-upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Upload failed (${res.status})`)
    }
    const data = await res.json()
    const url = data?.cloudinary?.secure_url || data?.uploaded?.[0]?.cloudinary?.secure_url
    if (url) {
      form.avatarUrl = url
      const patched = await pmProfiles.patch(profile.value._id, { avatarUrl: url })
      profile.value = patched as any
    }
  } catch (e: any) {
    avatarError.value = e?.message || 'Upload failed'
  } finally {
    avatarUploading.value = false
  }
}

async function loadProfile() {
  isLoading.value = true
  try {
    const uid = (auth.user as any)?._id?.toString?.()
    if (!uid) return
    await pmProfiles.fetchList({ userId: uid })
    const found = pmProfiles.list[0] as PmProfile | undefined
    if (found) {
      profile.value = found
      populateForm(found)
      await loadVerificationFiles(String(found._id))
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load profile'
  } finally {
    isLoading.value = false
  }
}

async function loadVerificationFiles(profileId: string) {
  try {
    const res = await feathers.service('files').find({
      query: {
        entityType: 'property-manager-profiles',
        entityId: profileId,
        $sort: { createdAt: -1 },
        $limit: 50
      }
    })
    const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
    verificationFiles.value = rows
  } catch {
    verificationFiles.value = []
  }
}

async function loadAssignedProperties() {
  isLoadingProperties.value = true
  try {
    const uid = (auth.user as any)?._id?.toString?.()
    if (!uid) return
    await pmAssignments.fetchList({ managerUserId: uid, $limit: 50 })
    const ids = pmAssignments.list.map((a: any) => a.propertyId).filter(Boolean)
    if (!ids.length) return
    const props = await Promise.allSettled(ids.map((id: string) => feathers.service('properties').get(id)))
    assignedProperties.value = props
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value)
  } catch {} finally {
    isLoadingProperties.value = false
  }
}

function populateForm(p: PmProfile) {
  form.displayName = p.displayName ?? ''
  form.companyName = p.companyName ?? ''
  form.registrationId = p.registrationId ?? ''
  form.taxId = p.taxId ?? ''
  form.phone = p.phone ?? ''
  form.whatsapp = p.whatsapp ?? ''
  form.emailPublic = p.emailPublic ?? ''
  form.websiteUrl = p.websiteUrl ?? ''
  form.bio = p.bio ?? ''
  form.avatarUrl = p.avatarUrl ?? ''
  form.portfolioSize = p.portfolioSize
  form.yearsManaging = p.yearsManaging
  form.defaultFee = p.defaultFee ?? null
  servicesRaw.value = (p.services ?? []).join(', ')
  regionsRaw.value = (p.regions ?? []).join(', ')
  languagesRaw.value = (p.languages ?? []).join(', ')
}

function buildPayload() {
  const splitTags = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  const out: Record<string, any> = {
    displayName: form.displayName.trim(),
    companyName: form.companyName.trim() || undefined,
    registrationId: form.registrationId.trim() || undefined,
    taxId: form.taxId.trim() || undefined,
    phone: form.phone.trim() || undefined,
    whatsapp: form.whatsapp.trim() || undefined,
    emailPublic: form.emailPublic.trim() || undefined,
    websiteUrl: form.websiteUrl.trim() || undefined,
    bio: form.bio.trim() || undefined,
    services: splitTags(servicesRaw.value),
    regions: splitTags(regionsRaw.value),
    languages: splitTags(languagesRaw.value),
    portfolioSize: form.portfolioSize ?? undefined,
    yearsManaging: form.yearsManaging ?? undefined
  }
  if (form.defaultFee && (form.defaultFee.rent || form.defaultFee.sale)) {
    const rc: any = {}
    if (form.defaultFee.rent) rc.rent = form.defaultFee.rent
    if (form.defaultFee.sale) rc.sale = form.defaultFee.sale
    if (form.defaultFee.notes) rc.notes = form.defaultFee.notes
    out.defaultFee = rc
  }
  return out
}

async function onSave() {
  successMsg.value = null
  errorMsg.value = null
  isSaving.value = true
  try {
    const payload = buildPayload()
    if (profile.value) {
      const updated = await pmProfiles.patch(profile.value._id, payload)
      profile.value = updated as any
      populateForm(updated as PmProfile)
      successMsg.value = 'Profile updated.'
    } else {
      const created = await pmProfiles.create(payload)
      profile.value = created as any
      populateForm(created as PmProfile)
      await loadVerificationFiles(String((created as any)._id))
      successMsg.value = 'Profile created.'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Save failed'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await Promise.all([loadProfile(), loadAssignedProperties()])
})
</script>

<style scoped>
.field-label { @apply mb-1 block text-xs font-semibold text-gray-700; }
.field-input { @apply w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500; }
</style>
