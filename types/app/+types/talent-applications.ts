export interface TalentApplication {
  user_id: number
  username: string
  full_name: string
  gender: string
  skill: string
  identity_card_url: string
}

export interface TalentApplicationsResponse {
  status: number
  success: boolean
  message: string
  data: {
    applications: TalentApplication[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
      has_next: boolean
      has_prev: boolean
    }
  }
  metadata: null
}

export interface TalentActionResponse {
  status: number
  success: boolean
  message: string
  data?: any
  metadata: null
}
