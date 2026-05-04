<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0"
    :class="sizeClass"
    aria-hidden="true"
  >
    <!-- plus -->
    <path v-if="name === 'plus'" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    <!-- x-mark -->
    <path v-else-if="name === 'x-mark'" d="M6 18L18 6M6 6l12 12" />
    <!-- document-text -->
    <path
      v-else-if="name === 'document-text'"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
    <!-- pencil-square -->
    <path
      v-else-if="name === 'pencil-square'"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
    <!-- document-plus (document-add) -->
    <path
      v-else-if="name === 'document-plus'"
      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V18a2 2 0 01-2 2z"
    />
    <!-- hashtag -->
    <path v-else-if="name === 'hashtag'" d="M7 20l4-16m2 16l4-16M9 9h8M5 5h6" />
    <!-- folder -->
    <path
      v-else-if="name === 'folder'"
      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
    />
    <!-- bookmark -->
    <path v-else-if="name === 'bookmark'" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    <!-- chart-bar -->
    <path
      v-else-if="name === 'chart-bar'"
      d="M9 19v-6m0 0V5m0 14h4m4 0h2M5 19v-3m0 0V5m0 14h.01M15 19v-2m0-4v-4"
    />
    <!-- magnifying-glass -->
    <path v-else-if="name === 'magnifying-glass'" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    <!-- arrow-down-tray (save / persist) -->
    <path
      v-else-if="name === 'arrow-down-tray'"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
    <!-- trash -->
    <path
      v-else-if="name === 'trash'"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
    <!-- exclamation-triangle -->
    <path
      v-else-if="name === 'exclamation-triangle'"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
    <!-- exclamation-circle -->
    <path
      v-else-if="name === 'exclamation-circle'"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    <!-- arrow-path (spinner) -->
    <path
      v-else-if="name === 'arrow-path'"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
    <!-- shield-check (admin) -->
    <path
      v-else-if="name === 'shield-check'"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
    <!-- chevron-down -->
    <path v-else-if="name === 'chevron-down'" d="M19 9l-7 7-7-7" />
    <!-- check-circle -->
    <path v-else-if="name === 'check-circle'" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    <!-- clock -->
    <path v-else-if="name === 'clock'" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    <!-- pencil (compact edit) -->
    <path
      v-else-if="name === 'pencil'"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
    <!-- table-cells (grid) -->
    <path
      v-else-if="name === 'table-cells'"
      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
    />
    <!-- link -->
    <path
      v-else-if="name === 'link'"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.101"
    />
    <!-- scale (legal) -->
    <path
      v-else-if="name === 'scale'"
      d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
    />
    <!-- megaphone (marketing) -->
    <path
      v-else-if="name === 'megaphone'"
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
    <!-- newspaper (blog) -->
    <path
      v-else-if="name === 'newspaper'"
      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
    />
    <!-- map (explore) -->
    <path
      v-else-if="name === 'map'"
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
    <!-- cog (tools) -->
    <template v-else-if="name === 'cog'">
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </template>
    <!-- rectangle-stack (footer) -->
    <path
      v-else-if="name === 'rectangle-stack'"
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
</template>

<script setup lang="ts">
export type UiHeroIconName =
  | 'plus'
  | 'x-mark'
  | 'document-text'
  | 'pencil-square'
  | 'document-plus'
  | 'hashtag'
  | 'folder'
  | 'bookmark'
  | 'chart-bar'
  | 'magnifying-glass'
  | 'arrow-down-tray'
  | 'trash'
  | 'exclamation-triangle'
  | 'exclamation-circle'
  | 'arrow-path'
  | 'shield-check'
  | 'chevron-down'
  | 'check-circle'
  | 'clock'
  | 'pencil'
  | 'table-cells'
  | 'link'
  | 'scale'
  | 'megaphone'
  | 'newspaper'
  | 'map'
  | 'cog'
  | 'rectangle-stack'

const props = withDefaults(
  defineProps<{
    name: UiHeroIconName
    size?: 'xs' | 'sm' | 'md' | 'lg'
  }>(),
  { size: 'sm' }
)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-3.5 w-3.5'
    case 'md':
      return 'h-5 w-5'
    case 'lg':
      return 'h-10 w-10'
    default:
      return 'h-4 w-4'
  }
})
</script>
