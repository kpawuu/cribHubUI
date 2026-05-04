/**
 * After role selection / profile steps, send the user to the URL they originally
 * tried to open (from `?from=` on `/onboarding/role`), without skipping intermediate
 * onboarding screens.
 */
const STORAGE_KEY = 'cribhub_onboarding_post_redirect'

/** Session keys used during onboarding; clear on logout so the next account cannot inherit state. */
const AUTH_RELATED_SESSION_KEYS = [STORAGE_KEY, 'roleRequestId', 'requestedRole'] as const

/** Remove onboarding-related `sessionStorage` entries (call from `logout`). */
export function clearAuthRelatedSessionStorage() {
  if (import.meta.server) return
  for (const k of AUTH_RELATED_SESSION_KEYS) {
    sessionStorage.removeItem(k)
  }
}

function isSafeInternalPath(p: string) {
  return p.startsWith('/') && !p.startsWith('/onboarding') && !p.startsWith('/auth')
}

/** Call from `/onboarding/role` when continuing — reads `route.query.from`. */
export function stashOnboardingPostRedirect() {
  if (import.meta.server) return
  const route = useRoute()
  const from = route.query.from as string | undefined
  if (from && isSafeInternalPath(from)) {
    sessionStorage.setItem(STORAGE_KEY, from)
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

/** Call after tenant / landlord / agent / PM onboarding steps complete. */
export function consumeOnboardingPostRedirect(fallback = '/dashboard') {
  if (import.meta.server) return fallback
  const raw = sessionStorage.getItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
  if (raw && isSafeInternalPath(raw)) return raw
  return fallback
}
