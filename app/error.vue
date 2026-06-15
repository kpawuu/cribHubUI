<template>
  <NuxtLayout name="default">
    <section class="min-h-[70vh] bg-gray-50 px-4 py-16 sm:px-6">
      <div class="mx-auto max-w-xl text-center">
        <p class="text-xs font-bold uppercase tracking-widest text-primary-600">
          Error {{ statusCode }}
        </p>
        <h1 class="mt-2 font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
          {{ title }}
        </h1>
        <p class="mt-3 text-sm text-gray-600 sm:text-base">
          {{ description }}
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded border border-transparent bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            @click="handleReset"
          >
            <i class="las la-redo-alt mr-2 text-base"></i>
            Try again
          </button>
          <NuxtLink
            to="/"
            class="inline-flex items-center justify-center rounded border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="clearError"
          >
            <i class="las la-home mr-2 text-base"></i>
            Back to home
          </NuxtLink>
        </div>

        <!-- Dev-only diagnostic block. Hidden in production. -->
        <details v-if="showDiagnostics" class="mt-8 rounded border border-gray-200 bg-white p-4 text-left text-xs">
          <summary class="cursor-pointer font-semibold text-gray-700">
            Diagnostics (visible in development only)
          </summary>
          <pre class="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-[11px] text-gray-600">{{ diagnostics }}</pre>
        </details>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => Number(props.error?.statusCode) || 500)

const title = computed(() => {
  if (statusCode.value === 404) return 'Page not found'
  if (statusCode.value === 403) return 'Access denied'
  if (statusCode.value === 401) return 'Sign in required'
  if (statusCode.value >= 500) return 'Something went wrong'
  return 'Unable to load page'
})

const description = computed(() => {
  if (statusCode.value === 404) {
    return "We couldn't find what you were looking for. It may have moved or no longer exists."
  }
  if (statusCode.value === 401 || statusCode.value === 403) {
    return 'You don\u2019t have permission to view this page. Please sign in with the right account.'
  }
  if (statusCode.value >= 500) {
    return 'A server error interrupted the request. Please retry; if the problem persists we\u2019ve been notified.'
  }
  return props.error?.statusMessage || 'Please try again or come back later.'
})

// Log SSR/CSR errors to the console so they show up in Nitro logs / browser console.
if (props.error) {
  // eslint-disable-next-line no-console
  console.error('[nuxt:error]', {
    statusCode: props.error.statusCode,
    statusMessage: props.error.statusMessage,
    url: props.error.url,
    message: props.error.message
  })
}

const showDiagnostics = computed(() => {
  return import.meta.dev && Boolean(props.error?.statusMessage || props.error?.message)
})

const diagnostics = computed(() => {
  return [
    `status: ${props.error?.statusCode}`,
    `message: ${props.error?.message || ''}`,
    `statusMessage: ${props.error?.statusMessage || ''}`,
    `url: ${props.error?.url || ''}`,
    props.error?.stack ? `stack:\n${props.error.stack}` : ''
  ]
    .filter(Boolean)
    .join('\n')
})

function handleReset() {
  // 404s should drop to the home page; everything else can reload the same path.
  if (statusCode.value === 404) {
    clearError({ redirect: '/' })
    return
  }
  clearError({ redirect: props.error?.url || '/' })
}
</script>
