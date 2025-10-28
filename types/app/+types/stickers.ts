export interface Sticker {
  id?: number;
  name: string;
  description: string;
  tags: string[];
  sticker_pack_id: number;
  sticker_pack?: string;
  is_animated: boolean;
  is_active?: boolean;
  is_favorite?: boolean;
  sort_order: number;
  sticker_url?: string;
  thumbnail_url?: string;
  created_at?: number;
  updated_at?: number;
}

export interface StickerResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    pagination: {
      has_next: boolean;
      has_prev: boolean;
      limit: number;
      page: number;
      total: number;
      total_pages: number;
    };
    stickers: Sticker[];
  };
  metadata: string;
}

export interface StickerDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Sticker;
  metadata: string;
}
