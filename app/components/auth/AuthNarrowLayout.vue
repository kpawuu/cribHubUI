<template>
  <div class="flex min-h-dvh flex-col items-center justify-center bg-gray-100 px-4 py-10 sm:px-6">
    <div class="w-full max-w-md">
      <div class="mb-6 text-center">
        <NuxtLink to="/" class="inline-block rounded p-1 hover:opacity-90">
          <img src="/images/logo/logo.png" alt="CribHub" class="mx-auto h-9 w-auto sm:h-10" />
        </NuxtLink>
        <slot name="under-logo" />
      </div>

      <div class="rounded border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <slot />
      </div>

      <slot name="below" />
    </div>
  </div>
</template>
