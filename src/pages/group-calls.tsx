import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

interface GroupCall {
  id: number
  title: string
  description: string
  creator_id: number
  creator_username: string
  activity_id: number
  category_id: number
  activity_name: string
  category_name: string
  status: string
  privacy_setting: string
  call_type: string
  max_participants: number
  current_participants: number
  scheduled_at: string | null
  started_at: string | null
  ended_at: string | null
  duration_minutes: number | null
  total_gifts_received: number
  total_gift_coins_value: number
  tags: string[]
  room_id: string
  livekit_ws_url: string
  created_at: string
  updated_at: string
}

interface Participant {
  id: number
  user_id: number
  username: string
  participant_type: 'host' | 'co_host' | 'speaker' | 'listener'
  is_muted: boolean
  is_speaking: boolean
  hand_raised: boolean
  joined_at: string
  left_at: string | null
  duration_minutes: number | null
  gifts_sent: number
  gift_coins_spent: number
  is_active: boolean
}

interface GroupCallsListResponse {
  status: number
  success: boolean
  message: string
  data: {
    group_calls: GroupCall[]
    total: number
    page: number
    limit: number
  }
  metadata: unknown | null
}

interface GroupCallDetailResponse {
  status: number
  success: boolean
  message: string
  data: GroupCall & { participants?: Participant[] }
  metadata: unknown | null
}

async function fetchGroupCalls(): Promise<GroupCallsListResponse> {
  return apiClient.get<GroupCallsListResponse>(API_ENDPOINTS.GROUP_CALLS)
}

async function fetchGroupCallDetail(id: number): Promise<GroupCallDetailResponse> {
  return apiClient.get<GroupCallDetailResponse>(API_ENDPOINTS.GROUP_CALL_BY_ID(id))
}

async function updateGroupCall(id: number, data: Partial<GroupCall>): Promise<GroupCallDetailResponse> {
  return apiClient.put<GroupCallDetailResponse>(API_ENDPOINTS.GROUP_CALL_UPDATE_ADMIN(id), data)
}

export function GroupCallsPage() {
  const [selectedGroupCall, setSelectedGroupCall] = useState<GroupCall | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editData, setEditData] = useState<Partial<GroupCall>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['group-calls'],
    queryFn: fetchGroupCalls,
  })

  const detailQuery = useQuery({
    queryKey: ['group-calls', selectedGroupCall?.id],
    queryFn: () => fetchGroupCallDetail(selectedGroupCall!.id),
    enabled: Boolean(selectedGroupCall),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GroupCall> }) => updateGroupCall(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-calls'] })
      if (selectedGroupCall) {
        queryClient.invalidateQueries({ queryKey: ['group-calls', selectedGroupCall.id] })
      }
      setIsModalOpen(false)
      setSelectedGroupCall(null)
    },
  })

  const handleRowClick = (groupCall: GroupCall) => {
    setSelectedGroupCall(groupCall)
    setEditData({
      title: groupCall.title,
      description: groupCall.description,
      status: groupCall.status,
      privacy_setting: groupCall.privacy_setting,
      call_type: groupCall.call_type,
      max_participants: groupCall.max_participants,
      scheduled_at: groupCall.scheduled_at,
      tags: groupCall.tags,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedGroupCall) {
      updateMutation.mutate({ id: selectedGroupCall.id, data: editData })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedGroupCall(null)
    setEditData({})
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Group Calls</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading group calls...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Group Calls</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading group calls: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const groupCalls = data?.data?.group_calls || []
  const filteredGroupCalls = groupCalls.filter((gc) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      `${gc.id}`.includes(q) ||
      (gc.title || '').toLowerCase().includes(q) ||
      (gc.creator_username || '').toLowerCase().includes(q) ||
      (gc.activity_name || '').toLowerCase().includes(q) ||
      (gc.category_name || '').toLowerCase().includes(q) ||
      (gc.room_id || '').toLowerCase().includes(q) ||
      (gc.tags || []).some((t) => (t || '').toLowerCase().includes(q))
    )
  })

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Group Calls</h1>
      </div>

      <div className="mt-4">
        <div className="mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, creator, activity, category, room, tags..."
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Privacy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroupCalls.map((gc) => (
                <tr key={gc.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(gc)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.creator_username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.activity_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.category_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${gc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {gc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.privacy_setting}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.call_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.current_participants}/{gc.max_participants}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.scheduled_at ? new Date(gc.scheduled_at).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-blue-600">View</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGroupCalls.length === 0 && (
          <div className="text-center py-8 text-gray-500">No group calls found</div>
        )}
      </div>

      {isModalOpen && selectedGroupCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Group Call: {selectedGroupCall.title}</h3>
              <p className="text-sm text-gray-600">Room: {selectedGroupCall.room_id}</p>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editData.status || 'active'}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">active</option>
                    <option value="scheduled">scheduled</option>
                    <option value="ended">ended</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                  <select
                    value={editData.privacy_setting || 'public'}
                    onChange={(e) => setEditData({ ...editData, privacy_setting: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">public</option>
                    <option value="private">private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Type</label>
                  <select
                    value={editData.call_type || 'voice'}
                    onChange={(e) => setEditData({ ...editData, call_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="voice">voice</option>
                    <option value="video">video</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  <input
                    type="number"
                    value={editData.max_participants ?? 0}
                    onChange={(e) => setEditData({ ...editData, max_participants: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(editData.tags || []).join(', ')}
                  onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2"
                />
              </div>

              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-2">Participants</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Muted</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speaking</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(detailQuery.data?.data?.participants || []).map((p) => (
                        <tr key={p.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.username} ({p.user_id})</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.participant_type}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.is_muted ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.is_speaking ? 'Yes' : 'No'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{new Date(p.joined_at).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{p.is_active ? 'Active' : 'Inactive'}</td>
                        </tr>
                      ))}
                      {detailQuery.isLoading && (
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-500" colSpan={6}>Loading participants...</td>
                        </tr>
                      )}
                      {detailQuery.error && (
                        <tr>
                          <td className="px-4 py-2 text-sm text-red-500" colSpan={6}>Failed to load details</td>
                        </tr>
                      )}
                      {!(detailQuery.data?.data?.participants || []).length && !detailQuery.isLoading && (
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-500" colSpan={6}>No participants</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleSave}
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

export default GroupCallsPage


