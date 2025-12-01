import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
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

interface GroupCallDetailResponse {
  status: number
  success: boolean
  message: string
  data: GroupCall & { participants?: Participant[] }
  metadata: unknown | null
}

async function fetchGroupCallDetail(id: number): Promise<GroupCallDetailResponse> {
  return apiClient.get<GroupCallDetailResponse>(API_ENDPOINTS.GROUP_CALL_BY_ID(id))
}

async function updateGroupCall(id: number, data: Partial<GroupCall>): Promise<GroupCallDetailResponse> {
  return apiClient.put<GroupCallDetailResponse>(API_ENDPOINTS.GROUP_CALL_UPDATE_ADMIN(id), data)
}

interface AssignHostRequest {
  host_id: number
  can_moderate: boolean
}

interface AssignHostResponse {
  status: number
  success: boolean
  message: string
  data: {
    id: number
    host_id: number
    host_username: string
    can_moderate: boolean
    is_active: boolean
    is_speaking: boolean
    joined_at: string
    left_at: string | null
    gifts_received: number
    gift_coins_received: number
  }
  metadata: unknown | null
}

async function assignHost(groupCallId: number, data: AssignHostRequest): Promise<AssignHostResponse> {
  return apiClient.post<AssignHostResponse>(`group-calls/admin/${groupCallId}/hosts`, data)
}

interface RemoveHostResponse {
  status: number
  success: boolean
  message: string
  data: unknown | null
  metadata: unknown | null
}

async function removeHost(groupCallId: number, hostId: number): Promise<RemoveHostResponse> {
  return apiClient.delete<RemoveHostResponse>(`group-calls/admin/${groupCallId}/hosts/${hostId}`)
}

interface GroupCallDetailPageProps {
  id: number
}

export function GroupCallDetailPage({ id }: GroupCallDetailPageProps) {
  const [editData, setEditData] = useState<Partial<GroupCall>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingParticipants, setIsEditingParticipants] = useState(false)
  const [hostAssignmentData, setHostAssignmentData] = useState<AssignHostRequest>({
    host_id: 0,
    can_moderate: true
  })
  const [confirmRemoveHost, setConfirmRemoveHost] = useState<{ show: boolean; hostId: number; hostUsername: string }>({
    show: false,
    hostId: 0,
    hostUsername: ''
  })
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['group-calls', id],
    queryFn: () => fetchGroupCallDetail(id),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GroupCall> }) => updateGroupCall(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-calls'] })
      queryClient.invalidateQueries({ queryKey: ['group-calls', id] })
      setIsEditing(false)
    },
  })

  const assignHostMutation = useMutation({
    mutationFn: ({ groupCallId, data }: { groupCallId: number; data: AssignHostRequest }) => assignHost(groupCallId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-calls'] })
      queryClient.invalidateQueries({ queryKey: ['group-calls', id] })
      setIsEditingParticipants(false)
      setHostAssignmentData({ host_id: 0, can_moderate: true })
    },
  })

  const removeHostMutation = useMutation({
    mutationFn: ({ groupCallId, hostId }: { groupCallId: number; hostId: number }) => removeHost(groupCallId, hostId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-calls'] })
      queryClient.invalidateQueries({ queryKey: ['group-calls', id] })
      setConfirmRemoveHost({ show: false, hostId: 0, hostUsername: '' })
    },
  })

  const groupCall = data?.data

  // Initialize edit data when group call loads
  useState(() => {
    if (groupCall && !isEditing) {
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
    }
  })

  const handleEdit = () => {
    if (groupCall) {
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
      setIsEditing(true)
    }
  }

  const handleSave = () => {
    updateMutation.mutate({ id, data: editData })
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (groupCall) {
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
    }
  }

  const handleEditParticipants = () => {
    setIsEditingParticipants(true)
  }

  const handleCancelParticipants = () => {
    setIsEditingParticipants(false)
    setHostAssignmentData({ host_id: 0, can_moderate: true })
  }

  const handleAssignHost = () => {
    if (hostAssignmentData.host_id > 0) {
      assignHostMutation.mutate({ groupCallId: id, data: hostAssignmentData })
    }
  }

  const handleRemoveHostClick = (hostId: number, hostUsername: string) => {
    setConfirmRemoveHost({ show: true, hostId, hostUsername })
  }

  const handleConfirmRemoveHost = () => {
    if (confirmRemoveHost.hostId > 0) {
      removeHostMutation.mutate({ groupCallId: id, hostId: confirmRemoveHost.hostId })
    }
  }

  const handleCancelRemoveHost = () => {
    setConfirmRemoveHost({ show: false, hostId: 0, hostUsername: '' })
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/group-calls"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Group Calls
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading group call details...</div>
        </div>
      </div>
    )
  }

  if (error || !groupCall) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/group-calls"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Group Calls
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">Error loading group call: {error ? (error as Error).message : 'Group call not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/group-calls"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Group Calls
          </Link>
          <h1 className="text-2xl font-bold">Group Call: {groupCall.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section - Group Call Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Group Call Details</h3>
                  <p className="text-sm text-gray-600">Room: {groupCall.room_id}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    groupCall.status === 'active' ? 'bg-green-100 text-green-800' : 
                    groupCall.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    groupCall.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {groupCall.status}
                  </span>
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Edit Details
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCancel}
                        className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.title || ''}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{groupCall.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  {isEditing ? (
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
                  ) : (
                    <p className="text-gray-900">{groupCall.status}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{groupCall.description || 'No description'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                  {isEditing ? (
                    <select
                      value={editData.privacy_setting || 'public'}
                      onChange={(e) => setEditData({ ...editData, privacy_setting: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="public">public</option>
                      <option value="private">private</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{groupCall.privacy_setting}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Call Type</label>
                  {isEditing ? (
                    <select
                      value={editData.call_type || 'voice'}
                      onChange={(e) => setEditData({ ...editData, call_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="voice">voice</option>
                      <option value="video">video</option>
                    </select>
                  ) : (
                    <p className="text-gray-900">{groupCall.call_type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.max_participants ?? 0}
                      onChange={(e) => setEditData({ ...editData, max_participants: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{groupCall.max_participants}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                  <p className="text-gray-900">{groupCall.creator_username} (ID: {groupCall.creator_id})</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Participants</label>
                  <p className="text-gray-900">{groupCall.current_participants}/{groupCall.max_participants}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                  <p className="text-gray-900">{groupCall.activity_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-gray-900">{groupCall.category_name}</p>
                </div>
              </div>

              {groupCall.scheduled_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
                  <p className="text-gray-900">{new Date(groupCall.scheduled_at).toLocaleString()}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={(editData.tags || []).join(', ')}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {groupCall.tags && groupCall.tags.length > 0 ? (
                      groupCall.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No tags</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Gifts Received</label>
                  <p className="text-gray-900">{groupCall.total_gifts_received}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Gift Coins Value</label>
                  <p className="text-gray-900">{groupCall.total_gift_coins_value}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <p className="text-gray-900">{groupCall.duration_minutes ? `${groupCall.duration_minutes} minutes` : '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-gray-900">{new Date(groupCall.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-gray-900">{new Date(groupCall.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Participants List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">
                  Participants ({groupCall.current_participants})
                </h4>
                {!isEditingParticipants ? (
                  <button
                    onClick={handleEditParticipants}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    Assign Host
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelParticipants}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignHost}
                      disabled={assignHostMutation.isPending || hostAssignmentData.host_id === 0}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {assignHostMutation.isPending ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {(groupCall.participants || []).map((p) => (
                  <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{p.username}</div>
                        <div className="text-sm text-gray-500">ID: {p.user_id}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          p.participant_type === 'host' ? 'bg-purple-100 text-purple-800' :
                          p.participant_type === 'co_host' ? 'bg-blue-100 text-blue-800' :
                          p.participant_type === 'speaker' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {p.participant_type}
                        </span>
                        {(p.participant_type === 'host' || p.participant_type === 'co_host') && (
                          <button
                            onClick={() => handleRemoveHostClick(p.user_id, p.username)}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                          >
                            Remove Host
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                        p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {p.is_muted && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Muted
                        </span>
                      )}
                      {p.is_speaking && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Speaking
                        </span>
                      )}
                      {p.hand_raised && (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Hand Raised
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Joined: {new Date(p.joined_at).toLocaleString()}</div>
                      {p.left_at && (
                        <div>Left: {new Date(p.left_at).toLocaleString()}</div>
                      )}
                      <div>Duration: {p.duration_minutes ? `${p.duration_minutes} min` : '-'}</div>
                      <div>Gifts Sent: {p.gifts_sent} (Coins: {p.gift_coins_spent})</div>
                    </div>
                  </div>
                ))}
                {(!groupCall.participants || groupCall.participants.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No participants
                  </div>
                )}
              </div>
            </div>
            
            {/* Host Assignment Form */}
            {isEditingParticipants && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <h5 className="text-md font-medium text-gray-900 mb-4">Assign Host</h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Host ID
                    </label>
                    <input
                      type="number"
                      value={hostAssignmentData.host_id || ''}
                      onChange={(e) => setHostAssignmentData({ 
                        ...hostAssignmentData, 
                        host_id: parseInt(e.target.value) || 0 
                      })}
                      placeholder="Enter user ID to assign as host"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="can_moderate"
                      checked={hostAssignmentData.can_moderate}
                      onChange={(e) => setHostAssignmentData({ 
                        ...hostAssignmentData, 
                        can_moderate: e.target.checked 
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="can_moderate" className="ml-2 block text-sm text-gray-700">
                      Can moderate (allow host to manage participants)
                    </label>
                  </div>
                  {assignHostMutation.error && (
                    <div className="text-red-600 text-sm">
                      Error: {
                        (assignHostMutation.error as any)?.response?.status === 404 
                          ? 'User not found' 
                          : (assignHostMutation.error as Error).message
                      }
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Host Confirmation Dialog */}
      {confirmRemoveHost.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Remove Host</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to remove <strong>{confirmRemoveHost.hostUsername}</strong> as a host? 
                This action cannot be undone.
              </p>
              {removeHostMutation.error && (
                <div className="text-red-600 text-sm mb-4">
                  Error: {(removeHostMutation.error as Error).message}
                </div>
              )}
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleCancelRemoveHost}
                  disabled={removeHostMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemoveHost}
                  disabled={removeHostMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {removeHostMutation.isPending ? 'Removing...' : 'Remove Host'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
