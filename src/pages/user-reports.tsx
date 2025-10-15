import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

interface UserReportItem {
  admin_notes: string
  category: string
  created_at: string
  description: string
  id: number
  reported_id: number
  reported_username: string
  reporter_id: number
  reporter_username: string
  reviewed_at: string
  reviewed_by: number
  reviewer_username: string
  status: string
}

interface UserReportsApiResponse {
  status: number
  success: boolean
  message: string
  data: {
    limit: number
    page: number
    total_pages: number
    total: number
    reports: UserReportItem[]
  }
  metadata: unknown | null
}

type ReportStatus = 'pending' | 'reviewed' | 'action_taken' | 'dismissed'

async function fetchUserReports(params: { status: ReportStatus; page: number; limit: number }): Promise<UserReportsApiResponse> {
  const search = new URLSearchParams()
  search.set('page', String(params.page))
  search.set('limit', String(params.limit))
  search.set('status', params.status)
  return apiClient.get<UserReportsApiResponse>(`${API_ENDPOINTS.USER_REPORTS}?${search.toString()}`)
}

async function updateUserReport(id: number, body: { admin_notes: string; status: ReportStatus }) {
  return apiClient.put(API_ENDPOINTS.USER_REPORT_BY_ID(id), body)
}

export function UserReportsPage() {
  const allStatuses: ReportStatus[] = ['pending', 'reviewed', 'action_taken', 'dismissed']
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [page] = useState(1)
  const [limit] = useState(100)
  const [selectedReport, setSelectedReport] = useState<UserReportItem | null>(null)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState<ReportStatus>('pending')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const queryParams = useMemo(() => ({ status: selectedStatus, page, limit }), [selectedStatus, page, limit])

  const { data, isLoading, error } = useQuery({
    queryKey: ['user-reports', queryParams],
    queryFn: () => fetchUserReports(queryParams),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, notes, status }: { id: number; notes: string; status: ReportStatus }) =>
      updateUserReport(id, { admin_notes: notes, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reports'] })
      setIsModalOpen(false)
      setSelectedReport(null)
    },
  })

  const reports = data?.data?.reports || []

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports
    const q = searchTerm.toLowerCase()
    return reports.filter((r) => {
      return (
        String(r.id).includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.reporter_username?.toLowerCase().includes(q) ||
        String(r.reporter_id).includes(q) ||
        r.reported_username?.toLowerCase().includes(q) ||
        String(r.reported_id).includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.admin_notes?.toLowerCase().includes(q) ||
        r.reviewer_username?.toLowerCase().includes(q)
      )
    })
  }, [reports, searchTerm])

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">User Reports</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading user reports...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">User Reports</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading user reports: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Reports</h1>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reports..."
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
            className="w-full sm:w-60 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="text-xs text-gray-500">Showing {filteredReports.length} of {reports.length} fetched</div>
      </div>
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewed At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedReport(r)
                    setEditNotes(r.admin_notes || '')
                    setEditStatus((r.status?.toLowerCase() as ReportStatus) || 'pending')
                    setIsModalOpen(true)
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${r.status?.toLowerCase() === 'resolved' ? 'bg-green-100 text-green-800' : r.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.reporter_username} (#{r.reporter_id})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.reported_username} (#{r.reported_id})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={r.description}>{r.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate" title={r.admin_notes}>{r.admin_notes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{r.reviewer_username || '-'}{r.reviewed_by ? ` (#${r.reviewed_by})` : ''}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.reviewed_at ? new Date(r.reviewed_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">No reports found</div>
        )}
      </div>

      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Report #{selectedReport.id}
              </h3>
              <div className="mt-1 text-sm text-gray-600">Category: {selectedReport.category} • Status: {selectedReport.status}</div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Reporter</div>
                  <div className="text-sm text-gray-900">{selectedReport.reporter_username} (#{selectedReport.reporter_id})</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Reported User</div>
                  <div className="text-sm text-gray-900">{selectedReport.reported_username} (#{selectedReport.reported_id})</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Description</div>
                <div className="text-sm text-gray-900 whitespace-pre-wrap break-words">{selectedReport.description}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                  >
                    {allStatuses.map((s) => (
                      <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs text-gray-500">Created: {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : '-'}</div>
              <div className="text-xs text-gray-500">Reviewed: {selectedReport.reviewed_at ? new Date(selectedReport.reviewed_at).toLocaleString() : '-'} by {selectedReport.reviewer_username || '-'}</div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedReport(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedReport) return
                  updateMutation.mutate({ id: selectedReport.id, notes: editNotes, status: editStatus })
                }}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserReportsPage


