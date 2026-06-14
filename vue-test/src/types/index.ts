export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  user_type: 'admin' | 'internal' | 'external';
}

export interface Room {
  id: number;
  name: string;
  type: string;
  capacity: string;
  location?: string;
  facilities?: string;
  image_url?: string;
  is_active: boolean;
  price_half_day_internal?: number;
  price_full_day_internal?: number;
  price_half_day_co_organizer?: number;
  price_full_day_co_organizer?: number;
  price_half_day_external?: number;
  price_full_day_external?: number;
}

export interface RoomPricing {
  halfInternal?: number;
  fullInternal?: number;
  halfCoop?: number;
  fullCoop?: number;
  halfExternal?: number;
  fullExternal?: number;
}

export interface Booking {
  id: number;
  booking_no: string;
  user_id: number;
  room_id: number;
  organization_type: string;
  partner_name?: string;
  booking_date: string;
  time_slot: string;
  objective?: string;
  room_price: number;
  addons_price: number;
  total_price: number;
  status: string;
  promo_code?: string;
  memo_document_url?: string;
  approval_document_url?: string;
  remarks?: string;
  created_at: string;
  room_name?: string;
  room_location?: string;
  room_image?: string;
  has_feedback?: boolean;
  firstname?: string;
  lastname?: string;
}

export interface Addon {
  id: number;
  name: string;
  unit: string;
  price: number;
  is_active: boolean;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
}

export interface PromoCode {
  id: number;
  code: string;
  discount: number;
  limit_count: number;
  is_active: boolean;
  used_count?: number;
  created_at: string;
}

export interface AdminStats {
  pendingCount: number;
  approvedToday: number;
  currentMonthRevenue: number;
}

export interface RevenueByMonth {
  label: string;
  revenue: number;
}

export interface PromoValidateResponse {
  code: string;
  discount: number;
  message: string;
}

export interface ApiError {
  message: string;
  bookingId?: number;
  bookingNo?: string;
}
