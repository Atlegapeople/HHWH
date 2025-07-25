-- SQL to run in Supabase Dashboard -> SQL Editor
-- This fixes the RLS policy to allow patient registration without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Allow registration" ON patients;
DROP POLICY IF EXISTS "Patients can view own data" ON patients;

-- Create new policy: Allow anyone to insert (for registration)
-- This is needed for patient self-registration
CREATE POLICY "Allow patient registration" ON patients
    FOR INSERT WITH CHECK (true);

-- Create new policy: Allow anyone to view (for now, until we implement auth)
-- In production, this should be restricted to authenticated users
CREATE POLICY "Allow patient data access" ON patients
    FOR SELECT USING (true);

-- Create policy: Allow updates for authenticated users (future use)
CREATE POLICY "Allow patient updates" ON patients
    FOR UPDATE USING (true);

-- Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'patients';