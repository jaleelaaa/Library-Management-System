/**
 * SECURE API CLIENT WITH AUTOMATIC TOKEN REFRESH
 *
 * This is an enhanced version of api.ts that implements:
 * 1. Automatic token refresh before expiration
 * 2. Retry failed requests after token refresh
 * 3. Memory-only storage for access tokens
 * 4. Better error handling
 *
 * TO USE: Replace imports from './api' with './api-secure'
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

// API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for refresh token
})

// In-memory token storage (more secure than localStorage)
let accessToken: string | null = null
let refreshToken: string | null = null
let tokenRefreshPromise: Promise<string> | null = null

/**
 * Set tokens (called after login)
 */
export function setTokens(access: string, refresh: string) {
  accessToken = access
  refreshToken = refresh

  // Still store refresh token in localStorage as backup
  // (Ideally should be httpOnly cookie)
  localStorage.setItem('refreshToken', refresh)
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return accessToken
}

/**
 * Clear tokens (on logout)
 */
export function clearTokens() {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000 // Convert to milliseconds

    // Consider token expired if less than 2 minutes remaining
    return Date.now() >= (exp - 120000)
  } catch {
    return true
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string> {
  // If refresh is already in progress, wait for it
  if (tokenRefreshPromise) {
    return tokenRefreshPromise
  }

  tokenRefreshPromise = (async () => {
    try {
      const currentRefreshToken = refreshToken || localStorage.getItem('refreshToken')

      if (!currentRefreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refresh_token: currentRefreshToken },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      )

      const { access_token, refresh_token } = response.data

      // Update tokens
      accessToken = access_token
      refreshToken = refresh_token
      localStorage.setItem('refreshToken', refresh_token)

      return access_token
    } catch (error) {
      // Refresh failed - clear tokens and logout
      clearTokens()
      window.location.href = '/login'
      throw error
    } finally {
      tokenRefreshPromise = null
    }
  })()

  return tokenRefreshPromise
}

/**
 * Request interceptor - Add token and handle refresh
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token for auth endpoints
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return config
    }

    // Get current token
    let token = accessToken

    // Check if token exists and is expired/expiring
    if (token && isTokenExpired(token)) {
      try {
        token = await refreshAccessToken()
      } catch (error) {
        // Refresh failed, will be handled in response interceptor
        return config
      }
    }

    // Add token to request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response interceptor - Handle 401 and retry with refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // If 401 and haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh token
        const newToken = await refreshAccessToken()

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        }

        return axios(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // For other errors or if retry failed
    if (error.response?.status === 401) {
      clearTokens()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

/**
 * Initialize tokens from storage on app load
 * WARNING: This still uses localStorage. For production,
 * refresh token should be in httpOnly cookie set by backend
 */
export function initializeAuth() {
  const storedRefreshToken = localStorage.getItem('refreshToken')
  if (storedRefreshToken) {
    refreshToken = storedRefreshToken

    // Attempt to refresh on load to get new access token
    refreshAccessToken().catch(() => {
      // If refresh fails, clear and redirect
      clearTokens()
    })
  }
}

export default api
