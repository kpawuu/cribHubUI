<template>
  <AuthSplitLayout>
    <template #aside>
      <p class="text-xs font-semibold uppercase tracking-wider text-white/80">Join CribHub</p>
      <h2 class="mt-2 max-w-md font-heading text-3xl font-bold leading-tight sm:text-4xl">Create your account in minutes.</h2>
      <p class="mt-4 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
        One profile for browsing, saving homes, applying to units, and managing leases—same design language as the rest of the product.
      </p>
      <p class="mt-4 max-w-md text-xs leading-relaxed text-white/80 sm:text-sm">
        New accounts can use the app as a tenant right away. If you want to list or manage properties as a landlord, agent, or property manager, you will choose that after you sign in and submit a short request for review.
      </p>
      <div class="mt-10 grid max-w-lg grid-cols-3 gap-4 text-center sm:gap-6">
        <div class="rounded bg-white/10 p-3 ring-1 ring-white/15 sm:p-4">
          <div class="font-heading text-2xl font-bold text-white sm:text-3xl">10k+</div>
          <div class="mt-1 text-xs text-white/80">Listings</div>
        </div>
        <div class="rounded bg-white/10 p-3 ring-1 ring-white/15 sm:p-4">
          <div class="font-heading text-2xl font-bold text-white sm:text-3xl">5k+</div>
          <div class="mt-1 text-xs text-white/80">Users</div>
        </div>
        <div class="rounded bg-white/10 p-3 ring-1 ring-white/15 sm:p-4">
          <div class="font-heading text-2xl font-bold text-white sm:text-3xl">200+</div>
          <div class="mt-1 text-xs text-white/80">Agents</div>
        </div>
      </div>
    </template>

    <div class="space-y-1">
      <h1 class="font-heading text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Create account</h1>
      <p class="text-sm text-gray-600">
        Start with email. Everyone gets tenant access first; you can request landlord, agent, or property manager from onboarding after you verify and sign in (those roles are activated after approval).
      </p>
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="fullName" class="mb-2 block text-sm font-medium text-gray-900">Full name</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-user text-lg leading-none"></i>
          </span>
          <input
            id="fullName"
            v-model="fullName"
            type="text"
            autocomplete="name"
            required
            placeholder="Ama Mensah"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label for="email" class="mb-2 block text-sm font-medium text-gray-900">Email</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-envelope text-lg leading-none"></i>
          </span>
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
        <label for="phone" class="mb-2 block text-sm font-medium text-gray-900">
          Phone <span class="font-normal text-gray-400">(optional)</span>
        </label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-phone text-lg leading-none"></i>
          </span>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            placeholder="+233 …"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label for="password" class="mb-2 block text-sm font-medium text-gray-900">Password</label>
        <div class="relative">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <i class="las la-lock text-lg leading-none"></i>
          </span>
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="8+ characters"
            class="block w-full rounded border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:ring-primary-500"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center rounded-r px-3 text-gray-500 hover:bg-gray-100"
            aria-label="Toggle password visibility"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'las la-eye-slash' : 'las la-eye'" class="text-xl leading-none"></i>
          </button>
        </div>
        <div class="mt-2 space-y-1">
          <div class="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div class="h-full rounded-full transition-all duration-300" :class="strengthBarClass" :style="{ width: `${strengthPct}%` }" />
          </div>
          <p class="text-xs" :class="strengthTextClass">{{ strengthText }}</p>
        </div>
      </div>

      <div class="flex gap-2 rounded border border-gray-100 bg-gray-50/80 p-3">
        <input
          id="terms"
          v-model="acceptedTerms"
          type="checkbox"
          required
          class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label for="terms" class="text-xs leading-relaxed text-gray-600">
          I agree to the
          <a href="#" class="font-medium text-primary-600 hover:underline">Terms</a>
          and
          <a href="#" class="font-medium text-primary-600 hover:underline">Privacy Policy</a>.
        </label>
      </div>

      <p v-if="error" class="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{{ error }}</p>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded bg-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
        :disabled="isSubmitting"
      >
        <i v-if="isSubmitting" class="las la-spinner animate-spin text-lg"></i>
        {{ isSubmitting ? 'Creating…' : 'Create account' }}
      </button>

      <div class="relative py-1">
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
        Already registered?
        <NuxtLink to="/auth/login" class="font-semibold text-primary-600 hover:text-primary-800 hover:underline">Sign in</NuxtLink>
      </p>
    </template>
  </AuthSplitLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign Up - CribHub' })

const fullName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const acceptedTerms = ref(false)
const showPassword = ref(false)

const error = ref<string | null>(null)
const isSubmitting = ref(false)

const strength = computed(() => {
  const p = password.value || ''
  let score = 0
  if (p.length >= 8) score += 1
  if (/[A-Z]/.test(p)) score += 1
  if (/[0-9]/.test(p)) score += 1
  if (/[^A-Za-z0-9]/.test(p)) score += 1
  return score
})

const strengthPct = computed(() => Math.min(100, Math.round((strength.value / 4) * 100)))
const strengthText = computed(() => {
  if (!password.value) return 'Use 8+ characters with mixed case, numbers, or symbols.'
  if (strength.value <= 1) return 'Weak—add complexity.'
  if (strength.value === 2) return 'Fair password.'
  if (strength.value === 3) return 'Good password.'
  return 'Strong password.'
})
const strengthBarClass = computed(() => {
  if (!password.value) return 'bg-gray-300'
  if (strength.value <= 1) return 'bg-red-500'
  if (strength.value === 2) return 'bg-amber-500'
  if (strength.value === 3) return 'bg-blue-500'
  return 'bg-emerald-500'
})
const strengthTextClass = computed(() => {
  if (!password.value) return 'text-gray-500'
  if (strength.value <= 1) return 'text-red-600'
  if (strength.value === 2) return 'text-amber-700'
  if (strength.value === 3) return 'text-blue-700'
  return 'text-emerald-700'
})

async function onSubmit() {
  error.value = null
  isSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers
    await feathers.service('users').create({
      fullName: fullName.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim() || undefined,
      password: password.value
    })

    await navigateTo({ path: '/auth/verify-email', query: { email: email.value.trim() } })
  } catch (e: any) {
    error.value = e?.message || 'Signup failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>
