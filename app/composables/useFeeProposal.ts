/**
 * Helpers for the shared fee-proposal model used by `agent-listing-requests`
 * and `property-manager-listing-requests`. Mirrors the backend TypeBox schema.
 */
export type FeeUnitType = 'percent' | 'fixed' | 'months_rent' | 'percent_rent_collected'

export interface FeeUnit {
  type: FeeUnitType
  value: number
  currency?: string
  notes?: string
}

export interface FeeProposal {
  rent?: FeeUnit
  sale?: FeeUnit
  triggers?: Array<
    | 'rent_consummated'
    | 'sale_consummated'
    | 'first_month_paid'
    | 'each_renewal'
    | 'monthly_rent_collected'
  >
  validityDays?: number
  notes?: string
  proposedByUserId?: string
  at?: string
}

export const FEE_UNIT_LABELS: Record<FeeUnitType, string> = {
  percent: '% of price',
  fixed: 'Flat amount',
  months_rent: 'Months of rent',
  percent_rent_collected: '% of rent collected'
}

export const FEE_TRIGGER_LABELS: Record<NonNullable<FeeProposal['triggers']>[number], string> = {
  rent_consummated: 'Once rental contract is signed',
  sale_consummated: 'Once sale is consummated',
  first_month_paid: 'When first month is paid',
  each_renewal: 'Each lease renewal',
  monthly_rent_collected: 'Each month rent is collected'
}

/** Format a single fee unit for display. */
export function formatFeeUnit(u?: FeeUnit | null, fallbackCurrency = 'GHS'): string {
  if (!u || typeof u.value !== 'number') return '—'
  const cur = u.currency || fallbackCurrency
  if (u.type === 'percent') return `${u.value}% of price`
  if (u.type === 'fixed') return `${cur} ${u.value.toLocaleString()} flat`
  if (u.type === 'months_rent') return `${u.value} month${u.value === 1 ? '' : 's'} of rent`
  if (u.type === 'percent_rent_collected') return `${u.value}% of rent collected`
  return '—'
}

/** Concise one-line summary of a proposal. */
export function summarizeProposal(p?: FeeProposal | null): string {
  if (!p) return 'No fee proposed'
  const parts: string[] = []
  if (p.rent) parts.push(`Rent: ${formatFeeUnit(p.rent)}`)
  if (p.sale) parts.push(`Sale: ${formatFeeUnit(p.sale)}`)
  if (!parts.length) return 'No fee proposed'
  return parts.join(' · ')
}

/** Convert a default rate card (DefaultFee) to an initial FeeProposal. */
export function defaultFeeToProposal(rate?: { rent?: FeeUnit; sale?: FeeUnit; notes?: string } | null): FeeProposal {
  if (!rate) return {}
  return {
    rent: rate.rent ? { ...rate.rent } : undefined,
    sale: rate.sale ? { ...rate.sale } : undefined,
    notes: rate.notes
  }
}

/** Compute the legacy commissionPercent for backwards compatibility with old UI. */
export function deriveCommissionPercent(p?: FeeProposal | null): number | null {
  const r = p?.rent
  if (!r) return null
  if (r.type === 'percent' || r.type === 'percent_rent_collected') return r.value ?? null
  return null
}

export function emptyProposal(): FeeProposal {
  return { rent: { type: 'percent', value: 0 } }
}
