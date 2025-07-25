-- Complete fix for doctors table to support proper authentication
-- Run this script in Supabase SQL Editor to fix all doctor registration issues

-- ================================================
-- STEP 1: Add missing columns to doctors table
-- ================================================

-- Add email column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'email') THEN
        ALTER TABLE doctors ADD COLUMN email text;
    END IF;
END $$;

-- Add practice_address column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'practice_address') THEN
        ALTER TABLE doctors ADD COLUMN practice_address text;
    END IF;
END $$;

-- Add phone column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'doctors' AND column_name = 'phone') THEN
        ALTER TABLE doctors ADD COLUMN phone text;
    END IF;
END $$;

-- ================================================
-- STEP 2: Add constraints and indexes
-- ================================================

-- Add unique constraint on email (only if doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctors_email_unique') THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_email_unique UNIQUE (email);
    END IF;
END $$;

-- Add unique constraint on user_id (only if doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'doctors_user_id_unique') THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON doctors(is_active);

-- ================================================
-- STEP 3: Update existing data
-- ================================================

-- Update existing doctors with email from their linked auth users
UPDATE doctors 
SET email = auth.users.email 
FROM auth.users 
WHERE doctors.user_id = auth.users.id::text 
AND doctors.email IS NULL;

-- ================================================
-- STEP 4: Update RLS policies for better security
-- ================================================

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow viewing active doctors" ON doctors;
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can be queried by email" ON doctors;

-- Policy: Allow anyone to view active doctors (for patient booking)
CREATE POLICY "Allow viewing active doctors" ON doctors
    FOR SELECT USING (is_active = true);

-- Policy: Doctors can view their own profile
CREATE POLICY "Doctors can view their own profile" ON doctors
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Doctors can update their own profile
CREATE POLICY "Doctors can update their own profile" ON doctors
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Allow admin queries (you may need to adjust this based on your admin role setup)
CREATE POLICY "Allow admin access" ON doctors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ================================================
-- STEP 5: Add helpful comments
-- ================================================

COMMENT ON COLUMN doctors.email IS 'Doctor email address, must match auth.users.email for authentication';
COMMENT ON COLUMN doctors.user_id IS 'Links to auth.users.id for authentication and authorization';
COMMENT ON COLUMN doctors.practice_address IS 'Physical address of doctor practice or clinic';
COMMENT ON COLUMN doctors.phone IS 'Doctor contact phone number';
COMMENT ON COLUMN doctors.is_active IS 'Whether doctor is approved and can accept appointments';

-- ================================================
-- STEP 6: Verify the changes
-- ================================================

-- Show updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Show constraints
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'doctors';

-- Show sample data
SELECT 
    id, 
    user_id, 
    full_name, 
    email, 
    specialization, 
    is_active,
    created_at
FROM doctors 
ORDER BY created_at DESC
LIMIT 5;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Doctors table has been successfully updated with email, practice_address, and phone columns.';
    RAISE NOTICE 'All constraints and indexes have been added.';
    RAISE NOTICE 'RLS policies have been updated for better security.';
    RAISE NOTICE 'You can now use the doctor registration API successfully.';
END $$;