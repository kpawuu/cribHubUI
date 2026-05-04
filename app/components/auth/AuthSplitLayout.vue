<template>
  <div class="min-h-dvh bg-gray-100 lg:flex">
    <!-- Form column -->
    <div class="flex w-full flex-1 flex-col justify-center px-4 py-8 sm:px-8 lg:max-w-xl lg:shrink-0 lg:px-12 xl:px-16">
      <div class="mx-auto w-full max-w-md">
        <div class="mb-6 flex items-center justify-between gap-4">
          <NuxtLink to="/" class="inline-flex items-center gap-2 rounded py-1 text-gray-700 hover:text-primary-700">
            <img src="/images/logo/logo.png" alt="CribHub" class="h-9 w-auto sm:h-10" />
          </NuxtLink>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <i class="las la-home text-base leading-none"></i>
            Home
          </NuxtLink>
        </div>

        <div class="rounded border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <slot />
        </div>

        <slot name="after-card" />
      </div>
    </div>

    <!-- Brand panel -->
    <div class="relative hidden min-h-[min(100vh,32rem)] w-full flex-1 lg:block">
      <div class="auth-gradient absolute inset-0" />
      <div class="relative flex h-full min-h-dvh flex-col justify-center px-10 py-16 text-white xl:px-16">
        <slot name="aside" />
      </div>
    </div>
  </div>
</template>
