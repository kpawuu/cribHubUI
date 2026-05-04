/**
 * useMessageNotifier
 * Plays a two-tone ping and shows an in-app toast when a new chat message arrives.
 * Toasts are stored in a Nuxt shared useState so app.vue can render them globally.
 */

export interface MessageToast {
  id: string
  senderName: string
  body: string
  avatarUrl?: string
  propertyName?: string
  href?: string
}

// Shared reactive toast list — consumed by the global ToastHost in app.vue
export const useMessageToasts = () =>
  useState<MessageToast[]>('message-toasts', () => [])

let _audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return _audioCtx
  } catch {
    return null
  }
}

/**
 * Play a two-note chime: C6 (1047 Hz) → E6 (1319 Hz).
 * Falls back silently if the Web Audio API is unavailable.
 */
export function playMessageSound() {
  if (typeof window === 'undefined') return
  try {
    const ctx = getAudioCtx()
    if (!ctx) return

    // Resume on first user interaction (autoplay policy)
    if (ctx.state === 'suspended') ctx.resume()

    const notes = [
      { freq: 1047, delay: 0, duration: 0.12 },   // C6
      { freq: 1319, delay: 0.07, duration: 0.18 }, // E6
    ]

    notes.forEach(({ freq, delay, duration }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + duration + 0.01)
    })
  } catch { /* fail silently */ }
}

let _permAsked = false

/**
 * Request browser notification permission once per session.
 * Call this after a user interaction (e.g. opening the chat).
 */
export async function requestNotifPermission() {
  if (typeof window === 'undefined' || _permAsked) return
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    _permAsked = true
    await Notification.requestPermission()
  }
}

/**
 * Show a native browser notification when the tab is not focused.
 */
function maybeNativeNotif(opts: MessageToast) {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (document.visibilityState === 'visible') return // only when tab is hidden
  if (Notification.permission !== 'granted') return

  const notif = new Notification(opts.senderName, {
    body: opts.body,
    icon: opts.avatarUrl || '/favicon.ico',
    tag: 'cribhub-chat',
    silent: true, // we already played our own sound
  })
  notif.onclick = () => {
    window.focus()
    if (opts.href) useRouter().push(opts.href)
    notif.close()
  }
}

/**
 * Show an in-app toast + optionally a browser notification.
 * Toast auto-dismisses after 5 seconds.
 */
export function showMessageToast(opts: Omit<MessageToast, 'id'>) {
  const toasts = useMessageToasts()
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  toasts.value.push({ id, ...opts })
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 5000)
  maybeNativeNotif({ id, ...opts })
}

/**
 * Remove a specific toast by id.
 */
export function dismissMessageToast(id: string) {
  const toasts = useMessageToasts()
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

/**
 * Convenience hook — returns { notify } which plays sound + shows toast.
 */
export function useMessageNotifier() {
  function notify(opts: Omit<MessageToast, 'id'>) {
    playMessageSound()
    showMessageToast(opts)
  }
  return { notify, requestNotifPermission }
}
