<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-10">
    <div class="w-full max-w-2xl">

      <!-- Logo -->
      <div class="mb-6 text-center">
        <NuxtLink to="/">
          <img src="/images/logo/logo.png" alt="CribHub" class="mx-auto h-9" />
        </NuxtLink>
      </div>

      <!-- Step progress -->
      <div class="mb-6 flex items-center justify-center gap-1.5">
        <span class="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-600">
          <i class="las la-check text-[9px]"></i>
        </span>
        <span class="text-xs text-gray-400 line-through">Choose role</span>
        <span class="mx-1 h-px w-8 bg-primary-300"></span>
        <span
          class="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold"
          :class="step === 'profile' ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'"
        >
          <i v-if="step !== 'profile'" class="las la-check text-[9px]"></i>
          <template v-else>2</template>
        </span>
        <span
          class="text-xs"
          :class="step === 'profile' ? 'font-semibold text-primary-600' : 'text-gray-400 line-through'"
        >
          Complete profile
        </span>
        <span class="mx-1 h-px w-8 bg-gray-300"></span>
        <span
          class="flex h-5 w-5 items-center justify-center rounded text-[10px]"
          :class="step === 'documents' ? 'bg-primary-600 font-bold text-white' : 'border border-gray-300 font-medium text-gray-400'"
        >
          3
        </span>
        <span
          class="text-xs"
          :class="step === 'documents' ? 'font-semibold text-primary-600' : 'text-gray-400'"
        >
          Verify documents
        </span>
      </div>

      <!-- Card -->
      <div class="rounded border border-gray-200 bg-white">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h1 class="text-sm font-bold text-gray-900">
              {{ step === 'profile' ? 'Property manager profile' : 'Upload verification documents' }}
            </h1>
            <p class="mt-0.5 text-xs text-gray-500">
              <template v-if="step === 'profile'">
                This is what landlords will see when deciding whether to approve your management requests.
                You can edit it any time after onboarding.
              </template>
              <template v-else>
                Optional but recommended. Upload your business registration, manager license, ID, or
                portfolio references. Landlords and the CribHub team will use these to verify your account.
              </template>
            </p>
          </div>
          <NuxtLink to="/onboarding/role" class="flex items-center gap-1 text-xs text-gray-400 transition hover:text-gray-700">
            <i class="las la-angle-left"></i> Back
          </NuxtLink>
        </div>

        <!-- Messages -->
        <div v-if="error" class="mx-5 mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          <i class="las la-exclamation-circle mr-1"></i>{{ error }}
        </div>
        <div v-if="success" class="mx-5 mt-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
          <i class="las la-check-circle mr-1"></i>{{ success }}
        </div>

        <!-- Step 2: documents -->
        <div v-if="step === 'documents'" class="space-y-3 p-5">
          <UiDocumentsUploader
            v-if="profileId"
            entity-type="property-manager-profiles"
            :entity-id="profileId"
            :files="verificationFiles"
            label="verification documents"
            purpose="verification"
            @update:files="verificationFiles = $event"
          />
          <p class="text-[11px] text-gray-400">
            Accepted: business registration, manager license, ID, portfolio references. PDF, DOC, or images up to 10 MB each.
          </p>
        </div>

        <!-- Step 1: profile form -->
        <form v-else class="space-y-5 p-5" @submit.prevent="onSubmit">
          <!-- Identity -->
          <section>
            <h2 class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <i class="las la-id-badge text-sm text-gray-400"></i> Public identity
            </h2>
            <div class="grid gap-3 sm:grid-cols-2">
              <div>
                <label class="field-label">Display name <span class="text-red-500">*</span></label>
                <input
                  v-model="form.displayName"
                  type="text"
                  required
                  placeholder="e.g. Adam Mensah"
                  class="field-input"
                />
                <p class="mt-0.5 text-[11px] text-gray-400">Shown on every request you send.</p>
              </div>
              <div>
                <label class="field-label">Company / portfolio</label>
                <input
                  v-model="form.companyName"
                  type="text"
                  placeholder="e.g. Apex Property Management"
                  class="field-input"
                />
              </div>
              <div>
                <label class="field-label">Registration ID</label>
                <input
                  v-model="form.registrationId"
                  type="text"
                  placeholder="Business registration"
                  class="field-input"
                />
              </div>
              <div>
                <label class="field-label">Years managing</label>
                <input
                  v-model.number="form.yearsManaging"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  class="field-input"
                />
              </div>
            </div>
          </section>

          <!-- Contact -->
          <section>
            <h2 class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <i class="las la-phone text-sm text-gray-400"></i> Contact
            </h2>
            <div class="grid gap-3 sm:grid-cols-3">
              <div>
                <label class="field-label">Phone</label>
                <input v-model="form.phone" type="tel" class="field-input" placeholder="+233 ..." />
              </div>
              <div>
                <label class="field-label">WhatsApp</label>
                <input v-model="form.whatsapp" type="tel" class="field-input" />
              </div>
              <div>
                <label class="field-label">Public email</label>
                <input v-model="form.emailPublic" type="email" class="field-input" />
              </div>
            </div>
          </section>

          <!-- About -->
          <section>
            <h2 class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <i class="las la-align-left text-sm text-gray-400"></i> About your services
            </h2>
            <textarea
              v-model="form.bio"
              rows="3"
              placeholder="Describe the properties you manage, your team, technology, and specialties…"
              class="field-input"
            ></textarea>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label class="field-label">Services (comma-separated)</label>
                <input
                  v-model="servicesRaw"
                  class="field-input"
                  placeholder="Tenant screening, Rent collection, Maintenance, Leasing"
                />
              </div>
              <div>
                <label class="field-label">Regions covered</label>
                <input
                  v-model="regionsRaw"
                  class="field-input"
                  placeholder="Accra, East Legon, Spintex"
                />
              </div>
            </div>
          </section>

          <!-- Default rate card -->
          <section>
            <h2 class="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
              <i class="las la-tag text-sm text-gray-400"></i> Default rate card
              <span class="ml-1 text-[10px] font-normal normal-case text-gray-400">
                (optional · pre-fills your fee on every request)
              </span>
            </h2>
            <UiFeeProposalEditor v-model="form.defaultFee" />
          </section>

          <!-- Confirmation -->
          <div class="flex items-start gap-2 rounded border border-gray-100 bg-gray-50 px-3 py-2.5">
            <input
              v-model="accepted"
              type="checkbox"
              required
              class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label class="text-xs leading-relaxed text-gray-600">
              I confirm the information provided is accurate. CribHub may review this profile and any uploaded
              documents during verification.
            </label>
          </div>
        </form>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-gray-100 px-5 py-3">
          <button
            v-if="step === 'profile'"
            type="button"
            class="text-xs text-gray-400 transition hover:text-gray-600"
            @click="skipForNow"
          >
            Skip for now
          </button>
          <button
            v-else
            type="button"
            class="text-xs text-gray-400 transition hover:text-gray-600"
            @click="finish"
          >
            Skip documents · upload later
          </button>
          <button
            v-if="step === 'profile'"
            type="button"
            class="inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            :disabled="isSubmitting || !accepted"
            @click="onSubmit"
          >
            <i v-if="isSubmitting" class="las la-circle-notch la-spin"></i>
            {{ isSubmitting ? 'Submitting…' : 'Continue' }}
            <i v-if="!isSubmitting" class="las la-arrow-right text-base"></i>
          </button>
          <button
            v-else
            type="button"
            class="inline-flex items-center gap-2 rounded bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            @click="finish"
          >
            Finish setup
            <i class="las la-check text-base"></i>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { usePropertyManagerProfilesStore } from '@@/stores/operations'
import { consumeOnboardingPostRedirect } from '../../composables/useOnboardingRedirect'
import type { FeeProposal } from '../../composables/useFeeProposal'

definePageMeta({ middleware: ['auth'], layout: 'auth' })
useHead({ title: 'Property Manager Profile – CribHub' })

const auth = useAuthStore()
const pmProfiles = usePropertyManagerProfilesStore()

const step = ref<'profile' | 'documents'>('profile')
const profileId = ref<string | null>(null)
const verificationFiles = ref<any[]>([])

const form = reactive({
  displayName: '',
  companyName: '',
  registrationId: '',
  phone: '',
  whatsapp: '',
  emailPublic: '',
  bio: '',
  yearsManaging: null as number | null,
  defaultFee: null as FeeProposal | null
})
const servicesRaw = ref('')
const regionsRaw = ref('')
const accepted = ref(false)

const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)

onMounted(() => {
  // Prefill from user (if available)
  const u = auth.user as any
  form.displayName = u?.fullName || u?.displayName || ''
  form.emailPublic = u?.email || ''
})

async function skipForNow() {
  await navigateTo(consumeOnboardingPostRedirect('/dashboard'))
}

function splitTags(s: string) {
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}

async function onSubmit() {
  error.value = null
  success.value = null
  isSubmitting.value = true
  try {
    const id = (auth.user as any)?._id?.toString?.() || (auth.user as any)?._id
    if (!id) throw new Error('Missing user id')

    const payload: Record<string, any> = {
      displayName: form.displayName.trim(),
      companyName: form.companyName.trim() || undefined,
      registrationId: form.registrationId.trim() || undefined,
      phone: form.phone.trim() || undefined,
      whatsapp: form.whatsapp.trim() || undefined,
      emailPublic: form.emailPublic.trim() || undefined,
      bio: form.bio.trim() || undefined,
      yearsManaging: form.yearsManaging ?? undefined,
      services: splitTags(servicesRaw.value),
      regions: splitTags(regionsRaw.value)
    }
    if (form.defaultFee && (form.defaultFee.rent || form.defaultFee.sale)) {
      // Strip empty fields for the rate card stored on the profile.
      const rc: any = {}
      if (form.defaultFee.rent) rc.rent = form.defaultFee.rent
      if (form.defaultFee.sale) rc.sale = form.defaultFee.sale
      if (form.defaultFee.notes) rc.notes = form.defaultFee.notes
      payload.defaultFee = rc
    }

    // Create or update PM profile
    await pmProfiles.fetchList({ userId: id })
    const existing = (pmProfiles.list as any[]).find((p) => String(p.userId) === String(id))
    let saved: any
    if (existing?._id) {
      saved = await pmProfiles.patch(String(existing._id), payload)
    } else {
      saved = await pmProfiles.create(payload)
    }
    profileId.value = String(saved?._id || existing?._id || '')

    const feathers = useNuxtApp().$feathers as any
    const patched = await feathers.service('users').patch(id, {
      onboarding: {
        property_manager: {
          companyName: form.companyName.trim() || undefined,
          registrationId: form.registrationId.trim() || undefined,
          about: form.bio.trim() || undefined
        }
      },
      isOnboarded: true
    })

    auth.user = patched
    try { localStorage.setItem('user', JSON.stringify(patched)) } catch {}
    success.value = 'Profile saved. You can now upload verification documents.'
    step.value = 'documents'
  } catch (e: any) {
    error.value = e?.message || 'Failed to submit'
  } finally {
    isSubmitting.value = false
  }
}

async function finish() {
  await navigateTo(consumeOnboardingPostRedirect('/dashboard'))
}
</script>

<style scoped>
.field-label { @apply mb-1 block text-xs font-semibold text-gray-700; }
.field-input { @apply w-full rounded border border-gray-300 px-3 py-2 text-sm transition focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500; }
</style>
