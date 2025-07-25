-- HHWH Online Clinic - Database Inspection Script
-- Run this in your Supabase Dashboard -> SQL Editor to check current database state

-- ==============================================
-- 1. CHECK EXISTING TABLES
-- ==============================================
SELECT 
    'EXISTING TABLES' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ==============================================
-- 2. CHECK FOR REQUIRED TABLES
-- ==============================================
SELECT 
    'TABLE EXISTENCE CHECK' as section,
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('patients'),
        ('doctors'), 
        ('appointments'),
        ('payments')
) AS required_tables(table_name);

-- ==============================================
-- 3. DETAILED COLUMN INSPECTION
-- ==============================================

-- Check patients table structure (if exists)
SELECT 
    'PATIENTS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'patients'
ORDER BY ordinal_position;

-- Check doctors table structure (if exists)
SELECT 
    'DOCTORS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'doctors'
ORDER BY ordinal_position;

-- Check appointments table structure (if exists)
SELECT 
    'APPOINTMENTS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'appointments'
ORDER BY ordinal_position;

-- Check payments table structure (if exists)
SELECT 
    'PAYMENTS TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments'
ORDER BY ordinal_position;

-- ==============================================
-- 4. CHECK TABLE RELATIONSHIPS (FOREIGN KEYS)
-- ==============================================
SELECT 
    'FOREIGN KEY CONSTRAINTS' as section,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==============================================
-- 5. CHECK ROW LEVEL SECURITY STATUS
-- ==============================================
SELECT 
    'ROW LEVEL SECURITY STATUS' as section,
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('patients', 'doctors', 'appointments', 'payments')
ORDER BY tablename;

-- ==============================================
-- 6. CHECK EXISTING DATA COUNTS
-- ==============================================

-- Count patients (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        RAISE NOTICE 'PATIENTS COUNT: %', (SELECT COUNT(*) FROM patients);
    ELSE
        RAISE NOTICE 'PATIENTS TABLE: Does not exist';
    END IF;
END $$;

-- Count doctors (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
        RAISE NOTICE 'DOCTORS COUNT: %', (SELECT COUNT(*) FROM doctors);
    ELSE
        RAISE NOTICE 'DOCTORS TABLE: Does not exist';
    END IF;
END $$;

-- Count appointments (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        RAISE NOTICE 'APPOINTMENTS COUNT: %', (SELECT COUNT(*) FROM appointments);
    ELSE
        RAISE NOTICE 'APPOINTMENTS TABLE: Does not exist';
    END IF;
END $$;

-- Count payments (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        RAISE NOTICE 'PAYMENTS COUNT: %', (SELECT COUNT(*) FROM payments);
    ELSE
        RAISE NOTICE 'PAYMENTS TABLE: Does not exist';
    END IF;
END $$;

-- ==============================================
-- 7. CHECK INDEXES
-- ==============================================
SELECT 
    'EXISTING INDEXES' as section,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN ('patients', 'doctors', 'appointments', 'payments')
ORDER BY tablename, indexname;

-- ==============================================
-- 8. SUMMARY REPORT
-- ==============================================
SELECT 
    'DATABASE SUMMARY' as section,
    'Total Tables' as metric,
    COUNT(*)::text as value
FROM information_schema.tables 
WHERE table_schema = 'public'

UNION ALL

SELECT 
    'DATABASE SUMMARY' as section,
    'Required Tables Missing' as metric,
    (4 - COUNT(*))::text as value
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('patients', 'doctors', 'appointments', 'payments');

-- ==============================================
-- INSTRUCTIONS FOR NEXT STEPS
-- ==============================================
SELECT 
    'NEXT STEPS' as section,
    'After reviewing the results above:' as instruction,
    '1. Check which tables are missing (❌)' as step_1,
    '2. Review existing table structures' as step_2,
    '3. I will create targeted SQL for missing pieces' as step_3;