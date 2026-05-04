import { defineStore } from 'pinia'
import { normalizeFeathersFind } from '../utils/feathersNormalize'

function wireSitePagesRealtime(
  list: Ref<any[]>,
  blogList: Ref<any[]>,
  detailBySlug: Record<string, any>,
  isSubscribed: Ref<boolean>
) {
  if (import.meta.server || isSubscribed.value) return
  isSubscribed.value = true
  const feathers = useNuxtApp().$feathers as any
  const svc = feathers.service('site-pages')

  const upsert = (row: any) => {
    const id = String(row?._id || '')
    if (!id) return
    const slug = row?.slug as string | undefined

    const i = list.value.findIndex((x) => String(x._id) === id)
    if (i >= 0) list.value[i] = row
    else list.value.unshift(row)

    const blogI = blogList.value.findIndex((x) => String(x._id) === id)
    if (row.section === 'blog') {
      if (blogI >= 0) blogList.value[blogI] = row
      else blogList.value.unshift(row)
    } else if (blogI >= 0) {
      blogList.value.splice(blogI, 1)
    }

    if (slug && Object.prototype.hasOwnProperty.call(detailBySlug, slug)) {
      detailBySlug[slug] = row
    }
  }

  const onRemoved = (row: any) => {
    const id = String(row?._id || '')
    const slug = row?.slug as string | undefined
    list.value = list.value.filter((x) => String(x._id) !== id)
    blogList.value = blogList.value.filter((x) => String(x._id) !== id)
    if (slug && Object.prototype.hasOwnProperty.call(detailBySlug, slug)) {
      delete detailBySlug[slug]
    }
  }

  svc.on('created', upsert)
  svc.on('patched', upsert)
  svc.on('updated', upsert)
  svc.on('removed', onRemoved)
}

export const useSitePagesStore = defineStore('sitePages', () => {
  const list = ref<any[]>([])
  const blogList = ref<any[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const isSubscribed = ref(false)

  const detailBySlug = reactive<Record<string, any>>({})

  function ensureRealtime() {
    wireSitePagesRealtime(list, blogList, detailBySlug, isSubscribed)
  }

  async function fetchList(query: Record<string, any> = {}) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('site-pages').find({
        query: { $limit: 200, ...query }
      })
      const norm = normalizeFeathersFind(res)
      list.value = norm.data
      total.value = norm.total
      ensureRealtime()
      return norm
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBySlug(slug: string) {
    const feathers = useNuxtApp().$feathers as any
    const res = await feathers.service('site-pages').find({
      query: { slug, $limit: 1 }
    })
    const norm = normalizeFeathersFind(res)
    const row = norm.data[0] ?? null
    if (row) detailBySlug[slug] = row
    else delete detailBySlug[slug]
    ensureRealtime()
    return row
  }

  async function fetchBlogList(limit = 80) {
    isLoading.value = true
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('site-pages').find({
        query: {
          section: 'blog',
          $sort: { publishedAt: -1 },
          $limit: limit
        }
      })
      const norm = normalizeFeathersFind(res)
      blogList.value = norm.data
      ensureRealtime()
      return norm
    } finally {
      isLoading.value = false
    }
  }

  async function createPage(payload: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('site-pages').create(payload)
  }

  async function patchPage(id: string, payload: Record<string, any>) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('site-pages').patch(id, payload)
  }

  async function removePage(id: string) {
    const feathers = useNuxtApp().$feathers as any
    return await feathers.service('site-pages').remove(id)
  }

  return {
    list,
    blogList,
    total,
    isLoading,
    isSubscribed,
    detailBySlug,
    fetchList,
    fetchBySlug,
    fetchBlogList,
    createPage,
    patchPage,
    removePage,
    ensureRealtime
  }
})
