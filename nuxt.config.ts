import flowbite from 'flowbite/plugin'

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://cribhub.com'
const SITE_NAME = process.env.NUXT_PUBLIC_APP_NAME || 'CribHub'
const SITE_DESC =
  "Ghana's #1 property platform. Browse verified homes, apartments, and commercial spaces for rent or sale in Accra and beyond. Find certified agents and manage your entire rental journey in one place."
const OG_IMAGE = `${SITE_URL}/images/og-default.jpg`

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
            sans: ['"Google Sans Flex"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            heading: ['"Google Sans Flex"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
          }
        }
      }
    }
  },

  app: {
    head: {
      titleTemplate: `%s | ${SITE_NAME}`,
      title: `${SITE_NAME} – Find Your Perfect Home in Ghana`,
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE_DESC },
        { name: 'keywords', content: 'property for rent Ghana, houses for sale Accra, real estate Ghana, apartments Accra, rent property Ghana, property listings, CribHub' },
        { name: 'author', content: SITE_NAME },
        { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
        { name: 'theme-color', content: '#4f46e5' },
        { name: 'application-name', content: SITE_NAME },
        // Open Graph
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_GH' },
        { property: 'og:title', content: `${SITE_NAME} – Find Your Perfect Home in Ghana` },
        { property: 'og:description', content: SITE_DESC },
        { property: 'og:image', content: OG_IMAGE },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: `${SITE_NAME} – Ghana Real Estate` },
        { property: 'og:url', content: SITE_URL },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@cribhub' },
        { name: 'twitter:creator', content: '@cribhub' },
        { name: 'twitter:title', content: `${SITE_NAME} – Find Your Perfect Home in Ghana` },
        { name: 'twitter:description', content: SITE_DESC },
        { name: 'twitter:image', content: OG_IMAGE },
        { name: 'twitter:image:alt', content: `${SITE_NAME} – Ghana Real Estate` },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,100..1000&display=swap' },
        { rel: 'stylesheet', href: '/fonts/interui/stylesheet.css' },
        { rel: 'stylesheet', href: '/fonts/lineawesome/css/line-awesome.min.css' },
      ],
    }
  },

  runtimeConfig: {
    // Private: API URL for server-side sitemap generation
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3036',
    public: {
      siteUrl: SITE_URL,
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3036',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'CribHub',
      pageSize: Number(process.env.NUXT_PUBLIC_PAGE_SIZE || 12),
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_KEY || ''
    }
  }
})