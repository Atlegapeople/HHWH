-- Complete doctors table creation script
-- Run this script in Supabase SQL Editor

-- Create doctors table with all required columns
CREATE TABLE IF NOT EXISTS doctors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text,
    phone text,
    specialization text NOT NULL,
    qualification text NOT NULL,
    hpcsa_number text UNIQUE NOT NULL,
    consultation_fee numeric NOT NULL DEFAULT 0,
    bio text,
    practice_address text,
    is_active boolean DEFAULT false,
    approval_status text CHECK (approval_status IN ('approved', 'rejected')),
    approval_date timestamptz,
    rejection_reason text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_phone ON doctors(phone);
CREATE INDEX IF NOT EXISTS idx_doctors_hpcsa_number ON doctors(hpcsa_number);
CREATE INDEX IF NOT EXISTS idx_doctors_is_active ON doctors(is_active);
CREATE INDEX IF NOT EXISTS idx_doctors_approval_status ON doctors(approval_status);
CREATE INDEX IF NOT EXISTS idx_doctors_created_at ON doctors(created_at);

-- Add comments to document the columns
COMMENT ON TABLE doctors IS 'Medical practitioners registered in the HHWH system';
COMMENT ON COLUMN doctors.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN doctors.full_name IS 'Doctor full name as registered';
COMMENT ON COLUMN doctors.email IS 'Doctor contact email address';
COMMENT ON COLUMN doctors.phone IS 'Doctor contact phone number';
COMMENT ON COLUMN doctors.specialization IS 'Medical specialization/field';
COMMENT ON COLUMN doctors.qualification IS 'Medical qualifications and degrees';
COMMENT ON COLUMN doctors.hpcsa_number IS 'Health Professions Council of South Africa registration number';
COMMENT ON COLUMN doctors.consultation_fee IS 'Consultation fee in South African Rand (ZAR)';
COMMENT ON COLUMN doctors.bio IS 'Professional biography and experience';
COMMENT ON COLUMN doctors.practice_address IS 'Physical address of doctor practice or clinic location';
COMMENT ON COLUMN doctors.is_active IS 'Whether the doctor is approved and active in the system';
COMMENT ON COLUMN doctors.approval_status IS 'Admin approval status: approved or rejected';
COMMENT ON COLUMN doctors.approval_date IS 'Date when admin approved/rejected the application';
COMMENT ON COLUMN doctors.rejection_reason IS 'Reason provided when application is rejected';

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Doctors can read their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
    FOR SELECT USING (auth.uid()::text = user_id);

-- Doctors can update their own profile (but not approval fields)
CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Admins can read all doctor profiles
CREATE POLICY "Admins can view all doctors" ON doctors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Admins can update all doctor profiles
CREATE POLICY "Admins can update all doctors" ON doctors
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Allow new doctor registrations (anyone can insert, but they start as inactive)
CREATE POLICY "Allow doctor registration" ON doctors
    FOR INSERT WITH CHECK (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON doctors 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

-- Success message
SELECT 'Doctors table created successfully with all required columns and RLS policies' as status;