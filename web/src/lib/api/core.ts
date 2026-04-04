type ApiSuccess = {
  success: true
}

export type ApiResponse<TData> = {
  data: TData
}

export type { ApiSuccess }

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

if (import.meta.env.PROD && apiBaseUrl === '') {
  throw new Error('VITE_API_BASE_URL is required in production')
}

export const apiUrl = (path: string) =>
  apiBaseUrl ? new URL(path, apiBaseUrl).toString() : path

const isAuthPage = (pathname: string) =>
  pathname === '/login' || pathname === '/register'

const getCurrentPath = () => {
  if (typeof window === 'undefined') {
    return '/budget'
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

const redirectToLogin = () => {
  if (typeof window === 'undefined' || isAuthPage(window.location.pathname)) {
    return
  }

  const redirect = encodeURIComponent(getCurrentPath())
  window.location.assign(`/login?redirect=${redirect}`)
}

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null

    if (payload?.error) {
      return payload.error
    }

    if (payload?.message) {
      return payload.message
    }
  }

  return `Request failed: ${response.status} ${response.statusText}`
}

export const authenticatedFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, {
    ...init,
    credentials: init?.credentials ?? 'include',
  })

  if (response.status === 401) {
    redirectToLogin()
  }

  return response
}

const request = async <TResponse>(
  url: string,
  init?: RequestInit
): Promise<TResponse> => {
  const headers = new Headers(init?.headers ?? {})
  const isFormData =
    typeof FormData !== 'undefined' && init?.body instanceof FormData

  if (!isFormData && init?.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await authenticatedFetch(url, {
    ...init,
    headers,
  })

  if (response.status === 401) {
    throw new UnauthorizedError()
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export const GET = async <TResponse>(url: string): Promise<TResponse> => {
  return request<TResponse>(url)
}

export const POST = async <TBody extends object, TResponse = ApiSuccess>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const POST_FORM = async <TResponse>(
  url: string,
  body: FormData
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'POST',
    body,
  })
}

export const PUT = async <TBody extends object, TResponse = ApiSuccess>(
  url: string,
  body: TBody
): Promise<TResponse> => {
  return request<TResponse>(url, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export const DELETE = async <TResponse = ApiSuccess>(
  url: string
): Promise<TResponse> => {
  return request<TResponse>(url, { method: 'DELETE' })
}
