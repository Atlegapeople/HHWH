-- Fix the user-profile mapping issue
-- Dr. Thabo Modise should be linked to the current user

-- First, let's see what the current auth user situation is
SELECT 
    id as user_id,
    email,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC;

-- Check current doctors table
SELECT 
    id,
    user_id,
    full_name,
    email
FROM doctors 
WHERE full_name LIKE '%Thabo%' OR full_name LIKE '%Sarah%'
ORDER BY created_at DESC;

-- Update Dr. Thabo's profile to be linked to the correct user
-- Replace 'your-actual-user-id' with the correct user ID from auth.users table
UPDATE doctors 
SET user_id = 'd2cee259-6030-4445-8e2a-eb7f4e3d7c32'::uuid
WHERE full_name = 'Dr Thabo Modise';

-- Update the email to match
UPDATE doctors 
SET email = 'thabo@atlegapeople.co.za'
WHERE full_name = 'Dr Thabo Modise';

-- Remove the Dr. Sarah profile that's incorrectly linked to this user
DELETE FROM doctors 
WHERE full_name = 'Dr. Sarah van der Merwe' 
AND user_id = 'd2cee259-6030-4445-8e2a-eb7f4e3d7c32';

-- Check the result
SELECT 
    id,
    user_id,
    full_name,
    email
FROM doctors 
WHERE user_id = 'd2cee259-6030-4445-8e2a-eb7f4e3d7c32';