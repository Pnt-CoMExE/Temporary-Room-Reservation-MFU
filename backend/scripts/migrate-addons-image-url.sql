-- Recording 5: optional image for add-ons (safe to re-run)
ALTER TABLE addons ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
