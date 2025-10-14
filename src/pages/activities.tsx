import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS, API_CONFIG, getAuthHeaders } from '../config/api'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

interface Activity {
  id: number
  category_id: number
  name: string
  description: string
  image_url: string
  category_name: string
  tags: string[]
  difficulty_level: string
  activity_type: string
  requires_equipment: boolean
  equipment_notes: string
  min_participants: number
  max_participants: number
  is_active: boolean
  metadata: unknown | null
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

interface ActivitiesApiResponse {
  status: number
  success: boolean
  message: string
  data: {
    activities: Activity[]
    metadata: {
      page: number
      limit: number
      total_pages: number
      total_records: number
      has_next: boolean
      has_previous: boolean
    }
  }
  metadata: unknown | null
}

async function fetchActivities(): Promise<ActivitiesApiResponse> {
  const token = localStorage.getItem('joynix_admin_auth')
  const accessToken = token ? JSON.parse(token).accessToken : null
  
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ACTIVITIES}`, {
    method: 'GET',
    headers: getAuthHeaders(accessToken),
  })
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export function ActivitiesPage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editData, setEditData] = useState<Partial<Activity>>({})
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Activity> }) => {
      const token = localStorage.getItem('joynix_admin_auth')
      const accessToken = token ? JSON.parse(token).accessToken : null
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ACTIVITY_BY_ID(id)}`, {
        method: 'PUT',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsModalOpen(false)
      setSelectedActivity(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof createData) => {
      const token = localStorage.getItem('joynix_admin_auth')
      const accessToken = token ? JSON.parse(token).accessToken : null
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ACTIVITIES}`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        description: '',
        is_active: true,
      })
    },
  })

  const handleRowClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setEditData({
      name: activity.name,
      description: activity.description,
      is_active: activity.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (selectedActivity) {
      updateMutation.mutate({
        id: selectedActivity.id,
        data: editData,
      })
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setSelectedActivity(null)
    setEditData({})
  }

  const handleCreateClick = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSave = () => {
    createMutation.mutate(createData)
  }

  const handleCreateCancel = () => {
    setIsCreateModalOpen(false)
    setCreateData({
      name: '',
      description: '',
      is_active: true,
    })
  }

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Activities</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading activities...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Activities</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading activities: {(error as Error).message}</div>
          </div>
        </div>
      </div>
    )
  }

  const activities = data?.data?.activities || []

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Activities</h1>
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Create Activity
        </button>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="border border-gray-200 rounded-lg overflow-hidden bg-white cursor-pointer hover:bg-gray-50"
            onClick={() => handleRowClick(activity)}
          >
            {activity.image_url && (
              <img src={activity.image_url} alt={activity.name} className="h-40 w-full object-cover" />
            )}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {activity.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <div className="text-xs text-gray-500">
                <span>Category: {activity.category_name}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">Type:</span> {activity.activity_type}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">Level:</span> {activity.difficulty_level}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="font-medium">Participants:</span> {activity.min_participants} - {activity.max_participants}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">No activities found</div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Activity: {selectedActivity.name}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <Switch
                    checked={editData.is_active || false}
                    onCheckedChange={(checked) => setEditData({ ...editData, is_active: Boolean(checked) })}
                    id="edit-active"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Activity
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="Enter activity name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="flex items-center">
                  <Switch
                    checked={createData.is_active}
                    onCheckedChange={(checked) => setCreateData({ ...createData, is_active: Boolean(checked) })}
                    id="create-active"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleCreateCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSave}
                disabled={createMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitiesPage


