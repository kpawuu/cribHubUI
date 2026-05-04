<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <!-- Page intro -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Inbox</p>
        <h1 class="font-heading mt-1 text-2xl font-semibold tracking-tight text-gray-900">
          Notifications
        </h1>
        <p class="mt-1.5 max-w-md text-sm leading-relaxed text-gray-500">
          Messages and updates from your rentals and account. Unread items are highlighted below.
        </p>
      </div>
      <button
        type="button"
        class="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-40"
        :disabled="notif.unreadTotal === 0 || markingAll"
        @click="onMarkAllRead"
      >
        <i v-if="markingAll" class="las la-spinner animate-spin text-lg leading-none" aria-hidden="true" />
        <i v-else class="las la-check-double text-lg leading-none text-gray-500" aria-hidden="true" />
        <span>{{ markingAll ? 'Marking…' : 'Mark all read' }}</span>
      </button>
    </header>

    <!-- Summary metrics -->
    <div
      class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      aria-label="Notification summary"
    >
      <div class="grid grid-cols-3 divide-x divide-gray-100">
        <div class="px-3 py-4 text-center sm:px-4">
          <p class="text-2xl font-semibold tabular-nums tracking-tight text-gray-900">{{ notif.total }}</p>
          <p class="mt-0.5 text-xs font-medium text-gray-500">Total</p>
        </div>
        <div class="px-3 py-4 text-center sm:px-4">
          <p class="text-2xl font-semibold tabular-nums tracking-tight text-primary-600">{{ notif.unreadTotal }}</p>
          <p class="mt-0.5 text-xs font-medium text-gray-500">Unread</p>
        </div>
        <div class="px-3 py-4 text-center sm:px-4">
          <p class="text-2xl font-semibold tabular-nums tracking-tight text-gray-700">
            {{ Math.max(0, notif.total - notif.unreadTotal) }}
          </p>
          <p class="mt-0.5 text-xs font-medium text-gray-500">Read</p>
        </div>
      </div>
    </div>

    <!-- Filter -->
    <div
      class="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Filter notifications"
    >
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="min-w-[4.5rem] rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        :class="
          filter === tab.key
            ? 'bg-primary-600 text-white shadow-sm'
            : 'text-gray-600 hover:bg-gray-50'
        "
        :aria-selected="filter === tab.key"
        @click="setFilter(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Main panel: loading / empty / list -->
    <section
      class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
      aria-label="Notification list"
    >
      <!-- Skeletons -->
      <div v-if="notif.isLoading" class="divide-y divide-gray-100 p-2">
        <div v-for="n in 6" :key="n" class="flex gap-4 px-3 py-4 sm:px-4">
          <div class="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-100" />
          <div class="min-w-0 flex-1 space-y-2 pt-0.5">
            <div class="h-4 max-w-xs w-[55%] animate-pulse rounded-lg bg-gray-100" />
            <div class="h-3 w-full animate-pulse rounded-lg bg-gray-50" />
            <div class="h-3 w-2/3 animate-pulse rounded-lg bg-gray-50" />
          </div>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="!notif.list.length" class="px-6 py-16 text-center sm:py-20">
        <div
          class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-300"
        >
          <i class="las la-bell-slash text-3xl leading-none" aria-hidden="true" />
        </div>
        <p class="text-base font-semibold text-gray-900">You’re caught up</p>
        <p class="mx-auto mt-2 max-w-sm text-sm text-gray-500">
          {{
            filter === 'unread'
              ? 'No unread notifications. Try “All” to browse history.'
              : 'When something needs your attention, it will show up here.'
          }}
        </p>
      </div>

      <!-- Rows -->
      <ul v-else class="divide-y divide-gray-100" role="list">
        <li
          v-for="n in notif.list"
          :key="n._id"
          class="transition-colors"
          :class="[
            n.readAt ? 'bg-white hover:bg-gray-50/80' : 'bg-primary-50/25 hover:bg-primary-50/40',
            rowDestination(n) ? 'cursor-pointer' : ''
          ]"
        >
          <div
            class="flex gap-3 px-3 py-4 sm:gap-4 sm:px-4"
            :role="rowDestination(n) ? 'button' : undefined"
            :tabindex="rowDestination(n) ? 0 : undefined"
            :aria-label="rowDestination(n) ? `Open: ${n.title || n.category || 'notification'}` : undefined"
            @click="onRowClick(n, $event)"
            @keydown.enter.prevent="onRowClick(n, $event)"
            @keydown.space.prevent="onRowClick(n, $event)"
          >
            <!-- Icon -->
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg leading-none"
              :class="
                n.readAt
                  ? 'border-gray-200 bg-gray-50 text-gray-400'
                  : 'border-primary-200 bg-white text-primary-600 shadow-sm'
              "
              aria-hidden="true"
            >
              <i :class="notifIcon(n.category || n.type)" />
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold leading-snug text-gray-900">
                      {{ n.title || n.category || n.type || 'Notification' }}
                    </p>
                    <span
                      v-if="!n.readAt"
                      class="inline-flex h-2 w-2 shrink-0 rounded-lg bg-primary-500 ring-2 ring-white"
                      title="Unread"
                    />
                  </div>
                  <p class="mt-1 text-sm leading-relaxed text-gray-600">
                    {{ n.body || '—' }}
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <time
                      class="inline-flex items-center gap-1 text-xs font-medium text-gray-400"
                      :datetime="n.createdAt"
                    >
                      <i class="las la-clock text-sm leading-none" aria-hidden="true" />
                      {{ fmtRelative(n.createdAt) }}
                    </time>
                    <span
                      v-if="n.category || n.type"
                      class="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium capitalize text-gray-600"
                    >
                      {{ (n.category || n.type || '').replace(/_/g, ' ') }}
                    </span>
                    <span
                      v-if="rowDestination(n)"
                      class="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary-600"
                    >
                      <i class="las la-arrow-right text-xs leading-none" aria-hidden="true" />
                      Open
                    </span>
                  </div>
                </div>

                <!-- Row action -->
                <div class="shrink-0 pt-0.5">
                  <button
                    v-if="!n.readAt"
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
                    :disabled="rowBusy === String(n._id)"
                    :aria-label="'Mark as read: ' + (n.title || n.type || 'notification')"
                    @click="onMarkRead(n)"
                  >
                    <i
                      v-if="rowBusy === String(n._id)"
                      class="las la-spinner animate-spin text-sm leading-none"
                      aria-hidden="true"
                    />
                    <i v-else class="las la-check text-sm leading-none text-primary-600" aria-hidden="true" />
                    <span class="hidden sm:inline">Done</span>
                  </button>
                  <button
                    v-else
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
                    :disabled="rowBusy === String(n._id)"
                    :aria-label="'Mark as unread: ' + (n.title || n.category || n.type || 'notification')"
                    @click.stop="onMarkUnread(n)"
                  >
                    <i
                      v-if="rowBusy === String(n._id)"
                      class="las la-spinner animate-spin text-sm leading-none"
                      aria-hidden="true"
                    />
                    <i v-else class="las la-undo text-sm leading-none" aria-hidden="true" />
                    <span class="hidden sm:inline">Unread</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <!-- Infinite scroll footer -->
      <div
        ref="scrollSentinel"
        class="flex min-h-[3rem] items-center justify-center border-t border-gray-100 px-4 py-4"
      >
        <span v-if="notif.isLoadingMore" class="inline-flex items-center gap-2 text-sm text-gray-500">
          <i class="las la-spinner animate-spin text-lg leading-none" aria-hidden="true" />
          Loading more…
        </span>
        <span v-else-if="notif.hasMore" class="text-xs font-medium text-gray-400">
          <i class="las la-angle-down mr-1 align-middle text-base leading-none" aria-hidden="true" />
          Scroll for more
        </span>
        <span v-else-if="notif.list.length" class="text-xs font-medium text-gray-400">End of list</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useUserNotificationsStore } from '@@/stores/userNotifications'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Notifications - CribHub' })

const { getNotificationDestination } = useNotificationDestination()
const notif = useUserNotificationsStore()
const scrollSentinel = ref<HTMLElement | null>(null)
const filter = ref<'all' | 'unread' | 'read'>('all')
const markingAll = ref(false)
const rowBusy = ref<string | null>(null)

const tabs = [
  { key: 'all' as const, label: 'All' },
  { key: 'unread' as const, label: 'Unread' },
  { key: 'read' as const, label: 'Read' },
]

function rowDestination(n: Record<string, unknown>) {
  return getNotificationDestination(n as any)
}

function onRowClick(n: Record<string, unknown>, e: KeyboardEvent | MouseEvent) {
  const target = e.target as HTMLElement | null
  if (target?.closest?.('a,button')) return
  const to = rowDestination(n)
  if (!to) return
  void navigateTo(to)
}

function notifIcon(type?: string) {
  const t = type || ''
  if (t.includes('message') || t.includes('chat')) return 'las la-comment-dots'
  if (t.includes('application')) return 'las la-file-alt'
  if (t.includes('contract')) return 'las la-file-contract'
  if (t.includes('payment')) return 'las la-credit-card'
  if (t.includes('maintenance')) return 'las la-tools'
  if (t.includes('notice')) return 'las la-bullhorn'
  if (t.includes('inquiry')) return 'las la-question-circle'
  if (t.includes('role') || t.includes('agent')) return 'las la-user-shield'
  return 'las la-bell'
}

function fmtRelative(d?: string) {
  if (!d) return ''
  try {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

async function setFilter(f: typeof filter.value) {
  filter.value = f
  if (f === 'unread') await notif.fetchList({ unreadOnly: true })
  else if (f === 'read') await notif.fetchList({ readOnlyOnly: true })
  else await notif.fetchList({})
}

useInfiniteScroll(scrollSentinel, () => {
  void notif.loadMore()
})

async function onMarkRead(n: { _id: string }) {
  rowBusy.value = String(n._id)
  try {
    await notif.markAsRead(String(n._id))
  } finally {
    rowBusy.value = null
  }
}

async function onMarkUnread(n: { _id: string }) {
  rowBusy.value = String(n._id)
  try {
    await notif.markAsUnread(String(n._id))
  } finally {
    rowBusy.value = null
  }
}

async function onMarkAllRead() {
  markingAll.value = true
  try {
    await notif.markAllRead()
  } finally {
    markingAll.value = false
  }
}

onMounted(() => setFilter('all'))
</script>
