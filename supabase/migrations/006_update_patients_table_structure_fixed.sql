-- Update patients table to add missing fields (checking for existing columns first)
-- This migration adds individual columns instead of using JSONB

-- Add individual address fields instead of JSONB (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'street_address') THEN
        ALTER TABLE patients ADD COLUMN street_address text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'city') THEN
        ALTER TABLE patients ADD COLUMN city text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'province') THEN
        ALTER TABLE patients ADD COLUMN province text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'postal_code') THEN
        ALTER TABLE patients ADD COLUMN postal_code text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'country') THEN
        ALTER TABLE patients ADD COLUMN country text DEFAULT 'South Africa';
    END IF;
END $$;

-- Add individual emergency contact fields instead of JSONB (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_relationship') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_relationship text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_phone text;
    END IF;
END $$;

-- Add document upload fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'id_document_url') THEN
        ALTER TABLE patients ADD COLUMN id_document_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medical_aid_card_url') THEN
        ALTER TABLE patients ADD COLUMN medical_aid_card_url text;
    END IF;
END $$;

-- Add gender field (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'gender') THEN
        ALTER TABLE patients ADD COLUMN gender text;
    END IF;
END $$;

-- Migrate existing JSONB data to individual columns (if any exists)
UPDATE patients 
SET 
    street_address = COALESCE(address->>'street', street_address, ''),
    city = COALESCE(address->>'city', city, ''),
    province = COALESCE(address->>'province', province, ''),
    postal_code = COALESCE(address->>'postal_code', postal_code, ''),
    emergency_contact_name = COALESCE(emergency_contact->>'name', emergency_contact_name, ''),
    emergency_contact_relationship = COALESCE(emergency_contact->>'relationship', emergency_contact_relationship, ''),
    emergency_contact_phone = COALESCE(emergency_contact->>'phone', emergency_contact_phone, '')
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL;

-- Drop the old JSONB columns after migration (only if they exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'address') THEN
        ALTER TABLE patients DROP COLUMN address;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
        ALTER TABLE patients DROP COLUMN emergency_contact;
    END IF;
END $$;

-- Create index on user_id for performance (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_user_id_idx') THEN
        CREATE INDEX patients_user_id_idx ON patients(user_id);
    END IF;
END $$;

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Allow registration" ON patients;
DROP POLICY IF EXISTS "Allow patient registration" ON patients;
DROP POLICY IF EXISTS "Allow patient data access" ON patients;
DROP POLICY IF EXISTS "Allow patient updates" ON patients;
DROP POLICY IF EXISTS "Allow patient deletion" ON patients;

-- Create new RLS policies using user_id
CREATE POLICY "Patients can view own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow patient registration" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow patient updates" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow patient deletion" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set user_id on insert (replace if exists)
CREATE OR REPLACE FUNCTION set_user_id_on_patient_insert()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id (replace if exists)
DROP TRIGGER IF EXISTS set_patient_user_id ON patients;
CREATE TRIGGER set_patient_user_id
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_patient_insert();

-- Add constraints (only if they don't exist)
DO $$ 
BEGIN
    -- Valid province constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_province') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_province CHECK (
            province IN (
                'Eastern Cape',
                'Free State', 
                'Gauteng',
                'KwaZulu-Natal',
                'Limpopo',
                'Mpumalanga',
                'North West',
                'Northern Cape',
                'Western Cape'
            )
        );
    END IF;
    
    -- Valid postal code constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_postal_code') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_postal_code CHECK (postal_code ~ '^\d{4}$');
    END IF;
    
    -- Valid phone constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_phone') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_phone CHECK (phone ~ '^(\+27|0)[6-8][0-9]{8}$');
    END IF;
    
    -- Valid emergency phone constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_emergency_phone') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_emergency_phone CHECK (emergency_contact_phone ~ '^(\+27|0)[6-8][0-9]{8}$');
    END IF;
END $$;

-- Create additional indexes for commonly queried fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_email_partial_idx') THEN
        CREATE INDEX patients_email_partial_idx ON patients(email) WHERE email IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_phone_partial_idx') THEN
        CREATE INDEX patients_phone_partial_idx ON patients(phone) WHERE phone IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_province_partial_idx') THEN
        CREATE INDEX patients_province_partial_idx ON patients(province) WHERE province IS NOT NULL;
    END IF;
END $$;

-- Add table and column comments
COMMENT ON TABLE patients IS 'Updated patients table with individual columns for better data management';
COMMENT ON COLUMN patients.user_id IS 'Links patient record to authenticated user';
COMMENT ON COLUMN patients.street_address IS 'Street address of patient';
COMMENT ON COLUMN patients.city IS 'City of patient residence';
COMMENT ON COLUMN patients.province IS 'South African province';
COMMENT ON COLUMN patients.postal_code IS '4-digit South African postal code';
COMMENT ON COLUMN patients.id_document_url IS 'URL to uploaded ID document';
COMMENT ON COLUMN patients.medical_aid_card_url IS 'URL to uploaded medical aid card';

-- Show final table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;