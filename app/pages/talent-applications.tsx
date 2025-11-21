import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'
import type { TalentApplication, TalentApplicationsResponse, TalentActionResponse } from '../../types/app/+types/talent-applications'

async function fetchTalentApplications(): Promise<TalentApplicationsResponse> {
  return apiClient.get<TalentApplicationsResponse>(API_ENDPOINTS.TALENT_APPLICATIONS)
}

async function promoteToTalent(userId: number): Promise<TalentActionResponse> {
  return apiClient.post<TalentActionResponse>(API_ENDPOINTS.PROMOTE_TO_TALENT(userId))
}

async function rejectAsTalent(userId: number): Promise<TalentActionResponse> {
  return apiClient.post<TalentActionResponse>(API_ENDPOINTS.REJECT_AS_TALENT(userId))
}

export function TalentApplicationsPage() {
  const [selectedApplication, setSelectedApplication] = useState<TalentApplication | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: fetchTalentApplications,
  })

  const promoteMutation = useMutation({
    mutationFn: promoteToTalent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] })
      setIsDetailModalOpen(false)
      setIsConfirmModalOpen(false)
      setSelectedApplication(null)
      setConfirmAction(null)
    },
  })

  const rejectMutation = useMutation({
    mutationFn: rejectAsTalent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] })
      setIsDetailModalOpen(false)
      setIsConfirmModalOpen(false)
      setSelectedApplication(null)
      setConfirmAction(null)
    },
  })

  const handleRowClick = (application: TalentApplication) => {
    setSelectedApplication(application)
    setIsDetailModalOpen(true)
  }

  const handleActionClick = (action: 'accept' | 'reject') => {
    setConfirmAction(action)
    setIsConfirmModalOpen(true)
  }

  const handleConfirmAction = () => {
    if (!selectedApplication || !confirmAction) return

    if (confirmAction === 'accept') {
      promoteMutation.mutate(selectedApplication.user_id)
    } else {
      rejectMutation.mutate(selectedApplication.user_id)
    }
  }

  const handleCloseModals = () => {
    setIsDetailModalOpen(false)
    setIsConfirmModalOpen(false)
    setSelectedApplication(null)
    setConfirmAction(null)
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Talent Applications</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading talent applications...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Talent Applications</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading talent applications: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const applications = data?.data?.applications || []
  const filteredApplications = applications.filter((app) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      `${app.user_id}`.includes(q) ||
      (app.username || '').toLowerCase().includes(q) ||
      (app.full_name || '').toLowerCase().includes(q) ||
      (app.skill || '').toLowerCase().includes(q) ||
      (app.gender || '').toLowerCase().includes(q)
    )
  })

  const getIdentityCardUrls = (urlString: string) => {
    return urlString.split(',').filter(Boolean)
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Talent Applications</h1>
      </div>

      <div className="mt-4">
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user ID, username, full name, skill, or gender..."
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((app) => (
                <tr key={app.user_id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(app)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.user_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">{app.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.skill}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-blue-600">View Details</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApplications.length === 0 && (
          <div className="text-center py-8 text-gray-500">No talent applications found</div>
        )}
        
        {data?.data?.pagination && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div>
              Showing {filteredApplications.length} of {data.data.pagination.total} applications
            </div>
            <div>
              Page {data.data.pagination.page} of {data.data.pagination.total_pages}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Talent Application Details</h3>
              <p className="text-sm text-gray-600">User ID: {selectedApplication.user_id}</p>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {selectedApplication.username}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {selectedApplication.full_name}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm capitalize">
                    {selectedApplication.gender}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                    {selectedApplication.skill}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Identity Card Images</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getIdentityCardUrls(selectedApplication.identity_card_url).map((url, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Identity Card ${index + 1}`}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate">Identity Card {index + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseModals}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleActionClick('reject')}
                disabled={promoteMutation.isPending || rejectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={() => handleActionClick('accept')}
                disabled={promoteMutation.isPending || rejectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && selectedApplication && confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Confirm {confirmAction === 'accept' ? 'Accept' : 'Reject'} Application
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to {confirmAction === 'accept' ? 'accept' : 'reject'} the talent application for{' '}
                <strong>{selectedApplication.username}</strong> ({selectedApplication.full_name})?
              </p>
              {confirmAction === 'accept' && (
                <p className="mt-2 text-sm text-green-600">
                  This will promote the user to talent status.
                </p>
              )}
              {confirmAction === 'reject' && (
                <p className="mt-2 text-sm text-red-600">
                  This will reject the user's talent application.
                </p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={promoteMutation.isPending || rejectMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={promoteMutation.isPending || rejectMutation.isPending}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                  confirmAction === 'accept'
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                {promoteMutation.isPending || rejectMutation.isPending
                  ? 'Processing...'
                  : confirmAction === 'accept'
                  ? 'Accept Application'
                  : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
