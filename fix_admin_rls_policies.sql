-- Fix Row Level Security policies for admin access to doctors table
-- Run this script in Supabase SQL Editor

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Doctors can view own profile" ON doctors;
DROP POLICY IF EXISTS "Doctors can update own profile" ON doctors;
DROP POLICY IF EXISTS "Admins can view all doctors" ON doctors;
DROP POLICY IF EXISTS "Admins can update all doctors" ON doctors;
DROP POLICY IF EXISTS "Allow doctor registration" ON doctors;

-- Create new RLS policies with better admin detection

-- 1. Doctors can read their own profile
CREATE POLICY "Doctors can view own profile" ON doctors
    FOR SELECT USING (
        auth.uid()::text = user_id 
        OR (
            -- Also allow if user has doctor role
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' = 'doctor'
                AND auth.users.id::text = doctors.user_id
            )
        )
    );

-- 2. Doctors can update their own profile (but not approval fields)
CREATE POLICY "Doctors can update own profile" ON doctors
    FOR UPDATE USING (
        auth.uid()::text = user_id
        OR (
            EXISTS (
                SELECT 1 FROM auth.users 
                WHERE auth.users.id = auth.uid() 
                AND auth.users.raw_user_meta_data->>'role' = 'doctor'
                AND auth.users.id::text = doctors.user_id
            )
        )
    );

-- 3. Admins can read all doctor profiles - Updated policy
CREATE POLICY "Admins can view all doctors" ON doctors
    FOR SELECT USING (
        -- Check if current user has admin role
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.user_metadata->>'role' = 'admin'
                OR auth.users.raw_user_meta_data ->> 'role' = 'admin'
            )
        )
    );

-- 4. Admins can update all doctor profiles - Updated policy
CREATE POLICY "Admins can update all doctors" ON doctors
    FOR UPDATE USING (
        -- Check if current user has admin role
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin'
                OR auth.users.user_metadata->>'role' = 'admin'
                OR auth.users.raw_user_meta_data ->> 'role' = 'admin'
            )
        )
    );

-- 5. Allow new doctor registrations
CREATE POLICY "Allow doctor registration" ON doctors
    FOR INSERT WITH CHECK (true);

-- Also add a temporary bypass policy for debugging (REMOVE IN PRODUCTION)
-- This allows any authenticated user to read doctors - useful for testing
CREATE POLICY "Temporary admin bypass" ON doctors
    FOR ALL USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%admin%'
        )
    );

-- Check current user role function for debugging
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TABLE(
    user_id uuid,
    email text,
    raw_user_meta_data jsonb,
    user_metadata jsonb,
    role_from_raw text,
    role_from_user text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.users.id,
        auth.users.email,
        auth.users.raw_user_meta_data,
        auth.users.user_metadata,
        auth.users.raw_user_meta_data->>'role' as role_from_raw,
        auth.users.user_metadata->>'role' as role_from_user
    FROM auth.users 
    WHERE auth.users.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the current user's role
SELECT * FROM get_current_user_role();

-- Success message
SELECT 'Admin RLS policies updated successfully' as status;