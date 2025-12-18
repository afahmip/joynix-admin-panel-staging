export interface Service {
  id: number
  activity_name: string
  category_name: string
  skill_level: string
  service_type: string
  is_available: boolean
}

export interface User {
  id: number
  username: string
  full_name: string
  email?: string
  phone_number?: string
  profile_image_url: string
  is_talent: boolean
  is_talent_candidate: boolean
  is_verified: boolean
  roles: string[]
  is_available_for_booking: boolean
  timezone: string
  last_active_at: string
  created_at: string
  services?: Service[]
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface UsersResponse {
  status: number
  success: boolean
  message: string
  data: {
    users: User[]
    pagination: Pagination
  }
  metadata: null
}
