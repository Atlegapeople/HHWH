-- Update patients table to add missing fields and improve structure
-- This migration adds individual columns instead of using JSONB

-- Add user_id column to link patients to authenticated users
ALTER TABLE patients 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Add individual address fields instead of JSONB
ALTER TABLE patients 
ADD COLUMN street_address text,
ADD COLUMN city text,
ADD COLUMN province text,
ADD COLUMN postal_code text,
ADD COLUMN country text DEFAULT 'South Africa';

-- Add individual emergency contact fields instead of JSONB
ALTER TABLE patients 
ADD COLUMN emergency_contact_name text,
ADD COLUMN emergency_contact_relationship text,
ADD COLUMN emergency_contact_phone text;

-- Add document upload fields
ALTER TABLE patients 
ADD COLUMN id_document_url text,
ADD COLUMN medical_aid_card_url text;

-- Add gender field
ALTER TABLE patients 
ADD COLUMN gender text;

-- Make some fields not null for data integrity
ALTER TABLE patients 
ALTER COLUMN street_address SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN province SET NOT NULL,
ALTER COLUMN postal_code SET NOT NULL,
ALTER COLUMN emergency_contact_name SET NOT NULL,
ALTER COLUMN emergency_contact_relationship SET NOT NULL,
ALTER COLUMN emergency_contact_phone SET NOT NULL;

-- Create index on user_id for performance
CREATE INDEX patients_user_id_idx ON patients(user_id);

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Allow registration" ON patients;
DROP POLICY IF EXISTS "Allow patient registration" ON patients;
DROP POLICY IF EXISTS "Allow patient data access" ON patients;
DROP POLICY IF EXISTS "Allow patient updates" ON patients;

-- Create new RLS policies using user_id
CREATE POLICY "Patients can view own data" ON patients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow patient registration" ON patients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow patient updates" ON patients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow patient deletion" ON patients
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id_on_patient_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.user_id = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id
DROP TRIGGER IF EXISTS set_patient_user_id ON patients;
CREATE TRIGGER set_patient_user_id
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_patient_insert();

-- Migrate existing JSONB data to individual columns (if any exists)
UPDATE patients 
SET 
    street_address = COALESCE(address->>'street', ''),
    city = COALESCE(address->>'city', ''),
    province = COALESCE(address->>'province', ''),
    postal_code = COALESCE(address->>'postal_code', ''),
    emergency_contact_name = COALESCE(emergency_contact->>'name', ''),
    emergency_contact_relationship = COALESCE(emergency_contact->>'relationship', ''),
    emergency_contact_phone = COALESCE(emergency_contact->>'phone', '')
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL;

-- Drop the old JSONB columns after migration
ALTER TABLE patients 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS emergency_contact;

-- Add constraint to ensure valid provinces
ALTER TABLE patients 
ADD CONSTRAINT valid_province CHECK (
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

-- Add constraint for postal code format (4 digits)
ALTER TABLE patients 
ADD CONSTRAINT valid_postal_code CHECK (postal_code ~ '^\d{4}$');

-- Add constraint for phone number format
ALTER TABLE patients 
ADD CONSTRAINT valid_phone CHECK (phone ~ '^(\+27|0)[6-8][0-9]{8}$');

ALTER TABLE patients 
ADD CONSTRAINT valid_emergency_phone CHECK (emergency_contact_phone ~ '^(\+27|0)[6-8][0-9]{8}$');

-- Create indexes for commonly queried fields
CREATE INDEX patients_email_idx ON patients(email) WHERE email IS NOT NULL;
CREATE INDEX patients_phone_idx ON patients(phone) WHERE phone IS NOT NULL;
CREATE INDEX patients_province_idx ON patients(province) WHERE province IS NOT NULL;

-- Verify the table structure
COMMENT ON TABLE patients IS 'Updated patients table with individual columns for better data management';
COMMENT ON COLUMN patients.user_id IS 'Links patient record to authenticated user';
COMMENT ON COLUMN patients.street_address IS 'Street address of patient';
COMMENT ON COLUMN patients.city IS 'City of patient residence';
COMMENT ON COLUMN patients.province IS 'South African province';
COMMENT ON COLUMN patients.postal_code IS '4-digit South African postal code';
COMMENT ON COLUMN patients.id_document_url IS 'URL to uploaded ID document';
COMMENT ON COLUMN patients.medical_aid_card_url IS 'URL to uploaded medical aid card';