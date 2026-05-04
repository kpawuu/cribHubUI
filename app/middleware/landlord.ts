import { useAuthStore } from '@@/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const auth = useAuthStore(usePinia())
  if (!auth.isReady) await auth.bootstrap()
  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
  if (!auth.roles.length) await auth.fetchRoles()
  if (!auth.hasRole('landlord', 'admin', 'property_manager')) {
    return navigateTo('/dashboard')
  }
})
