-- Temporarily disable RLS for testing admin access
-- ONLY USE FOR TESTING - RE-ENABLE IN PRODUCTION

-- Disable RLS on doctors table
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;

-- Check if there are any doctors
SELECT COUNT(*) as total_doctors FROM doctors;

-- Show sample of doctors data
SELECT id, full_name, email, specialization, is_active, approval_status, created_at 
FROM doctors 
ORDER BY created_at DESC 
LIMIT 5;

-- Success message
SELECT 'RLS temporarily disabled for doctors table - RE-ENABLE BEFORE PRODUCTION!' as warning;