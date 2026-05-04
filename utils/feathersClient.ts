import { useNuxtApp } from '#app'

/** Feathers is provided by `app/plugins/feathers.client.ts` (client-only). */
export function getFeathersClient(): any | null {
  if (import.meta.server) return null
  try {
    const nuxt = useNuxtApp()
    return nuxt.$feathers ?? null
  } catch {
    return null
  }
}
