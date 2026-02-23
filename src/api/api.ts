import { store } from '../store/store'
import { logout } from '../store/authSlice'

const BASE_URL = `${import.meta.env.APP_URL}/api`

interface FetchOptions extends RequestInit {
  body?: any
}

async function apiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = store.getState().auth.token

  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => headers.set(key, value))
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => headers.set(key, value))
    } else {
      Object.entries(options.headers).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config)

  if (response.status === 401) {
    store.dispatch(logout())
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Something went wrong')
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
}
