import type { Application as FeathersApplication } from '@feathersjs/feathers'
import type { Socket } from 'socket.io-client'

declare module '#app' {
  interface NuxtApp {
    $feathers: FeathersApplication
    $feathersSocket: Socket
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $feathers: FeathersApplication
    $feathersSocket: Socket
  }
}

export {}

