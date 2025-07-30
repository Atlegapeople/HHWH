-- Update doctors table to support different practitioner types
ALTER TABLE doctors 
ADD COLUMN IF NOT EXISTS practitioner_type text CHECK (practitioner_type IN ('gp', 'auxiliary', 'dietitian', 'counsellor', 'biokineticist', 'specialist')) DEFAULT 'gp',
ADD COLUMN IF NOT EXISTS registration_number text, -- Generic registration number (HPCSA, SADC, etc.)
ADD COLUMN IF NOT EXISTS registration_body text, -- Which body they're registered with
ADD COLUMN IF NOT EXISTS consultation_types text[] DEFAULT ARRAY['package_consultation', 'individual_consultation'],
ADD COLUMN IF NOT EXISTS package_consultation_fee numeric, -- Fee for package consultations
ADD COLUMN IF NOT EXISTS individual_consultation_fee numeric; -- Fee for individual consultations

-- Update existing consultation_fee to be individual_consultation_fee for backwards compatibility
UPDATE doctors 
SET 
    individual_consultation_fee = COALESCE(individual_consultation_fee, consultation_fee),
    package_consultation_fee = COALESCE(package_consultation_fee, consultation_fee)
WHERE individual_consultation_fee IS NULL OR package_consultation_fee IS NULL;

-- Rename hpcsa_number to be more generic (only if it exists and target doesn't exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'hpcsa_number') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'primary_registration_number') THEN
        ALTER TABLE doctors RENAME COLUMN hpcsa_number TO primary_registration_number;
    END IF;
END $$;

-- Add index for practitioner type filtering
CREATE INDEX IF NOT EXISTS doctors_practitioner_type_idx ON doctors(practitioner_type, is_active);
CREATE INDEX IF NOT EXISTS doctors_consultation_types_idx ON doctors USING GIN(consultation_types);

-- Insert sample auxiliary practitioners for demo (avoid duplicates)
DO $$
BEGIN
    -- Insert Sarah Johnson (Dietitian)
    IF NOT EXISTS (SELECT 1 FROM doctors WHERE full_name = 'Sarah Johnson' AND practitioner_type = 'dietitian') THEN
        INSERT INTO doctors (
            full_name, 
            practitioner_type, 
            specialization, 
            qualification, 
            registration_number,
            registration_body,
            package_consultation_fee, 
            individual_consultation_fee,
            bio,
            consultation_types
        ) VALUES (
            'Sarah Johnson', 
            'dietitian', 
            'Clinical Nutrition', 
            'BSc Dietetics, MSc Clinical Nutrition', 
            'DN12345',
            'ASGCA',
            450.00, 
            500.00,
            'Specialized in hormone-related nutrition and metabolic health for women.',
            ARRAY['package_consultation', 'individual_consultation', 'cgm_support']
        );
    END IF;

    -- Insert Dr. Michelle Roberts (Counsellor)
    IF NOT EXISTS (SELECT 1 FROM doctors WHERE full_name = 'Dr. Michelle Roberts' AND practitioner_type = 'counsellor') THEN
        INSERT INTO doctors (
            full_name, 
            practitioner_type, 
            specialization, 
            qualification, 
            registration_number,
            registration_body,
            package_consultation_fee, 
            individual_consultation_fee,
            bio,
            consultation_types
        ) VALUES (
            'Dr. Michelle Roberts', 
            'counsellor', 
            'Women''s Mental Health', 
            'PhD Clinical Psychology', 
            'PS67890',
            'HPCSA',
            550.00, 
            650.00,
            'Specializing in hormonal transitions and women''s mental health support.',
            ARRAY['package_consultation', 'individual_consultation', 'hormone_counselling']
        );
    END IF;

    -- Insert Jessica Williams (Biokineticist)
    IF NOT EXISTS (SELECT 1 FROM doctors WHERE full_name = 'Jessica Williams' AND practitioner_type = 'biokineticist') THEN
        INSERT INTO doctors (
            full_name, 
            practitioner_type, 
            specialization, 
            qualification, 
            registration_number,
            registration_body,
            package_consultation_fee, 
            individual_consultation_fee,
            bio,
            consultation_types
        ) VALUES (
            'Jessica Williams', 
            'biokineticist', 
            'Women''s Exercise Physiology', 
            'BSc Biokinetics (Hons)', 
            'BK11223',
            'SAAB',
            400.00, 
            450.00,
            'Exercise specialist focusing on hormonal health and fitness for women over 35.',
            ARRAY['package_consultation', 'individual_consultation', 'exercise_programs']
        );
    END IF;

    -- Insert Dr. Amanda Foster (Auxiliary)
    IF NOT EXISTS (SELECT 1 FROM doctors WHERE full_name = 'Dr. Amanda Foster' AND practitioner_type = 'auxiliary') THEN
        INSERT INTO doctors (
            full_name, 
            practitioner_type, 
            specialization, 
            qualification, 
            registration_number,
            registration_body,
            package_consultation_fee, 
            individual_consultation_fee,
            bio,
            consultation_types
        ) VALUES (
            'Dr. Amanda Foster', 
            'auxiliary', 
            'Hormone Health', 
            'MBChB, Dip in Hormone Therapy', 
            'MP55667',
            'HPCSA',
            660.00, 
            750.00,
            'Auxiliary medical practitioner specializing in hormone replacement therapy and menopause management.',
            ARRAY['package_consultation', 'individual_consultation', 'hormone_therapy']
        );
    END IF;
END $$;

-- Update existing doctors to have practitioner_type and proper fees
UPDATE doctors 
SET 
    practitioner_type = 'gp',
    registration_body = 'HPCSA',
    consultation_types = ARRAY['package_consultation', 'individual_consultation'],
    package_consultation_fee = COALESCE(package_consultation_fee, 850.00),
    individual_consultation_fee = COALESCE(individual_consultation_fee, 950.00)
WHERE practitioner_type IS NULL;

-- Handle hpcsa_number column if it still exists (copy to registration_number)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'hpcsa_number') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'doctors' AND column_name = 'registration_number') THEN
        UPDATE doctors 
        SET registration_number = COALESCE(registration_number, hpcsa_number)
        WHERE registration_number IS NULL;
    END IF;
END $$;