// ==========================================
// Shared types for MFU Space Booking API
// ==========================================

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  name: string;
}

export interface User {
  id: number;
  google_id?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone_number?: string;
  profile_picture?: string;
  user_type: 'admin' | 'internal' | 'external';
  created_at?: Date;
  updated_at?: Date;
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
  created_at?: Date;
  updated_at?: Date;
}

export interface RoomPricing {
  id: number;
  room_id: number;
  price_half_day_internal: number;
  price_full_day_internal: number;
  price_half_day_co_organizer: number;
  price_full_day_co_organizer: number;
  price_half_day_external: number;
  price_full_day_external: number;
  is_active: boolean;
  effective_date: Date;
}

export interface RoomWithPricing extends Room {
  price_half_day_internal?: number;
  price_full_day_internal?: number;
  price_half_day_co_organizer?: number;
  price_full_day_co_organizer?: number;
  price_half_day_external?: number;
  price_full_day_external?: number;
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
  approved_by?: number;
  approved_at?: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface BookingWithDetails extends Booking {
  firstname?: string;
  lastname?: string;
  user_email?: string;
  room_name?: string;
  room_location?: string;
  feedback_rating?: number;
  feedback_comment?: string;
  has_feedback?: boolean;
  room_image?: string;
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
  image_url: string;
  image?: string;
  link?: string;
  is_active: boolean;
}

export interface PromoCode {
  id: number;
  code: string;
  discount: number;
  limit_count: number;
  is_active: boolean;
  used_count?: number;
  created_at: Date;
}

export interface Feedback {
  id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  created_at: Date;
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

export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  bookingId?: number;
  bookingNo?: string;
  count?: number;
  documentUrl?: string | null;
  imageUrl?: string;
}

export interface PromoValidateResponse {
  code: string;
  discount: number;
  message: string;
}

// Express augmentation for authenticated requests
declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}
