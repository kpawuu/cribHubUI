<template>
  <div>
    <!-- Page header -->
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Agent Profile</h1>
        <p class="mt-0.5 text-sm text-gray-500">
          Your public profile shown to landlords and tenants on property listings.
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

    <!-- Alerts -->
    <div
      v-if="successMsg"
      class="mb-4 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      <i class="las la-check-circle text-lg text-green-600"></i> {{ successMsg }}
    </div>
    <div
      v-if="errorMsg"
      class="mb-4 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <i class="las la-exclamation-circle text-lg text-red-500"></i> {{ errorMsg }}
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-16 text-gray-400">
      <i class="las la-circle-notch la-spin text-3xl"></i>
    </div>

    <form v-else class="grid gap-4 lg:grid-cols-3" @submit.prevent="onSave">
      <!-- Left: identity + bio + coverage -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Identity -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-id-badge text-base text-gray-500"></i> Identity
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">
                Display name <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.displayName"
                required
                placeholder="e.g. James Okonkwo"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-gray-400">Shown on property listings.</p>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Agency / Brokerage</label>
              <input
                v-model="form.agency"
                placeholder="e.g. Prime Realty Ltd."
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Phone</label>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="+234 800 000 0000"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">WhatsApp</label>
              <input
                v-model="form.whatsapp"
                type="tel"
                placeholder="+234 800 000 0000"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1 block text-xs font-semibold text-gray-600">Public email</label>
              <input
                v-model="form.emailPublic"
                type="email"
                placeholder="agent@example.com"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-gray-400">Shown on listing pages. Leave blank to hide.</p>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-align-left text-base text-gray-500"></i> Bio
          </h2>
          <textarea
            v-model="form.bio"
            rows="5"
            placeholder="Tell landlords and clients about your experience, specialties and approach…"
            class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          ></textarea>
        </div>

        <!-- Coverage & Languages -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-map-marker-alt text-base text-gray-500"></i> Coverage &amp; Languages
          </h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Regions / Areas</label>
              <input
                v-model="regionsRaw"
                placeholder="Lagos Island, Lekki, Victoria Island"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-gray-400">Comma-separated list of areas you cover.</p>
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Languages spoken</label>
              <input
                v-model="languagesRaw"
                placeholder="English, Yoruba, French"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p class="mt-1 text-xs text-gray-400">Comma-separated list.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: avatar + stats + save + ref -->
      <div class="space-y-4">

        <!-- Avatar upload -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-camera text-base text-gray-500"></i> Profile Photo
          </h2>

          <!-- Current avatar -->
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
              <!-- Remove button -->
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

          <!-- Upload area -->
          <label
            class="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-center transition hover:border-primary-400 hover:bg-primary-50/30"
            :class="{ 'border-primary-500 bg-primary-50': avatarDragging, 'opacity-50 cursor-not-allowed': !profile }"
            @dragover.prevent="profile && (avatarDragging = true)"
            @dragleave.prevent="avatarDragging = false"
            @drop.prevent="profile ? onAvatarDrop($event) : null"
          >
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              class="sr-only"
              :disabled="!profile"
              @change="onAvatarFileChange"
            />
            <div v-if="avatarUploading" class="flex items-center gap-2 text-sm text-primary-600">
              <i class="las la-circle-notch la-spin text-lg"></i>
              Uploading…
            </div>
            <template v-else>
              <i class="las la-cloud-upload-alt text-2xl text-gray-400"></i>
              <span class="text-xs font-medium text-gray-600">
                {{ profile ? 'Click or drag to upload' : 'Save profile first to upload a photo' }}
              </span>
              <span class="text-xs text-gray-400">PNG, JPG · max 5 MB</span>
            </template>
          </label>
          <p v-if="avatarError" class="mt-1.5 text-xs text-red-600">
            <i class="las la-exclamation-triangle mr-0.5"></i>{{ avatarError }}
          </p>
        </div>

        <!-- Stats -->
        <div class="compact-card rounded bg-white p-4">
          <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
            <i class="las la-chart-bar text-base text-gray-500"></i> Stats
          </h2>
          <div class="space-y-3">
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Listings count</label>
              <input
                v-model.number="form.listingsCount"
                type="number"
                min="0"
                placeholder="0"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-semibold text-gray-600">Avg. response time (min)</label>
              <input
                v-model.number="form.responseTimeMinutes"
                type="number"
                min="0"
                placeholder="e.g. 30"
                class="w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        <!-- Save -->
        <button
          type="submit"
          :disabled="isSaving"
          class="flex w-full items-center justify-center gap-2 rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          <i v-if="isSaving" class="las la-circle-notch la-spin text-base"></i>
          <i v-else class="las la-save text-base"></i>
          {{ isSaving ? 'Saving…' : profile ? 'Save changes' : 'Create profile' }}
        </button>

        <!-- Reference info -->
        <div v-if="profile" class="compact-card rounded bg-gray-50 p-3 text-xs">
          <p class="font-semibold text-gray-600">Your reference email</p>
          <p class="mt-0.5 break-all font-mono text-gray-700">{{ auth.user?.email }}</p>
          <p class="mt-1 text-gray-400">Landlords can find you by email address.</p>
        </div>
      </div>
    </form>

    <!-- Assigned properties -->
    <div class="mt-6 compact-card rounded bg-white p-4">
      <h2 class="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2.5 text-sm font-semibold text-gray-900">
        <i class="las la-building text-base text-gray-500"></i>
        Assigned properties
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
        You have not been assigned to any properties yet.
        <br />
        <NuxtLink to="/agent/listings" class="mt-1 inline-block text-primary-600 hover:underline">
          Browse listings to send a request →
        </NuxtLink>
      </p>

      <div v-else class="divide-y divide-gray-100">
        <NuxtLink
          v-for="p in assignedProperties"
          :key="String(p._id)"
          :to="`/properties/${p._id}`"
          class="group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div class="h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
            <img
              v-if="p.coverImageUrl"
              :src="p.coverImageUrl"
              :alt="p.name"
              class="h-full w-full object-cover"
            />
            <span v-else class="flex h-full w-full items-center justify-center text-gray-300">
              <i class="las la-building text-lg"></i>
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-gray-900 group-hover:text-primary-700">{{ p.name }}</p>
            <p class="truncate text-xs text-gray-500">{{ p.location?.city || p.location?.address || '—' }}</p>
          </div>
          <i class="las la-angle-right text-sm text-gray-400 group-hover:text-primary-600"></i>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useAgentProfilesStore, useAgentAssignmentsStore } from '@@/stores/operations'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Agent Profile – CribHub' })

const auth = useAuthStore()
const agentProfilesStore = useAgentProfilesStore()
const agentAssignmentsStore = useAgentAssignmentsStore()
const feathers = useNuxtApp().$feathers as any
const config = useRuntimeConfig()

// ── Types ──────────────────────────────────────────────────────────────────
interface AgentProfile {
  _id: string
  userId: string
  displayName: string
  agency?: string
  phone?: string
  whatsapp?: string
  emailPublic?: string
  bio?: string
  regions?: string[]
  languages?: string[]
  avatarUrl?: string
  listingsCount?: number
  responseTimeMinutes?: number
  verified?: boolean
}

// ── State ──────────────────────────────────────────────────────────────────
const isLoading = ref(true)
const isSaving = ref(false)
const isLoadingProperties = ref(true)
const profile = ref<AgentProfile | null>(null)
const assignedProperties = ref<any[]>([])
const successMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const form = reactive({
  displayName: '',
  agency: '',
  phone: '',
  whatsapp: '',
  emailPublic: '',
  bio: '',
  avatarUrl: '',
  listingsCount: undefined as number | undefined,
  responseTimeMinutes: undefined as number | undefined,
})

const regionsRaw = ref('')
const languagesRaw = ref('')

// ── Avatar upload ──────────────────────────────────────────────────────────
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarDragging = ref(false)
const avatarUploading = ref(false)
const avatarError = ref<string | null>(null)

function onAvatarDrop(e: DragEvent) {
  avatarDragging.value = false
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
    avatarError.value = 'Save your profile first before uploading a photo.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'File exceeds 5 MB limit.'
    return
  }
  if (!file.type.startsWith('image/')) {
    avatarError.value = 'Please select an image file.'
    return
  }

  avatarError.value = null
  avatarUploading.value = true
  try {
    const token =
      (auth as any).accessToken ||
      localStorage.getItem('accessToken') ||
      ''

    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('entityType', 'agent-profiles')
    formData.append('entityId', profile.value._id)
    formData.append('purpose', 'avatar')

    const res = await fetch(`${config.public.apiBaseUrl}/file-upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error || `Upload failed (${res.status})`)
    }
    const data = await res.json()
    const url = data?.cloudinary?.secure_url || data?.uploaded?.[0]?.cloudinary?.secure_url
    if (url) {
      form.avatarUrl = url
      if (profile.value) profile.value.avatarUrl = url
    } else {
      throw new Error('No URL returned from upload.')
    }
  } catch (e: any) {
    avatarError.value = e?.message || 'Upload failed'
  } finally {
    avatarUploading.value = false
  }
}

// ── Load ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  isLoading.value = true
  try {
    const userId = (auth.user as any)?._id?.toString?.()
    if (!userId) return
    await agentProfilesStore.fetchList({ userId })
    const found = agentProfilesStore.list[0] as AgentProfile | undefined
    if (found) {
      profile.value = found
      populateForm(found)
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to load profile'
  } finally {
    isLoading.value = false
  }
}

async function loadAssignedProperties() {
  isLoadingProperties.value = true
  try {
    const userId = (auth.user as any)?._id?.toString?.()
    if (!userId) return
    await agentAssignmentsStore.fetchList({ agentUserId: userId, $limit: 50 })
    const propertyIds = agentAssignmentsStore.list.map((a: any) => a.propertyId).filter(Boolean)
    if (!propertyIds.length) return
    const props = await Promise.allSettled(
      propertyIds.map((id: string) => feathers.service('properties').get(id))
    )
    assignedProperties.value = props
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value)
  } catch {
    // silently ignore
  } finally {
    isLoadingProperties.value = false
  }
}

// Real-time: reflect profile changes pushed via socket
watch(() => agentProfilesStore.list, (newList) => {
  const userId = (auth.user as any)?._id?.toString?.()
  if (!userId) return
  const updated = newList.find((p: any) => String(p.userId) === userId)
  if (updated && profile.value && String((updated as any)._id) === String(profile.value._id)) {
    profile.value = updated as AgentProfile
  }
}, { deep: true })

function populateForm(p: AgentProfile) {
  form.displayName = p.displayName ?? ''
  form.agency = p.agency ?? ''
  form.phone = p.phone ?? ''
  form.whatsapp = p.whatsapp ?? ''
  form.emailPublic = p.emailPublic ?? ''
  form.bio = p.bio ?? ''
  form.avatarUrl = p.avatarUrl ?? ''
  form.listingsCount = p.listingsCount
  form.responseTimeMinutes = p.responseTimeMinutes
  regionsRaw.value = (p.regions ?? []).join(', ')
  languagesRaw.value = (p.languages ?? []).join(', ')
}

function buildPayload() {
  const splitTags = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
  return {
    displayName: form.displayName.trim(),
    agency: form.agency.trim() || undefined,
    phone: form.phone.trim() || undefined,
    whatsapp: form.whatsapp.trim() || undefined,
    emailPublic: form.emailPublic.trim() || undefined,
    bio: form.bio.trim() || undefined,
    avatarUrl: form.avatarUrl.trim() || undefined,
    regions: splitTags(regionsRaw.value),
    languages: splitTags(languagesRaw.value),
    listingsCount: form.listingsCount ?? undefined,
    responseTimeMinutes: form.responseTimeMinutes ?? undefined,
  }
}

async function onSave() {
  successMsg.value = null
  errorMsg.value = null
  isSaving.value = true
  try {
    const payload = buildPayload()
    if (profile.value) {
      const updated = await agentProfilesStore.patch(profile.value._id, payload)
      profile.value = updated
      populateForm(updated)
      successMsg.value = 'Profile updated successfully.'
    } else {
      const created = await agentProfilesStore.create(payload)
      profile.value = created
      populateForm(created)
      successMsg.value = 'Profile created! You are now visible on listings.'
    }
  } catch (e: any) {
    errorMsg.value = e?.message || 'Failed to save profile'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await Promise.all([loadProfile(), loadAssignedProperties()])
})
</script>
