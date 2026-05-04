<template>
  <div class="mx-auto max-w-3xl">

    <!-- Header with avatar -->
    <div class="mb-5 flex items-center gap-4">
      <div class="relative">
        <div class="h-14 w-14 rounded overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Avatar"
            class="h-full w-full object-cover"
          />
          <span v-else class="text-xl font-bold text-gray-400">{{ initials }}</span>
        </div>
        <label
          class="absolute -bottom-1 -right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-primary-600 text-white shadow-sm transition hover:bg-primary-700"
          title="Change photo"
        >
          <i class="las la-camera text-[10px]"></i>
          <input type="file" class="hidden" accept="image/*" @change="onAvatarChange" />
        </label>
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900">{{ auth.user?.fullName || auth.user?.email || 'My Profile' }}</h1>
        <div class="mt-0.5 flex items-center gap-2 flex-wrap">
          <span
            v-for="role in auth.roles"
            :key="role"
            :class="[
              'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
              role === 'landlord' ? 'bg-amber-100 text-amber-700' :
              role === 'tenant' ? 'bg-blue-100 text-blue-700' :
              role === 'agent' ? 'bg-purple-100 text-purple-700' :
              'bg-gray-100 text-gray-600'
            ]"
          >{{ role }}</span>
          <span
            v-if="userIsVerified"
            class="flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
          >
            <i class="las la-check-circle text-xs"></i>Verified
          </span>
        </div>
      </div>
    </div>

    <!-- Tab nav -->
    <div class="mb-4 flex rounded border border-gray-200 bg-white p-0.5 text-xs font-medium w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="flex items-center gap-1.5 rounded px-3 py-1.5 transition"
        :class="activeTab === tab.key ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'"
        @click="activeTab = tab.key"
      >
        <i :class="tab.icon" class="text-sm"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- ─────────────── PERSONAL TAB ─────────────── -->
    <div v-if="activeTab === 'personal'" class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
      <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
        <i class="las la-user text-primary-600"></i>
        <span class="text-sm font-semibold text-gray-800">Personal information</span>
      </div>
      <form class="p-4 space-y-4" @submit.prevent="save">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Full name</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Your full name"
              class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Email address</label>
            <div class="relative">
              <input
                :value="auth.user?.email || ''"
                type="email"
                disabled
                class="block w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <i class="las la-lock absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            </div>
            <p class="mt-0.5 text-[10px] text-gray-400">Email cannot be changed here</p>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Phone number</label>
            <input
              v-model="phone"
              type="tel"
              placeholder="+233 xx xxx xxxx"
              class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">National ID</label>
            <input
              v-model="nationalId"
              type="text"
              placeholder="GHA-XXXXXXXXX-X"
              class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Preferred currency</label>
            <select
              v-model="defaultCurrency"
              class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-400 focus:outline-none focus:bg-white"
            >
              <option value="GHS">GHS — Ghanaian Cedi</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Member since</label>
            <input
              :value="fmtDate(userCreatedAt)"
              type="text"
              disabled
              class="block w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 border-t border-gray-100">
          <div>
            <p v-if="error" class="flex items-center gap-1 text-xs text-red-600"><i class="las la-exclamation-circle"></i>{{ error }}</p>
            <p v-if="success" class="flex items-center gap-1 text-xs text-emerald-600"><i class="las la-check-circle"></i>{{ success }}</p>
          </div>
          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            :disabled="isSaving"
          >
            <i v-if="isSaving" class="las la-spinner animate-spin"></i>
            {{ isSaving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- ─────────────── SECURITY TAB ─────────────── -->
    <div v-else-if="activeTab === 'security'" class="space-y-3">

      <!-- Change password -->
      <div class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-lock text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">Change password</span>
        </div>
        <form class="p-4 space-y-4" @submit.prevent="onChangePassword">
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Current password</label>
            <div class="relative">
              <input
                v-model="currentPassword"
                :type="showCurrentPw ? 'text' : 'password'"
                required
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm focus:border-primary-400 focus:outline-none focus:bg-white"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="showCurrentPw = !showCurrentPw">
                <i :class="showCurrentPw ? 'las la-eye-slash' : 'las la-eye'" class="text-sm"></i>
              </button>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">New password</label>
            <div class="relative">
              <input
                v-model="newPassword"
                :type="showNewPw ? 'text' : 'password'"
                required
                minlength="8"
                class="block w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm focus:border-primary-400 focus:outline-none focus:bg-white"
              />
              <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="showNewPw = !showNewPw">
                <i :class="showNewPw ? 'las la-eye-slash' : 'las la-eye'" class="text-sm"></i>
              </button>
            </div>
            <!-- Password strength -->
            <div v-if="newPassword" class="mt-1.5 space-y-1">
              <div class="flex gap-0.5">
                <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full" :class="i <= pwStrength ? strengthColor : 'bg-gray-200'"></div>
              </div>
              <p class="text-[10px]" :class="pwStrength < 2 ? 'text-red-500' : pwStrength < 4 ? 'text-amber-500' : 'text-emerald-600'">
                {{ pwStrengthLabel }}
              </p>
            </div>
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold text-gray-700">Confirm new password</label>
            <input
              v-model="confirmNewPassword"
              type="password"
              required
              minlength="8"
              class="block w-full rounded border bg-gray-50 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:bg-white"
              :class="confirmNewPassword && newPassword !== confirmNewPassword ? 'border-red-300' : 'border-gray-300'"
            />
            <p v-if="confirmNewPassword && newPassword !== confirmNewPassword" class="mt-0.5 text-[10px] text-red-500">Passwords do not match</p>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-gray-100">
            <p v-if="pwError" class="text-xs text-red-600"><i class="las la-exclamation-circle mr-0.5"></i>{{ pwError }}</p>
            <p v-if="pwSuccess" class="text-xs text-emerald-600"><i class="las la-check-circle mr-0.5"></i>{{ pwSuccess }}</p>
            <button
              type="submit"
              class="ml-auto inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="isChangingPassword || (!!confirmNewPassword && newPassword !== confirmNewPassword)"
            >
              <i v-if="isChangingPassword" class="las la-spinner animate-spin"></i>
              {{ isChangingPassword ? 'Updating…' : 'Update password' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 2FA -->
      <div class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-shield-alt text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">Two-factor authentication</span>
          <span class="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">Coming soon</span>
        </div>
        <div class="flex items-center gap-3 p-4">
          <div class="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-400">
            <i class="las la-mobile-alt text-base"></i>
          </div>
          <div class="flex-1">
            <p class="text-xs font-semibold text-gray-700">Authenticator app</p>
            <p class="text-[11px] text-gray-400">Add an extra layer of protection to your account</p>
          </div>
          <button type="button" disabled class="rounded border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-400 cursor-not-allowed opacity-60">
            Enable 2FA
          </button>
        </div>
      </div>

      <!-- Sessions -->
      <div class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-desktop text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">Active session</span>
        </div>
        <div class="flex items-center gap-3 p-4">
          <div class="flex h-8 w-8 items-center justify-center rounded bg-emerald-50 text-emerald-600">
            <i class="las la-circle text-xs"></i>
          </div>
          <div class="flex-1">
            <p class="text-xs font-semibold text-gray-700">Current browser session</p>
            <p class="text-[11px] text-gray-400">You're signed in right now on this device</p>
          </div>
          <button
            type="button"
            class="rounded border border-red-200 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 transition"
            @click="signOut"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>

    <!-- ─────────────── PREFERENCES TAB ─────────────── -->
    <div v-else-if="activeTab === 'preferences'" class="space-y-3">

      <!-- Notification preferences -->
      <div class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-bell text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">Notification preferences</span>
        </div>
        <div class="p-4 space-y-3">
          <div
            v-for="pref in notifPrefs"
            :key="pref.key"
            class="flex items-center justify-between gap-4 rounded border border-gray-100 bg-gray-50 p-3"
          >
            <div class="flex items-center gap-2.5">
              <div class="flex h-7 w-7 items-center justify-center rounded bg-white border border-gray-200 text-primary-600">
                <i :class="pref.icon" class="text-sm"></i>
              </div>
              <div>
                <p class="text-xs font-semibold text-gray-800">{{ pref.label }}</p>
                <p class="text-[10px] text-gray-400">{{ pref.desc }}</p>
              </div>
            </div>
            <label class="relative inline-flex cursor-pointer items-center" :class="{ 'opacity-40 cursor-not-allowed': pref.disabled }">
              <input
                v-if="pref.key === 'email'"
                v-model="emailNotifications"
                type="checkbox"
                class="peer sr-only"
                :disabled="pref.disabled"
              />
              <input v-else type="checkbox" class="peer sr-only" :disabled="true" />
              <div class="peer h-4 w-7 rounded-full bg-gray-300 after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition peer-checked:bg-primary-600 peer-checked:after:translate-x-3"></div>
            </label>
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-gray-100">
            <p v-if="prefError" class="text-xs text-red-600"><i class="las la-exclamation-circle mr-0.5"></i>{{ prefError }}</p>
            <p v-if="prefSuccess" class="text-xs text-emerald-600"><i class="las la-check-circle mr-0.5"></i>{{ prefSuccess }}</p>
            <button
              type="button"
              class="ml-auto inline-flex items-center gap-1.5 rounded bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              :disabled="prefSaving"
              @click="savePreferences"
            >
              <i v-if="prefSaving" class="las la-spinner animate-spin"></i>
              {{ prefSaving ? 'Saving…' : 'Save preferences' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Appearance -->
      <div class="compact-card bg-white rounded border border-gray-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
          <i class="las la-palette text-primary-600"></i>
          <span class="text-sm font-semibold text-gray-800">Appearance</span>
          <span class="ml-auto rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">Coming soon</span>
        </div>
        <div class="flex items-center gap-3 p-4">
          <div
            v-for="theme in themes"
            :key="theme.label"
            class="flex flex-col items-center gap-1"
          >
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded border-2 transition',
                theme.active ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300 cursor-pointer'
              ]"
              :style="{ background: theme.bg }"
            >
              <i :class="theme.icon" class="text-base" :style="{ color: theme.iconColor }"></i>
            </div>
            <p class="text-[10px] text-gray-500">{{ theme.label }}</p>
          </div>
        </div>
      </div>

      <!-- Danger zone -->
      <div class="compact-card bg-white rounded border border-red-200 overflow-hidden">
        <div class="flex items-center gap-2 border-b border-red-100 px-4 py-3">
          <i class="las la-exclamation-triangle text-red-500"></i>
          <span class="text-sm font-semibold text-red-700">Danger zone</span>
        </div>
        <div class="p-4">
          <p class="text-xs text-gray-600 mb-3">Permanently delete your account. This action cannot be undone. All your data will be erased.</p>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            @click="showDeleteConfirm = true"
          >
            <i class="las la-user-times"></i>
            Delete my account
          </button>
          <p v-if="deleteMessage" class="mt-2 text-xs text-gray-500">{{ deleteMessage }}</p>
        </div>
      </div>
    </div>

    <!-- Delete account confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="showDeleteConfirm = false">
        <div class="w-full max-w-sm rounded border border-gray-200 bg-white p-5 text-center">
          <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
            <i class="las la-user-times text-lg"></i>
          </div>
          <p class="text-sm font-bold text-gray-900">Delete your account?</p>
          <p class="mt-1 text-xs text-gray-500 max-w-xs mx-auto">All your data, properties, contracts and documents will be permanently removed. This cannot be undone.</p>
          <div class="mt-4 flex justify-center gap-2">
            <button type="button" class="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50" @click="showDeleteConfirm = false">
              Cancel
            </button>
            <button type="button" class="inline-flex items-center gap-1.5 rounded bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700" @click="deleteAccount">
              Yes, delete everything
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'My Profile - CribHub' })

const auth = useAuthStore()

const activeTab = ref<'personal' | 'security' | 'preferences'>('personal')

const tabs = [
  { key: 'personal' as const, label: 'Personal', icon: 'las la-user' },
  { key: 'security' as const, label: 'Security', icon: 'las la-lock' },
  { key: 'preferences' as const, label: 'Preferences', icon: 'las la-sliders-h' },
]

// Avatar
const avatarPreview = ref<string | null>(null)

const userIsVerified = computed(() => !!(auth.user as any)?.isVerified)
const userCreatedAt = computed(() => (auth.user as any)?.createdAt as string | undefined)

const initials = computed(() => {
  const n = auth.user?.fullName || auth.user?.email || ''
  return n.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
})

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)
}

// Personal
const fullName = ref(auth.user?.fullName || '')
const phone = ref(auth.user?.phone || '')
const nationalId = ref((auth.user as any)?.nationalId || '')
const defaultCurrency = ref(auth.user?.defaultCurrency || 'GHS')
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSaving = ref(false)

function fmtDate(d?: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

async function save() {
  error.value = null
  success.value = null
  isSaving.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const id = (auth.user as any)?._id
    if (!id) throw new Error('Missing user ID')
    const patched = await feathers.service('users').patch(id, {
      fullName: fullName.value.trim(),
      phone: phone.value.trim() || undefined,
      nationalId: nationalId.value.trim() || undefined,
      defaultCurrency: defaultCurrency.value,
    })
    auth.user = patched as any
    localStorage.setItem('user', JSON.stringify(patched))
    success.value = 'Profile saved.'
    setTimeout(() => { success.value = null }, 3000)
  } catch (e: any) {
    error.value = e?.message || 'Failed to save'
  } finally {
    isSaving.value = false
  }
}

// Security
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const isChangingPassword = ref(false)
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const pwError = ref<string | null>(null)
const pwSuccess = ref<string | null>(null)

const pwStrength = computed(() => {
  const p = newPassword.value
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
})

const strengthColor = computed(() => {
  if (pwStrength.value < 2) return 'bg-red-400'
  if (pwStrength.value < 4) return 'bg-amber-400'
  return 'bg-emerald-500'
})

const pwStrengthLabel = computed(() => {
  if (pwStrength.value < 2) return 'Weak password'
  if (pwStrength.value < 3) return 'Fair password'
  if (pwStrength.value < 4) return 'Good password'
  return 'Strong password'
})

async function onChangePassword() {
  pwError.value = null
  pwSuccess.value = null
  isChangingPassword.value = true
  try {
    if (newPassword.value !== confirmNewPassword.value) throw new Error('Passwords do not match')
    throw new Error('Password change is not enabled on this API yet.')
  } catch (e: any) {
    pwError.value = e?.message || 'Failed to update password'
  } finally {
    isChangingPassword.value = false
  }
}

async function signOut() {
  await auth.logout()
  await navigateTo('/auth/login')
}

// Preferences
const emailNotifications = ref((auth.user as any)?.emailNotifications !== false)
const prefError = ref<string | null>(null)
const prefSuccess = ref<string | null>(null)
const prefSaving = ref(false)

const notifPrefs = [
  { key: 'email', label: 'Email notifications', icon: 'las la-envelope', desc: 'Important updates and activity emails', disabled: false },
  { key: 'sms', label: 'SMS notifications', icon: 'las la-sms', desc: 'Coming soon', disabled: true },
  { key: 'marketing', label: 'Marketing emails', icon: 'las la-bullhorn', desc: 'Coming soon', disabled: true },
]

const themes = [
  { label: 'Light', icon: 'las la-sun', bg: '#fff', iconColor: '#f59e0b', active: true },
  { label: 'Dark', icon: 'las la-moon', bg: '#1f2937', iconColor: '#c4b5fd', active: false },
  { label: 'Auto', icon: 'las la-adjust', bg: 'linear-gradient(135deg,#fff 50%,#1f2937 50%)', iconColor: '#6366f1', active: false },
]

watch(
  () => auth.user,
  (u) => {
    if (!u) return
    emailNotifications.value = (u as any).emailNotifications !== false
  },
  { deep: true }
)

async function savePreferences() {
  prefError.value = null
  prefSuccess.value = null
  prefSaving.value = true
  try {
    const feathers = useNuxtApp().$feathers as any
    const id = (auth.user as any)?._id
    if (!id) throw new Error('Missing user ID')
    const patched = await feathers.service('users').patch(id, { emailNotifications: emailNotifications.value })
    auth.user = patched as any
    if (auth.user) localStorage.setItem('user', JSON.stringify(auth.user))
    prefSuccess.value = 'Preferences saved.'
    setTimeout(() => { prefSuccess.value = null }, 3000)
  } catch (e: any) {
    prefError.value = e?.message || 'Failed to save preferences'
  } finally {
    prefSaving.value = false
  }
}

// Danger zone
const showDeleteConfirm = ref(false)
const deleteMessage = ref<string | null>(null)

async function deleteAccount() {
  showDeleteConfirm.value = false
  deleteMessage.value = null
  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('delete-account').create({})
    await auth.logout()
    await navigateTo('/')
  } catch (e: any) {
    deleteMessage.value = e?.message || 'Failed to delete account'
    showDeleteConfirm.value = false
  }
}
</script>
