import { API_CONFIG } from '../config/api'

interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean
}

class ApiClient {
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  private getAuthToken(): string | null {
    try {
      const authData = localStorage.getItem('joynix_admin_auth')
      if (!authData) return null
      const parsed = JSON.parse(authData)
      return parsed.accessToken || null
    } catch {
      return null
    }
  }

  private getRefreshToken(): string | null {
    try {
      const authData = localStorage.getItem('joynix_admin_auth')
      if (!authData) return null
      const parsed = JSON.parse(authData)
      return parsed.refreshToken || null
    } catch {
      return null
    }
  }

  private getUserId(): string | null {
    try {
      const authData = localStorage.getItem('joynix_admin_auth')
      if (!authData) return null
      const parsed = JSON.parse(authData)
      return parsed.user?.id || null
    } catch {
      return null
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    const userId = this.getUserId()

    if (!refreshToken || !userId) {
      throw new Error('No refresh token or user ID available')
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}auth/refresh`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        refresh_token: refreshToken,
        user_id: userId,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    const data = await response.json()
    
    // Update localStorage with new tokens
    const authData = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      user: JSON.parse(localStorage.getItem('joynix_admin_auth') || '{}').user
    }
    localStorage.setItem('joynix_admin_auth', JSON.stringify(authData))

    return data.access_token
  }

  private getHeaders(options: ApiClientOptions = {}): HeadersInit {
    const baseHeaders = { ...API_CONFIG.HEADERS }
    
    if (options.requireAuth !== false) {
      const token = this.getAuthToken()
      if (token) {
        return {
          ...baseHeaders,
          Authorization: `Bearer ${token}`,
        }
      }
    }
    
    return baseHeaders
  }

  async request<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`
    const headers = this.getHeaders(options)
    
    let response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && options.requireAuth !== false) {
      const refreshToken = this.getRefreshToken()
      const userId = this.getUserId()
      
      if (refreshToken && userId) {
        try {
          const newAccessToken = await this.refreshAccessToken()
          
          // Retry the original request with the new token
          const newHeaders = {
            ...headers,
            Authorization: `Bearer ${newAccessToken}`,
          }
          
          response = await fetch(url, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          })
        } catch (refreshError) {
          // If refresh fails, clear auth data and redirect to login
          localStorage.removeItem('joynix_admin_auth')
          window.location.href = '/signin'
          throw new Error('Authentication failed and token refresh unsuccessful')
        }
      } else {
        // No refresh token available, redirect to login
        localStorage.removeItem('joynix_admin_auth')
        window.location.href = '/signin'
        throw new Error('No refresh token available')
      }
    }
    
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody && typeof errorBody === 'object' && errorBody.message ? errorBody.message : 'Request failed');
    }
    
    return response.json()
  }

  async get<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options: ApiClientOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
