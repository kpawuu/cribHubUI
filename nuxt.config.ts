import flowbite from 'flowbite/plugin'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  build: {
    transpile: ['@tiptap/vue-3', '@tiptap/starter-kit', '@tiptap/extension-link', '@tiptap/extension-placeholder', 'isomorphic-dompurify']
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', 'nuxt-easy-lightbox'],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    config: {
      plugins: [flowbite],
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            heading: ['Cal Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: '/fonts/interui/stylesheet.css' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cal+Sans&display=swap'
        },
        { rel: 'stylesheet', href: '/fonts/lineawesome/css/line-awesome.min.css' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3036',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'CribHub',
      pageSize: Number(process.env.NUXT_PUBLIC_PAGE_SIZE || 12),
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || ''
    }
  }
})