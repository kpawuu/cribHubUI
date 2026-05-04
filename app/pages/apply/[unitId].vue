<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-2xl mx-auto px-4 py-10">
      <NuxtLink to="/listings" class="text-sm text-primary-600 hover:text-primary-700 font-medium">← Back to listings</NuxtLink>

      <h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">Rental application</h1>
      <p v-if="unit" class="text-sm text-gray-600 mb-6">
        Unit <span class="font-semibold">{{ unit.unitNumber || unitId }}</span>
        · {{ unit.bedrooms }} bed / {{ unit.bathrooms }} bath
      </p>

      <div v-if="loadError" class="rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm p-4 mb-4">{{ loadError }}</div>

      <div v-if="!auth.isAuthenticated" class="bg-white border border-gray-200 rounded-xl p-6 mb-4">
        <p class="text-sm text-gray-700 mb-3">Sign in as a tenant to submit an application for this unit.</p>
        <NuxtLink
          :to="{ path: '/auth/login', query: { redirect: route.fullPath } }"
          class="inline-flex px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded"
        >
          Sign in
        </NuxtLink>
      </div>

      <form v-else class="space-y-4 bg-white border border-gray-200 rounded-xl p-6" @submit.prevent="onSubmit">
        <div v-if="!auth.hasRole('tenant', 'admin')" class="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
          Your account needs the <strong>tenant</strong> role to apply. Complete tenant onboarding from your dashboard.
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Cover letter / message</label>
          <textarea
            v-model="message"
            required
            rows="4"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-primary-500"
            placeholder="Tell the landlord why you are a good fit…"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">Employment / income (short)</label>
          <input
            v-model="employment"
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-primary-500"
            placeholder="Employer or main income source"
          />
        </div>

        <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>
        <p v-if="submittedOk" class="text-sm text-green-700">Application submitted. You can track it under Applications.</p>

        <div class="flex gap-3 pt-2">
          <button
            type="submit"
            class="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded disabled:opacity-50"
            :disabled="pending || !auth.hasRole('tenant', 'admin')"
          >
            {{ pending ? 'Submitting…' : 'Submit application' }}
          </button>
          <NuxtLink to="/applications" class="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded hover:bg-gray-50">
            My applications
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useUnitsStore } from '@@/stores/units'
import { useRentalApplicationsStore } from '@@/stores/rentalApplications'

definePageMeta({})

useHead({ title: 'Apply for unit - CribHub' })

const route = useRoute()
const auth = useAuthStore()
const units = useUnitsStore()
const apps = useRentalApplicationsStore()

const unitId = computed(() => String(route.params.unitId || ''))
const unit = ref<any | null>(null)
const loadError = ref('')
const submitError = ref('')
const submittedOk = ref(false)
const pending = ref(false)
const message = ref('')
const employment = ref('')

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (!auth.roles.length && auth.isAuthenticated) await auth.fetchRoles()
  try {
    unit.value = await units.fetchById(unitId.value)
    if (!unit.value || unit.value.status !== 'vacant') {
      loadError.value = 'This unit is not available for applications.'
    }
  } catch (e: any) {
    loadError.value = e?.message || 'Unable to load unit.'
  }
})

async function onSubmit() {
  submitError.value = ''
  submittedOk.value = false
  pending.value = true
  try {
    await apps.createApplication({
      unitId: unitId.value,
      applicationData: {
        message: message.value.trim(),
        employment: employment.value.trim()
      }
    })
    submittedOk.value = true
    message.value = ''
    employment.value = ''
  } catch (e: any) {
    submitError.value = e?.message || 'Submit failed.'
  } finally {
    pending.value = false
  }
}
</script>
