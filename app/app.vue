<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Global message toast host -->
  <Teleport to="body">
    <div class="pointer-events-none fixed right-4 top-4 z-[999] flex flex-col items-end gap-2.5">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-x-8 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-8 opacity-0"
        move-class="transition-all duration-300"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex w-72 cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-xl ring-1 ring-black/5"
          @click="onToastClick(toast)"
        >
          <!-- Avatar -->
          <div class="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary-600 ring-2 ring-primary-100">
            <img
              v-if="toast.avatarUrl"
              :src="toast.avatarUrl"
              class="h-full w-full object-cover"
              alt=""
            />
            <span v-else class="flex h-full w-full items-center justify-center text-sm font-bold text-white">
              {{ (toast.senderName || 'O')[0].toUpperCase() }}
            </span>
            <!-- online dot -->
            <span class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400"></span>
          </div>

          <!-- Content -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-bold text-gray-900">{{ toast.senderName }}</p>
            <p v-if="toast.propertyName" class="truncate text-[10px] text-primary-500 font-medium">{{ toast.propertyName }}</p>
            <p class="mt-0.5 truncate text-xs text-gray-600">{{ toast.body }}</p>
          </div>

          <!-- Dismiss -->
          <button
            type="button"
            class="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            @click.stop="dismiss(toast.id)"
          >
            <i class="las la-times text-sm"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const toasts = useMessageToasts()

function dismiss(id: string) {
  dismissMessageToast(id)
}

function onToastClick(toast: any) {
  dismiss(toast.id)
  if (toast.href) navigateTo(toast.href)
}
</script>
