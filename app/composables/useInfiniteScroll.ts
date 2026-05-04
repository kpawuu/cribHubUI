import type { Ref } from 'vue'

export function useInfiniteScroll(root: Ref<HTMLElement | null>, onNearEnd: () => void, options?: { rootMargin?: string }) {
  let observer: IntersectionObserver | null = null

  function bind(el: HTMLElement | null) {
    observer?.disconnect()
    observer = null
    if (!el || !import.meta.client) return
    observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        if (e?.isIntersecting) onNearEnd()
      },
      { root: null, rootMargin: options?.rootMargin || '240px', threshold: 0 }
    )
    observer.observe(el)
  }

  onMounted(() => {
    watch(root, (el) => bind(el), { immediate: true })
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })
}
