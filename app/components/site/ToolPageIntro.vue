<template>
  <div v-if="pending" class="mb-5 rounded border border-gray-100 bg-white px-5 py-4 animate-pulse">
    <div class="h-7 w-64 rounded bg-gray-100 mb-2"></div>
    <div class="h-3 w-full rounded bg-gray-50"></div>
  </div>
  <div v-else-if="page" class="mb-5 rounded border border-gray-100 bg-white px-5 py-4">
    <h1 class="font-heading text-2xl font-bold text-gray-900">{{ page.title }}</h1>
    <div
      v-if="htmlBody"
      class="mt-2 prose prose-sm prose-gray max-w-none text-[13px] text-gray-600"
      v-html="htmlBody"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: any
  htmlBody: string
  pending: boolean
}>()
</script>
