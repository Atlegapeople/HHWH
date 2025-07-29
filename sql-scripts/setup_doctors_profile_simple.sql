-- Simple doctors table setup script without complex type casting
-- This version focuses on the essential structure needed for the profile page

-- Create or modify doctors table with proper structure
CREATE TABLE IF NOT EXISTS doctors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT NOT NULL DEFAULT 'General Practitioner',
    qualification TEXT,
    hpcsa_number TEXT,
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

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'doctors_user_id_unique' 
        AND table_name = 'doctors'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint on user_id';
    ELSE
        RAISE NOTICE 'Unique constraint on user_id already exists';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_hpcsa ON doctors(hpcsa_number);
CREATE INDEX IF NOT EXISTS idx_doctors_active ON doctors(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can insert their own profile" ON doctors;
DROP POLICY IF EXISTS "Public can view active doctors" ON doctors;

-- Create simple RLS policies using text comparison to avoid type issues
CREATE POLICY "Doctors can view their own profile"
    ON doctors FOR SELECT
    USING (user_id::text = auth.uid()::text);

CREATE POLICY "Doctors can update their own profile"
    ON doctors FOR UPDATE
    USING (user_id::text = auth.uid()::text);

CREATE POLICY "Doctors can insert their own profile"
    ON doctors FOR INSERT
    WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Public can view active doctors"
    ON doctors FOR SELECT
    USING (is_active = true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON doctors TO authenticated;
GRANT SELECT ON doctors TO anon;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Doctors table setup completed successfully!';
    RAISE NOTICE 'You can now use the doctor profile page to create/update profiles.';
END $$;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show existing doctors (if any)
SELECT 
    id, 
    user_id, 
    full_name, 
    email, 
    specialization, 
    is_active, 
    created_at 
FROM doctors 
ORDER BY created_at DESC;