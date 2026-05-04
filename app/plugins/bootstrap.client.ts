import { useAuthStore } from '@@/stores/auth'
import { usePropertiesStore } from '@@/stores/properties'

export default defineNuxtPlugin(async () => {
  const pinia = usePinia()
  const auth = useAuthStore(pinia)
  await auth.bootstrap()

  if (auth.isAuthenticated) {
    const properties = usePropertiesStore(pinia)
    properties.subscribeRealtime()
  }
})
