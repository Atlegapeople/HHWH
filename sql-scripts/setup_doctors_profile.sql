-- Setup doctors table for profile management
-- This script ensures the doctors table has the proper structure and constraints

-- First, let's see the current structure and then modify as needed
-- Check if doctors table exists and its current structure

-- Drop existing doctors table if it exists (BE CAREFUL - this will delete data)
-- Only uncomment the next line if you want to start fresh
-- DROP TABLE IF EXISTS doctors CASCADE;

-- Create or modify doctors table with proper structure
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT NOT NULL DEFAULT 'General Practitioner',
    qualification TEXT,
    hpcsa_number TEXT UNIQUE,
    consultation_fee DECIMAL(10,2) DEFAULT 850.00,
    bio TEXT,
    practice_address TEXT,
    profile_photo_url TEXT,
    available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday'],
    available_hours JSONB DEFAULT '{"start": "08:00", "end": "17:00"}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique constraint on user_id (required for upsert)
DO $$ 
BEGIN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctors_user_id_unique' 
        AND table_name = 'doctors'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hpcsa ON doctors(hpcsa_number);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON doctors;
DROP POLICY IF EXISTS "Admins can view all doctor profiles" ON doctors;
DROP POLICY IF EXISTS "Public can view approved active doctors" ON doctors;

-- Create RLS policies
-- Doctors can view their own profile
CREATE POLICY "Doctors can view their own profile"
    ON doctors FOR SELECT
    USING (auth.uid()::uuid = user_id);

-- Doctors can update their own profile  
CREATE POLICY "Doctors can update their own profile"
    ON doctors FOR UPDATE
    USING (auth.uid()::uuid = user_id);

-- Doctors can insert their own profile
CREATE POLICY "Doctors can insert their own profile"
    ON doctors FOR INSERT
    WITH CHECK (auth.uid()::uuid = user_id);

-- Admins can view all doctor profiles (assumes admin role exists)
CREATE POLICY "Admins can view all doctor profiles"
    ON doctors FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()::uuid
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Public can view active doctors (for patient booking)
CREATE POLICY "Public can view active doctors"
    ON doctors FOR SELECT
    USING (is_active = true);

-- Insert sample doctor data if no doctors exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM doctors LIMIT 1) THEN
        -- Insert sample doctor (you may need to adjust the user_id)
        -- Get a real user_id from auth.users table, or skip sample data
        IF EXISTS (SELECT 1 FROM auth.users WHERE id = 'a5c586a8-4366-4560-884d-7c3b5c379fa9'::uuid) THEN
            INSERT INTO doctors (
                user_id,
                full_name,
                email,
                phone,
                specialization,
                qualification,
                hpcsa_number,
                consultation_fee,
                bio,
                practice_address,
                is_active
            ) VALUES (
                'a5c586a8-4366-4560-884d-7c3b5c379fa9'::uuid,
            'Dr. Sarah van der Merwe',
            'sarah.vandermerwe@hhwh.co.za',
            '+27 11 234 5678',
            'Gynaecologist',
            'MBChB, FCOG(SA)',
            'HP123456',
            850.00,
                'Dr. Sarah van der Merwe is a qualified gynaecologist with over 15 years of experience in women''s health. She specializes in hormone therapy, menopause management, and reproductive health. Dr. van der Merwe is passionate about providing personalized care and helping women navigate their health journey with confidence.',
                '123 Medical Centre, Sandton, Johannesburg',
                true
            );
            RAISE NOTICE 'Sample doctor data inserted';
        ELSE
            RAISE NOTICE 'User ID not found in auth.users table - skipping sample data';
        END IF;
    ELSE
        RAISE NOTICE 'Doctors table already contains data';
    END IF;
END $$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON doctors TO authenticated;
GRANT SELECT ON doctors TO anon;

-- Display final table structure (using standard SQL instead of psql \d command)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Show all doctors
SELECT id, user_id, full_name, email, specialization, is_active, created_at 
FROM doctors;