import type { UseFetchOptions } from 'nuxt/app'

export function useApiFetch<T>(
  request: Parameters<typeof useFetch>[0],
  opts?: UseFetchOptions<T>
) {
  const config = useRuntimeConfig()

  return useFetch<T>(request, {
    baseURL: config.public.apiBase as string,
    credentials: 'include',
    ...opts,
  })
}
