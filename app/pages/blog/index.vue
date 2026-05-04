<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Compact header bar -->
    <div class="border-b border-gray-100 bg-white">
      <div class="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-widest text-primary-600 mb-1">CribHub Blog</p>
            <h1 class="font-heading text-3xl font-bold tracking-tight text-gray-900">Insights &amp; Updates</h1>
          </div>
          <p class="hidden sm:block text-sm text-gray-500 pb-1">
            {{ posts.length }} article{{ posts.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <!-- Loading -->
      <div v-if="pending" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="rounded border border-gray-100 bg-white p-5 animate-pulse">
          <div class="h-2.5 w-24 rounded bg-gray-100 mb-3"></div>
          <div class="h-4 w-full rounded bg-gray-100 mb-2"></div>
          <div class="h-4 w-3/4 rounded bg-gray-100 mb-4"></div>
          <div class="h-2 w-20 rounded bg-gray-50"></div>
        </div>
      </div>

      <!-- Posts grid -->
      <div v-else-if="posts.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="post in posts"
          :key="String(post._id)"
          :to="`/blog/${post.slug}`"
          class="group flex flex-col compact-card rounded border border-gray-200 bg-white p-5 transition-all duration-200 hover:border-primary-300"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="rounded bg-primary-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary-700">
              Blog
            </span>
            <span v-if="post.publishedAt" class="text-[11px] text-gray-400 font-medium">
              {{ fmtDate(post.publishedAt) }}
            </span>
          </div>
          <h2 class="font-heading text-base font-bold text-gray-900 leading-snug group-hover:text-primary-700 transition-colors flex-1 line-clamp-3">
            {{ post.title }}
          </h2>
          <div class="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary-600">
            <span>Read article</span>
            <i class="las la-arrow-right transition-transform group-hover:translate-x-1"></i>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty state -->
      <div v-else class="rounded border border-gray-200 bg-white py-16 text-center">
        <div class="inline-flex h-12 w-12 items-center justify-center rounded bg-gray-50 text-gray-400 mb-3">
          <i class="las la-newspaper text-2xl"></i>
        </div>
        <h3 class="text-base font-semibold text-gray-800">No articles yet</h3>
        <p class="mt-1 text-sm text-gray-500">Check back soon for new posts.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSitePagesStore } from '@@/stores/sitePages'

definePageMeta({ layout: 'default' })
useHead({ title: 'Blog — CribHub' })

const sitePages = useSitePagesStore()
const { pending } = await useAsyncData('blog-index', () => sitePages.fetchBlogList(80))

const posts = computed(() => sitePages.blogList)

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
