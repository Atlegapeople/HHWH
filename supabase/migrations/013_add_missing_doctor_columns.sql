-- Add missing columns to doctors table for prescriptions functionality
-- This migration adds practice_name and practice_address columns

-- Add practice_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'practice_name') THEN
        ALTER TABLE doctors ADD COLUMN practice_name text;
    END IF;
END $$;

-- Add practice_address column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'practice_address') THEN
        ALTER TABLE doctors ADD COLUMN practice_address text;
    END IF;
END $$;

-- Update existing doctors with default practice information
UPDATE doctors 
SET 
    practice_name = COALESCE(practice_name, 'HHWH Online Clinic'),
    practice_address = COALESCE(practice_address, 'Cape Town, South Africa')
WHERE practice_name IS NULL OR practice_address IS NULL;

-- Add index for faster practice-based queries
CREATE INDEX IF NOT EXISTS doctors_practice_name_idx ON doctors(practice_name);

-- Update specific doctors with their practice information if needed
-- (This can be customized based on actual doctor data)

COMMENT ON COLUMN doctors.practice_name IS 'Name of the medical practice or clinic where the doctor works';
COMMENT ON COLUMN doctors.practice_address IS 'Full address of the medical practice or clinic';