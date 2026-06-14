/**
 * Centralised access to the authenticated user's role-application(s).
 *
 * Pulls from the read-only `my-role-applications` Feathers service that
 * returns the enriched payload (substage, missing docs, SLA, next-step CTA)
 * so the dashboard banner and the dedicated `/account/role-requests`
 * page render in a single network round-trip.
 *
 * Realtime: this composable subscribes to `role-requests` and
 * `verification-documents` events through `useFeathersRealtime` and re-fetches
 * when one of the current user's applications changes — so the dashboard
 * banner auto-advances from "Submitted" → "Docs required" → "In review" →
 * "Approved" without a page refresh.
 */

import { onScopeDispose } from 'vue'

export type RoleApplicationView = {
  _id: string
  userId: string
  role: 'landlord' | 'property_manager' | 'agent'
  roleLabel: string
  status: 'pending' | 'approved' | 'rejected'
  substage: 'submitted' | 'docs_required' | 'reviewing' | 'decided'
  message: string | null
  notes: string | null
  reviewedAt: string | null
  reviewedBy: string | null
  reviewerStartedAt: string | null
  createdAt: string | null
  slaDueAt: string | null
  daysOpen: number
  overdue: boolean
  requiredDocumentTypes: string[]
  requestedDocumentTypes: string[]
  missingDocumentTypes: string[]
  missingDocumentLabels: string[]
  documents: Array<{
    _id: string
    documentType: string
    documentTypeLabel: string
    documentUrl: string
    uploadedAt: string
  }>
  nextStep: { label: string; href: string; tone: 'amber' | 'indigo' | 'emerald' | 'red' | 'blue' }
}

export function useRoleApplications() {
  const list = useState<RoleApplicationView[]>('role-applications:list', () => [])
  const isLoading = useState<boolean>('role-applications:loading', () => false)
  const hasFetched = useState<boolean>('role-applications:hasFetched', () => false)
  const lastError = useState<string | null>('role-applications:lastError', () => null)
  const userId = useState<string | null>('role-applications:userId', () => null)

  /** Pending (not-yet-decided) applications for the current user. */
  const pending = computed(() => list.value.filter((a) => a.status === 'pending'))

  /** Most urgent open application for the dashboard banner — fewest missing docs first, then oldest. */
  const primary = computed<RoleApplicationView | null>(() => {
    if (!list.value.length) return null
    const open = list.value.filter((a) => a.substage !== 'decided')
    if (open.length) {
      const sorted = [...open].sort((a, b) => {
        // docs_required > reviewing > submitted (higher = more urgent for the user)
        const urgency = { docs_required: 3, submitted: 2, reviewing: 1, decided: 0 } as const
        const u = urgency[b.substage] - urgency[a.substage]
        if (u !== 0) return u
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      })
      return sorted[0] ?? null
    }
    // No open applications — surface the most recent decision so newly-approved
    // users see the welcome ribbon for a session.
    const decided = [...list.value].sort(
      (a, b) => new Date(b.reviewedAt || 0).getTime() - new Date(a.reviewedAt || 0).getTime()
    )
    return decided[0] ?? null
  })

  async function fetch(force = false) {
    if (import.meta.server) return
    if (isLoading.value) return
    if (hasFetched.value && !force) return
    isLoading.value = true
    lastError.value = null
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('my-role-applications').find({ query: {} })
      const rawData: RoleApplicationView[] = Array.isArray(res) ? res : (res?.data ?? [])
      // Defensively migrate any legacy CTA URL the backend might still send
      // until it's redeployed. The frontend route was renamed:
      //   /applications/role-requests  →  /account/role-requests
      const data: RoleApplicationView[] = rawData.map((row) => {
        if (row?.nextStep?.href === '/applications/role-requests') {
          return { ...row, nextStep: { ...row.nextStep, href: '/account/role-requests' } }
        }
        return row
      })
      // Defensive fallback: if the enriched endpoint returned nothing, double-
      // check against the raw `role-requests` service. This protects against
      // edge cases where the user's role-requests exist but the enriched view
      // failed to materialize (e.g. transient error reading documents during
      // page mount right after creation).
      if (!data.length) {
        const fallback = await fetchFallback(feathers)
        if (fallback.length) {
          list.value = fallback
        } else {
          list.value = []
        }
      } else {
        list.value = data
      }
      hasFetched.value = true
    } catch (e: any) {
      if (import.meta.dev) {
        // eslint-disable-next-line no-console
        console.warn('[useRoleApplications] fetch failed', e)
      }
      lastError.value = e?.message || 'Could not load your role applications.'
      // Don't wipe a previously-populated list on a transient error.
      hasFetched.value = true
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Last-resort fallback used when `my-role-applications` returns an empty
   * array. Queries `role-requests` directly with the authenticated user's id,
   * then builds a *minimal* view per row so the page can still render. Missing
   * fields (substage, next-step CTA, document list, SLA) are filled with safe
   * defaults — the realtime listener will refresh with the proper enriched
   * shape once it is available.
   */
  async function fetchFallback(feathers: any): Promise<RoleApplicationView[]> {
    try {
      const auth = (await import('#imports')).useNuxtApp().$pinia
      // Pull current user id from the auth store via state key so we don't
      // need to import the store directly (avoids circular composables).
      const uid = userId.value
      if (!uid) return []
      const res = await feathers.service('role-requests').find({
        query: { userId: uid, $sort: { createdAt: -1 }, $limit: 25 }
      })
      const raw: any[] = Array.isArray(res) ? res : (res?.data ?? [])
      const ROLE_LABEL: Record<string, string> = {
        landlord: 'Landlord',
        property_manager: 'Property Manager',
        agent: 'Agent'
      }
      return raw.map((rr) => ({
        _id: String(rr._id),
        userId: String(rr.userId),
        role: rr.role,
        roleLabel: ROLE_LABEL[rr.role] || rr.role,
        status: rr.status,
        substage: rr.substage || (rr.status === 'pending' ? 'submitted' : 'decided'),
        message: rr.message ?? null,
        notes: rr.notes ?? null,
        reviewedAt: rr.reviewedAt ?? null,
        reviewedBy: rr.reviewedBy ?? null,
        reviewerStartedAt: rr.reviewerStartedAt ?? null,
        createdAt: rr.createdAt ?? null,
        slaDueAt: rr.slaDueAt ?? null,
        daysOpen: 0,
        overdue: false,
        requiredDocumentTypes: [],
        requestedDocumentTypes: Array.isArray(rr.requestedDocumentTypes) ? rr.requestedDocumentTypes : [],
        missingDocumentTypes: [],
        missingDocumentLabels: [],
        documents: [],
        nextStep: {
          label: 'View full status',
          href: '/account/role-requests',
          tone: rr.status === 'approved' ? 'emerald' : rr.status === 'rejected' ? 'red' : 'blue'
        }
      })) as RoleApplicationView[]
    } catch {
      return []
    }
  }

  /**
   * Wire realtime listeners that refetch the enriched view whenever a relevant
   * role-request or verification-document event arrives. Safe to call multiple
   * times — listeners are tracked per scope.
   */
  function ensureRealtime(currentUserId: string | null | undefined) {
    if (import.meta.server) return
    userId.value = currentUserId ? String(currentUserId) : null

    const refresh = () => void fetch(true)

    const isMine = (row: any): boolean => {
      if (!userId.value || !row) return false
      if (row.userId && String(row.userId) === userId.value) return true
      // verification-documents only carry roleRequestId; cross-check the cache.
      if (row.roleRequestId) {
        return list.value.some((a) => a._id === String(row.roleRequestId))
      }
      return false
    }

    const offRr = useFeathersRealtime('role-requests', {
      onCreated: (r: any) => { if (isMine(r)) refresh() },
      onPatched: (r: any) => { if (isMine(r)) refresh() },
      onUpdated: (r: any) => { if (isMine(r)) refresh() },
      onRemoved: (r: any) => { if (isMine(r)) refresh() }
    })
    const offDocs = useFeathersRealtime('verification-documents', {
      onCreated: (d: any) => { if (isMine(d)) refresh() },
      onPatched: (d: any) => { if (isMine(d)) refresh() },
      onRemoved: (d: any) => { if (isMine(d)) refresh() }
    })

    onScopeDispose(() => {
      offRr()
      offDocs()
    })
  }

  return { list, pending, primary, isLoading, hasFetched, fetch, ensureRealtime }
}
