import { feathers } from '@feathersjs/feathers'

/**
 * Universal Feathers client plugin.
 *
 * - On the server we register the REST transport (read-only HTTP).
 *   The auth client is intentionally NOT installed because it needs
 *   `window.localStorage`. SSR therefore makes anonymous requests, which is
 *   exactly what we want for public pages (home, listings, blog, CMS pages…).
 *
 * - On the client we keep the existing realtime stack: Socket.IO transport
 *   plus the authentication client backed by `localStorage`. Realtime
 *   subscriptions (`service.on('created', …)`) continue to work as before.
 *
 * `useNuxtApp().$feathers` is now defined in both runtimes, so callers no
 * longer need to gate every access with `import.meta.client`. Realtime
 * subscriptions still need a server-side guard because the REST transport
 * does not emit events.
 */
export default defineNuxtPlugin({
  name: 'feathers-client',
  enforce: 'pre',
  async setup() {
    const config = useRuntimeConfig()
    const apiBaseUrl = String(config.public.apiBaseUrl)

    const client = feathers()

    if (import.meta.server) {
      const rest = (await import('@feathersjs/rest-client')).default
      const restClient = rest(apiBaseUrl)
      const fetchImpl: typeof fetch = (globalThis.fetch as typeof fetch).bind(globalThis)
      client.configure(restClient.fetch(fetchImpl))

      return {
        provide: {
          feathers: client,
          feathersSocket: null as any
        }
      }
    }

    const [{ default: socketio }, { io }, { default: authenticationClient }] = await Promise.all([
      import('@feathersjs/socketio-client'),
      import('socket.io-client'),
      import('@feathersjs/authentication-client')
    ])

    const socket = io(apiBaseUrl, {
      transports: ['websocket', 'polling']
    })

    client
      .configure(socketio(socket, { timeout: 20000 }))
      .configure(
        authenticationClient({
          storageKey: 'accessToken',
          storage: window.localStorage
        })
      )

    return {
      provide: {
        feathers: client,
        feathersSocket: socket
      }
    }
  }
})
