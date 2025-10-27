export interface AvatarBorder {
  id?: number;
  border_type: string;
  code: string;
  description: string;
  image_url: string;
  is_hidden: boolean;
  metadata: Record<string, any>;
  name: string;
  rarity: string;
  sort_order: number;
  unlock_condition: string;
  earned_count?: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface AvatarBorderResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    data: AvatarBorder[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
  metadata: any;
}

export interface AvatarBorderDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: AvatarBorder;
  metadata: any;
}
