<template>
  <!-- Nested routes under `pages/dashboard/*` (e.g. site-pages CMS) render here; see Nuxt parent/child routing. -->
  <NuxtPage v-if="!isDashboardHome" />
  <div v-else class="bg-gray-50">
    <!-- Welcome banner -->
    <div class="mb-6 border-b border-gray-200 bg-white px-0 pb-6 pt-4">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-primary-600">Your hub</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-gray-900">
            Welcome back, {{ auth.user?.fullName?.split(' ')[0] || 'there' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">
            <span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">{{ dashRoleLabel }}</span>
            <span class="ml-2">· {{ todayDate }}</span>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            to="/listings"
            class="inline-flex items-center rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            <i class="las la-search mr-1.5 text-base"></i>Find a home
          </NuxtLink>
          <NuxtLink
            to="/favorites"
            class="inline-flex items-center rounded border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <i class="las la-heart mr-1.5 text-base text-red-500"></i>Saved
          </NuxtLink>
          <NuxtLink
            v-if="showLandlordEntry"
            to="/landlord/properties"
            class="inline-flex items-center rounded border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 transition hover:bg-primary-100"
          >
            <i class="las la-building mr-1.5 text-base"></i>{{ portfolioHubLabel }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="mb-6">
      <div v-if="dash.isLoading && !dash.summary" class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded border border-gray-200 bg-white" />
      </div>
      <div v-else class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div
          v-for="stat in statsCards"
          :key="stat.label"
          class="compact-card bg-white rounded p-4"
        >
          <div class="flex items-center justify-between">
            <div :class="`flex h-9 w-9 items-center justify-center rounded ${stat.iconBg}`">
              <i :class="`${stat.icon} text-lg leading-none ${stat.iconColor}`"></i>
            </div>
            <span class="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{{ dashRoleLabel }}</span>
          </div>
          <p class="mt-3 text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="mt-0.5 text-xs text-gray-500">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Quick shortcuts -->
    <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <NuxtLink
        to="/contracts"
        class="compact-card group flex items-center gap-3 rounded bg-white p-4 transition hover:border-primary-300"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600">
          <i class="las la-file-contract text-xl"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-gray-900 group-hover:text-primary-700">Contracts</p>
          <p class="text-xs text-gray-500">Rental agreements and rent dates</p>
        </div>
        <i class="las la-angle-right text-gray-300 group-hover:text-primary-500"></i>
      </NuxtLink>
      <NuxtLink
        to="/legal-documents"
        class="compact-card group flex items-center gap-3 rounded bg-white p-4 transition hover:border-primary-300"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-violet-50 text-violet-600">
          <i class="las la-balance-scale text-xl"></i>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-gray-900 group-hover:text-primary-700">Legal documents</p>
          <p class="text-xs text-gray-500">Drafts and paperwork library</p>
        </div>
        <i class="las la-angle-right text-gray-300 group-hover:text-primary-500"></i>
      </NuxtLink>
    </div>

    <NuxtLink
      v-if="auth.hasRole('admin')"
      to="/dashboard/site-pages"
      class="compact-card mb-6 flex items-center gap-3 rounded border border-amber-200 bg-amber-50/60 p-4 transition hover:border-amber-300"
    >
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-amber-100 text-amber-800">
        <i class="las la-newspaper text-xl"></i>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-gray-900">Site pages (CMS)</p>
        <p class="text-xs text-gray-600">Edit legal, marketing, blog, and tool intros shown on the public site</p>
      </div>
      <i class="las la-angle-right text-amber-600"></i>
    </NuxtLink>

    <!-- Main two-column -->
    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Activity feed -->
      <div class="lg:col-span-2">
        <div class="compact-card bg-white rounded">
          <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">Recent activity</h2>
              <p v-if="notifications.unreadTotal > 0" class="mt-0.5 text-xs text-primary-700">
                {{ notifications.unreadTotal }} unread
              </p>
            </div>
            <NuxtLink to="/notifications" class="text-xs font-medium text-primary-600 hover:underline">View all</NuxtLink>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-if="notifications.isLoading && !notifications.list.length" class="space-y-3 p-4">
              <div v-for="n in 4" :key="n" class="h-12 animate-pulse rounded bg-gray-100" />
            </div>
            <p v-else-if="!notifications.list.length" class="p-6 text-center text-sm text-gray-500">
              <i class="las la-inbox mb-2 block text-3xl text-gray-300"></i>
              No recent activity yet.
            </p>
            <template v-else>
              <div
                v-for="n in notifications.list.slice(0, 7)"
                :key="n._id"
                class="flex items-start gap-3 px-4 py-3 transition hover:bg-gray-50"
                :class="[
                  { 'bg-primary-50/40': !n.readAt },
                  notifDestination(n) ? 'cursor-pointer' : ''
                ]"
                :role="notifDestination(n) ? 'button' : undefined"
                :tabindex="notifDestination(n) ? 0 : undefined"
                @click="onNotifRowClick(n, $event)"
                @keydown.enter.prevent="onNotifRowClick(n, $event)"
                @keydown.space.prevent="onNotifRowClick(n, $event)"
              >
                <div :class="`flex h-8 w-8 shrink-0 items-center justify-center rounded ${notifIconClass(n.category)}`">
                  <i :class="`${notifIcon(n.category)} text-sm`"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ n.title || n.eventKey || 'Notification' }}</p>
                  <p class="mt-0.5 line-clamp-1 text-xs text-gray-500">{{ n.body || '—' }}</p>
                </div>
                <p class="shrink-0 text-xs text-gray-400">{{ timeAgo(n.createdAt) }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="space-y-4">
        <!-- Quick actions -->
        <div class="compact-card bg-white rounded p-4">
          <h2 class="mb-3 text-sm font-semibold text-gray-900">Quick actions</h2>
          <div class="space-y-2">
            <NuxtLink
              to="/listings"
              class="flex w-full items-center rounded bg-primary-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
            >
              <i class="las la-compass mr-2 text-base"></i>Browse properties
            </NuxtLink>
            <NuxtLink
              v-if="auth.hasRole('tenant')"
              to="/tenant/my-home"
              class="flex w-full items-center rounded border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-100"
            >
              <i class="las la-home mr-2 text-base"></i>My Home
            </NuxtLink>
            <NuxtLink
              to="/applications"
              class="flex w-full items-center rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <i class="las la-file-alt mr-2 text-base"></i>My applications
            </NuxtLink>
            <NuxtLink
              to="/messages"
              class="flex w-full items-center rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <i class="las la-comments mr-2 text-base"></i>Messages
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="flex w-full items-center rounded border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <i class="las la-user-edit mr-2 text-base"></i>Edit profile
            </NuxtLink>
          </div>
        </div>

        <!-- Landlord quick links -->
        <div v-if="showLandlordEntry" class="compact-card rounded bg-white p-4">
          <div class="mb-3 flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded bg-primary-600">
              <i class="las la-building text-xs text-white"></i>
            </div>
            <h2 class="text-sm font-semibold text-gray-900">{{ portfolioToolsTitle }}</h2>
          </div>
          <div class="space-y-1.5">
            <NuxtLink
              v-for="link in landlordLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2 rounded px-2 py-2 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-primary-700"
            >
              <i :class="`${link.icon} text-base text-gray-400`"></i>
              <span>{{ link.label }}</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Tip card -->
        <div class="rounded border border-dashed border-gray-200 bg-white p-4 text-sm">
          <p class="font-medium text-gray-900"><i class="las la-lightbulb mr-1 text-amber-500"></i>Tip</p>
          <p class="mt-1.5 text-xs leading-relaxed text-gray-600">
            Save listings you like—your
            <NuxtLink class="font-medium text-primary-600 hover:underline" to="/favorites">Saved</NuxtLink>
            tab syncs everywhere you use CribHub.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useDashboardStore } from '@@/stores/dashboard'
import { useUserNotificationsStore } from '@@/stores/userNotifications'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Dashboard - CribHub' })

const route = useRoute()
const auth = useAuthStore()
const dash = useDashboardStore()
const notifications = useUserNotificationsStore()
const { getNotificationDestination } = useNotificationDestination()

/** True only for `/dashboard` — child paths like `/dashboard/site-pages` use `<NuxtPage />` above. */
const isDashboardHome = computed(() => {
  const p = route.path.replace(/\/+$/, '') || '/'
  return p === '/dashboard'
})

function notifDestination(n: any) {
  return getNotificationDestination(n)
}

function onNotifRowClick(n: any, e: MouseEvent | KeyboardEvent) {
  const el = e.target as HTMLElement | null
  if (el?.closest?.('a,button')) return
  const to = notifDestination(n)
  if (to) void navigateTo(to)
}

const s = computed(() => (dash.summary || {}) as Record<string, any>)

const showLandlordEntry = computed(
  () =>
    auth.hasRole('landlord', 'admin', 'property_manager') ||
    (typeof s.value.role === 'string' && (s.value.role === 'landlord' || s.value.role === 'property_manager'))
)

const portfolioHubLabel = computed(() =>
  auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin') ? 'Portfolio hub' : 'Landlord hub'
)

const portfolioToolsTitle = computed(() =>
  auth.hasRole('property_manager') && !auth.hasRole('landlord', 'admin') ? 'Portfolio tools' : 'Landlord tools'
)

const todayDate = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

const dashRoleLabel = computed(() => {
  const r = s.value.role
  if (typeof r !== 'string' || !r) return auth.roles[0] || 'user'
  if (r === 'property_manager') return 'property manager'
  return r
})

const statsCards = computed(() => {
  const sv = s.value
  return [
    {
      label: sv.assignedProperties != null ? 'Assigned properties' : sv.properties != null ? 'Total properties' : 'Units',
      value: sv.properties ?? sv.assignedProperties ?? sv.units ?? '—',
      icon: 'las la-city', iconBg: 'bg-blue-50', iconColor: 'text-blue-600'
    },
    {
      label: sv.payments != null ? 'Payments' : 'Contracts',
      value: sv.payments ?? sv.rentalContracts ?? '—',
      icon: 'las la-wallet', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600'
    },
    {
      label: sv.rentalApplications != null ? 'Applications' : sv.inquiries != null ? 'Inquiries' : 'Maintenance',
      value: sv.rentalApplications ?? sv.inquiries ?? sv.maintenanceRequests ?? '—',
      icon: 'las la-users', iconBg: 'bg-violet-50', iconColor: 'text-violet-600'
    },
    {
      label: sv.openInquiries != null ? 'Open inquiries' : sv.users != null ? 'Users (admin)' : 'Maintenance',
      value: sv.maintenanceRequests ?? sv.openInquiries ?? sv.users ?? '—',
      icon: 'las la-clipboard-list', iconBg: 'bg-amber-50', iconColor: 'text-amber-600'
    }
  ]
})

const landlordLinks = [
  { to: '/landlord/properties', label: 'My properties', icon: 'las la-building' },
  { to: '/landlord/review-applications', label: 'Review applications', icon: 'las la-clipboard-check' },
  { to: '/landlord/maintenance', label: 'Maintenance', icon: 'las la-tools' },
  { to: '/landlord/payments', label: 'Payments', icon: 'las la-wallet' },
  { to: '/landlord/notices', label: 'Notices & SMS', icon: 'las la-bullhorn' },
  { to: '/landlord/communications', label: 'Portfolio updates', icon: 'las la-stream' },
]

function notifIcon(category: string) {
  const m: Record<string, string> = {
    payment: 'las la-wallet', lease: 'las la-file-contract', maintenance: 'las la-tools',
    application: 'las la-file-alt', system: 'las la-cog'
  }
  return m[category] || 'las la-bell'
}

function notifIconClass(category: string) {
  const m: Record<string, string> = {
    payment: 'bg-emerald-50 text-emerald-600', lease: 'bg-blue-50 text-blue-600',
    maintenance: 'bg-amber-50 text-amber-600', application: 'bg-violet-50 text-violet-600',
    system: 'bg-gray-100 text-gray-500'
  }
  return m[category] || 'bg-primary-50 text-primary-600'
}

function timeAgo(date: string) {
  if (!date) return ''
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()
  try {
    await dash.fetchSummary()
    await notifications.fetchRecent(12)
  } catch { /* ignore */ }
})
</script>
