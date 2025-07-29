-- Check current patients table structure
-- Run this first to see what columns already exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Check existing indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'patients';

-- Check existing constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'patients';

-- Check existing RLS policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';