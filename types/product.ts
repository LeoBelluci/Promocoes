export const promotionStatuses = ["active", "expired", "renewed", "inactive"] as const;

export type PromotionStatus = (typeof promotionStatuses)[number];

export interface ProductPromotion {
  id: string;
  store_id: string;
  marketplace: string;
  product_name: string;
  sku: string;
  promotion: boolean;
  ending_date: string;
  promo_code: string | null;
  image_url: string | null;
  phone_number: string;
  renewal_value: number | string;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductPromotionPayload {
  store_id: string;
  marketplace: string;
  product_name: string;
  sku: string;
  promotion: boolean;
  ending_date: string;
  promo_code?: string | null;
  image_url?: string | null;
  phone_number: string;
  renewal_value: number;
  status: PromotionStatus;
}

export interface ProductFiltersState {
  search: string;
  store_id: string;
  marketplace: string;
  product_name: string;
  sku: string;
  promo_code: string;
  promotion: string;
  status: string;
  ending_date: string;
  ending_today: boolean;
  ending_next_3_days: boolean;
  expired: boolean;
}

export interface SentMessage {
  id: string;
  product_id: string | null;
  store_id: string | null;
  marketplace: string | null;
  phone_number: string;
  message: string;
  provider: string | null;
  provider_message_id: string | null;
  status: string | null;
  trigger_type?: "manual" | "automatic" | null;
  sent_at: string;
}

export interface ProductStats {
  total: number;
  activePromotions: number;
  endingSoon: number;
  expired: number;
}
