export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server) return

  const { data, error } = await useApiFetch('/api/auth/me')

  if (error.value || !data.value?.user) {
    return navigateTo('/admin/login')
  }
})
