import { useAuthStore } from '@@/stores/auth'

// Paths that are excluded from the onboarding gate
const ONBOARDING_EXEMPT = ['/onboarding/', '/auth/']

export default defineNuxtRouteMiddleware(async (to) => {
  // localStorage / Pinia not available during SSR
  if (import.meta.server) return

  const auth = useAuthStore(usePinia())
  if (!auth.isReady) await auth.bootstrap()

  if (!auth.isAuthenticated) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }

  // Gate: authenticated but onboarding not completed (tenant-only users must pick a path;
  // users who already hold landlord/agent/pm/admin skip — see auth store `onboardingComplete`).
  const exempt = ONBOARDING_EXEMPT.some((p) => to.path.startsWith(p))
  if (!exempt && !auth.onboardingComplete()) {
    return navigateTo({
      path: '/onboarding/role',
      query: { from: to.fullPath !== '/onboarding/role' ? to.fullPath : undefined },
    })
  }
})
