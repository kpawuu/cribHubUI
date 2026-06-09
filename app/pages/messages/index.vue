<template>
  <!-- Full-bleed layout: break out of the account layout's container padding -->
  <div
    class="chat-shell -mx-4 -my-6 sm:-mx-6 lg:-mx-8 flex overflow-hidden bg-white"
    style="height: calc(100dvh - 3.5rem)"
  >

    <!-- ═══════════════════════════════════════════════════
         LEFT PANEL — Thread list
    ════════════════════════════════════════════════════ -->
    <div
      class="thread-panel flex w-full flex-col border-r border-gray-200 sm:w-80 xl:w-96"
      :class="activeMobileView === 'chat' ? 'hidden sm:flex' : 'flex'"
    >

      <!-- Header -->
      <div class="border-b border-gray-200 px-4 py-3">
        <div class="flex items-center justify-between">
          <h1 class="text-base font-bold text-gray-900">Messages</h1>
          <span
            v-if="newCount > 0"
            class="flex h-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white"
          >{{ newCount }}</span>
        </div>
        <!-- Source pills -->
        <div class="mt-2.5 flex items-center gap-1">
          <button
            type="button"
            class="rounded-full px-2.5 py-0.5 text-xs font-medium transition"
            :class="sourceFilter === 'inquiries' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="sourceFilter = 'inquiries'"
          >Inquiries
            <span v-if="(inq.list || []).length" class="ml-1 rounded-full px-1 text-[10px] font-bold leading-none"
              :class="sourceFilter === 'inquiries' ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-700'"
            >{{ inq.list.length }}</span>
          </button>
          <button
            type="button"
            class="rounded-full px-2.5 py-0.5 text-xs font-medium transition"
            :class="sourceFilter === 'direct' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="sourceFilter = 'direct'"
          >Direct chats
            <span v-if="(threadsStore.list || []).length" class="ml-1 rounded-full px-1 text-[10px] font-bold leading-none"
              :class="sourceFilter === 'direct' ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-700'"
            >{{ threadsStore.list.length }}</span>
          </button>
        </div>
        <!-- Search -->
        <div class="relative mt-2.5">
          <i class="las la-search absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search conversations…"
            class="w-full rounded border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder-gray-400 transition focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </div>
        <!-- Status filter pills (landlord/agent only, inquiries source) -->
        <div v-if="useLandlordInbox && sourceFilter === 'inquiries'" class="mt-2.5 flex items-center gap-1 overflow-x-auto pb-0.5">
          <button
            v-for="f in statusFilters"
            :key="f.value"
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition"
            :class="statusFilter === f.value
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="statusFilter = f.value"
          >
            {{ f.label }}
            <span
              v-if="f.value !== 'all' && countForStatus(f.value) > 0"
              class="ml-0.5 rounded-full px-1 text-[10px] font-bold leading-none"
              :class="statusFilter === f.value ? 'bg-white/30 text-white' : 'bg-gray-300 text-gray-700'"
            >{{ countForStatus(f.value) }}</span>
          </button>
        </div>
      </div>

      <!-- Thread list -->
      <div class="flex-1 overflow-y-auto">
        <!-- Skeleton -->
        <div v-if="inq.isLoading" class="space-y-px p-2">
          <div v-for="n in 5" :key="n" class="flex animate-pulse items-center gap-3 rounded px-3 py-3">
            <div class="h-10 w-10 shrink-0 rounded-full bg-gray-200"></div>
            <div class="flex-1 space-y-1.5">
              <div class="h-3 w-3/4 rounded bg-gray-200"></div>
              <div class="h-2.5 w-full rounded bg-gray-100"></div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else-if="!filteredThreads.length && !filteredDirectThreads.length" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <i class="las la-comment-slash text-2xl text-gray-400"></i>
          </div>
          <p class="text-sm font-medium text-gray-700">No conversations yet</p>
          <p class="mt-1 text-xs text-gray-400">
            <template v-if="sourceFilter === 'direct'">Direct chats with landlords, agents and property managers will appear here.</template>
            <template v-else-if="useLandlordInbox">Tenant inquiries will appear here.</template>
            <template v-else>
              Message a listing to start a conversation.
              <br />
              <NuxtLink to="/listings" class="mt-1 inline-block text-primary-600 hover:underline">Browse listings →</NuxtLink>
            </template>
          </p>
        </div>

        <!-- Thread items (inquiry-based) -->
        <div v-else-if="sourceFilter === 'inquiries'">
          <button
            v-for="thread in filteredThreads"
            :key="thread._id"
            type="button"
            class="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-gray-50"
            :class="[
              activeThread?._id === thread._id ? 'bg-primary-50' : '',
              thread.status === 'new' && useLandlordInbox ? 'border-l-2 border-l-primary-500 pl-[10px]' : ''
            ]"
            @click="selectThread(thread)"
          >
            <!-- Avatar -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              :class="avatarColors(thread)"
            >
              {{ threadAvatarLetter(thread) }}
            </div>
            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <p class="truncate text-sm font-semibold text-gray-900">{{ threadTitle(thread) }}</p>
                <span class="shrink-0 text-[10px] text-gray-400">{{ formatDate(thread.lastMessageAt || thread.createdAt) }}</span>
              </div>
              <p class="mt-0.5 truncate text-xs text-gray-500">
                {{ propNames[thread.propertyId] || 'Loading…' }}
              </p>
              <p v-if="thread.lastMessagePreview || thread.message" class="mt-0.5 truncate text-xs text-gray-400">
                {{ thread.lastMessagePreview || thread.message }}
              </p>
            </div>
            <!-- Unread dot -->
            <div v-if="thread.status === 'new' && useLandlordInbox" class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500"></div>
          </button>

          <!-- Load more sentinel -->
          <div ref="scrollSentinel" class="h-4"></div>
          <div v-if="inq.isLoadingMore" class="flex justify-center py-3">
            <i class="las la-circle-notch la-spin text-gray-400"></i>
          </div>
        </div>

        <!-- Direct chats (threads service) -->
        <div v-else>
          <NuxtLink
            v-for="t in filteredDirectThreads"
            :key="t._id"
            :to="`/messages/${t._id}`"
            class="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-gray-50"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
              :class="avatarColors(t)"
            >
              {{ directAvatarLetter(t) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <p class="truncate text-sm font-semibold text-gray-900">{{ t.title || directOtherName(t) || 'Conversation' }}</p>
                <span class="shrink-0 text-[10px] text-gray-400">{{ formatDate(t.lastMessageAt || t.createdAt) }}</span>
              </div>
              <p class="mt-0.5 truncate text-xs text-gray-500">
                <span :class="directKindClass(t.kind)" class="mr-1.5">{{ directKindLabel(t.kind) }}</span>
                <template v-if="t.propertyId">{{ propNames[t.propertyId] || '…' }}</template>
              </p>
              <p v-if="t.lastMessagePreview" class="mt-0.5 truncate text-xs text-gray-400">{{ t.lastMessagePreview }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         RIGHT PANEL — Chat area
    ════════════════════════════════════════════════════ -->
    <div
      class="flex flex-1 flex-col"
      :class="activeMobileView === 'list' ? 'hidden sm:flex' : 'flex'"
    >

      <!-- No thread selected -->
      <div
        v-if="!activeThread"
        class="flex flex-1 flex-col items-center justify-center text-center"
      >
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <i class="las la-comments text-3xl text-gray-300"></i>
        </div>
        <p class="text-sm font-semibold text-gray-600">Select a conversation</p>
        <p class="mt-1 text-xs text-gray-400">Choose a thread from the list to read and reply.</p>
      </div>

      <!-- Active thread -->
      <template v-else>

        <!-- Chat header -->
        <div class="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <!-- Back on mobile -->
          <button
            type="button"
            class="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 sm:hidden"
            @click="activeMobileView = 'list'; chat.closeThread()"
          >
            <i class="las la-arrow-left text-lg"></i>
          </button>

          <!-- Avatar -->
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="avatarColors(activeThread)"
          >
            {{ threadAvatarLetter(activeThread) }}
          </div>

          <!-- Name + property -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-gray-900">{{ threadTitle(activeThread) }}</p>
            <p class="truncate text-xs text-gray-500">
              <NuxtLink
                v-if="activeThread.propertyId"
                :to="`/properties/${activeThread.propertyId}`"
                class="text-primary-600 hover:underline"
              >{{ propNames[activeThread.propertyId] || 'Property' }}</NuxtLink>
            </p>
          </div>

          <!-- Contact details (compact) -->
          <div class="hidden shrink-0 flex-col items-end gap-0.5 md:flex">
            <span v-if="activeThread.email" class="flex items-center gap-1 text-[11px] text-gray-400">
              <i class="las la-envelope text-sm"></i>{{ activeThread.email }}
            </span>
            <span v-if="activeThread.phone" class="flex items-center gap-1 text-[11px] text-gray-400">
              <i class="las la-phone text-sm"></i>{{ activeThread.phone }}
            </span>
          </div>

          <!-- Status badge + picker -->
          <div class="relative shrink-0">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition hover:bg-gray-50"
              :class="statusBadgeClass(activeThread.status)"
              @click="statusPickerOpen = !statusPickerOpen"
            >
              {{ statusLabel(activeThread.status) }}
              <i class="las la-angle-down text-xs"></i>
            </button>
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-75"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="statusPickerOpen"
                class="absolute right-0 top-8 z-20 w-44 rounded border border-gray-200 bg-white py-1 shadow-lg"
              >
                <button
                  v-for="s in inquiryStatuses"
                  :key="s.value"
                  type="button"
                  class="flex w-full items-center gap-2 px-3 py-1.5 text-xs transition hover:bg-gray-50"
                  :class="activeThread.status === s.value ? 'font-semibold text-primary-700' : 'text-gray-700'"
                  @click="patchStatus(s.value)"
                >
                  <span :class="s.dotClass" class="h-2 w-2 rounded-full"></span>
                  {{ s.label }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Messages area -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          <!-- Loading skeleton -->
          <div v-if="chat.isLoading" class="flex flex-col gap-3">
            <div v-for="n in 5" :key="n" class="flex" :class="n % 2 === 0 ? 'justify-end' : ''">
              <div class="h-10 w-48 rounded-2xl bg-gray-100 animate-pulse"></div>
            </div>
          </div>

          <!-- No messages yet (just the inquiry) -->
          <template v-else>

            <!-- ── Original inquiry message (synthetic first message) ── -->
            <div v-if="activeThread.message" class="flex" :class="isOwnMessage({ senderUserId: activeThread.createdByUserId }) ? 'justify-end' : 'justify-start'">
              <div class="max-w-[72%]">
                <p
                  v-if="!isOwnMessage({ senderUserId: activeThread.createdByUserId })"
                  class="mb-1 text-[10px] font-semibold text-gray-500"
                >{{ activeThread.name || activeThread.email || 'Visitor' }}</p>
                <div
                  class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                  :class="isOwnMessage({ senderUserId: activeThread.createdByUserId })
                    ? 'rounded-br-sm bg-primary-600 text-white'
                    : 'rounded-bl-sm bg-gray-100 text-gray-800'"
                >{{ activeThread.message }}</div>
                <p class="mt-1 text-[10px] text-gray-400" :class="isOwnMessage({ senderUserId: activeThread.createdByUserId }) ? 'text-right' : ''">
                  {{ formatDate(activeThread.createdAt) }}
                  <span class="ml-1 rounded bg-gray-100 px-1 py-0.5 text-[9px] font-semibold text-gray-500">initial</span>
                </p>
              </div>
            </div>

            <!-- ── Chat messages ── -->
            <template v-for="(msg, idx) in chat.messages" :key="msg._id">
              <!-- Date separator -->
              <div
                v-if="showDateSeparator(idx)"
                class="flex items-center gap-2 py-1"
              >
                <div class="flex-1 border-t border-gray-200"></div>
                <span class="text-[10px] font-medium text-gray-400">{{ dateSeparatorLabel(msg.createdAt) }}</span>
                <div class="flex-1 border-t border-gray-200"></div>
              </div>

              <div class="flex" :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'">
                <div class="max-w-[72%]">
                  <p
                    v-if="!isOwnMessage(msg)"
                    class="mb-1 text-[10px] font-semibold text-gray-500"
                  >{{ msg.senderName || 'User' }}</p>
                  <div
                    class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    :class="isOwnMessage(msg)
                      ? 'rounded-br-sm bg-primary-600 text-white'
                      : 'rounded-bl-sm bg-gray-100 text-gray-800'"
                  >{{ msg.body }}</div>
                  <p class="mt-1 text-[10px] text-gray-400" :class="isOwnMessage(msg) ? 'text-right' : ''">
                    {{ formatTime(msg.createdAt) }}
                  </p>
                </div>
              </div>
            </template>

            <!-- Empty state (no replies yet) -->
            <div v-if="!chat.messages.length && !activeThread.message" class="flex flex-col items-center justify-center py-12 text-center">
              <i class="las la-comment-dots text-3xl text-gray-300"></i>
              <p class="mt-2 text-xs text-gray-400">No messages yet. Start the conversation!</p>
            </div>

          </template>
        </div>

        <!-- Composer -->
        <div class="shrink-0 border-t border-gray-200 bg-white p-3">
          <div class="flex items-end gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 transition focus-within:border-primary-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-400">
            <textarea
              ref="composerEl"
              v-model="composerText"
              rows="1"
              placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
              class="max-h-32 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              @keydown.enter.exact.prevent="sendMessage"
              @input="autoGrow"
            ></textarea>
            <button
              type="button"
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded transition"
              :class="composerText.trim()
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              :disabled="!composerText.trim() || chat.isSending"
              @click="sendMessage"
            >
              <i v-if="chat.isSending" class="las la-circle-notch la-spin text-base"></i>
              <i v-else class="las la-paper-plane text-base"></i>
            </button>
          </div>
          <p class="mt-1.5 text-[10px] text-gray-400">
            <i class="las la-lock mr-0.5 text-xs"></i>
            All messages are private and stay within CribHub.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInquiriesStore, useChatMessagesStore, useThreadsStore } from '@@/stores/operations'
import { useAuthStore } from '@@/stores/auth'

definePageMeta({ middleware: ['auth'], layout: 'account' })
useHead({ title: 'Messages – CribHub' })

const auth = useAuthStore()
const inq = useInquiriesStore()
const chat = useChatMessagesStore()
const threadsStore = useThreadsStore()
const feathers = useNuxtApp().$feathers as any
const scrollSentinel = ref<HTMLElement | null>(null)
const messagesEl = ref<HTMLElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)

type SourceFilter = 'inquiries' | 'direct'
const sourceFilter = ref<SourceFilter>('inquiries')

// ── Auth helpers ───────────────────────────────────────────────────────────
const roles = computed(() => (Array.isArray(auth.user?.roles) ? auth.user!.roles : []) as string[])
const useLandlordInbox = computed(() =>
  roles.value.some((r) => ['landlord', 'property_manager', 'agent', 'admin'].includes(r))
)
const myUserId = computed(() => String((auth.user as any)?._id || ''))

// ── Mobile view toggle ─────────────────────────────────────────────────────
type MobileView = 'list' | 'chat'
const activeMobileView = ref<MobileView>('list')

// ── Property name cache ────────────────────────────────────────────────────
const propNames = ref<Record<string, string>>({})

async function resolvePropertyNames(rows: any[]) {
  const ids = [...new Set(rows.map((r: any) => r.propertyId).filter(Boolean))]
  const toFetch = ids.filter((id) => !propNames.value[id])
  if (!toFetch.length) return
  await Promise.allSettled(
    toFetch.map(async (id) => {
      try {
        const p = await feathers.service('properties').get(id)
        propNames.value[id] = (p as any)?.name || 'Property'
      } catch {
        propNames.value[id] = 'Property'
      }
    })
  )
}

// ── Thread selection ───────────────────────────────────────────────────────
const activeThread = ref<any>(null)
const statusPickerOpen = ref(false)

async function selectThread(thread: any) {
  statusPickerOpen.value = false
  activeThread.value = { ...thread }
  activeMobileView.value = 'chat'
  await chat.openThread(thread._id)
  scrollToBottom()
}

// ── Search & filter ────────────────────────────────────────────────────────
const searchQuery = ref('')
type InqStatus = 'all' | 'new' | 'contacted' | 'viewing_scheduled' | 'closed' | 'lost'
const statusFilter = ref<InqStatus>('all')
const statusFilters: { value: InqStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Replied' },
  { value: 'viewing_scheduled', label: 'Viewing' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
]

const allThreads = computed(() => inq.list)
const newCount = computed(() => allThreads.value.filter((r: any) => r.status === 'new').length)

function countForStatus(status: string) {
  return allThreads.value.filter((r: any) => r.status === status).length
}

const filteredThreads = computed(() => {
  let rows = allThreads.value as any[]
  if (useLandlordInbox.value && statusFilter.value !== 'all') {
    rows = rows.filter((r) => r.status === statusFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    rows = rows.filter(
      (r) =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.email || '').toLowerCase().includes(q) ||
        (propNames.value[r.propertyId] || '').toLowerCase().includes(q) ||
        (r.message || '').toLowerCase().includes(q)
    )
  }
  return [...rows].sort((a, b) => {
    const ta = a.lastMessageAt || a.createdAt || ''
    const tb = b.lastMessageAt || b.createdAt || ''
    return tb > ta ? 1 : tb < ta ? -1 : 0
  })
})

// Other party display name cache for direct threads
const directOtherNames = ref<Record<string, string>>({})

async function resolveDirectThreadMetadata(rows: any[]) {
  const propIds = [...new Set(rows.map((t) => t.propertyId).filter(Boolean))]
  const toFetch = propIds.filter((id) => !propNames.value[id])
  if (toFetch.length) {
    await Promise.allSettled(toFetch.map(async (id) => {
      try {
        const p = await feathers.service('properties').get(id)
        propNames.value[id] = (p as any)?.name || 'Property'
      } catch { propNames.value[id] = 'Property' }
    }))
  }
  const meId = myUserId.value
  const userIds = new Set<string>()
  for (const t of rows) {
    const others = (t.participantIds || []).filter((u: string) => String(u) !== meId)
    for (const u of others) if (u && !directOtherNames.value[u]) userIds.add(String(u))
  }
  if (userIds.size) {
    await Promise.allSettled([...userIds].map(async (uid) => {
      try {
        const u = await feathers.service('users').get(uid)
        directOtherNames.value[uid] = (u as any)?.fullName || (u as any)?.email || uid
      } catch { directOtherNames.value[uid] = uid }
    }))
  }
}

function directOtherName(thread: any): string {
  const meId = myUserId.value
  const others = (thread.participantIds || []).filter((u: string) => String(u) !== meId)
  if (!others.length) return ''
  return directOtherNames.value[String(others[0])] || ''
}

function directAvatarLetter(thread: any): string {
  const name = thread.title || directOtherName(thread)
  return (name?.[0] || 'C').toUpperCase()
}

function directKindLabel(k: string): string {
  return ({
    'landlord-pm': 'PM',
    'landlord-agent': 'Agent',
    'landlord-tenant': 'Tenant'
  } as Record<string, string>)[k] || 'Chat'
}

function directKindClass(k: string): string {
  const base = 'inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase'
  return base + ' ' + ({
    'landlord-pm': 'bg-blue-100 text-blue-700',
    'landlord-agent': 'bg-purple-100 text-purple-700',
    'landlord-tenant': 'bg-emerald-100 text-emerald-700'
  } as Record<string, string>)[k] || (base + ' bg-gray-100 text-gray-600')
}

const filteredDirectThreads = computed(() => {
  let rows = (threadsStore.list || []) as any[]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    rows = rows.filter((t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (directOtherName(t) || '').toLowerCase().includes(q) ||
      (propNames.value[t.propertyId] || '').toLowerCase().includes(q) ||
      (t.lastMessagePreview || '').toLowerCase().includes(q)
    )
  }
  return [...rows].sort((a, b) => {
    const ta = a.lastMessageAt || a.createdAt || ''
    const tb = b.lastMessageAt || b.createdAt || ''
    return tb > ta ? 1 : tb < ta ? -1 : 0
  })
})

watch(() => threadsStore.list.length, () => { void resolveDirectThreadMetadata(threadsStore.list) })

// ── Status management ──────────────────────────────────────────────────────
const updatingStatus = ref(false)

const inquiryStatuses = [
  { value: 'new', label: 'New', dotClass: 'bg-blue-500' },
  { value: 'contacted', label: 'Replied', dotClass: 'bg-amber-500' },
  { value: 'viewing_scheduled', label: 'Viewing scheduled', dotClass: 'bg-purple-500' },
  { value: 'closed', label: 'Closed', dotClass: 'bg-green-500' },
  { value: 'lost', label: 'Lost', dotClass: 'bg-gray-400' },
]

async function patchStatus(status: string) {
  if (!activeThread.value || activeThread.value.status === status) {
    statusPickerOpen.value = false
    return
  }
  statusPickerOpen.value = false
  updatingStatus.value = true
  try {
    await inq.patch(activeThread.value._id, { status })
    activeThread.value.status = status
    const listItem = allThreads.value.find((r: any) => r._id === activeThread.value._id)
    if (listItem) (listItem as any).status = status
  } catch { /* silent */ } finally {
    updatingStatus.value = false
  }
}

// ── Composer ───────────────────────────────────────────────────────────────
const composerText = ref('')

async function sendMessage() {
  if (!composerText.value.trim()) return
  const body = composerText.value
  composerText.value = ''
  if (composerEl.value) composerEl.value.style.height = 'auto'
  await chat.sendMessage(body)
  await nextTick()
  scrollToBottom()
}

function autoGrow(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
}

// ── Chat helpers ───────────────────────────────────────────────────────────
function isOwnMessage(msg: any) {
  return String(msg?.senderUserId) === myUserId.value
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function showDateSeparator(idx: number): boolean {
  if (idx === 0) return true
  const curr = chat.messages[idx]?.createdAt
  const prev = chat.messages[idx - 1]?.createdAt
  if (!curr || !prev) return false
  return new Date(curr).toDateString() !== new Date(prev).toDateString()
}

function dateSeparatorLabel(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: diffDays > 365 ? 'numeric' : undefined })
  } catch { return '' }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

// ── Thread display helpers ─────────────────────────────────────────────────
function threadTitle(thread: any): string {
  if (useLandlordInbox.value) return thread.name || thread.email || 'Anonymous'
  return propNames.value[thread.propertyId] || 'Property inquiry'
}

function threadAvatarLetter(thread: any): string {
  const title = threadTitle(thread)
  return (title[0] ?? '?').toUpperCase()
}

const avatarPalette = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]
function avatarColors(thread: any): string {
  const hash = String(thread._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return avatarPalette[hash % avatarPalette.length]
}

function statusLabel(status: string): string {
  return ({ new: 'New', contacted: 'Replied', viewing_scheduled: 'Viewing', closed: 'Closed', lost: 'Lost' } as any)[status] ?? status
}

function statusBadgeClass(status: string): string {
  return (
    {
      new: 'border-blue-200 bg-blue-50 text-blue-700',
      contacted: 'border-amber-200 bg-amber-50 text-amber-700',
      viewing_scheduled: 'border-purple-200 bg-purple-50 text-purple-700',
      closed: 'border-green-200 bg-green-50 text-green-700',
      lost: 'border-gray-200 bg-gray-50 text-gray-600',
    } as any
  )[status] ?? 'border-gray-200 bg-gray-50 text-gray-600'
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch { return iso }
}

// ── Real-time: resolve property names for incoming inquiries ───────────────
watch(() => inq.list.length, () => { void resolvePropertyNames(inq.list) })

// Real-time: scroll to bottom when a new chat message arrives
watch(() => chat.messages.length, () => { scrollToBottom() })

// Real-time: notify on incoming messages (not from current user)
const { notify, requestNotifPermission: reqPerm } = useMessageNotifier()
watch(() => chat.messages.length, (newLen, oldLen) => {
  if (newLen <= (oldLen ?? 0)) return
  const last = chat.messages[newLen - 1]
  if (!last || String(last.senderUserId) === myUserId.value) return
  const thread = activeThread.value as any
  playMessageSound()
  showMessageToast({
    senderName: last.senderName || 'New message',
    body: last.body,
    propertyName: thread ? propNames.value[thread.propertyId] : undefined,
  })
})

// Also notify for new incoming inquiries (staff only)
watch(() => inq.list.length, (newLen, oldLen) => {
  if (!useLandlordInbox.value || newLen <= (oldLen ?? 0)) return
  const last = inq.list[0] as any
  if (!last) return
  playMessageSound()
  showMessageToast({
    senderName: last.name || last.email || 'New inquiry',
    body: last.message || 'New inquiry received',
    propertyName: propNames.value[last.propertyId],
    href: '/messages',
  })
})

// Real-time: keep active thread status in sync when the inquiry is updated
watch(
  () => inq.list.map((r: any) => r.status).join(','),
  () => {
    if (!activeThread.value) return
    const updated = inq.list.find((r: any) => r._id === activeThread.value._id) as any
    if (updated && updated.status !== activeThread.value.status) {
      activeThread.value.status = updated.status
    }
  }
)

// Close status picker on outside click
function onBodyClick(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.relative')) statusPickerOpen.value = false
}

// ── Infinite scroll ────────────────────────────────────────────────────────
useInfiniteScroll(scrollSentinel, () => { void inq.loadMore() })

// ── Mount ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await Promise.allSettled([
    inq.fetchList({ $sort: { createdAt: -1 } }),
    threadsStore.fetchList({ $sort: { lastMessageAt: -1, createdAt: -1 } })
  ])
  await Promise.allSettled([
    resolvePropertyNames(inq.list),
    resolveDirectThreadMetadata(threadsStore.list)
  ])
  document.addEventListener('click', onBodyClick)
  void reqPerm()
})

onBeforeUnmount(() => {
  chat.closeThread()
  document.removeEventListener('click', onBodyClick)
})
</script>
