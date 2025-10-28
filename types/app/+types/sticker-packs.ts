import type { Sticker } from './stickers'

export interface StickerPack {
  id?: number;
  name: string;
  description: string;
  category: string;
  tags: string[];
  price_coins: number;
  is_featured: boolean;
  is_free_for_all: boolean;
  is_premium: boolean;
  is_active?: boolean;
  is_owned?: boolean;
  featured_priority?: number;
  purchase_count?: number;
  thumbnail_url?: string;
  stickers?: Sticker[];
  created_at?: number;
  updated_at?: number;
}

export interface StickerPackResponse {
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
    sticker_packs: StickerPack[];
  };
  metadata: string;
}

export interface StickerPackDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: StickerPack;
  metadata: string;
}
