import { defineStore } from 'pinia'

type AuthResult = {
  accessToken?: string
  refreshToken?: string
  authentication?: unknown
  user?: any
}

function userRecordId(u: any): string | null {
  if (!u || typeof u !== 'object') return null
  const raw = u._id ?? u.id
  if (raw == null || raw === '') return null
  if (typeof raw === 'object' && typeof raw.toString === 'function') return raw.toString()
  return String(raw)
}

export const useAuthStore = defineStore('auth', () => {
  const isReady = ref(false)
  const isAuthenticated = ref(false)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const user = ref<any | null>(null)
  /** Populated from `user-roles` after login / bootstrap. */
  const roles = ref<string[]>([])

  function loadFromStorage() {
    accessToken.value = localStorage.getItem('accessToken')
    refreshToken.value = localStorage.getItem('refreshToken')
    const rawUser = localStorage.getItem('user')
    user.value = rawUser ? JSON.parse(rawUser) : null
    roles.value = Array.isArray(user.value?.roles) ? [...user.value.roles] : []
    isAuthenticated.value = Boolean(accessToken.value)
  }

  async function fetchRoles() {
    roles.value = []
    const uid = userRecordId(user.value)
    if (!uid || !isAuthenticated.value) return
    try {
      const feathers = useNuxtApp().$feathers as any
      const res = await feathers.service('user-roles').find({
        paginate: false,
        query: { userId: uid }
      })
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      roles.value = list.map((r: any) => r.role).filter(Boolean)
      if (user.value) {
        user.value = { ...user.value, roles: roles.value }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    } catch (e) {
      roles.value = []
      if (import.meta.dev) {
        console.warn('[auth] fetchRoles failed', e)
      }
    }
  }

  function hasRole(...allowed: string[]) {
    return allowed.some((r) => roles.value.includes(r))
  }

  async function bootstrap() {
    if (process.server) return
    loadFromStorage()

    if (accessToken.value) {
      try {
        const feathers = useNuxtApp().$feathers as any
        const res = (await feathers.reAuthenticate()) as AuthResult
        if (res?.accessToken) {
          accessToken.value = res.accessToken
          localStorage.setItem('accessToken', res.accessToken)
        }
        if ((res as any)?.refreshToken) {
          refreshToken.value = (res as any).refreshToken
          if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
        }
        if (res?.user) {
          user.value = res.user
          localStorage.setItem('user', JSON.stringify(res.user))
        }
        isAuthenticated.value = true
        await fetchRoles()
      } catch {
        await logout()
      }
    }

    isReady.value = true
  }

  async function login(email: string, password: string) {
    const feathers = useNuxtApp().$feathers as any
    const res = (await feathers.authenticate({
      strategy: 'local',
      email,
      password
    })) as AuthResult

    accessToken.value = res.accessToken || null
    refreshToken.value = (res as any).refreshToken || null
    user.value = res.user || null
    isAuthenticated.value = Boolean(accessToken.value)

    if (accessToken.value) localStorage.setItem('accessToken', accessToken.value)
    if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
    if (user.value) localStorage.setItem('user', JSON.stringify(user.value))
    await fetchRoles()
    return res
  }

  async function logout() {
    try {
      const feathers = useNuxtApp().$feathers as any
      await feathers.logout()
    } catch {
      // ignore
    }
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    roles.value = []
  }

  return {
    isReady,
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    roles,
    hasRole,
    fetchRoles,
    bootstrap,
    login,
    logout
  }
})

