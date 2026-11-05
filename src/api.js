export function getApiBase() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname
    return `http://${hostname}:8000/api`
  }
  return 'http://127.0.0.1:8000/api'
}

export const API = getApiBase()

export function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
  if (!match) return null
  try {
    return decodeURIComponent(match[3])
  } catch {
    return match[3]
  }
}

let csrfPromise = null

export async function ensureCsrfCookie(force = false) {
  if (!force && getCookie('XSRF-TOKEN')) {
    return Promise.resolve()
  }

  if (!csrfPromise || force) {
    const rootUrl = API.replace(/\/api\/?$/, '')
    csrfPromise = fetch(`${rootUrl}/sanctum/csrf-cookie`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => {
        csrfPromise = null
        return res
      })
      .catch((err) => {
        csrfPromise = null
        throw err
      })
  }

  return csrfPromise
}

export async function request(path, { method = 'GET', token, body, headers = {} } = {}, isRetry = false) {
  const upperMethod = method.toUpperCase()
  const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)

  if (isMutating) {
    await ensureCsrfCookie()
  }

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const xsrfToken = isMutating ? getCookie('XSRF-TOKEN') : null

  const response = await fetch(`${API}${path}`, {
    method: upperMethod,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
      ...headers,
    },
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  })

  // Automatic one-time recovery if CSRF token expired
  if (response.status === 419 && !isRetry && isMutating) {
    await ensureCsrfCookie(true)
    return request(path, { method, token, body, headers }, true)
  }

  const data = response.status === 204 ? null : await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401 && token && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atlas:auth-expired', {
        detail: { message: data?.message || 'Your session has expired. Please sign in again.' },
      }))
    }
    const message = data?.message || Object.values(data?.errors || {})?.flat()?.[0] || `Request failed (${response.status})`
    const err = new Error(message)
    err.status = response.status
    err.data = data
    throw err
  }

  return data
}

export const asset = (path) => path?.startsWith('http') ? path : path ? `${API.replace(/\/api$/, '')}/storage/${path}` : ''
