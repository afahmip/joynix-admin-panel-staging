import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'
import { API_ENDPOINTS } from '../config/api'
import { useAuth } from './auth'

export type ResourcePermissions = {
  gamifications?: boolean
  group_calls?: boolean
  activities?: boolean
  categories?: boolean
  users?: {
    user_reports?: boolean
    talent_applications?: boolean
  }
  payments?: boolean
}

type APIResourcesResponse = {
  data: {
    role: string
    resources: ResourcePermissions
  }
  message: string
  status: string
}

export type ResourcesResponse = {
  role: string
  resources: ResourcePermissions
}

type ResourcesContextValue = {
  resources: ResourcePermissions | null
  role: string | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  canAccess: (resourcePath: string) => boolean
}

const ResourcesContext = createContext<ResourcesContextValue | undefined>(undefined)

export function ResourcesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [data, setData] = useState<ResourcesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchResources = async () => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get<APIResourcesResponse>(API_ENDPOINTS.RESOURCES)
      setData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch resources'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [isAuthenticated])

  const canAccess = (resourcePath: string): boolean => {
    if (!data?.resources) return false

    const parts = resourcePath.split('.')
    let current: any = data.resources

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return false
      }
    }

    return current === true
  }

  const value: ResourcesContextValue = {
    resources: data?.resources || null,
    role: data?.role || null,
    isLoading,
    error,
    refetch: fetchResources,
    canAccess,
  }

  return <ResourcesContext.Provider value={value}>{children}</ResourcesContext.Provider>
}

export function useResources() {
  const ctx = useContext(ResourcesContext)
  if (!ctx) throw new Error('useResources must be used within ResourcesProvider')
  return ctx
}
