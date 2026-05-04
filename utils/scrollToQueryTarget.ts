import { nextTick } from 'vue'

/**
 * Scroll to and briefly highlight an element matched by a data-* attribute.
 * `id` should be a safe identifier (e.g. Mongo ObjectId hex).
 */
export function scrollToDataTarget(dataAttrName: string, id: string | undefined | null) {
  if (!id || typeof id !== 'string' || typeof document === 'undefined') return
  const safe = id.replace(/\\/g, '').replace(/"/g, '')
  nextTick(() => {
    const el = document.querySelector(`[data-${dataAttrName}="${safe}"]`)
    if (!el || !(el instanceof HTMLElement)) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-2', 'ring-primary-400', 'ring-offset-2', 'transition-shadow')
    window.setTimeout(() => {
      el.classList.remove('ring-2', 'ring-primary-400', 'ring-offset-2', 'transition-shadow')
    }, 2400)
  })
}
