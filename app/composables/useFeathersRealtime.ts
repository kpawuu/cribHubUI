type Handlers<T = unknown> = {
  onCreated?: (item: T) => void
  onPatched?: (item: T) => void
  onUpdated?: (item: T) => void
  onRemoved?: (item: T) => void
}

/**
 * Subscribe to Feathers service Socket.IO events (requires API channel publishers).
 * Returns a disposer; call on scope cleanup.
 */
export function useFeathersRealtime<T = unknown>(servicePath: string, handlers: Handlers<T>) {
  if (import.meta.server) return () => {}

  const nuxt = useNuxtApp()
  const svc = (nuxt.$feathers as any).service(servicePath)

  const onCreated = (item: T) => handlers.onCreated?.(item)
  const onPatched = (item: T) => handlers.onPatched?.(item)
  const onUpdated = (item: T) => handlers.onUpdated?.(item)
  const onRemoved = (item: T) => handlers.onRemoved?.(item)

  svc.on('created', onCreated)
  svc.on('patched', onPatched)
  svc.on('updated', onUpdated)
  svc.on('removed', onRemoved)

  return () => {
    svc.removeListener('created', onCreated)
    svc.removeListener('patched', onPatched)
    svc.removeListener('updated', onUpdated)
    svc.removeListener('removed', onRemoved)
  }
}
