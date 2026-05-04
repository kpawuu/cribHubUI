<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="border-b border-gray-100 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div class="animate-pulse flex items-center gap-2">
          <div class="h-2 w-20 rounded bg-gray-100"></div>
          <div class="h-2 w-2 rounded bg-gray-100"></div>
          <div class="h-2 w-32 rounded bg-gray-100"></div>
        </div>
      </div>
      <div class="mx-auto max-w-7xl px-4 pt-6 pb-5 sm:px-6 animate-pulse space-y-3">
        <div class="h-9 w-3/4 rounded bg-gray-100"></div>
        <div class="h-1 w-12 rounded bg-primary-100"></div>
      </div>
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 animate-pulse space-y-2">
        <div v-for="n in 8" :key="n" class="h-3 rounded bg-gray-50" :class="n % 3 === 0 ? 'w-4/5' : 'w-full'"></div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="mx-auto max-w-7xl px-4 py-16 sm:px-6 text-center">
      <div class="inline-flex h-14 w-14 items-center justify-center rounded bg-primary-50 text-primary-600 mb-4">
        <i class="las la-file-alt text-3xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">Page not found</h1>
      <p class="mt-2 text-sm text-gray-500">This page is not available or hasn't been published yet.</p>
      <NuxtLink
        to="/"
        class="mt-6 inline-flex items-center gap-2 rounded bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
      >
        <i class="las la-home"></i> Back to home
      </NuxtLink>
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Breadcrumb bar -->
      <div class="border-b border-gray-100 bg-white">
        <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <nav class="flex items-center gap-1.5 text-xs text-gray-500">
            <template v-for="(b, i) in breadcrumbs" :key="i">
              <NuxtLink v-if="b.to" :to="b.to" class="font-medium hover:text-primary-600 transition-colors">{{ b.label }}</NuxtLink>
              <span v-else class="text-gray-800 font-semibold">{{ b.label }}</span>
              <i v-if="i < breadcrumbs.length - 1" class="las la-angle-right text-gray-300 text-[10px]"></i>
            </template>
          </nav>
        </div>
      </div>

      <!-- Page hero -->
      <div class="bg-white border-b border-gray-100">
        <div class="mx-auto max-w-7xl px-4 pt-7 pb-5 sm:px-6">
          <div v-if="sectionLabel" class="mb-2">
            <span class="rounded bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-700">{{ sectionLabel }}</span>
          </div>
          <h1 class="font-heading text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-tight">{{ title }}</h1>
          <div class="mt-4 h-0.5 w-12 bg-gradient-to-r from-primary-600 to-primary-300"></div>
        </div>
      </div>

      <!-- Article body -->
      <div class="mx-auto max-w-7xl px-4 py-7 sm:px-6">
        <article
          class="site-article prose prose-gray max-w-3xl
                 prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
                 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
                 prose-h3:text-xl prose-h3:mt-7 prose-h3:mb-3
                 prose-p:text-gray-700 prose-p:leading-7 prose-p:my-4 prose-p:text-[15px]
                 prose-a:text-primary-600 prose-a:no-underline prose-a:font-medium hover:prose-a:underline
                 prose-strong:text-gray-900 prose-strong:font-semibold
                 prose-ul:my-4 prose-ol:my-4 prose-li:my-1 prose-li:text-gray-700 prose-li:text-[15px]
                 prose-blockquote:border-l-[3px] prose-blockquote:border-primary-500 prose-blockquote:bg-primary-50/40
                 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r prose-blockquote:my-6 prose-blockquote:not-italic
                 prose-code:text-primary-700 prose-code:bg-primary-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-[13px]
                 prose-img:rounded prose-img:shadow-sm"
          v-html="htmlBody"
        ></article>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
export type Crumb = { label: string; to?: string }

defineProps<{
  title: string
  htmlBody: string
  loading: boolean
  notFound: boolean
  sectionLabel?: string
  breadcrumbs?: Crumb[]
}>()
</script>
