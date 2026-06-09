<template>
  <div
    class="chat-shell -mx-4 -my-6 sm:-mx-6 lg:-mx-8 flex flex-col overflow-hidden bg-white"
    style="height: calc(100dvh - 3.5rem)"
  >
    <!-- Header -->
    <div class="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
      <NuxtLink
        to="/messages"
        class="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
        aria-label="Back to inbox"
      >
        <i class="las la-arrow-left text-lg"></i>
      </NuxtLink>

      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="avatarClass"
      >
        {{ avatarLetter }}
      </div>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-gray-900">
          {{ thread?.title || otherPartyName || 'Conversation' }}
        </p>
        <div class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
          <span :class="kindBadgeClass">{{ kindLabel }}</span>
          <NuxtLink
            v-if="thread?.propertyId && propName"
            :to="`/properties/${thread.propertyId}`"
            class="text-primary-600 hover:underline"
          >{{ propName }}</NuxtLink>
        </div>
      </div>
    </div>

    <!-- System note -->
    <div v-if="thread?.systemNote" class="border-b border-gray-100 bg-amber-50 px-4 py-2 text-xs text-amber-800">
      <i class="las la-info-circle mr-1"></i>{{ thread.systemNote }}
    </div>

    <!-- Messages -->
    <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      <div v-if="chat.isLoading" class="flex flex-col gap-3">
        <div v-for="n in 5" :key="n" class="flex" :class="n % 2 === 0 ? 'justify-end' : ''">
          <div class="h-10 w-48 rounded-2xl bg-gray-100 animate-pulse"></div>
        </div>
      </div>

      <template v-else>
        <template v-for="(msg, idx) in chat.messages" :key="msg._id">
          <div v-if="showDateSeparator(idx)" class="flex items-center gap-2 py-1">
            <div class="flex-1 border-t border-gray-200"></div>
            <span class="text-[10px] font-medium text-gray-400">{{ dateSeparatorLabel(msg.createdAt) }}</span>
            <div class="flex-1 border-t border-gray-200"></div>
          </div>

          <!-- System chip message -->
          <div v-if="msg.system" class="flex justify-center">
            <span class="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">
              <i class="las la-info-circle mr-1"></i>{{ msg.body }}
            </span>
          </div>

          <div v-else class="flex" :class="isOwnMessage(msg) ? 'justify-end' : 'justify-start'">
            <div class="max-w-[72%]">
              <p
                v-if="!isOwnMessage(msg)"
                class="mb-1 text-[10px] font-semibold text-gray-500"
              >{{ msg.senderName || 'User' }}</p>
              <div
                class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm"
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

        <div v-if="!chat.messages.length" class="flex flex-col items-center justify-center py-12 text-center">
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
          :class="composerText.trim() && !chat.isSending
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
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@@/stores/auth'
import { useChatMessagesStore, useThreadsStore } from '@@/stores/operations'

definePageMeta({ middleware: ['auth'], layout: 'account' })

const auth = useAuthStore()
const chat = useChatMessagesStore()
const threadsStore = useThreadsStore()
const feathers = useNuxtApp().$feathers as any
const route = useRoute()
const messagesEl = ref<HTMLElement | null>(null)
const composerEl = ref<HTMLTextAreaElement | null>(null)

const threadId = computed(() => String(route.params.threadId || ''))
const thread = ref<any>(null)
const propName = ref<string>('')
const otherPartyName = ref<string>('')

const myUserId = computed(() => String((auth.user as any)?._id || ''))

useHead(() => ({
  title: thread.value
    ? `${thread.value.title || otherPartyName.value || 'Conversation'} – Messages – CribHub`
    : 'Messages – CribHub'
}))

const kindLabel = computed(() => {
  switch (thread.value?.kind) {
    case 'landlord-pm': return 'Landlord ↔ Property manager'
    case 'landlord-agent': return 'Landlord ↔ Agent'
    case 'landlord-tenant': return 'Landlord ↔ Tenant'
    default: return 'Direct chat'
  }
})

const kindBadgeClass = computed(() => {
  const base = 'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase'
  switch (thread.value?.kind) {
    case 'landlord-pm': return base + ' bg-blue-100 text-blue-700'
    case 'landlord-agent': return base + ' bg-purple-100 text-purple-700'
    case 'landlord-tenant': return base + ' bg-emerald-100 text-emerald-700'
    default: return base + ' bg-gray-100 text-gray-700'
  }
})

const composerText = ref('')

const avatarLetter = computed(() => {
  const t = thread.value?.title || otherPartyName.value || 'C'
  return (t[0] || 'C').toUpperCase()
})

const avatarPalette = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
]
const avatarClass = computed(() => {
  const hash = String(thread.value?._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return avatarPalette[hash % avatarPalette.length]
})

function isOwnMessage(msg: any) {
  return String(msg?.senderUserId) === myUserId.value
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

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

function autoGrow(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 128)}px`
}

async function sendMessage() {
  if (!composerText.value.trim()) return
  const body = composerText.value
  composerText.value = ''
  if (composerEl.value) composerEl.value.style.height = 'auto'
  await chat.sendMessage(body)
  await nextTick()
  scrollToBottom()
}

async function loadThread() {
  if (!threadId.value) return
  try {
    thread.value = await threadsStore.get(threadId.value)
  } catch (e) {
    console.warn('Could not load thread', e)
    return
  }
  if (thread.value?.propertyId) {
    try {
      const p = await feathers.service('properties').get(thread.value.propertyId)
      propName.value = (p as any)?.name || ''
    } catch {}
  }
  const otherIds = (thread.value?.participantIds || []).filter((u: string) => String(u) !== myUserId.value)
  if (otherIds.length) {
    try {
      const u = await feathers.service('users').get(otherIds[0])
      otherPartyName.value = (u as any)?.fullName || (u as any)?.email || ''
    } catch {}
  }
}

watch(() => chat.messages.length, () => scrollToBottom())

onMounted(async () => {
  if (!auth.isReady) await auth.bootstrap()
  await loadThread()
  await chat.open({ threadId: threadId.value })
  scrollToBottom()
})

onBeforeUnmount(() => {
  chat.close()
})
</script>
