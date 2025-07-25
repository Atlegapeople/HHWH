-- Add practice_address column to doctors table
-- Run this script in Supabase SQL Editor

-- Step 1: Add practice_address column to doctors table
ALTER TABLE doctors ADD COLUMN practice_address text;

-- Step 2: Create index for practice_address lookups (optional)
CREATE INDEX idx_doctors_practice_address ON doctors(practice_address);

-- Step 3: Add comment to document the column
COMMENT ON COLUMN doctors.practice_address IS 'Physical address of doctor practice or clinic location';

-- Step 4: Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name = 'practice_address';

-- Step 5: Show current doctors table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Step 6: Show sample of updated doctors table
SELECT id, user_id, full_name, practice_address, specialization, is_active 
FROM doctors 
LIMIT 3;

-- Success message
SELECT 'practice_address column successfully added to doctors table' as status;