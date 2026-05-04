export function useFeathers() {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$feathers
}
