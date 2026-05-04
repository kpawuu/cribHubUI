import { useAuthStore } from '@@/stores/auth'

/** Shape returned by `user-notifications` (see rentflow_api user-notifications schema). */
export type NotificationLike = {
  linkUrl?: string
  eventKey?: string
  category?: string
  /** Legacy / alternate field */
  type?: string
  relatedService?: string
  relatedId?: string
  metadata?: Record<string, unknown>
}

function parseLinkUrl(linkUrl?: string): { pathname: string; search: string; hash: string } | null {
  if (!linkUrl || typeof linkUrl !== 'string') return null
  const t = linkUrl.trim()
  if (!t) return null
  try {
    const u =
      t.startsWith('http://') || t.startsWith('https://')
        ? new URL(t)
        : new URL(t, 'https://example.invalid')
    return { pathname: u.pathname || '/', search: u.search || '', hash: u.hash || '' }
  } catch {
    return null
  }
}

/**
 * Resolves an in-app path for a user notification. API `linkUrl` values use the backend
 * `APP_URL` host; we only use pathname + map to CribHub routes where they differ.
 */
export function getNotificationDestination(n: NotificationLike): string | null {
  const auth = useAuthStore()
  const eventKey = String(n.eventKey || '')
  const relatedService = String(n.relatedService || '')
  const relatedId = n.relatedId != null ? String(n.relatedId) : ''
  const meta = (n.metadata || {}) as Record<string, unknown>

  const isStaff = () => auth.hasRole('landlord', 'property_manager', 'agent', 'admin')

  const parsed = parseLinkUrl(n.linkUrl)
  if (parsed?.pathname) {
    const path = (parsed.pathname.replace(/\/$/, '') || '/') as string
    const tail = `${parsed.search || ''}${parsed.hash || ''}`

    const mProp = path.match(/^\/properties\/([^/]+)$/)
    if (mProp) return `/properties/${mProp[1]}${tail}`

    const mApp = path.match(/^\/rental-applications\/([^/]+)$/)
    if (mApp) {
      const id = mApp[1]
      const q = `?application=${encodeURIComponent(id)}`
      if (eventKey === 'rental_application.created') return `/landlord/review-applications${q}`
      return `/applications${q}`
    }

    const mMaint = path.match(/^\/maintenance-requests\/([^/]+)$/)
    if (mMaint) {
      const id = mMaint[1]
      if (eventKey === 'maintenance_request.updated' && !isStaff()) return '/dashboard'
      return `/landlord/maintenance?ticket=${encodeURIComponent(id)}`
    }

    const mContract = path.match(/^\/rental-contracts\/([^/]+)$/)
    if (mContract) return `/contracts?contract=${encodeURIComponent(mContract[1])}`

    const mPay = path.match(/^\/payments\/([^/]+)$/)
    if (mPay) {
      if (isStaff()) return `/landlord/payments?payment=${encodeURIComponent(mPay[1])}`
      return '/contracts'
    }

    const mRole = path.match(/^\/role-requests\/([^/]+)$/)
    if (mRole) return '/profile'

    const mComm = path.match(/^\/communications\/([^/]+)$/)
    if (mComm) return '/landlord/communications'

    if (path.match(/^\/virtual-viewing-requests\/[^/]+$/)) return '/dashboard'

    if (path.startsWith('/')) return `${path}${parsed.search || ''}${parsed.hash || ''}`
  }

  if (relatedService === 'inquiries' && meta.propertyId) {
    return `/properties/${encodeURIComponent(String(meta.propertyId))}`
  }
  if (relatedService === 'rental-applications' && relatedId) {
    if (eventKey === 'rental_application.created') {
      return `/landlord/review-applications?application=${encodeURIComponent(relatedId)}`
    }
    return `/applications?application=${encodeURIComponent(relatedId)}`
  }
  if (relatedService === 'maintenance-requests' && relatedId) {
    if (eventKey === 'maintenance_request.updated' && !isStaff()) return '/dashboard'
    return `/landlord/maintenance?ticket=${encodeURIComponent(relatedId)}`
  }
  if (relatedService === 'rental-contracts' && relatedId) {
    return `/contracts?contract=${encodeURIComponent(relatedId)}`
  }
  if (relatedService === 'payments' && relatedId) {
    if (isStaff()) return `/landlord/payments?payment=${encodeURIComponent(relatedId)}`
    return '/contracts'
  }
  if (relatedService === 'role-requests' && relatedId) return '/profile'
  if (relatedService === 'communications' && relatedId) return '/landlord/communications'
  if (relatedService === 'agent-assignments' && meta.propertyId) {
    return `/properties/${encodeURIComponent(String(meta.propertyId))}`
  }

  return null
}

export function useNotificationDestination() {
  return { getNotificationDestination }
}
