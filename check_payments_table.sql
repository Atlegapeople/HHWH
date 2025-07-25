-- Quick check if payments table exists and has the right structure
SELECT 
    'TABLE EXISTS' as status,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments';

-- Show structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments'
ORDER BY ordinal_position;

-- Count any existing payment records
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        RAISE NOTICE 'PAYMENTS COUNT: %', (SELECT COUNT(*) FROM payments);
    ELSE
        RAISE NOTICE 'PAYMENTS TABLE: Does not exist - need to create it';
    END IF;
END $$;