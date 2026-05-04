<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="compact-card w-full max-w-md rounded bg-white text-center">
      <!-- Verifying state -->
      <div v-if="status === 'verifying'" class="p-10">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
          <i class="las la-spinner animate-spin text-2xl text-primary-600"></i>
        </div>
        <p class="text-sm font-semibold text-gray-900">Verifying your payment…</p>
        <p class="mt-1 text-xs text-gray-500">Please wait a moment.</p>
      </div>

      <!-- Success state -->
      <div v-else-if="status === 'success'" class="p-10">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <i class="las la-check-circle text-3xl text-emerald-500"></i>
        </div>
        <p class="text-base font-bold text-gray-900">Payment confirmed!</p>
        <p class="mt-1 text-sm text-gray-600">Your rent payment has been recorded successfully.</p>
        <p v-if="reference" class="mt-2 font-mono text-xs text-gray-400">Ref: {{ reference }}</p>
        <div class="mt-6 flex flex-col gap-2">
          <NuxtLink to="/contracts" class="rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
            Back to contracts
          </NuxtLink>
          <NuxtLink to="/dashboard" class="rounded border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            Go to dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Failed state -->
      <div v-else-if="status === 'failed'" class="p-10">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <i class="las la-times-circle text-3xl text-red-500"></i>
        </div>
        <p class="text-base font-bold text-gray-900">Payment could not be verified</p>
        <p class="mt-1 text-sm text-gray-600">{{ errorMsg || 'Something went wrong. Please try again from your contracts page.' }}</p>
        <div class="mt-6">
          <NuxtLink to="/contracts" class="rounded bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
            Back to contracts
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'], layout: false })
useHead({ title: 'Payment verification - CribHub' })

const route = useRoute()
const status = ref<'verifying' | 'success' | 'failed'>('verifying')
const reference = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

onMounted(async () => {
  const ref = (route.query.reference as string) || (route.query.trxref as string)
  reference.value = ref || null

  if (!ref) {
    status.value = 'failed'
    errorMsg.value = 'No payment reference found in the URL.'
    return
  }

  try {
    const feathers = useNuxtApp().$feathers as any
    await feathers.service('payments').create({ action: 'verify', reference: ref })
    status.value = 'success'
  } catch (e: any) {
    status.value = 'failed'
    errorMsg.value = e?.message || null
  }
})
</script>
