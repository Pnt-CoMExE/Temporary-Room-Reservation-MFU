# Database Schema Design

Based on the ER diagram and Data Dictionary from the Temporary Rental Space Management System of MFU.

## Tables

### 1. `users`
- `id` (serial, PK): Unique identifier for each user.
- `google_id` (varchar 255): Google account ID for OAuth.
- `firstname` (varchar 100): User's first name.
- `lastname` (varchar 100): User's last name.
- `email` (varchar 255, Unique): User's email address.
- `phone_number` (varchar 20): User's phone number.
- `user_type` (varchar 50): Type of user (e.g., admin, user).
- `profile_picture` (text): URL to the user's image.
- `created_at` (timestamp): Record creation time.

### 2. `rooms`
- `id` (serial, PK): Room ID.
- `name` (varchar 255): Room name (e.g., Meeting Room C3).
- `type` (varchar 100): Type of room.
- `status` (varchar 50): Room status (e.g., available, unavailable).
- `capacity` (integer): People capacity.
- `location` (varchar 255): Physical location.
- `image_url` (text): URL to room image.
- `is_active` (boolean): Active status.
- `created_at` (timestamp): Record creation time.

### 3. `room_pricing`
- `id` (serial, PK): Pricing ID.
- `room_id` (integer, FK): Reference to `rooms` table.
- `price_half_day_internal` (numeric 10,2): Half-day price for internal users.
- `price_full_day_internal` (numeric 10,2): Full-day price for internal users.
- `price_half_day_co_organizer` (numeric 10,2): Half-day price for co-op users.
- `price_full_day_co_organizer` (numeric 10,2): Full-day price for co-op users.
- `price_half_day_external` (numeric 10,2): Half-day price for external users.
- `price_full_day_external` (numeric 10,2): Full-day price for external users.
- `effective_date` (timestamp): Effective start date of pricing.
- `end_date` (timestamp): Effective end date of pricing.
- `is_active` (boolean): Active status.
- `created_by` (integer, FK): Reference to `users` table (Admin who created it).
- `created_at` (timestamp): Record creation time.

### 4. `bookings`
- `id` (serial, PK): Booking ID.
- `booking_no` (varchar 50, Unique): Alphanumeric booking number.
- `user_id` (integer, FK): Reference to `users` table.
- `room_id` (integer, FK): Reference to `rooms` table.
- `organization_type` (varchar 50): Internal, external, or co-organizer.
- `partner_name` (varchar 255): Partner organization name (if any).
- `proof_document_url` (text): URL to proof document.
- `booking_date` (date): Date of the booking.
- `time_slot` (varchar 50): Morning / afternoon / full-day.
- `objective` (text): Purpose of the booking.
- `room_price` (numeric 10,2): Price of the room alone.
- `addons_price` (numeric 10,2): Total price of add-ons.
- `total_price` (numeric 10,2): Overall total price.
- `status` (varchar 50): Booking status (e.g., approved, pending).
- `approved_by` (integer, FK): Admin user ID who approved.
- `approved_at` (timestamp): Time of approval.
- `memo_document_url` (text): URL/path to the attached PDF memorandum document.
- `promo_code` (varchar 50): Applied promotion discount code.
- `remarks` (text): Additional remarks.
- `created_at` (timestamp): Record creation time.
- `updated_at` (timestamp): Record update time.

### 5. `addons`
- `id` (serial, PK): Add-on ID.
- `name` (varchar 255): Name of the add-on (e.g., Projector).
- `price_per_unit` (numeric 10,2): Price per unit.
- `unit_name` (varchar 50): Unit of measurement (e.g., piece).
- `is_active` (boolean): Active status.
- `created_at` (timestamp): Record creation time.

### 6. `booking_addons`
- `id` (serial, PK): Booking Add-on ID.
- `booking_id` (integer, FK): Reference to `bookings` table.
- `addon_id` (integer, FK): Reference to `addons` table.
- `quantity` (integer): Quantity selected.
- `unit_price` (numeric 10,2): Price per unit at time of booking.
- `total_price` (numeric 10,2): Total price for this add-on.

### 7. `payments`
- `id` (serial, PK): Payment ID.
- `booking_id` (integer, FK): Reference to `bookings` table.
- `transaction_id` (varchar 100, Unique): Transaction ID from gateway.
- `amount` (numeric 10,2): Payment amount.
- `payment_method` (varchar 100): Method (e.g., promptpay).
- `status` (varchar 50): Payment status.
- `paid_at` (timestamp): Payment completion time.
- `created_at` (timestamp): Record creation time.

### 8. `feedbacks`
- `id` (serial, PK): Feedback ID.
- `booking_id` (integer, FK): Reference to `bookings` table.
- `rating` (integer): Rating (1-5).
- `comment` (text): User feedback or review.
- `created_at` (timestamp): Record creation time.

### 9. `admin_activity_logs`
- `id` (serial, PK): Activity log ID.
- `admin_name` (varchar 255): Name or identifier of the administrator performing the action.
- `action` (varchar 255): Action description (e.g., "อัปเดตสถานะการจอง").
- `details` (text): Details or parameters of the recorded activity.
- `created_at` (timestamp): Record creation time.

### 10. `promo_codes`
- `id` (serial, PK): Promo code ID.
- `code` (varchar 50, Unique): Promotional code string.
- `discount` (numeric 10,2): Discount amount or value.
- `limit_count` (integer): Usage limit count (default 100).
- `is_active` (boolean): Active status flag.

### 11. `banners`
- `id` (serial, PK): Banner ID.
- `title` (varchar 255): Banner headline or title.
- `image_url` (text): Image URL for the promo banner.
- `link` (varchar 255): Target destination route link.
- `is_active` (boolean): Active status flag.

