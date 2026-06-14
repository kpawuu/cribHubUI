<template>
  <div class="mx-auto max-w-4xl">

    <!-- ── Page header ── -->
    <div class="mb-6">
      <p class="text-xs font-semibold uppercase tracking-widest text-primary-600">Admin · Verification</p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-900">Role Requests</h1>
      <p class="mt-1 text-sm text-gray-500 max-w-2xl">
        Review and action onboarding requests from users who wish to operate as landlords, agents, or property managers.
        Roles are activated only after approval.
      </p>
    </div>

    <!-- ── Stat chips ── -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        v-for="tab in statusTabs"
        :key="tab.key"
        type="button"
        class="flex items-center gap-2 rounded border px-3.5 py-2 text-xs font-semibold transition"
        :class="activeStatus === tab.key
          ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'"
        @click="setStatus(tab.key)"
      >
        <span
          class="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
          :class="tab.dotClass"
        >{{ counts[tab.key] }}</span>
        {{ tab.label }}
      </button>
    </div>

    <!-- ── Loading skeleton ── -->
    <div v-if="loading" class="space-y-3">
      <div v-for="n in 3" :key="n" class="rounded border border-gray-200 bg-white p-5 shadow-sm">
        <div class="flex items-start gap-4">
          <div class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200"></div>
          <div class="flex-1 space-y-2">
            <div class="h-3.5 w-36 animate-pulse rounded bg-gray-200"></div>
            <div class="h-2.5 w-56 animate-pulse rounded bg-gray-100"></div>
            <div class="h-2.5 w-24 animate-pulse rounded bg-gray-100"></div>
          </div>
          <div class="flex gap-2">
            <div class="h-7 w-20 animate-pulse rounded bg-gray-200"></div>
            <div class="h-7 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Empty state ── -->
    <div
      v-else-if="!visibleRows.length"
      class="rounded border border-gray-200 bg-white p-14 text-center shadow-sm"
    >
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded bg-gray-100">
        <i class="las la-user-shield text-2xl text-gray-400"></i>
      </div>
      <p class="text-sm font-semibold text-gray-800">No {{ activeStatus === 'all' ? '' : activeStatus }} requests</p>
      <p class="mt-1 text-xs text-gray-400">
        {{ activeStatus === 'pending' ? 'All caught up — no requests awaiting review.' : 'Nothing to display here yet.' }}
      </p>
    </div>

    <!-- ── Request cards ── -->
    <div v-else class="space-y-3">
      <div
        v-for="r in visibleRows"
        :key="r._id"
        class="rounded border bg-white shadow-sm transition-shadow hover:shadow-md"
        :class="r.status === 'pending' ? 'border-gray-200' : r.status === 'approved' ? 'border-emerald-100' : 'border-red-100'"
      >
        <!-- Card body -->
        <div class="flex flex-wrap items-start gap-4 p-5">

          <!-- Avatar -->
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
            :style="{ background: avatarColor(r.userId) }"
          >
            <img
              v-if="userMap[r.userId]?.avatarUrl"
              :src="userMap[r.userId].avatarUrl"
              alt=""
              class="h-full w-full rounded-full object-cover"
            />
            <span v-else>{{ userInitials(r.userId) }}</span>
          </div>

          <!-- User + request info -->
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-bold text-gray-900 truncate">
                {{ userMap[r.userId]?.fullName || userMap[r.userId]?.email || 'Unknown user' }}
              </span>
              <!-- Role badge -->
              <span class="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="roleStyle(r.role).badge">
                <i :class="roleStyle(r.role).icon" class="text-[11px]"></i>
                {{ roleLabel(r.role) }}
              </span>
              <!-- Status badge -->
              <span class="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                :class="statusStyle(r.status).badge">
                <i :class="statusStyle(r.status).icon" class="text-[10px]"></i>
                {{ r.status }}
              </span>
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
              <span v-if="userMap[r.userId]?.email">
                <i class="las la-envelope mr-0.5"></i>{{ userMap[r.userId].email }}
              </span>
              <span v-if="userMap[r.userId]?.createdAt">
                <i class="las la-calendar-alt mr-0.5"></i>Member since {{ fmtDate(userMap[r.userId].createdAt) }}
              </span>
              <span>
                <i class="las la-clock mr-0.5"></i>Requested {{ fmtRelative(r.createdAt) }}
              </span>
            </div>

            <!-- Applicant message -->
            <div v-if="r.message" class="mt-3 rounded border border-gray-100 bg-gray-50 px-3 py-2.5">
              <p class="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                <i class="las la-comment-alt mr-0.5"></i>Applicant note
              </p>
              <p class="text-xs leading-relaxed text-gray-700">{{ r.message }}</p>
            </div>

            <!-- Review info (for approved/rejected) -->
            <div v-if="r.status !== 'pending' && r.reviewedAt" class="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
              <i :class="r.status === 'approved' ? 'las la-check-circle text-emerald-500' : 'las la-times-circle text-red-400'"></i>
              <span>
                {{ r.status === 'approved' ? 'Approved' : 'Rejected' }} {{ fmtRelative(r.reviewedAt) }}
              </span>
              <span v-if="r.notes" class="ml-1 rounded border border-gray-200 bg-white px-2 py-0.5 text-[10px] italic text-gray-500">
                "{{ r.notes }}"
              </span>
            </div>

            <!-- Profile + documents toggle -->
            <button
              v-if="r.profile || (r.documents && r.documents.length)"
              type="button"
              class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              @click="expanded[r._id] = !expanded[r._id]"
            >
              <i :class="expanded[r._id] ? 'las la-angle-up' : 'las la-angle-down'"></i>
              {{ expanded[r._id] ? 'Hide application details' : 'Review application details' }}
            </button>
          </div>

          <!-- Actions -->
          <div class="flex shrink-0 flex-col items-end gap-2">
            <template v-if="r.status === 'pending'">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                :disabled="busy === r._id"
                @click="approve(r._id)"
              >
                <i v-if="busy === r._id" class="las la-circle-notch la-spin text-xs"></i>
                <i v-else class="las la-check text-xs"></i>
                Approve
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                :disabled="busy === r._id"
                @click="toggleRequestDocsPanel(r._id, r.role)"
              >
                <i class="las la-file-upload text-xs"></i>
                Request docs
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded border border-red-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                :disabled="busy === r._id"
                @click="toggleRejectPanel(r._id)"
              >
                <i class="las la-times text-xs"></i>
                Reject
              </button>
            </template>
            <template v-else>
              <span class="text-[10px] text-gray-300 italic">No further action</span>
            </template>
          </div>
        </div>

        <!-- ── Expandable application details ── -->
        <Transition name="slide-down">
          <div v-if="expanded[r._id]" class="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div class="grid gap-4 md:grid-cols-2">
              <!-- Profile -->
              <div v-if="r.profile" class="space-y-2">
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">{{ profileSectionTitle(r.role) }}</p>
                <div class="rounded border border-gray-200 bg-white p-3 text-xs">
                  <div class="flex items-start gap-3">
                    <img
                      v-if="r.profile.avatarUrl"
                      :src="r.profile.avatarUrl"
                      class="h-10 w-10 shrink-0 rounded object-cover"
                      :alt="r.profile.displayName"
                    />
                    <span v-else class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400">
                      <i class="las la-user text-xl"></i>
                    </span>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm font-semibold text-gray-900">{{ r.profile.displayName || '—' }}</p>
                      <p v-if="r.profile.agency || r.profile.companyName" class="text-xs text-gray-600">
                        {{ r.profile.agency || r.profile.companyName }}
                      </p>
                    </div>
                  </div>
                  <div v-if="r.profile.bio" class="mt-2 whitespace-pre-wrap leading-relaxed text-gray-700">{{ r.profile.bio }}</div>
                  <dl class="mt-2 space-y-1">
                    <div v-if="r.profile.emailPublic" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Public email</dt>
                      <dd class="break-all text-gray-900">{{ r.profile.emailPublic }}</dd>
                    </div>
                    <div v-if="r.profile.phone" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Phone</dt>
                      <dd class="text-gray-900">{{ r.profile.phone }}</dd>
                    </div>
                    <div v-if="r.profile.whatsapp" class="flex justify-between gap-2">
                      <dt class="text-gray-500">WhatsApp</dt>
                      <dd class="text-gray-900">{{ r.profile.whatsapp }}</dd>
                    </div>
                    <div v-if="r.profile.regions?.length" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Regions</dt>
                      <dd class="text-gray-900">{{ r.profile.regions.join(', ') }}</dd>
                    </div>
                    <div v-if="r.profile.languages?.length" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Languages</dt>
                      <dd class="text-gray-900">{{ r.profile.languages.join(', ') }}</dd>
                    </div>
                    <div v-if="r.profile.services?.length" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Services</dt>
                      <dd class="text-gray-900">{{ r.profile.services.join(', ') }}</dd>
                    </div>
                    <div v-if="r.profile.portfolioSize != null" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Portfolio size</dt>
                      <dd class="text-gray-900">{{ r.profile.portfolioSize }}</dd>
                    </div>
                    <div v-if="r.profile.yearsManaging != null" class="flex justify-between gap-2">
                      <dt class="text-gray-500">Years managing</dt>
                      <dd class="text-gray-900">{{ r.profile.yearsManaging }}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <!-- Documents -->
              <div>
                <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Verification documents</p>
                <div class="mt-2">
                  <UiVerificationDocsList :files="r.documents || []" />
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- ── Inline request-docs panel ── -->
        <Transition name="slide-down">
          <div v-if="requestingDocsId === r._id" class="border-t border-amber-100 bg-amber-50 px-5 py-4">
            <p class="mb-2 text-xs font-semibold text-amber-800">
              <i class="las la-file-upload mr-1"></i>Request additional documents
            </p>
            <p class="mb-2 text-[11px] text-amber-700">
              Tick the document types you still need from the applicant. They will be emailed and shown a checklist on their dashboard.
            </p>
            <div class="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <label
                v-for="opt in docOptionsFor(r.role)"
                :key="opt.key"
                class="flex cursor-pointer items-center gap-2 rounded border border-amber-200 bg-white px-2.5 py-1.5 text-xs text-gray-800 hover:bg-amber-50"
              >
                <input
                  type="checkbox"
                  class="h-3.5 w-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  :checked="(requestedDocs[r._id] || []).includes(opt.key)"
                  @change="toggleRequestedDoc(r._id, opt.key)"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>
            <div class="mt-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-white"
                @click="requestingDocsId = null"
              >
                Cancel
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:opacity-50"
                :disabled="busy === r._id || !(requestedDocs[r._id] || []).length"
                @click="sendDocRequest(r._id)"
              >
                <i v-if="busy === r._id" class="las la-circle-notch la-spin text-xs"></i>
                <i v-else class="las la-paper-plane text-xs"></i>
                Notify applicant
              </button>
            </div>
          </div>
        </Transition>

        <!-- ── Inline reject panel ── -->
        <Transition name="slide-down">
          <div v-if="rejectingId === r._id" class="border-t border-red-100 bg-red-50 px-5 py-4">
            <p class="mb-2 text-xs font-semibold text-red-700">
              <i class="las la-exclamation-triangle mr-1"></i>Reject this request
            </p>
            <textarea
              v-model="rejectNotes[r._id]"
              rows="2"
              placeholder="Optional: add a note for the applicant explaining the decision…"
              class="w-full rounded border border-red-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-300"
            ></textarea>
            <div class="mt-2.5 flex items-center justify-end gap-2">
              <button
                type="button"
                class="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-white"
                @click="rejectingId = null"
              >
                Cancel
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 rounded bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                :disabled="busy === r._id"
                @click="reject(r._id)"
              >
                <i v-if="busy === r._id" class="las la-circle-notch la-spin text-xs"></i>
                Confirm rejection
              </button>
            </div>
          </div>
        </Transition>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useRoleRequestsStore } from '@@/stores/roleRequests'

definePageMeta({ middleware: ['auth', 'admin'], layout: 'account' })
useHead({ title: 'Role Requests — CribHub Admin' })

const auth = useAuthStore()
const rrStore = useRoleRequestsStore()

// ── State ──────────────────────────────────────────────────────────────────
const rows = computed(() => rrStore.list)
const loading = computed(() => rrStore.isLoading)

const activeStatus = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')

const statusTabs = [
  { key: 'all'      as const, label: 'All',      dotClass: 'bg-gray-200 text-gray-700' },
  { key: 'pending'  as const, label: 'Pending',   dotClass: 'bg-amber-400 text-white'   },
  { key: 'approved' as const, label: 'Approved',  dotClass: 'bg-emerald-500 text-white'  },
  { key: 'rejected' as const, label: 'Rejected',  dotClass: 'bg-red-500 text-white'      },
]

const counts = computed(() => ({
  all:      rows.value.length,
  pending:  rows.value.filter((r) => r.status === 'pending').length,
  approved: rows.value.filter((r) => r.status === 'approved').length,
  rejected: rows.value.filter((r) => r.status === 'rejected').length,
}))

const visibleRows = computed(() =>
  activeStatus.value === 'all' ? rows.value : rows.value.filter((r) => r.status === activeStatus.value)
)

// ── Action state ───────────────────────────────────────────────────────────
const busy = ref<string | null>(null)
const rejectingId = ref<string | null>(null)
const rejectNotes = reactive<Record<string, string>>({})
const expanded = reactive<Record<string, boolean>>({})
const requestingDocsId = ref<string | null>(null)
const requestedDocs = reactive<Record<string, string[]>>({})

const DOC_OPTIONS_BY_ROLE: Record<string, Array<{ key: string; label: string }>> = {
  landlord: [
    { key: 'national_id', label: 'National ID (Ghana Card)' },
    { key: 'proof_of_ownership', label: 'Proof of ownership' }
  ],
  property_manager: [
    { key: 'national_id', label: 'National ID (Ghana Card)' },
    { key: 'business_registration', label: 'Business registration' },
    { key: 'pm_certificate', label: 'PM certification (optional)' }
  ],
  agent: [
    { key: 'national_id', label: 'National ID (Ghana Card)' },
    { key: 'agent_license', label: 'Agent licence' }
  ]
}
function docOptionsFor(role: string) {
  return DOC_OPTIONS_BY_ROLE[role] ?? [{ key: 'national_id', label: 'National ID (Ghana Card)' }]
}
function toggleRequestedDoc(id: string, key: string) {
  const cur = requestedDocs[id] ? [...requestedDocs[id]] : []
  const idx = cur.indexOf(key)
  if (idx >= 0) cur.splice(idx, 1)
  else cur.push(key)
  requestedDocs[id] = cur
}
function toggleRequestDocsPanel(id: string, role: string) {
  requestingDocsId.value = requestingDocsId.value === id ? null : id
  if (requestingDocsId.value === id && !requestedDocs[id]) {
    // Default to the missing required types for the role.
    const need = (DOC_OPTIONS_BY_ROLE[role] ?? []).map((o) => o.key)
    const uploadedTypes = new Set(
      ((rows.value.find((r) => r._id === id)?.documents) || []).map((d: any) => String(d.documentType))
    )
    requestedDocs[id] = need.filter((k) => !uploadedTypes.has(k))
  }
}
async function sendDocRequest(id: string) {
  busy.value = id
  try {
    await rrStore.patch(id, { requestedDocumentTypes: requestedDocs[id] || [] })
    requestingDocsId.value = null
  } finally {
    busy.value = null
  }
}

function profileSectionTitle(role: string) {
  if (role === 'agent') return 'Agent profile'
  if (role === 'property_manager') return 'Property manager profile'
  if (role === 'landlord') return 'Landlord details'
  return 'Profile'
}

// ── User enrichment ────────────────────────────────────────────────────────
const userMap = reactive<Record<string, any>>({})

async function enrichUsers(requests: any[]) {
  const ids = [...new Set(requests.map((r) => String(r.userId)).filter(Boolean))]
  const missing = ids.filter((id) => !userMap[id])
  if (!missing.length) return
  try {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('users').find({
      query: { _id: { $in: missing }, $limit: missing.length, $select: ['_id', 'fullName', 'email', 'avatarUrl', 'createdAt'] }
    })
    const list: any[] = Array.isArray(res) ? res : (res?.data ?? [])
    for (const u of list) {
      userMap[String(u._id)] = u
    }
  } catch {
    // Enrichment is best-effort; silently ignore failures
  }
}

// ── Load ───────────────────────────────────────────────────────────────────
async function load() {
  await rrStore.fetchList({
    $sort: { createdAt: -1 },
    $limit: 100,
    $include: ['applicant', 'profile', 'documents']
  })
  await enrichUsers(rows.value)
}

watch(rows, (newRows) => {
  enrichUsers(newRows)
})

async function setStatus(key: typeof activeStatus.value) {
  activeStatus.value = key
}

// ── Actions ────────────────────────────────────────────────────────────────
async function approve(id: string) {
  busy.value = id
  try {
    await rrStore.patch(id, { status: 'approved' })
  } finally {
    busy.value = null
  }
}

function toggleRejectPanel(id: string) {
  rejectingId.value = rejectingId.value === id ? null : id
  if (!rejectNotes[id]) rejectNotes[id] = ''
}

async function reject(id: string) {
  busy.value = id
  try {
    await rrStore.patch(id, { status: 'rejected', notes: rejectNotes[id]?.trim() || undefined })
    rejectingId.value = null
  } finally {
    busy.value = null
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function roleLabel(role: string) {
  return { landlord: 'Landlord', property_manager: 'Property Manager', agent: 'Agent' }[role] ?? role
}

function roleStyle(role: string) {
  return {
    landlord:         { badge: 'bg-amber-100 text-amber-700',   icon: 'las la-home' },
    property_manager: { badge: 'bg-violet-100 text-violet-700', icon: 'las la-building' },
    agent:            { badge: 'bg-blue-100 text-blue-700',     icon: 'las la-user-tie' },
  }[role] ?? { badge: 'bg-gray-100 text-gray-600', icon: 'las la-tag' }
}

function statusStyle(status: string) {
  return {
    pending:  { badge: 'bg-amber-50 text-amber-600',   icon: 'las la-hourglass-half' },
    approved: { badge: 'bg-emerald-50 text-emerald-600', icon: 'las la-check-circle' },
    rejected: { badge: 'bg-red-50 text-red-600',        icon: 'las la-times-circle'  },
  }[status] ?? { badge: 'bg-gray-100 text-gray-500', icon: 'las la-question-circle' }
}

function userInitials(userId: string) {
  const u = userMap[userId]
  if (!u) return '?'
  const n = u.fullName || u.email || ''
  return n.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
}

// Deterministic avatar color from userId string
const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#0ea5e9','#14b8a6','#a855f7'
]
function avatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtRelative(d?: string) {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return fmtDate(d)
}

onMounted(load)
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.22s ease, opacity 0.22s ease;
  overflow: hidden;
  max-height: 200px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
