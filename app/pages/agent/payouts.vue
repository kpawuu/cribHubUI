<template>
  <div>
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-900">My Commissions</h1>
      <p class="mt-0.5 text-sm text-gray-500">
        Track every commission you've earned across the properties you represent — pending, approved, paid, or cancelled.
      </p>
    </div>
    <UiPayoutsTable kind="agent" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'agent'], layout: 'account' })
useHead({ title: 'My commissions – CribHub' })
</script>
