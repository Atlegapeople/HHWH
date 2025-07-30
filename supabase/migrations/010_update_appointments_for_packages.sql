-- Update appointments table to support package-based bookings
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES packages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS package_consultation_id uuid REFERENCES package_consultations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS practitioner_type text CHECK (practitioner_type IN ('gp', 'auxiliary', 'dietitian', 'counsellor', 'biokineticist')) DEFAULT 'gp',
ADD COLUMN IF NOT EXISTS procedure_codes text[] DEFAULT ARRAY[]::text[], -- Medical aid procedure codes for this consultation
ADD COLUMN IF NOT EXISTS sequence_in_package integer DEFAULT 1, -- Which consultation in the package sequence
ADD COLUMN IF NOT EXISTS is_package_consultation boolean DEFAULT false; -- Identifies if this is part of a package

-- Update the consultation_type enum to include package-specific types
ALTER TABLE appointments 
DROP CONSTRAINT IF EXISTS appointments_consultation_type_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointments_consultation_type_check 
CHECK (consultation_type IN ('initial', 'follow_up', 'emergency', 'package_initial', 'package_followup', 'package_auxiliary'));

-- Add indexes for package-related queries
CREATE INDEX IF NOT EXISTS appointments_package_id_idx ON appointments(package_id);
CREATE INDEX IF NOT EXISTS appointments_package_consultation_id_idx ON appointments(package_consultation_id);
CREATE INDEX IF NOT EXISTS appointments_practitioner_type_idx ON appointments(practitioner_type);
CREATE INDEX IF NOT EXISTS appointments_package_sequence_idx ON appointments(package_id, sequence_in_package);