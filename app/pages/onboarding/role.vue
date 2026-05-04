<template>
  <div class="min-h-screen py-12 px-4 bg-gray-50">
    <div class="max-w-5xl mx-auto">
      <!-- Logo -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-block">
          <img src="/images/logo/logo.png" alt="CribHub" class="h-12 mx-auto" />
        </NuxtLink>
      </div>

      <!-- Progress Bar -->
      <div class="mb-12">
        <div class="flex items-center justify-center space-x-2">
          <div class="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
          <div class="w-16 h-1 bg-gray-300"></div>
          <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
          <div class="w-16 h-1 bg-gray-300"></div>
          <div class="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
        </div>
        <div class="flex justify-center mt-2 text-xs text-gray-500">
          <span class="font-semibold text-primary-600">Choose Role</span>
          <span class="mx-4">•</span>
          <span>Complete Profile</span>
          <span class="mx-4">•</span>
          <span>Get Started</span>
        </div>
      </div>

      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Welcome! Choose Your Role</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Pick how you plan to use CribHub. <span class="font-medium text-gray-800">Tenant</span> lets you browse and rent right away.
          <span class="font-medium text-gray-800">Landlord</span>, <span class="font-medium text-gray-800">agent</span>, and
          <span class="font-medium text-gray-800">property manager</span> start a verification request and are enabled after the team approves it.
        </p>
      </div>

      <div v-if="error" class="mb-6 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">{{ error }}</div>

      <!-- Role Cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
        <!-- Tenant -->
        <div
          class="role-card bg-white rounded-xl border-2 border-gray-200 p-6 text-center"
          :class="{ selected: selectedRole === 'tenant' }"
          @click="select('tenant')"
        >
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Tenant</h3>
          <p class="text-sm text-gray-600 mb-4">Looking for a place to rent</p>
          <div class="text-xs text-gray-500">
            • Browse properties<br />
            • Submit applications<br />
            • Manage payments
          </div>
        </div>

        <!-- Landlord -->
        <div
          class="role-card bg-white rounded-xl border-2 border-gray-200 p-6 text-center"
          :class="{ selected: selectedRole === 'landlord' }"
          @click="select('landlord')"
        >
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Landlord</h3>
          <p class="text-sm text-gray-600 mb-4">Property owner</p>
          <div class="text-xs text-gray-500">
            • List properties<br />
            • Manage tenants<br />
            • Track payments
          </div>
        </div>

        <!-- Agent -->
        <div
          class="role-card bg-white rounded-xl border-2 border-gray-200 p-6 text-center"
          :class="{ selected: selectedRole === 'agent' }"
          @click="select('agent')"
        >
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Agent</h3>
          <p class="text-sm text-gray-600 mb-4">Real estate professional</p>
          <div class="text-xs text-gray-500">
            • List properties<br />
            • Connect clients<br />
            • Earn commissions
          </div>
        </div>

        <!-- Property Manager -->
        <div
          class="role-card bg-white rounded-xl border-2 border-gray-200 p-6 text-center"
          :class="{ selected: selectedRole === 'property_manager' }"
          @click="select('property_manager')"
        >
          <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              ></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Property Manager</h3>
          <p class="text-sm text-gray-600 mb-4">Manage properties for owners</p>
          <div class="text-xs text-gray-500">
            • Manage properties<br />
            • Handle maintenance<br />
            • Coordinate tenants
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="text-center animate-fade-in">
        <button
          class="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
          :disabled="!selectedRole || isSubmitting"
          @click="continueNext"
        >
          {{ isSubmitting ? 'Continuing…' : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useRoleRequestsStore } from '@@/stores/roleRequests'
import { normalizeFeathersFind } from '../../../utils/feathersNormalize'
import { stashOnboardingPostRedirect, consumeOnboardingPostRedirect } from '../../composables/useOnboardingRedirect'

definePageMeta({ middleware: ['auth'] })
useHead({ title: 'Choose Your Role - CribHub' })

const auth = useAuthStore()
const rrStore = useRoleRequestsStore()
const route = useRoute()

const selectedRole = ref<null | 'tenant' | 'landlord' | 'agent' | 'property_manager'>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

function select(role: NonNullable<typeof selectedRole.value>) {
  selectedRole.value = role
}

function safeFromQuery(): string | null {
  const from = route.query.from as string | undefined
  if (from && from.startsWith('/') && !from.startsWith('/onboarding') && !from.startsWith('/auth')) return from
  return null
}

async function markOnboarded() {
  const feathers = useNuxtApp().$feathers as any
  const id = (auth.user as any)?._id?.toString?.() || (auth.user as any)?._id
  if (!id) return
  const patched = await feathers.service('users').patch(id, { isOnboarded: true })
  auth.user = patched
  localStorage.setItem('user', JSON.stringify(patched))
  await auth.fetchRoles()
}

/**
 * Create a pending role request, or reuse an existing pending one (e.g. legacy signup
 * that used `requestedRole` before it was removed).
 */
async function ensureRoleRequest(userId: string, role: 'landlord' | 'agent' | 'property_manager') {
  try {
    return await rrStore.create({ userId, role })
  } catch (e: any) {
    const name = e?.data?.name || e?.className || ''
    const msg = String(e?.message || '')
    const conflict = name === 'Conflict' || name === 'conflict' || msg.includes('pending')
    if (!conflict) throw e

    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('role-requests').find({
      query: { userId, role, status: 'pending', $limit: 1 }
    })
    const norm = normalizeFeathersFind(res)
    const row = norm.data[0]
    if (!row) throw e
    return row
  }
}

async function continueNext() {
  if (!selectedRole.value) return
  error.value = null
  isSubmitting.value = true
  try {
    stashOnboardingPostRedirect()
    const role = selectedRole.value

    if (role === 'tenant') {
      await markOnboarded()
      await navigateTo('/onboarding/tenant')
      return
    }

    const userId = (auth.user as any)?._id?.toString?.() || (auth.user as any)?._id
    if (!userId) throw new Error('Missing user id')

    const rr = await ensureRoleRequest(userId, role)
    sessionStorage.setItem('roleRequestId', String(rr?._id || ''))
    sessionStorage.setItem('requestedRole', role)

    await markOnboarded()

    if (role === 'landlord') await navigateTo('/onboarding/landlord')
    else if (role === 'agent') await navigateTo('/onboarding/agent')
    else await navigateTo('/onboarding/property-manager')
  } catch (e: any) {
    error.value = e?.message || 'Failed to continue'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()

  if (auth.onboardingComplete()) {
    const q = safeFromQuery()
    await navigateTo(q || consumeOnboardingPostRedirect('/dashboard'))
  }
})
</script>
