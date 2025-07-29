-- Check the actual structure of the doctors table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for triggers on the table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'doctors';

-- Check constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'doctors'
AND table_schema = 'public';