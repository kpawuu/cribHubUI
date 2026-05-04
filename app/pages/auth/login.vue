<template>
  <AuthSplitLayout>
    <template #aside>
      <p class="text-xs font-semibold uppercase tracking-wider text-white/80">CribHub</p>
      <h2 class="mt-2 max-w-md font-heading text-3xl font-bold leading-tight sm:text-4xl">Find your next place, without the noise.</h2>
      <p class="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
        Secure access to saved homes, applications, leases, and messages—aligned with how you use the rest of the app.
      </p>
      <ul class="mt-8 max-w-sm space-y-3 text-sm text-white/95">
        <li class="flex items-start gap-3">
          <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/15 ring-1 ring-white/20">
            <i class="las la-shield-alt text-lg leading-none"></i>
          </span>
          <span><strong class="text-white">Verified listings</strong> and role-aware tools for tenants & landlords.</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/15 ring-1 ring-white/20">
            <i class="las la-bolt text-lg leading-none"></i>
          </span>
          <span><strong class="text-white">Realtime updates</strong> on favorites, notifications, and applications.</span>
        </li>
      </ul>
    </template>

    <div class="space-y-1">
      <h1 class="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Welcome back</h1>
      <p class="text-sm text-gray-600">Sign in to continue to your account.</p>
    </div>

    <div v-if="error" class="mt-5 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      <i class="las la-exclamation-circle mr-1.5 align-middle text-base"></i>
      {{ error }}
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-gray-900">Email</label>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-envelope text-lg leading-none"></i>
          </div>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <div class="mb-2 flex items-center justify-between gap-2">
          <label for="password" class="block text-sm font-medium text-gray-900">Password</label>
          <NuxtLink to="/auth/forgot-password" class="text-xs font-medium text-primary-600 hover:text-primary-800 hover:underline">
            Forgot password?
          </NuxtLink>
        </div>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-lock text-lg leading-none"></i>
          </div>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center rounded-r px-3 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            :aria-pressed="showPassword"
            aria-label="Toggle password visibility"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'las la-eye-slash' : 'las la-eye'" class="text-xl leading-none"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="remember"
          v-model="remember"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500"
        />
        <label for="remember" class="text-sm text-gray-600">Remember this device</label>
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded bg-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isSubmitting"
      >
        <i v-if="isSubmitting" class="las la-spinner animate-spin text-lg"></i>
        {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
      </button>

      <div class="relative py-2">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="bg-white px-2 text-xs font-medium uppercase tracking-wide text-gray-400">Or</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <i class="lab la-google text-lg text-[#4285F4]"></i>
          Google
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <i class="lab la-facebook text-lg text-[#1877F2]"></i>
          Facebook
        </button>
      </div>
    </form>

    <template #after-card>
      <p class="mt-5 text-center text-sm text-gray-600">
        No account?
        <NuxtLink to="/auth/signup" class="font-semibold text-primary-600 hover:text-primary-800 hover:underline">Create one</NuxtLink>
      </p>
    </template>
  </AuthSplitLayout>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Login - CribHub' })

const auth = useAuthStore()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const showPassword = ref(false)
const remember = ref(false)

async function onSubmit() {
  error.value = null
  isSubmitting.value = true
  try {
    await auth.login(email.value.trim(), password.value)
    if (!auth.onboardingComplete()) {
      // Tenant-only / not finished — force role onboarding; pass intended destination as `from`
      const from = route.query.redirect as string | undefined
      await navigateTo({ path: '/onboarding/role', query: from ? { from } : undefined })
    } else {
      // Return to the page they were trying to visit, or fall back to dashboard
      const redirect = (route.query.redirect as string) || '/dashboard'
      await navigateTo(redirect)
    }
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>
