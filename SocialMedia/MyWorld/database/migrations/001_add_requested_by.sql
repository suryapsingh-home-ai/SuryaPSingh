-- Migration: add requested_by to friendships (for existing databases)
-- Run: psql -U postgres -d myworld -f database/migrations/001_add_requested_by.sql

ALTER TABLE friendships
  ADD COLUMN IF NOT EXISTS requested_by INTEGER;

UPDATE friendships
SET requested_by = user_id_1
WHERE requested_by IS NULL;

ALTER TABLE friendships
  ALTER COLUMN requested_by SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friendships_requested_by_fkey'
  ) THEN
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_requested_by_fkey
      FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
