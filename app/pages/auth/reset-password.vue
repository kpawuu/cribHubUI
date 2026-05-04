<template>
  <AuthNarrowLayout>
    <div class="flex flex-col items-center text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded bg-primary-100 text-primary-700 ring-4 ring-primary-50">
        <i class="las la-key text-3xl leading-none"></i>
      </div>
      <h1 class="mt-4 font-heading text-2xl font-bold tracking-tight text-gray-900">Set new password</h1>
      <p class="mt-2 text-sm leading-relaxed text-gray-600">
        Code sent to
        <span class="font-medium text-gray-900">{{ email || '—' }}</span>
      </p>
    </div>

    <div v-if="error" class="mt-5 rounded border border-red-200 bg-red-50 p-3 text-left text-sm text-red-800" role="alert">
      {{ error }}
    </div>
    <div v-if="success" class="mt-5 rounded border border-emerald-200 bg-emerald-50 p-3 text-left text-sm text-emerald-900" role="status">
      <i class="las la-check-circle mr-1"></i>
      {{ success }}
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label class="mb-2 block text-center text-sm font-medium text-gray-900">6-digit code</label>
        <div class="flex justify-center gap-2">
          <input
            v-for="(_, idx) in digits"
            :key="idx"
            :ref="(el) => setOtpRef(el, idx)"
            v-model="digits[idx]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            class="h-11 w-10 rounded border border-gray-300 bg-gray-50 text-center text-lg font-semibold text-gray-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 sm:h-12 sm:w-11 sm:text-xl"
            @input="onOtpInput(idx)"
            @keydown="onOtpKeydown($event, idx)"
            @paste="onOtpPaste"
          />
        </div>
      </div>

      <div>
        <label for="password" class="mb-2 block text-sm font-medium text-gray-900">New password</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-lock text-lg leading-none"></i>
          </span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            required
            placeholder="8+ characters"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-11 text-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center rounded-r px-3 text-gray-500 hover:bg-gray-100"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'las la-eye-slash' : 'las la-eye'" class="text-xl leading-none"></i>
          </button>
        </div>
      </div>

      <div>
        <label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-900">Confirm password</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-lock text-lg leading-none"></i>
          </span>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            autocomplete="new-password"
            minlength="8"
            required
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-11 text-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center rounded-r px-3 text-gray-500 hover:bg-gray-100"
            @click="showConfirm = !showConfirm"
          >
            <i :class="showConfirm ? 'las la-eye-slash' : 'las la-eye'" class="text-xl leading-none"></i>
          </button>
        </div>
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded bg-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
        :disabled="isSubmitting"
      >
        <i v-if="isSubmitting" class="las la-spinner animate-spin text-lg"></i>
        {{ isSubmitting ? 'Updating…' : 'Update password' }}
      </button>
    </form>

    <div class="mt-5 border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
      <p class="mb-2">Didn’t get the code?</p>
      <button
        type="button"
        class="font-semibold text-primary-600 hover:text-primary-800 hover:underline disabled:text-gray-400"
        :disabled="isResending"
        @click="onResend"
      >
        {{ isResending ? 'Sending…' : 'Resend code' }}
      </button>
    </div>

    <template #below>
      <p class="mt-4 text-center text-sm">
        <NuxtLink to="/auth/login" class="font-medium text-primary-600 hover:underline">Return to sign in</NuxtLink>
      </p>
    </template>
  </AuthNarrowLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
const route = useRoute()

const email = computed(() => String(route.query.email || '').trim())
useHead({ title: 'Reset Password - CribHub' })

const digits = ref<string[]>(['', '', '', '', '', ''])
const otpRefs = ref<Array<HTMLInputElement | null>>([null, null, null, null, null, null])
const token = computed(() => digits.value.join(''))
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const isResending = ref(false)

function setOtpRef(el: unknown, idx: number) {
  otpRefs.value[idx] = el as HTMLInputElement | null
}
function focusIdx(idx: number) {
  otpRefs.value[idx]?.focus()
}
function onOtpInput(idx: number) {
  const v = (digits.value[idx] || '').replace(/\D/g, '').slice(0, 1)
  digits.value[idx] = v
  if (v && idx < 5) focusIdx(idx + 1)
}
function onOtpKeydown(e: KeyboardEvent, idx: number) {
  if (e.key === 'Backspace' && !digits.value[idx] && idx > 0) focusIdx(idx - 1)
}
function onOtpPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = e.clipboardData?.getData('text') || ''
  const onlyDigits = (text.match(/\d/g) || []).slice(0, 6)
  if (!onlyDigits.length) return
  digits.value = [...onlyDigits, ...Array(6 - onlyDigits.length).fill('')].slice(0, 6)
  focusIdx(Math.min(onlyDigits.length, 5))
}

onMounted(async () => {
  if (!email.value) await navigateTo('/auth/forgot-password')
  focusIdx(0)
})

async function onSubmit() {
  error.value = null
  success.value = null
  isSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers
    if (!email.value) throw new Error('Missing email')
    if (token.value.length !== 6) throw new Error('Enter the 6-digit code')
    if (password.value !== confirmPassword.value) throw new Error('Passwords do not match')
    await feathers.service('auth-management').create({
      action: 'resetPwdShort',
      value: { user: { email: email.value }, token: token.value, password: password.value }
    })
    success.value = 'Password updated. Redirecting to sign in…'
    await navigateTo('/auth/login')
  } catch (e: any) {
    error.value = e?.message || 'Failed to reset password'
  } finally {
    isSubmitting.value = false
  }
}

async function onResend() {
  error.value = null
  success.value = null
  isResending.value = true
  try {
    const feathers = useNuxtApp().$feathers
    if (!email.value) throw new Error('Missing email')
    await feathers.service('auth-management').create({
      action: 'sendResetPwd',
      value: { email: email.value }
    })
    success.value = 'Reset code resent.'
  } catch (e: any) {
    error.value = e?.message || 'Failed to resend code'
  } finally {
    isResending.value = false
  }
}
</script>
