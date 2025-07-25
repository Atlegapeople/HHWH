-- Script to activate a doctor after registration
-- Run this script in Supabase SQL Editor to approve and activate doctors

-- ================================================
-- OPTION 1: Activate a specific doctor by email
-- ================================================

-- Replace 'doctor@example.com' with the actual doctor's email
UPDATE doctors 
SET 
    is_active = true,
    updated_at = NOW()
WHERE email = 'thabo@atlegepaeople.co.za'  -- Change this email
AND is_active = false;

-- Verify the activation
SELECT 
    id,
    full_name,
    email,
    specialization,
    is_active,
    created_at,
    updated_at
FROM doctors 
WHERE email = 'thabo@atlegepaeople.co.za';  -- Change this email

-- ================================================
-- OPTION 2: Activate a doctor by their ID
-- ================================================

-- Uncomment and replace 'DOCTOR_ID_HERE' with actual doctor ID
-- UPDATE doctors 
-- SET 
--     is_active = true,
--     updated_at = NOW()
-- WHERE id = 'DOCTOR_ID_HERE'
-- AND is_active = false;

-- ================================================
-- OPTION 3: Show all pending doctors for approval
-- ================================================

-- View all doctors waiting for approval
SELECT 
    id,
    full_name,
    email,
    specialization,
    qualification,
    hpcsa_number,
    consultation_fee,
    is_active,
    created_at
FROM doctors 
WHERE is_active = false
ORDER BY created_at DESC;

-- ================================================
-- OPTION 4: Bulk activate multiple doctors
-- ================================================

-- Uncomment to activate all pending doctors (use with caution!)
-- UPDATE doctors 
-- SET 
--     is_active = true,
--     updated_at = NOW()
-- WHERE is_active = false;

-- ================================================
-- OPTION 5: Deactivate a doctor (if needed)
-- ================================================

-- Uncomment and replace email to deactivate a doctor
-- UPDATE doctors 
-- SET 
--     is_active = false,
--     updated_at = NOW()
-- WHERE email = 'doctor@example.com';

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Count active vs inactive doctors
SELECT 
    is_active,
    COUNT(*) as count
FROM doctors 
GROUP BY is_active;

-- Show recently activated doctors
SELECT 
    full_name,
    email,
    specialization,
    is_active,
    updated_at
FROM doctors 
WHERE is_active = true
AND updated_at >= NOW() - INTERVAL '1 day'
ORDER BY updated_at DESC;