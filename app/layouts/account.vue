<template>
  <div class="min-h-dvh bg-gray-50 text-gray-900 antialiased">
    <!-- Top bar -->
    <header class="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white">
      <div class="flex h-14 items-center gap-2 px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          class="inline-flex items-center rounded p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          @click="mobileSidebarOpen = true"
        >
          <i class="las la-bars text-2xl leading-none"></i>
        </button>

        <NuxtLink to="/" class="flex shrink-0 items-center gap-2 py-1 pr-2">
          <img src="/images/logo/logo.png" alt="CribHub" class="h-7 w-auto" />
        </NuxtLink>

        <div class="hidden min-w-0 flex-1 md:block md:max-w-sm lg:max-w-md">
          <NuxtLink
            to="/listings"
            class="flex items-center gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 transition hover:border-primary-300 hover:bg-white hover:text-gray-700"
          >
            <i class="las la-search text-base text-gray-400"></i>
            <span class="truncate">Search properties…</span>
          </NuxtLink>
        </div>

        <div class="ml-auto flex items-center gap-1">
          <NuxtLink
            to="/notifications"
            class="relative inline-flex items-center rounded p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <i class="las la-bell text-xl leading-none"></i>
            <span
              v-if="notifications.unreadTotal > 0"
              class="absolute -right-0.5 top-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
            >
              {{ notifications.unreadTotal > 99 ? '99+' : notifications.unreadTotal }}
            </span>
          </NuxtLink>

          <ClientOnly>
            <div ref="userDropdownRef" class="relative ml-1">
            <button
              type="button"
              class="flex items-center gap-2 rounded py-1.5 pl-1 pr-2 hover:bg-gray-100"
              :aria-expanded="userDropdownOpen"
              @click="userDropdownOpen = !userDropdownOpen"
            >
              <div class="flex h-8 w-8 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">
                {{ userInitials }}
              </div>
              <span class="hidden max-w-[8rem] truncate text-sm font-medium text-gray-800 sm:block">
                {{ auth.user?.fullName || 'Account' }}
              </span>
              <i class="las la-angle-down hidden text-sm text-gray-500 sm:inline transition-transform duration-150" :class="userDropdownOpen ? 'rotate-180' : ''"></i>
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="scale-95 opacity-0"
              enter-to-class="scale-100 opacity-100"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="scale-100 opacity-100"
              leave-to-class="scale-95 opacity-0"
            >
            <div
              v-show="userDropdownOpen"
              class="absolute right-0 top-full z-50 mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded border border-gray-200 bg-white shadow-lg"
            >
              <div class="px-4 py-3">
                <p class="truncate text-sm font-semibold text-gray-900">{{ auth.user?.fullName || 'Signed in' }}</p>
                <p class="truncate text-xs text-gray-500">{{ auth.user?.email || '' }}</p>
                <div class="mt-2 flex flex-wrap gap-1">
                  <span
                    v-for="role in auth.roles"
                    :key="role"
                    class="rounded bg-primary-50 px-1.5 py-0.5 text-xs font-medium capitalize text-primary-700"
                  >{{ role }}</span>
                </div>
              </div>
              <ul class="py-1 text-sm text-gray-700">
                <li><NuxtLink to="/profile" class="block px-4 py-2.5 hover:bg-gray-50" @click="userDropdownOpen = false"><i class="las la-user-circle mr-2 text-base"></i>Profile & settings</NuxtLink></li>
                <li><NuxtLink to="/favorites" class="block px-4 py-2.5 hover:bg-gray-50" @click="userDropdownOpen = false"><i class="las la-heart mr-2 text-base"></i>Saved properties</NuxtLink></li>
                <li><NuxtLink to="/" class="block px-4 py-2.5 hover:bg-gray-50" @click="userDropdownOpen = false"><i class="las la-home mr-2 text-base"></i>Back to site</NuxtLink></li>
              </ul>
              <div class="py-1">
                <button
                  type="button"
                  class="flex w-full items-center px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  @click="logout"
                >
                  <i class="las la-sign-out-alt mr-2 text-base"></i>Sign out
                </button>
              </div>
            </div>
            </Transition>
            </div>
            <template #fallback>
              <div class="ml-1 flex items-center gap-2 rounded py-1.5 pl-1 pr-2">
                <div class="h-8 w-8 animate-pulse rounded bg-gray-200"></div>
                <span class="hidden h-4 w-20 animate-pulse rounded bg-gray-200 sm:block"></span>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <!-- Mobile overlay -->
    <Transition enter-active-class="transition-opacity duration-200" leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="mobileSidebarOpen" class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden" @click="mobileSidebarOpen = false" />
    </Transition>

    <!-- Sidebar -->
    <aside
      class="fixed bottom-0 left-0 top-14 z-40 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0"
      :class="mobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'"
    >
      <div class="flex flex-1 flex-col overflow-y-auto">
        <!-- User mini card (client-only — depends on the authenticated user) -->
        <ClientOnly>
          <div class="border-b border-gray-100 px-4 py-4">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-600 text-sm font-bold text-white">
                {{ userInitials }}
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-gray-900">{{ auth.user?.fullName || 'Account' }}</p>
                <p class="truncate text-xs text-gray-500">{{ primaryRoleLabel }}</p>
              </div>
            </div>
          </div>
          <template #fallback>
            <div class="border-b border-gray-100 px-4 py-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-200"></div>
                <div class="min-w-0 flex-1 space-y-1.5">
                  <div class="h-3.5 w-24 animate-pulse rounded bg-gray-200"></div>
                  <div class="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          </template>
        </ClientOnly>

        <ClientOnly>
        <div class="flex-1 px-3 py-3">
          <!-- Main nav -->
          <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Overview</p>
          <nav class="mb-4 space-y-0.5">
            <NuxtLink
              v-for="item in navMain"
              :key="item.to"
              :to="item.to"
              class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
              :class="isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
              @click="mobileSidebarOpen = false"
            >
              <i :class="[item.icon, 'w-5 shrink-0 text-center text-lg leading-none']"></i>
              <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              <span
                v-if="item.showUnreadBadge && notifications.unreadTotal > 0"
                class="flex h-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white"
              >
                {{ notifBadgeLabel }}
              </span>
              <span
                v-if="item.showMessagesBadge && unreadMessages > 0"
                class="flex h-5 shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold leading-none text-white"
              >
                {{ unreadMessages > 99 ? '99+' : unreadMessages }}
              </span>
            </NuxtLink>
          </nav>

          <!-- Docs nav -->
          <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Documents</p>
          <nav class="mb-4 space-y-0.5">
            <NuxtLink
              v-for="item in navDocs"
              :key="item.to"
              :to="item.to"
              class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
              :class="isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
              @click="mobileSidebarOpen = false"
            >
              <i :class="[item.icon, 'w-5 shrink-0 text-center text-lg leading-none']"></i>
              <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
              <span
                v-if="item.showUnreadBadge && notifications.unreadTotal > 0"
                class="flex h-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white"
              >
                {{ notifBadgeLabel }}
              </span>
            </NuxtLink>
          </nav>

          <!-- Agent nav -->
          <template v-if="auth.hasRole('agent')">
            <p class="mb-1 mt-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Agent</p>
            <nav class="mb-4 space-y-0.5">
              <NuxtLink
                to="/agent/profile"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/agent/profile') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-id-badge w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Agent Profile</span>
              </NuxtLink>
              <NuxtLink
                to="/agent/listings"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/agent/listings') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-clipboard-list w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Listing Requests</span>
              </NuxtLink>
              <NuxtLink
                to="/agent/applications"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/agent/applications') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-file-alt w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Unit Applications</span>
              </NuxtLink>
              <NuxtLink
                to="/agent/payouts"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/agent/payouts') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-coins w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Commissions</span>
              </NuxtLink>
            </nav>
          </template>

          <!-- Property manager nav -->
          <template v-if="auth.hasRole('property_manager')">
            <p class="mb-1 mt-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Property Manager</p>
            <nav class="mb-4 space-y-0.5">
              <NuxtLink
                to="/pm/profile"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/pm/profile') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-user-cog w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">PM Profile</span>
              </NuxtLink>
              <NuxtLink
                to="/pm/listings"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/pm/listings') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-tasks w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Management Requests</span>
              </NuxtLink>
              <NuxtLink
                to="/pm/payouts"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive('/pm/payouts') ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i class="las la-coins w-5 shrink-0 text-center text-lg leading-none"></i>
                <span class="min-w-0 flex-1 truncate">Management Fees</span>
              </NuxtLink>
            </nav>
          </template>

          <!-- Landlord nav -->
          <template v-if="showLandlordNav">
            <p class="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">{{ portfolioNavLabel }}</p>
            <nav class="space-y-0.5">
              <NuxtLink
                v-for="item in navLandlord"
                :key="item.to + item.label"
                :to="item.to"
                class="flex min-w-0 items-center gap-3 rounded px-2 py-2 text-sm font-medium transition"
                :class="isActive(item.to) ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'"
                @click="mobileSidebarOpen = false"
              >
                <i :class="[item.icon, 'w-5 shrink-0 text-center text-lg leading-none']"></i>
                <span class="min-w-0 flex-1 truncate">{{ item.label }}</span>
                <span
                  v-if="item.showUnreadBadge && notifications.unreadTotal > 0"
                  class="flex h-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-none text-white"
                >
                  {{ notifBadgeLabel }}
                </span>
              </NuxtLink>
            </nav>
          </template>
        </div>
          <template #fallback>
            <div class="flex-1 space-y-2 px-3 py-3">
              <div v-for="n in 6" :key="n" class="h-8 animate-pulse rounded bg-gray-100"></div>
            </div>
          </template>
        </ClientOnly>

        <!-- Bottom -->
        <div class="border-t border-gray-100 px-3 py-3">
          <NuxtLink to="/" class="flex items-center gap-2 rounded px-2 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800" @click="mobileSidebarOpen = false">
            <i class="las la-arrow-left text-base"></i>
            Exit to homepage
          </NuxtLink>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="min-h-dvh bg-gray-50 pt-14 lg:pl-60">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useUserNotificationsStore } from '@@/stores/userNotifications'
import { useInquiriesStore } from '@@/stores/operations'

const route = useRoute()
const auth = useAuthStore()
const notifications = useUserNotificationsStore()
const inq = useInquiriesStore()
const mobileSidebarOpen = ref(false)
const userDropdownOpen = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

// Close dropdown on route change
watch(() => route.fullPath, () => { userDropdownOpen.value = false })

// Close dropdown when clicking outside
function handleOutsideClick(e: MouseEvent) {
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target as Node)) {
    userDropdownOpen.value = false
  }
}

onMounted(() => { document.addEventListener('click', handleOutsideClick, true) })
onUnmounted(() => { document.removeEventListener('click', handleOutsideClick, true) })

// Unread messages badge: new inquiries for landlord/agent/PM, or new replies for tenant
const unreadMessages = computed(() => {
  const roles = auth.roles || []
  const isStaff = roles.some((r: string) => ['landlord', 'property_manager', 'agent', 'admin'].includes(r))
  if (isStaff) return inq.list.filter((r: any) => r.status === 'new').length
  // Tenant: count threads that have been replied to (status changed from 'new')
  return inq.list.filter((r: any) => r.status === 'contacted' || r.status === 'viewing_scheduled').length
})

const userInitials = computed(() => {
  const name = auth.user?.fullName || ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?'
})

const primaryRoleLabel = computed(() => {
  const order = ['admin', 'landlord', 'property_manager', 'agent', 'tenant']
  const roles = auth.roles || []
  for (const r of order) {
    if (roles.includes(r)) {
      const labels: Record<string, string> = {
        admin: 'Administrator', landlord: 'Landlord', property_manager: 'Property Manager',
        agent: 'Agent', tenant: 'Tenant'
      }
      return labels[r] || r
    }
  }
  return 'User'
})

type SidebarNavItem = { to: string; label: string; icon: string; showUnreadBadge?: boolean; showMessagesBadge?: boolean }

const navMain = computed((): SidebarNavItem[] => {
  const items: SidebarNavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: 'las la-th-large' },
  ]
  // Tenant home — shown only for tenant role (may also be landlord etc.)
  if (auth.hasRole('tenant')) {
    items.push({ to: '/tenant/my-home', label: 'My Home', icon: 'las la-home' })
  }
  items.push(
    { to: '/listings', label: 'Browse', icon: 'las la-search-location' },
    { to: '/favorites', label: 'Saved', icon: 'las la-heart' },
    { to: '/applications', label: 'Applications', icon: 'las la-file-alt' },
    { to: '/messages', label: 'Messages', icon: 'las la-comments', showMessagesBadge: true }
  )
  return items
})

const navDocs: SidebarNavItem[] = [
  { to: '/contracts', label: 'Contracts', icon: 'las la-file-contract' },
  { to: '/legal-documents', label: 'Legal docs', icon: 'las la-balance-scale' },
  { to: '/notifications', label: 'Notifications', icon: 'las la-bell', showUnreadBadge: true },
  { to: '/profile', label: 'Profile', icon: 'las la-user-circle' },
]

const navLandlordBase: SidebarNavItem[] = [
  { to: '/landlord/properties', label: 'Properties', icon: 'las la-building' },
  { to: '/landlord/review-applications', label: 'Applications', icon: 'las la-clipboard-check' },
  { to: '/landlord/maintenance', label: 'Maintenance', icon: 'las la-tools' },
  { to: '/landlord/payments', label: 'Payments', icon: 'las la-wallet' },
  { to: '/landlord/notices', label: 'Notices', icon: 'las la-bullhorn' },
  { to: '/landlord/communications', label: 'Updates', icon: 'las la-stream' }
]

const navLandlord = computed((): SidebarNavItem[] => {
  const items = [...navLandlordBase]
  if (auth.hasRole('admin')) {
    items.push(
      { to: '/verification/role-requests', label: 'Role requests (admin)', icon: 'las la-user-shield' },
      { to: '/admin/payouts', label: 'Payouts moderation', icon: 'las la-coins' },
      { to: '/admin/ratings', label: 'Ratings moderation', icon: 'las la-comments' },
      { to: '/admin/migrations', label: 'Data migrations', icon: 'las la-database' }
    )
  }
  return items
})

const showLandlordNav = computed(() => auth.hasRole('landlord', 'admin', 'property_manager'))

const portfolioNavLabel = computed(() =>
  auth.hasRole('landlord', 'admin') ? 'Landlord' : 'Portfolio'
)

const notifBadgeLabel = computed(() => (notifications.unreadTotal > 99 ? '99+' : String(notifications.unreadTotal)))

function isActive(path: string) {
  const p = route.path
  if (path === '/dashboard') return p === '/dashboard'
  if (path === '/listings') return p === '/listings' || p.startsWith('/listings/')
  if (path.startsWith('/landlord')) return p === path || p.startsWith(path + '/')
  return p === path || p.startsWith(path + '/')
}

watch(() => route.fullPath, () => { mobileSidebarOpen.value = false })

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  if (auth.isAuthenticated && !auth.roles.length) await auth.fetchRoles()
  try { await notifications.fetchRecent(8) } catch { /* ignore */ }
  // Pre-load inquiry counts for the unread badge on the Messages nav link
  try { await inq.fetchList({ $sort: { createdAt: -1 } }) } catch { /* ignore */ }
})

async function logout() {
  await auth.logout()
  await navigateTo('/')
}
</script>
