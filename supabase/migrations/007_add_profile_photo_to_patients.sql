-- Add profile_photo_url column to patients table (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'profile_photo_url') THEN
        ALTER TABLE patients ADD COLUMN profile_photo_url TEXT;
        COMMENT ON COLUMN patients.profile_photo_url IS 'URL to the patient profile photo stored in Supabase Storage';
    END IF;
END $$;