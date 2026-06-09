<template>
  <div>
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-900">My Management Fees</h1>
      <p class="mt-0.5 text-sm text-gray-500">
        Every management fee tied to the properties you run — pending, approved, paid, or cancelled.
      </p>
    </div>
    <UiPayoutsTable kind="pm" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'property-manager'], layout: 'account' })
useHead({ title: 'Management fees – CribHub' })
</script>
