-- Add data validation constraints and performance indexes
-- Fixed version with correct constraint queries

-- Add data validation constraints (only if they don't exist)
DO $$ 
BEGIN
    -- Valid province constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_province') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_province CHECK (
            province IS NULL OR province IN (
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
        RAISE NOTICE 'Added valid_province constraint';
    ELSE
        RAISE NOTICE 'valid_province constraint already exists';
    END IF;
    
    -- Valid postal code constraint (4 digits, but allow empty for optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_postal_code') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_postal_code CHECK (
            postal_code IS NULL OR postal_code = '' OR postal_code ~ '^\d{4}$'
        );
        RAISE NOTICE 'Added valid_postal_code constraint';
    ELSE
        RAISE NOTICE 'valid_postal_code constraint already exists';
    END IF;
    
    -- Valid phone constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_phone') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_phone CHECK (
            phone IS NULL OR phone ~ '^(\+27|0)[6-8][0-9]{8}$'
        );
        RAISE NOTICE 'Added valid_phone constraint';
    ELSE
        RAISE NOTICE 'valid_phone constraint already exists';
    END IF;
    
    -- Valid emergency phone constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'patients' AND constraint_name = 'valid_emergency_phone') THEN
        ALTER TABLE patients ADD CONSTRAINT valid_emergency_phone CHECK (
            emergency_contact_phone IS NULL OR emergency_contact_phone = '' OR emergency_contact_phone ~ '^(\+27|0)[6-8][0-9]{8}$'
        );
        RAISE NOTICE 'Added valid_emergency_phone constraint';
    ELSE
        RAISE NOTICE 'valid_emergency_phone constraint already exists';
    END IF;
END $$;

-- Create performance indexes (only if they don't exist)
DO $$ 
BEGIN
    -- Index on user_id for RLS performance
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_user_id_idx') THEN
        CREATE INDEX patients_user_id_idx ON patients(user_id);
        RAISE NOTICE 'Created patients_user_id_idx';
    ELSE
        RAISE NOTICE 'patients_user_id_idx already exists';
    END IF;
    
    -- Partial indexes for commonly queried non-null fields
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_email_partial_idx') THEN
        CREATE INDEX patients_email_partial_idx ON patients(email) WHERE email IS NOT NULL;
        RAISE NOTICE 'Created patients_email_partial_idx';
    ELSE
        RAISE NOTICE 'patients_email_partial_idx already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_phone_partial_idx') THEN
        CREATE INDEX patients_phone_partial_idx ON patients(phone) WHERE phone IS NOT NULL;
        RAISE NOTICE 'Created patients_phone_partial_idx';
    ELSE
        RAISE NOTICE 'patients_phone_partial_idx already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'patients' AND indexname = 'patients_province_partial_idx') THEN
        CREATE INDEX patients_province_partial_idx ON patients(province) WHERE province IS NOT NULL;
        RAISE NOTICE 'Created patients_province_partial_idx';
    ELSE
        RAISE NOTICE 'patients_province_partial_idx already exists';
    END IF;
END $$;

-- Add table and column comments for documentation
COMMENT ON TABLE patients IS 'Patient records with individual columns for addresses and emergency contacts';
COMMENT ON COLUMN patients.user_id IS 'Links patient record to authenticated user (auth.users.id)';
COMMENT ON COLUMN patients.street_address IS 'Street address of patient residence';
COMMENT ON COLUMN patients.city IS 'City of patient residence';
COMMENT ON COLUMN patients.province IS 'South African province (validated against official list)';
COMMENT ON COLUMN patients.postal_code IS '4-digit South African postal code';
COMMENT ON COLUMN patients.country IS 'Country of residence (defaults to South Africa)';
COMMENT ON COLUMN patients.emergency_contact_name IS 'Full name of emergency contact person';
COMMENT ON COLUMN patients.emergency_contact_relationship IS 'Relationship to patient (e.g., spouse, parent)';
COMMENT ON COLUMN patients.emergency_contact_phone IS 'Phone number of emergency contact';
COMMENT ON COLUMN patients.id_document_url IS 'Supabase storage URL for uploaded ID document';
COMMENT ON COLUMN patients.medical_aid_card_url IS 'Supabase storage URL for uploaded medical aid card';

-- Show table constraints (fixed query)
SELECT 
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'patients'
AND tc.constraint_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Show check constraints specifically
SELECT 
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
WHERE cc.constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'patients'
)
ORDER BY cc.constraint_name;

-- Show all indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'patients'
ORDER BY indexname;