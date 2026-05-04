import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import { io } from 'socket.io-client'
import authenticationClient from '@feathersjs/authentication-client'

export default defineNuxtPlugin({
  name: 'feathers-client',
  enforce: 'pre',
  setup() {
    const config = useRuntimeConfig()
    const apiBaseUrl = String(config.public.apiBaseUrl)

    const socket = io(apiBaseUrl, {
      transports: ['websocket', 'polling']
    })

    const client = feathers()
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
