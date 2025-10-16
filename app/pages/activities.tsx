import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Switch } from '../components/ui/switch'

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
  return apiClient.get<ActivitiesApiResponse>(API_ENDPOINTS.ACTIVITIES)
}

export function ActivitiesPage() {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)
  const [editData, setEditData] = useState<Partial<Activity>>({})
  const [createData, setCreateData] = useState({
    name: '',
    description: '',
    image_url: '',
    category_id: 1,
    tags: [] as string[],
    difficulty_level: 'beginner',
    activity_type: 'Individual',
    requires_equipment: false,
    equipment_notes: '',
    min_participants: 1,
    max_participants: 10,
    is_active: true,
  })

  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Activity> }) => 
      apiClient.put(API_ENDPOINTS.ACTIVITY_BY_ID(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsModalOpen(false)
      setSelectedActivity(null)
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof createData) => 
      apiClient.post(API_ENDPOINTS.ACTIVITIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsCreateModalOpen(false)
      setCreateData({
        name: '',
        description: '',
        image_url: '',
        category_id: 1,
        tags: [],
        difficulty_level: 'beginner',
        activity_type: 'Individual',
        requires_equipment: false,
        equipment_notes: '',
        min_participants: 1,
        max_participants: 10,
        is_active: true,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(API_ENDPOINTS.ACTIVITY_BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      setIsDeleteModalOpen(false)
      setActivityToDelete(null)
    },
  })

  const handleRowClick = (activity: Activity) => {
    setSelectedActivity(activity)
    setEditData({
      name: activity.name,
      description: activity.description,
      image_url: activity.image_url,
      category_id: activity.category_id,
      tags: activity.tags,
      difficulty_level: activity.difficulty_level,
      activity_type: activity.activity_type,
      requires_equipment: activity.requires_equipment,
      equipment_notes: activity.equipment_notes,
      min_participants: activity.min_participants,
      max_participants: activity.max_participants,
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
      image_url: '',
      category_id: 1,
      tags: [],
      difficulty_level: 'beginner',
      activity_type: 'Individual',
      requires_equipment: false,
      equipment_notes: '',
      min_participants: 1,
      max_participants: 10,
      is_active: true,
    })
  }

  const handleDeleteClick = (activity: Activity, e: React.MouseEvent) => {
    e.stopPropagation()
    setActivityToDelete(activity)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (activityToDelete) {
      deleteMutation.mutate(activityToDelete.id)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setActivityToDelete(null)
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
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${activity.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {activity.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={(e) => handleDeleteClick(activity, e)}
                    className="px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                Delete
                  </button>
                </div>
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Activity: {selectedActivity.name}
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Image URL
                  </label>
                  <Input
                    value={editData.image_url || ''}
                    onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category ID
                  </label>
                  <Input
                    type="number"
                    value={editData.category_id || ''}
                    onChange={(e) => setEditData({ ...editData, category_id: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={editData.difficulty_level || 'beginner'}
                    onChange={(e) => setEditData({ ...editData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={editData.activity_type || 'Individual'}
                    onChange={(e) => setEditData({ ...editData, activity_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="social">Social</option>
                    <option value="individual">Individual</option>
                    <option value="casual">Casual</option>
                    <option value="competitive">Competitive</option>
                    <option value="educational">Educational</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={editData.tags?.join(', ') || ''}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Participants
                  </label>
                  <Input
                    type="number"
                    value={editData.min_participants || ''}
                    onChange={(e) => setEditData({ ...editData, min_participants: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={editData.max_participants || ''}
                    onChange={(e) => setEditData({ ...editData, max_participants: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Notes
                </label>
                <Textarea
                  value={editData.equipment_notes || ''}
                  onChange={(e) => setEditData({ ...editData, equipment_notes: e.target.value })}
                  placeholder="Any equipment requirements or notes"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <Switch
                    checked={editData.requires_equipment || false}
                    onCheckedChange={(checked) => setEditData({ ...editData, requires_equipment: Boolean(checked) })}
                    id="edit-equipment"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Equipment</span>
                </label>
                
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Activity
              </h3>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Image URL
                  </label>
                  <Input
                    value={createData.image_url}
                    onChange={(e) => setCreateData({ ...createData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category ID
                  </label>
                  <Input
                    type="number"
                    value={createData.category_id}
                    onChange={(e) => setCreateData({ ...createData, category_id: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={createData.difficulty_level}
                    onChange={(e) => setCreateData({ ...createData, difficulty_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={createData.activity_type}
                    onChange={(e) => setCreateData({ ...createData, activity_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Social">Social</option>
                    <option value="Individual">Individual</option>
                    <option value="Casual">Casual</option>
                    <option value="Competitive">Competitive</option>
                    <option value="Educational">Educational</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <Input
                    value={createData.tags.join(', ')}
                    onChange={(e) => setCreateData({ ...createData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Participants
                  </label>
                  <Input
                    type="number"
                    value={createData.min_participants}
                    onChange={(e) => setCreateData({ ...createData, min_participants: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={createData.max_participants}
                    onChange={(e) => setCreateData({ ...createData, max_participants: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment Notes
                </label>
                <Textarea
                  value={createData.equipment_notes}
                  onChange={(e) => setCreateData({ ...createData, equipment_notes: e.target.value })}
                  placeholder="Any equipment requirements or notes"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <Switch
                    checked={createData.requires_equipment}
                    onCheckedChange={(checked) => setCreateData({ ...createData, requires_equipment: Boolean(checked) })}
                    id="create-equipment"
                  />
                  <span className="ml-2 text-sm text-gray-700">Requires Equipment</span>
                </label>
                
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && activityToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Activity
              </h3>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete <strong>{activityToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
