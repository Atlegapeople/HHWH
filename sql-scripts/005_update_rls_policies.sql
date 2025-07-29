-- Update RLS policies to work properly with user_id
-- This ensures users can only access their own patient records

-- First, let's see what policies currently exist
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';

-- Drop all existing patient policies to start fresh
DROP POLICY IF EXISTS "Patients can view own data" ON patients;
DROP POLICY IF EXISTS "Allow registration" ON patients;
DROP POLICY IF EXISTS "Allow patient registration" ON patients;
DROP POLICY IF EXISTS "Allow patient data access" ON patients;
DROP POLICY IF EXISTS "Allow patient updates" ON patients;
DROP POLICY IF EXISTS "Allow patient deletion" ON patients;

-- Create new RLS policies using user_id for proper authentication
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
    -- Set user_id from authenticated user if not already set
    IF NEW.user_id IS NULL THEN
        NEW.user_id = auth.uid();
    END IF;
    
    -- Validate that user_id matches authenticated user (security check)
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot create patient record for different user';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user_id
DROP TRIGGER IF EXISTS set_patient_user_id ON patients;
CREATE TRIGGER set_patient_user_id
    BEFORE INSERT ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_user_id_on_patient_insert();

-- Verify the new policies are in place
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';

-- Test that RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'patients';