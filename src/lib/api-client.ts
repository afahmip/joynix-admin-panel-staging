import { API_CONFIG } from '../config/api'

interface ApiClientOptions extends RequestInit {
  requireAuth?: boolean
}

class ApiClient {
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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
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
