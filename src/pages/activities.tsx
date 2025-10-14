import { useQuery } from '@tanstack/react-query'
import { API_CONFIG, API_ENDPOINTS } from '../config/api'

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
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.ACTIVITIES}`)
  if (!response.ok) {
    throw new Error('Failed to fetch activities')
  }
  return response.json()
}

export function ActivitiesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: fetchActivities,
  })

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
      <h1 className="text-2xl font-bold">Activities</h1>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
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
    </div>
  )
}

export default ActivitiesPage


