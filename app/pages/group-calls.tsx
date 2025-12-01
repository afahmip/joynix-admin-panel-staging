import { useQuery } from '@tanstack/react-query'
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


async function fetchGroupCalls(): Promise<GroupCallsListResponse> {
  return apiClient.get<GroupCallsListResponse>(API_ENDPOINTS.GROUP_CALLS)
}


export function GroupCallsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['group-calls'],
    queryFn: fetchGroupCalls,
  })

  const handleRowClick = (groupCall: GroupCall) => {
    navigate(`/group-calls/${groupCall.id}`)
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
        <Link
          to="/group-calls/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Group Call
        </Link>
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      gc.status === 'active' ? 'bg-green-100 text-green-800' : 
                      gc.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      gc.status === 'ended' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {gc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.privacy_setting}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.call_type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.current_participants}/{gc.max_participants}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{gc.scheduled_at ? new Date(gc.scheduled_at).toLocaleString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link to={`/group-calls/${gc.id}`} className="text-blue-600 hover:text-blue-800" onClick={(e) => e.stopPropagation()}>
                      View Details
                    </Link>
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

    </div>
  )
}
