import { useNuxtApp } from '#app'

/**
 * Returns the Feathers client provided by `app/plugins/feathers.ts`.
 *
 * The plugin is now universal:
 *  - on the server we get a Feathers client wired to the REST transport
 *  - on the client we get the Socket.IO + auth client
 *
 * Returns `null` only when the plugin has not yet executed or when called
 * from a context where Nuxt is unavailable (e.g. raw module init).
 */
export function getFeathersClient(): any | null {
  try {
    const nuxt = useNuxtApp()
    return nuxt.$feathers ?? null
  } catch {
    return null
  }
}
