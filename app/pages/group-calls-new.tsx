import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { API_ENDPOINTS } from '../config/api'
import { apiClient } from '../lib/api-client'

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

interface Category {
  id: number
  name: string
  description: string
  icon_url: string
  color_code: string
  sort_order: number
  is_active: boolean
  metadata: unknown | null
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

interface ActivitiesResponse {
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

interface CategoriesResponse {
  status: number
  success: boolean
  message: string
  data: {
    categories: Category[]
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

interface CreateGroupCallRequest {
  activity_id: number
  category_id: number
  activity_name: string
  call_type: 'voice' | 'video'
  category_name: string
  description: string
  max_participants: number
  privacy_setting: 'public' | 'private'
  scheduled_at: string
  tags: string[]
  title: string
}

interface CreateGroupCallResponse {
  status: number
  success: boolean
  message: string
  data: {
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
    scheduled_at: string
    started_at: string | null
    ended_at: string | null
    duration_minutes: number | null
    total_gifts_received: number
    total_gift_coins_value: number
    tags: string[]
    created_at: string
    updated_at: string
  }
  metadata: unknown | null
}

async function fetchActivities(): Promise<ActivitiesResponse> {
  return apiClient.get<ActivitiesResponse>(`${API_ENDPOINTS.ACTIVITIES}`)
}

async function fetchCategories(): Promise<CategoriesResponse> {
  return apiClient.get<CategoriesResponse>(`${API_ENDPOINTS.CATEGORIES}`)
}

async function createGroupCall(data: CreateGroupCallRequest): Promise<CreateGroupCallResponse> {
  return apiClient.post<CreateGroupCallResponse>(API_ENDPOINTS.GROUP_CALL_CREATE_ADMIN, data)
}

export function GroupCallsNewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState<CreateGroupCallRequest>({
    activity_id: 0,
    category_id: 0,
    activity_name: '',
    call_type: 'voice',
    category_name: '',
    description: '',
    max_participants: 1000,
    privacy_setting: 'public',
    scheduled_at: '',
    tags: [],
    title: '',
  })

  const [tagsInput, setTagsInput] = useState('')

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const createMutation = useMutation({
    mutationFn: createGroupCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-calls'] })
      navigate('/group-calls')
    },
  })

  const handleActivityChange = (activityId: number) => {
    const activity = activitiesQuery.data?.data.activities.find(a => a.id === activityId)
    if (activity) {
      setFormData(prev => ({
        ...prev,
        activity_id: activityId,
        activity_name: activity.name,
        category_id: activity.category_id,
        category_name: activity.category_name,
      }))
    }
  }

  const handleCategoryChange = (categoryId: number) => {
    const category = categoriesQuery.data?.data.categories.find(c => c.id === categoryId)
    if (category) {
      setFormData(prev => ({
        ...prev,
        category_id: categoryId,
        category_name: category.name,
      }))
    }
  }

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value.split(',').map(t => t.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    
    if (!formData.activity_id) {
      alert('Activity is required')
      return
    }
    
    if (!formData.category_id) {
      alert('Category is required')
      return
    }
    
    if (!formData.scheduled_at.trim()) {
      alert('Scheduled date and time is required')
      return
    }

    // Convert datetime-local to ISO string
    const submitData = {
      ...formData,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
    }

    createMutation.mutate(submitData)
  }

  const handleCancel = () => {
    navigate('/group-calls')
  }

  if (activitiesQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Create Group Call</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  if (activitiesQuery.error || categoriesQuery.error) {
    return (
      <div>
        <h1 className="text-2xl font-bold">Create Group Call</h1>
        <div className="mt-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading data</div>
          </div>
        </div>
      </div>
    )
  }

  const activities = activitiesQuery.data?.data.activities || []
  const categories = categoriesQuery.data?.data.categories || []

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create Group Call</h1>
      </div>

      <div className="mt-6">
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group call title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.activity_id}
                  onChange={(e) => handleActivityChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select an activity</option>
                  {activities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name} ({activity.category_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleCategoryChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Call Type</label>
                <select
                  value={formData.call_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, call_type: e.target.value as 'voice' | 'video' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="voice">Voice</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Setting</label>
                <select
                  value={formData.privacy_setting}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy_setting: e.target.value as 'public' | 'private' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="10000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled At <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Select date and time"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Group Call'}
            </button>
          </div>

          {createMutation.error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-600">
                Error creating group call: {(createMutation.error as Error).message}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
