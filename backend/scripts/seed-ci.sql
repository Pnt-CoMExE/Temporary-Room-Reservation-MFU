-- Minimal seed for CI / integration tests (idempotent)
INSERT INTO users (id, email, firstname, lastname, user_type, is_active)
VALUES
  (1, 'staff@mfu.ac.th', 'Staff', 'User', 'internal', TRUE),
  (2, 'admin@lamduan.mfu.ac.th', 'Admin', 'User', 'admin', TRUE),
  (3, 'external@gmail.com', 'External', 'User', 'external', TRUE)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  firstname = EXCLUDED.firstname,
  lastname = EXCLUDED.lastname,
  user_type = EXCLUDED.user_type,
  is_active = TRUE;

INSERT INTO rooms (id, name, type, capacity, location, is_active)
VALUES
  (1, 'Test Meeting Room', 'ห้องประชุม', 20, 'CI Building', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  is_active = TRUE;

INSERT INTO room_pricing (
  room_id,
  price_half_day_internal, price_full_day_internal,
  price_half_day_co_organizer, price_full_day_co_organizer,
  price_half_day_external, price_full_day_external,
  is_active
)
SELECT 1, 500, 1000, 800, 1500, 1200, 2000, TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM room_pricing WHERE room_id = 1 AND is_active = TRUE
);

SELECT setval(pg_get_serial_sequence('users', 'id'), GREATEST((SELECT MAX(id) FROM users), 1));
SELECT setval(pg_get_serial_sequence('rooms', 'id'), GREATEST((SELECT MAX(id) FROM rooms), 1));
