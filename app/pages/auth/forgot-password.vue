<template>
  <AuthNarrowLayout>
    <div class="flex flex-col items-center text-center">
      <div class="flex h-14 w-14 items-center justify-center rounded bg-primary-100 text-primary-700 ring-4 ring-primary-50">
        <i class="las la-unlock text-3xl leading-none"></i>
      </div>
      <h1 class="mt-4 font-heading text-2xl font-bold tracking-tight text-gray-900">Reset password</h1>
      <p class="mt-2 max-w-sm text-sm leading-relaxed text-gray-600">
        Enter the email for your account. We will send a code to continue on the next step.
      </p>
    </div>

    <div v-if="error" class="mt-5 rounded border border-red-200 bg-red-50 p-3 text-left text-sm text-red-800" role="alert">
      <i class="las la-exclamation-circle mr-1 text-base"></i>
      {{ error }}
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="onSubmit">
      <div>
        <label for="email" class="mb-2 block text-left text-sm font-medium text-gray-900">Email</label>
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

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center gap-2 rounded bg-primary-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-60"
        :disabled="isSubmitting"
      >
        <i v-if="isSubmitting" class="las la-spinner animate-spin text-lg"></i>
        <i v-else class="las la-paper-plane text-lg"></i>
        {{ isSubmitting ? 'Sending…' : 'Send reset code' }}
      </button>
    </form>

    <div class="mt-5 border-t border-gray-100 pt-4 text-center">
      <NuxtLink
        to="/auth/login"
        class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <i class="las la-arrow-left"></i>
        Back to sign in
      </NuxtLink>
    </div>

    <template #below>
      <p class="mt-4 text-center text-sm text-gray-600">
        Remembered it?
        <NuxtLink to="/auth/login" class="font-semibold text-primary-600 hover:text-primary-800 hover:underline">Sign in</NuxtLink>
      </p>
    </template>
  </AuthNarrowLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })
useHead({ title: 'Forgot Password - CribHub' })

const email = ref('')
const error = ref<string | null>(null)
const isSubmitting = ref(false)

async function onSubmit() {
  error.value = null
  isSubmitting.value = true
  try {
    const feathers = useNuxtApp().$feathers
    if (!feathers) {
      error.value = 'Connection is not ready. Please refresh the page and try again.'
      return
    }
    await feathers.service('auth-management').create({
      action: 'sendResetPwd',
      value: { email: email.value.trim() }
    })
    await navigateTo({ path: '/auth/reset-password', query: { email: email.value.trim() } })
  } catch (e: any) {
    error.value = e?.message || 'Failed to send reset code'
  } finally {
    isSubmitting.value = false
  }
}
</script>
