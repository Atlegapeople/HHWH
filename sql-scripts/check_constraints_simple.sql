-- Simple script to check existing constraints on patients table

-- Show all table constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'patients'
AND table_schema = 'public'
ORDER BY constraint_type, constraint_name;

-- Show check constraints with their definitions
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_schema = 'public'
AND constraint_name IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'patients'
    AND constraint_type = 'CHECK'
);

-- Show indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'patients'
ORDER BY indexname;

-- Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;