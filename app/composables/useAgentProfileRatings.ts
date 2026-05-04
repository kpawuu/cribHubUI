/**
 * Agent profile ratings come from `ratingAvg` + `ratingCount` on `agent-profiles`,
 * maintained by the `agent-ratings` service after each review write.
 */
export function agentProfileHasReviews(a: any): boolean {
  const c = Number(a?.ratingCount)
  const av = Number(a?.ratingAvg)
  return Number.isFinite(c) && c > 0 && Number.isFinite(av) && av > 0
}

/** Average 1–5 when there are reviews; otherwise null. */
export function agentProfileRatingAvg(a: any): number | null {
  if (!agentProfileHasReviews(a)) return null
  return Math.min(5, Math.max(0, Number(a.ratingAvg)))
}

export function agentProfileRatingCount(a: any): number {
  const c = Number(a?.ratingCount)
  return Number.isFinite(c) && c > 0 ? Math.floor(c) : 0
}

/** Whole stars to highlight (1–5), 0 when no reviews. */
export function agentProfileFilledStars(a: any): number {
  const av = agentProfileRatingAvg(a)
  if (av == null) return 0
  return Math.min(5, Math.max(0, Math.round(av)))
}

export function agentProfileRatingLabel(a: any): string {
  const av = agentProfileRatingAvg(a)
  if (av == null) return '—'
  return av.toFixed(1)
}
