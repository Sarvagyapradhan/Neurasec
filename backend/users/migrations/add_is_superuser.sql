-- Add is_superuser column to users table
ALTER TABLE users ADD COLUMN is_superuser BOOLEAN DEFAULT FALSE; 