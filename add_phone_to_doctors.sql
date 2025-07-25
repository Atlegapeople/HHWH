-- Add phone column to doctors table
-- Run this script in Supabase SQL Editor

-- Step 1: Add phone column to doctors table
ALTER TABLE doctors ADD COLUMN phone text;

-- Step 2: Create index for phone lookups (optional but recommended)
CREATE INDEX idx_doctors_phone ON doctors(phone);

-- Step 3: Update existing doctors with phone from their auth user metadata (if available)
UPDATE doctors 
SET phone = auth.users.raw_user_meta_data->>'phone'
FROM auth.users 
WHERE doctors.user_id = auth.users.id::text 
AND doctors.phone IS NULL
AND auth.users.raw_user_meta_data->>'phone' IS NOT NULL;

-- Step 4: Add comment to document the column
COMMENT ON COLUMN doctors.phone IS 'Doctor contact phone number';

-- Step 5: Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name = 'phone';

-- Step 6: Show sample of updated doctors table structure
SELECT id, user_id, full_name, phone, specialization, is_active 
FROM doctors 
LIMIT 5;

-- Success message
SELECT 'Phone column successfully added to doctors table' as status;