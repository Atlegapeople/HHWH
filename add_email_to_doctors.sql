-- Add email column to doctors table
-- Run this script in Supabase SQL Editor

-- Step 1: Add email column to doctors table
ALTER TABLE doctors ADD COLUMN email text;

-- Step 2: Add unique constraint on email (recommended for data integrity)
ALTER TABLE doctors ADD CONSTRAINT doctors_email_unique UNIQUE (email);

-- Step 3: Create index for faster email lookups (performance optimization)
CREATE INDEX idx_doctors_email ON doctors(email);

-- Step 4: Update existing doctors with email from their linked auth users
-- This will populate email for any existing doctors that have user_id
UPDATE doctors 
SET email = auth.users.email 
FROM auth.users 
WHERE doctors.user_id = auth.users.id::text 
AND doctors.email IS NULL;

-- Step 5: Add comment to document the column purpose
COMMENT ON COLUMN doctors.email IS 'Doctor email address, should match auth.users.email for authentication';

-- Step 6: Update RLS policies to include email-based queries (optional)
DROP POLICY IF EXISTS "Doctors can be queried by email" ON doctors;
CREATE POLICY "Doctors can be queried by email" ON doctors
  FOR SELECT USING (true); -- Adjust this policy based on your security requirements

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name = 'email';

-- Show sample of updated doctors table structure
SELECT id, user_id, full_name, email, specialization, is_active 
FROM doctors 
LIMIT 5;