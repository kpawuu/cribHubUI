<script setup lang="ts">
/** Legacy URL: catalog lives on `/listings`. */
const route = useRoute()
await navigateTo({ path: '/listings', query: { ...route.query } }, { replace: true, redirectCode: 301 })
</script>

<template>
  <div class="flex min-h-[40vh] items-center justify-center text-sm text-gray-500">Redirecting to listings…</div>
</template>
