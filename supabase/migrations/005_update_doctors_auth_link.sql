-- Update doctors table to properly link with auth users
-- and add missing fields from our type definitions

-- Add email field to doctors table (for easier queries)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS email text;

-- Update user_id to reference auth.users
ALTER TABLE doctors DROP CONSTRAINT IF EXISTS doctors_user_id_fkey;
ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint on user_id (one doctor per auth user)
ALTER TABLE doctors ADD CONSTRAINT doctors_user_id_unique UNIQUE (user_id);

-- Add RLS policies for doctors
DROP POLICY IF EXISTS "Doctors can view their own profile" ON doctors;
CREATE POLICY "Doctors can view their own profile" ON doctors
  FOR SELECT USING (auth.uid() = user_id::uuid);

DROP POLICY IF EXISTS "Doctors can update their own profile" ON doctors;
CREATE POLICY "Doctors can update their own profile" ON doctors
  FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Function to automatically create doctor profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_doctor_signup()
RETURNS trigger AS $$
BEGIN
  -- Only create doctor profile if user has 'doctor' role
  IF NEW.raw_user_meta_data->>'role' = 'doctor' THEN
    INSERT INTO public.doctors (
      user_id,
      full_name,
      email,
      specialization,
      qualification,
      hpcsa_number,
      consultation_fee,
      bio,
      is_active
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'specialization', 'General Practitioner'),
      COALESCE(NEW.raw_user_meta_data->>'qualification', ''),
      COALESCE(NEW.raw_user_meta_data->>'hpcsa_number', ''),
      COALESCE((NEW.raw_user_meta_data->>'consultation_fee')::numeric, 850.00),
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      false -- Start as inactive until approved
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for doctor signup
DROP TRIGGER IF EXISTS on_auth_user_created_doctor ON auth.users;
CREATE TRIGGER on_auth_user_created_doctor
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_doctor_signup();

-- Update existing doctors to link with auth users (if needed)
-- This is a one-time migration script

-- Create some test doctor auth users for existing doctors
-- Note: In production, this would be handled through proper registration flow

DO $$
DECLARE
  doc_record RECORD;
  auth_user_id uuid;
BEGIN
  -- Loop through existing doctors without user_id
  FOR doc_record IN 
    SELECT * FROM doctors WHERE user_id IS NULL 
  LOOP
    -- Create a temporary auth user for testing
    -- In production, doctors would register through the proper flow
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      LOWER(REPLACE(doc_record.full_name, ' ', '.')) || '@hhwh.test',
      crypt('password123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      jsonb_build_object(
        'role', 'doctor',
        'full_name', doc_record.full_name
      )
    ) RETURNING id INTO auth_user_id;
    
    -- Link the doctor to the auth user
    UPDATE doctors 
    SET 
      user_id = auth_user_id::text,
      email = LOWER(REPLACE(doc_record.full_name, ' ', '.')) || '@hhwh.test'
    WHERE id = doc_record.id;
  END LOOP;
END $$;