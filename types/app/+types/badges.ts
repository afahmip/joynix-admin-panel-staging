export interface Badge {
  id?: number;
  badge_type: string;
  code: string;
  description: string;
  image_url: string;
  is_hidden: boolean;
  name: string;
  rarity: string;
  sort_order: number;
  unlock_condition: string;
  metadata?: string;
  earned_count?: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface CreateBadgeData {
  code: string;
  name: string;
  description: string;
  badge_type: string;
  rarity: string;
  unlock_condition: string;
  sort_order: number;
  is_hidden: boolean;
  metadata: string;
  image: File | null;
}

export interface BadgeResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    data: Badge[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
  metadata: any;
}

export interface BadgeDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Badge;
  metadata: any;
}
