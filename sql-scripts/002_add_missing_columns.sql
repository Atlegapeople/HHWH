-- Add missing columns to patients table
-- Run this after checking the current structure

-- Add individual address fields (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'street_address') THEN
        ALTER TABLE patients ADD COLUMN street_address text;
        RAISE NOTICE 'Added street_address column';
    ELSE
        RAISE NOTICE 'street_address column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'city') THEN
        ALTER TABLE patients ADD COLUMN city text;
        RAISE NOTICE 'Added city column';
    ELSE
        RAISE NOTICE 'city column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'province') THEN
        ALTER TABLE patients ADD COLUMN province text;
        RAISE NOTICE 'Added province column';
    ELSE
        RAISE NOTICE 'province column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'postal_code') THEN
        ALTER TABLE patients ADD COLUMN postal_code text;
        RAISE NOTICE 'Added postal_code column';
    ELSE
        RAISE NOTICE 'postal_code column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'country') THEN
        ALTER TABLE patients ADD COLUMN country text DEFAULT 'South Africa';
        RAISE NOTICE 'Added country column';
    ELSE
        RAISE NOTICE 'country column already exists';
    END IF;
END $$;

-- Add individual emergency contact fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_name text;
        RAISE NOTICE 'Added emergency_contact_name column';
    ELSE
        RAISE NOTICE 'emergency_contact_name column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_relationship') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_relationship text;
        RAISE NOTICE 'Added emergency_contact_relationship column';
    ELSE
        RAISE NOTICE 'emergency_contact_relationship column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact_phone text;
        RAISE NOTICE 'Added emergency_contact_phone column';
    ELSE
        RAISE NOTICE 'emergency_contact_phone column already exists';
    END IF;
END $$;

-- Add document upload fields
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'id_document_url') THEN
        ALTER TABLE patients ADD COLUMN id_document_url text;
        RAISE NOTICE 'Added id_document_url column';
    ELSE
        RAISE NOTICE 'id_document_url column already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'medical_aid_card_url') THEN
        ALTER TABLE patients ADD COLUMN medical_aid_card_url text;
        RAISE NOTICE 'Added medical_aid_card_url column';
    ELSE
        RAISE NOTICE 'medical_aid_card_url column already exists';
    END IF;
END $$;

-- Add gender field (optional)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'gender') THEN
        ALTER TABLE patients ADD COLUMN gender text;
        RAISE NOTICE 'Added gender column';
    ELSE
        RAISE NOTICE 'gender column already exists';
    END IF;
END $$;