export type PaginatedResult<T> = {
  data: T[]
  total: number
  skip: number
  limit: number
}

export function normalizeFeathersFind<T>(res: unknown): PaginatedResult<T> {
  if (Array.isArray(res)) {
    const data = res as T[]
    return { data, total: data.length, skip: 0, limit: data.length }
  }
  const r = res as Record<string, unknown>
  const data = Array.isArray(r?.data) ? (r.data as T[]) : []
  return {
    data,
    total: typeof r?.total === 'number' ? (r.total as number) : data.length,
    skip: typeof r?.skip === 'number' ? (r.skip as number) : 0,
    limit: typeof r?.limit === 'number' ? (r.limit as number) : data.length
  }
}
