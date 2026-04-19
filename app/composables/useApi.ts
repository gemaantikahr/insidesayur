export function useApi<T = any>(
  request: Parameters<typeof $fetch>[0],
  opts?: Parameters<typeof $fetch>[1]
) {
  const config = useRuntimeConfig()

  return $fetch<T>(request, {
    baseURL: config.public.apiBase as string,
    ...opts,
  })
}
