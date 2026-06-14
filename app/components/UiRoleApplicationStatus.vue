<template>
  <div
    v-if="app"
    class="overflow-hidden rounded border border-gray-200 bg-white shadow-sm transition"
  >
    <div class="p-4 sm:p-5">
      <!-- Heading row -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-3">
          <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded', toneIconBg]">
            <i :class="[toneIcon, 'text-lg', toneIconColor]"></i>
          </div>
          <div class="min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-wider" :class="toneEyebrow">
              {{ eyebrow }}
            </p>
            <h2 class="mt-0.5 text-base font-bold text-gray-900 sm:text-lg">{{ headline }}</h2>
            <p v-if="subtext" class="mt-0.5 text-xs text-gray-600 sm:text-sm">{{ subtext }}</p>
          </div>
        </div>

        <!-- Meta -->
        <div class="flex shrink-0 flex-wrap items-center gap-2 text-[11px] text-gray-500">
          <span class="rounded bg-gray-100 px-2 py-0.5 font-mono uppercase tracking-wider">
            #{{ shortRef }}
          </span>
          <span>
            <i class="las la-clock mr-0.5"></i>{{ elapsedLabel }}
          </span>
          <span v-if="slaLabel" :class="app.overdue ? 'text-red-600 font-semibold' : ''">
            <i class="las la-stopwatch mr-0.5"></i>{{ slaLabel }}
          </span>
        </div>
      </div>

      <!-- Stepper — horizontal on md+, stacked on mobile. -->
      <ol class="mt-6 hidden gap-0 text-center md:grid md:grid-cols-4">
        <li
          v-for="(step, idx) in steps"
          :key="step.key"
          class="relative flex flex-col items-center px-2"
        >
          <!-- Left connector (to previous step) -->
          <div
            v-if="idx > 0"
            class="absolute left-0 right-1/2 top-6"
            :class="connectorClass(steps[idx - 1].state, step.state)"
          ></div>
          <!-- Right connector (to next step) -->
          <div
            v-if="idx < steps.length - 1"
            class="absolute left-1/2 right-0 top-6"
            :class="connectorClass(step.state, steps[idx + 1].state)"
          ></div>

          <!-- Icon circle -->
          <div
            class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white transition"
            :class="stepCircleClass(step)"
          >
            <i :class="[step.icon, 'text-lg', stepIconColor(step)]"></i>
          </div>

          <!-- Title -->
          <p
            class="mt-3 text-sm font-bold"
            :class="step.state === 'idle' ? 'text-gray-400' : 'text-gray-900'"
          >
            {{ step.label }}
          </p>

          <!-- Description -->
          <p
            class="mt-1 max-w-[170px] text-[11px] leading-snug"
            :class="step.state === 'idle' ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ step.description }}
          </p>

          <!-- Status pill -->
          <span
            class="mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide"
            :class="stepPillClass(step)"
          >
            {{ step.statusLabel }}
          </span>
        </li>
      </ol>

      <!-- Mobile vertical stepper -->
      <ol class="mt-5 space-y-3 md:hidden">
        <li
          v-for="(step, idx) in steps"
          :key="`m-${step.key}`"
          class="relative flex gap-3"
        >
          <div class="flex flex-col items-center">
            <div
              class="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white"
              :class="stepCircleClass(step)"
            >
              <i :class="[step.icon, 'text-sm', stepIconColor(step)]"></i>
            </div>
            <div
              v-if="idx < steps.length - 1"
              class="mt-1 flex-1"
              :class="connectorClassVertical(step.state, steps[idx + 1].state)"
            ></div>
          </div>
          <div class="flex-1 pb-3">
            <div class="flex items-center justify-between gap-2">
              <p
                class="text-sm font-bold"
                :class="step.state === 'idle' ? 'text-gray-400' : 'text-gray-900'"
              >
                {{ step.label }}
              </p>
              <span
                class="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                :class="stepPillClass(step)"
              >
                {{ step.statusLabel }}
              </span>
            </div>
            <p
              class="mt-0.5 text-[11px] leading-snug"
              :class="step.state === 'idle' ? 'text-gray-400' : 'text-gray-500'"
            >
              {{ step.description }}
            </p>
          </div>
        </li>
      </ol>

      <!-- Missing-docs callout (collapsed view; clicking the CTA expands the uploader below) -->
      <div
        v-if="app.substage === 'docs_required' && app.missingDocumentLabels.length && !showUploader"
        class="mt-4 rounded border border-amber-200 bg-amber-50/60 px-3.5 py-2.5"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
          <i class="las la-exclamation-circle mr-1"></i>Action needed
        </p>
        <p class="mt-1 text-xs text-amber-900">
          Please upload {{ app.missingDocumentLabels.length }}
          {{ app.missingDocumentLabels.length === 1 ? 'document' : 'documents' }}:
        </p>
        <ul class="mt-1.5 space-y-0.5 text-xs text-amber-900">
          <li v-for="label in app.missingDocumentLabels" :key="label" class="flex items-center gap-1.5">
            <i class="las la-file-upload text-amber-600"></i>{{ label }}
          </li>
        </ul>
      </div>

      <!-- Inline uploader — opens here when the user clicks "Upload documents" -->
      <Transition name="slide-down">
        <div v-if="showUploader" class="mt-4 rounded border border-amber-200 bg-amber-50/40 px-3.5 py-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              <i class="las la-cloud-upload-alt mr-1"></i>Upload verification documents
            </p>
            <button
              type="button"
              class="text-[11px] font-medium text-gray-500 hover:text-gray-800"
              @click="showUploader = false"
            >
              <i class="las la-times"></i> Hide
            </button>
          </div>
          <p class="mb-2 text-[11px] text-amber-800">
            PDF · DOC · JPG · PNG — up to 10&nbsp;MB per file. Files are reviewed by the CribHub team.
          </p>

          <ul class="divide-y divide-amber-100 rounded border border-amber-200 bg-white">
            <li
              v-for="row in checklist"
              :key="row.key"
              class="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex items-start gap-3">
                <div
                  :class="[
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs',
                    row.uploaded
                      ? 'bg-emerald-50 text-emerald-600'
                      : row.requested
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-gray-100 text-gray-400'
                  ]"
                >
                  <i :class="row.uploaded ? 'las la-check' : 'las la-file'"></i>
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-900">{{ row.label }}</p>
                  <p
                    class="text-[11px]"
                    :class="row.uploaded ? 'text-emerald-700' : row.requested ? 'text-amber-700' : 'text-gray-500'"
                  >
                    <template v-if="row.uploaded">Uploaded</template>
                    <template v-else-if="row.requested">Reviewer asked for this document</template>
                    <template v-else>Required for {{ app.roleLabel }} verification</template>
                  </p>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-2 sm:justify-end">
                <a
                  v-if="row.uploaded && row.uploadedUrl"
                  :href="row.uploadedUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center rounded border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
                >
                  <i class="las la-external-link-alt mr-1"></i>View
                </a>
                <label
                  v-if="app.status === 'pending'"
                  class="inline-flex cursor-pointer items-center rounded bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-amber-700"
                  :class="busyKey === row.key ? 'pointer-events-none opacity-60' : ''"
                >
                  <i
                    :class="busyKey === row.key ? 'las la-circle-notch la-spin' : 'las la-cloud-upload-alt'"
                    class="mr-1"
                  ></i>
                  {{ row.uploaded ? 'Replace' : 'Upload' }}
                  <input
                    type="file"
                    class="sr-only"
                    accept=".pdf,.doc,.docx,image/png,image/jpeg,image/webp"
                    @change="onPickFile($event, row.key)"
                  />
                </label>
              </div>
            </li>
          </ul>

          <p v-if="uploadError" class="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
            <i class="las la-exclamation-circle mr-1"></i>{{ uploadError }}
          </p>
          <p v-else-if="lastUploadedLabel" class="mt-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
            <i class="las la-check-circle mr-1"></i>"{{ lastUploadedLabel }}" uploaded. The reviewer will be notified.
          </p>
        </div>
      </Transition>

      <!-- Rejection note — standalone v-if (it's mutually exclusive with the
           docs_required callout above, but the <Transition> uploader breaks
           v-else-if adjacency, so a plain v-if keeps the chain valid). -->
      <div
        v-if="app.status === 'rejected' && app.notes"
        class="mt-4 rounded border border-red-200 bg-red-50 px-3.5 py-2.5"
      >
        <p class="text-[11px] font-semibold uppercase tracking-wider text-red-700">
          <i class="las la-info-circle mr-1"></i>Reviewer note
        </p>
        <p class="mt-1 whitespace-pre-wrap text-xs italic text-red-900">"{{ app.notes }}"</p>
      </div>

      <!-- CTA row -->
      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-gray-500">
          {{ submittedLabel }}
          <span v-if="app.reviewedAt"> · {{ reviewedAtLabel }}</span>
        </p>
        <div class="flex flex-wrap gap-2">
          <!-- Upload action: stays inside the dashboard banner instead of navigating away. -->
          <button
            v-if="isDocsUpload"
            type="button"
            class="inline-flex items-center rounded px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition"
            :class="ctaButtonClass"
            @click="showUploader = !showUploader"
          >
            <i :class="['mr-1.5', showUploader ? 'las la-angle-up' : ctaIcon]"></i>
            {{ showUploader ? 'Hide uploader' : app.nextStep.label }}
          </button>
          <NuxtLink
            v-else
            :to="app.nextStep.href"
            class="inline-flex items-center rounded px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition"
            :class="ctaButtonClass"
          >
            <i :class="['mr-1.5', ctaIcon]"></i>{{ app.nextStep.label }}
          </NuxtLink>
          <NuxtLink
            v-if="isDocsUpload || app.nextStep.href !== '/account/role-requests'"
            to="/account/role-requests"
            class="inline-flex items-center rounded border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            View full status
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RoleApplicationView } from '../composables/useRoleApplications'
import { useVerificationUpload } from '../composables/useVerificationUpload'

const props = defineProps<{ app: RoleApplicationView | null }>()

const app = computed(() => props.app)

// ─── Inline uploader state ─────────────────────────────────────────────────
const showUploader = ref(false)
const busyKey = ref<string | null>(null)
const uploadError = ref<string | null>(null)
const lastUploadedLabel = ref<string | null>(null)

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

const checklist = computed<ChecklistRow[]>(() => {
  if (!app.value) return []
  const merged = Array.from(
    new Set([...app.value.requiredDocumentTypes, ...app.value.requestedDocumentTypes])
  )
  return merged.map((key) => {
    const uploaded = app.value!.documents.find((d) => d.documentType === key)
    return {
      key,
      label: DOCUMENT_TYPE_LABEL[key] ?? key,
      uploaded: !!uploaded,
      uploadedAt: uploaded?.uploadedAt,
      uploadedUrl: uploaded?.documentUrl,
      requested: app.value!.requestedDocumentTypes.includes(key) && !uploaded
    }
  })
})

const isDocsUpload = computed(
  () => !!app.value && app.value.status === 'pending' && app.value.substage === 'docs_required'
)

// Auto-collapse the panel as soon as the app stops needing documents (e.g.
// the realtime listener pushes a fresh view where everything is uploaded).
watch(isDocsUpload, (yes) => {
  if (!yes) showUploader.value = false
})

const { uploadOne } = useVerificationUpload()

async function onPickFile(e: Event, documentType: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !app.value) return
  uploadError.value = null
  lastUploadedLabel.value = null
  busyKey.value = documentType
  try {
    const existing = app.value.documents.find((d) => d.documentType === documentType) ?? null
    const result = await uploadOne(app.value._id, documentType, file, existing)
    if (!result.ok) {
      uploadError.value = result.errorMessage || 'Upload failed.'
    } else {
      lastUploadedLabel.value = DOCUMENT_TYPE_LABEL[documentType] ?? documentType
    }
  } finally {
    busyKey.value = null
  }
}

const shortRef = computed(() => app.value?._id?.slice(-6) ?? '——')

const eyebrow = computed(() => `${app.value?.roleLabel ?? 'Role'} application`)

const headline = computed(() => {
  if (!app.value) return ''
  if (app.value.status === 'approved') return `🎉 You're now a ${app.value.roleLabel.toLowerCase()}`
  if (app.value.status === 'rejected') return `Your ${app.value.roleLabel} application wasn't approved`
  switch (app.value.substage) {
    case 'docs_required':
      return `Action needed: upload ${app.value.missingDocumentLabels.length} more ${
        app.value.missingDocumentLabels.length === 1 ? 'document' : 'documents'
      }`
    case 'reviewing':
      return `Your ${app.value.roleLabel} application is in review`
    case 'submitted':
    default:
      return `Your ${app.value.roleLabel} application has been received`
  }
})

const subtext = computed(() => {
  if (!app.value) return ''
  if (app.value.status === 'approved') {
    return 'Welcome — your new tools are unlocked. Jump in whenever you’re ready.'
  }
  if (app.value.status === 'rejected') {
    return 'You can address the reviewer’s notes and re-apply at any time.'
  }
  switch (app.value.substage) {
    case 'docs_required':
      return 'We can’t start the review until the documents below are on file.'
    case 'reviewing':
      return 'A reviewer has opened your case. Decisions usually post within 12 hours.'
    case 'submitted':
    default:
      return 'We aim to reach a decision within 12 hours. You’ll be notified at each step.'
  }
})

type StepState = 'done' | 'active' | 'idle'
type StepRow = {
  key: string
  label: string
  state: StepState
  icon: string
  description: string
  statusLabel: string
  /** Set on the terminal step when the final result is known. */
  outcome?: 'approved' | 'rejected'
}

const steps = computed<StepRow[]>(() => {
  if (!app.value) return []
  const a = app.value
  const decided = a.status !== 'pending'
  const sb = a.substage

  const decisionState: StepState = decided ? 'done' : 'idle'
  const reviewState: StepState = decided ? 'done' : sb === 'reviewing' ? 'active' : 'idle'
  const docsState: StepState = decided
    ? 'done'
    : sb === 'docs_required'
      ? 'active'
      : 'done'

  const docsTotal = a.requiredDocumentTypes.length + a.requestedDocumentTypes.length
  const docsUploaded = a.documents.length

  return [
    {
      key: 'submitted',
      label: 'Submitted',
      icon: 'las la-paper-plane',
      state: 'done',
      description: submittedShort.value
        ? `Application received ${submittedShort.value}.`
        : 'We received your application.',
      statusLabel: 'Done'
    },
    {
      key: 'docs',
      label: 'Documents',
      icon: 'las la-file-alt',
      state: docsState,
      description:
        docsState === 'active'
          ? `Please upload the remaining ${docsTotal - docsUploaded} document${docsTotal - docsUploaded === 1 ? '' : 's'}.`
          : docsState === 'done'
            ? `All ${docsUploaded} document${docsUploaded === 1 ? '' : 's'} on file.`
            : 'Verification documents you provide are checked here.',
      statusLabel:
        docsState === 'active'
          ? 'In Progress'
          : docsState === 'done'
            ? 'Done'
            : 'Upcoming'
    },
    {
      key: 'review',
      label: 'In review',
      icon: 'las la-user-shield',
      state: reviewState,
      description:
        reviewState === 'active'
          ? reviewDetail.value
            ? `A reviewer has opened your application (${reviewDetail.value}).`
            : 'A reviewer is going through your application.'
          : reviewState === 'done'
            ? 'Reviewer assessment complete.'
            : 'Our team will verify your information and documents.',
      statusLabel:
        reviewState === 'active'
          ? 'In Progress'
          : reviewState === 'done'
            ? 'Done'
            : 'Upcoming'
    },
    {
      key: 'decision',
      label: 'Decision',
      icon: a.status === 'approved'
        ? 'las la-check'
        : a.status === 'rejected'
          ? 'las la-times'
          : 'las la-award',
      state: decisionState,
      description:
        a.status === 'approved'
          ? `You're all set! Welcome — your ${a.roleLabel.toLowerCase()} tools are unlocked.`
          : a.status === 'rejected'
            ? 'Your application was not approved this time.'
            : "We'll notify you here with the outcome.",
      statusLabel:
        a.status === 'approved' ? 'Approved' : a.status === 'rejected' ? 'Declined' : 'Upcoming',
      outcome: a.status === 'approved' ? 'approved' : a.status === 'rejected' ? 'rejected' : undefined
    }
  ]
})

const submittedShort = computed(() => {
  if (!app.value?.createdAt) return ''
  const d = new Date(app.value.createdAt)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
})

const submittedLabel = computed(() => {
  if (!app.value?.createdAt) return ''
  const d = new Date(app.value.createdAt)
  return `Submitted ${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${elapsedLabel.value}`
})

const reviewedAtLabel = computed(() => {
  if (!app.value?.reviewedAt) return ''
  return `Decision ${humanRelative(app.value.reviewedAt)}`
})

const reviewDetail = computed(() => {
  if (!app.value) return ''
  if (app.value.substage === 'reviewing' && app.value.reviewerStartedAt) {
    return `started ${humanRelative(app.value.reviewerStartedAt)}`
  }
  return ''
})

const elapsedLabel = computed(() => {
  if (!app.value?.createdAt) return ''
  return `${humanRelative(app.value.createdAt)}`
})

const slaLabel = computed(() => {
  if (!app.value?.slaDueAt) return null
  if (app.value.status !== 'pending') return null
  const due = new Date(app.value.slaDueAt)
  const ms = due.getTime() - Date.now()
  if (ms < 0) return `Decision overdue by ${humanDuration(-ms)}`
  return `Decision due in ${humanDuration(ms)}`
})

// ── Tone (color) system ───────────────────────────────────────────────────
const tone = computed(() => app.value?.nextStep.tone ?? 'blue')
const toneIcon = computed(() => {
  if (!app.value) return 'las la-bell'
  if (app.value.status === 'approved') return 'las la-check-circle'
  if (app.value.status === 'rejected') return 'las la-times-circle'
  if (app.value.substage === 'docs_required') return 'las la-file-upload'
  if (app.value.substage === 'reviewing') return 'las la-user-shield'
  return 'las la-paper-plane'
})
const toneIconBg = computed(() => ({
  amber: 'bg-amber-50',
  indigo: 'bg-indigo-50',
  emerald: 'bg-emerald-50',
  red: 'bg-red-50',
  blue: 'bg-primary-50'
}[tone.value]))
const toneIconColor = computed(() => ({
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-600',
  red: 'text-red-600',
  blue: 'text-primary-600'
}[tone.value]))
const toneEyebrow = computed(() => ({
  amber: 'text-amber-700',
  indigo: 'text-indigo-700',
  emerald: 'text-emerald-700',
  red: 'text-red-700',
  blue: 'text-primary-700'
}[tone.value]))
const ctaIcon = computed(() => {
  if (!app.value) return 'las la-arrow-right'
  if (app.value.status === 'approved') return 'las la-arrow-right'
  if (app.value.status === 'rejected') return 'las la-redo'
  if (app.value.substage === 'docs_required') return 'las la-cloud-upload-alt'
  return 'las la-eye'
})
const ctaButtonClass = computed(() => ({
  amber: 'bg-amber-600 hover:bg-amber-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  emerald: 'bg-emerald-600 hover:bg-emerald-700',
  red: 'bg-red-600 hover:bg-red-700',
  blue: 'bg-primary-600 hover:bg-primary-700'
}[tone.value]))
// ── Stepper styling helpers ───────────────────────────────────────────────
const TONE_BG: Record<string, string> = {
  amber: 'bg-amber-50',
  indigo: 'bg-indigo-50',
  emerald: 'bg-emerald-50',
  red: 'bg-red-50',
  blue: 'bg-primary-50'
}
const TONE_BORDER: Record<string, string> = {
  amber: 'border-amber-500',
  indigo: 'border-indigo-500',
  emerald: 'border-emerald-500',
  red: 'border-red-500',
  blue: 'border-primary-500'
}
const TONE_TEXT: Record<string, string> = {
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
  emerald: 'text-emerald-600',
  red: 'text-red-600',
  blue: 'text-primary-600'
}
const TONE_SOLID: Record<string, string> = {
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  red: 'bg-red-500',
  blue: 'bg-primary-500'
}
const TONE_PILL: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-primary-100 text-primary-700'
}

function stepCircleClass(step: StepRow): string {
  if (step.state === 'done') {
    if (step.outcome === 'approved') return 'bg-emerald-50 border-emerald-500'
    if (step.outcome === 'rejected') return 'bg-red-50 border-red-500'
    return 'bg-emerald-50 border-emerald-400'
  }
  if (step.state === 'active') {
    return `${TONE_BG[tone.value]} ${TONE_BORDER[tone.value]} ring-4 ring-offset-0 ${ringTone.value}`
  }
  return 'bg-white border-gray-200'
}

function stepIconColor(step: StepRow): string {
  if (step.state === 'done') {
    if (step.outcome === 'rejected') return 'text-red-600'
    return 'text-emerald-600'
  }
  if (step.state === 'active') return TONE_TEXT[tone.value]
  return 'text-gray-300'
}

function stepPillClass(step: StepRow): string {
  if (step.state === 'done') {
    if (step.outcome === 'rejected') return 'bg-red-100 text-red-700'
    return 'bg-emerald-100 text-emerald-700'
  }
  if (step.state === 'active') return TONE_PILL[tone.value]
  return 'bg-gray-100 text-gray-500'
}

/**
 * Connector line style between two adjacent step states (horizontal).
 *   • done → done       : solid emerald
 *   • done → active     : solid tone color (flows out of completed step)
 *   • anything else     : dashed gray
 */
function connectorClass(prev: StepState, next: StepState): string {
  if (prev === 'done' && next === 'done') return 'h-0.5 bg-emerald-400'
  if (prev === 'done' && next === 'active') return `h-0.5 ${TONE_SOLID[tone.value]}`
  return 'h-px border-t border-dashed border-gray-300'
}

function connectorClassVertical(prev: StepState, next: StepState): string {
  if (prev === 'done' && next === 'done') return 'w-0.5 bg-emerald-400'
  if (prev === 'done' && next === 'active') return `w-0.5 ${TONE_SOLID[tone.value]}`
  return 'w-px border-l border-dashed border-gray-300'
}

const ringTone = computed(() => ({
  amber: 'ring-amber-100',
  indigo: 'ring-indigo-100',
  emerald: 'ring-emerald-100',
  red: 'ring-red-100',
  blue: 'ring-primary-100'
}[tone.value]))

function humanRelative(d?: string | null) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  return diff < 0 ? `in ${humanDuration(-diff)}` : `${humanDuration(diff)} ago`
}

function humanDuration(ms: number): string {
  const mins = Math.round(ms / 60_000)
  if (mins < 1) return 'a moment'
  if (mins < 60) return `${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d`
  const months = Math.round(days / 30)
  return `${months}mo`
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.22s ease, opacity 0.22s ease;
  overflow: hidden;
  max-height: 600px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
