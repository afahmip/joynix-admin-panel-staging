import { useState, useEffect } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

interface UserReportsApiResponse {
  status: number
  success: boolean
  message: string
  data: {
    limit: number
    page: number
    total_pages: number
    total: number
    reports: unknown[]
  }
  metadata: unknown | null
}

async function fetchPendingUserReportsCount(): Promise<number> {
  const search = new URLSearchParams()
  search.set('page', '1')
  search.set('limit', '1')
  search.set('status', 'pending')
  const res = await apiClient.get<UserReportsApiResponse>(`${API_ENDPOINTS.USER_REPORTS}?${search.toString()}`)
  return res?.data?.total ?? 0
}

export function DashboardPage() {
  const [pendingCount, setPendingCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const count = await fetchPendingUserReportsCount()
        setPendingCount(count)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Pending User Reports</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-gray-200" />
                ) : error ? (
                  <span className="text-red-600 text-base">Error</span>
                ) : (
                  pendingCount ?? 0
                )}
              </div>
            </div>
            <div className="shrink-0 rounded-md bg-yellow-50 p-3 text-yellow-700">
              {/* Icon placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.75 6.75a.75.75 0 0 1 1.5 0v5.25a.75.75 0 0 1-1.5 0V9Zm.75 8.25a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25Z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
