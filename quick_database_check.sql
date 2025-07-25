-- Quick Database Status Check
-- Run this in Supabase SQL Editor for a concise summary

-- 1. Essential table existence check
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') 
        THEN 'patients: ✅ EXISTS' 
        ELSE 'patients: ❌ MISSING' 
    END as patients_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') 
        THEN 'doctors: ✅ EXISTS' 
        ELSE 'doctors: ❌ MISSING' 
    END as doctors_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') 
        THEN 'appointments: ✅ EXISTS' 
        ELSE 'appointments: ❌ MISSING' 
    END as appointments_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') 
        THEN 'payments: ✅ EXISTS' 
        ELSE 'payments: ❌ MISSING' 
    END as payments_status;

-- 2. If doctors table exists, check if it has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'doctors') THEN
        RAISE NOTICE 'DOCTORS TABLE: % records found', (SELECT COUNT(*) FROM doctors);
        RAISE NOTICE 'Sample doctor: %', (SELECT full_name FROM doctors LIMIT 1);
    ELSE
        RAISE NOTICE 'DOCTORS TABLE: Missing - need to create';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'DOCTORS TABLE: Error accessing - %', SQLERRM;
END $$;

-- 3. If appointments table exists, check structure
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        RAISE NOTICE 'APPOINTMENTS TABLE: % records found', (SELECT COUNT(*) FROM appointments);
    ELSE
        RAISE NOTICE 'APPOINTMENTS TABLE: Missing - need to create';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'APPOINTMENTS TABLE: Error accessing - %', SQLERRM;
END $$;

-- 4. If payments table exists, check structure  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
        RAISE NOTICE 'PAYMENTS TABLE: % records found', (SELECT COUNT(*) FROM payments);
    ELSE
        RAISE NOTICE 'PAYMENTS TABLE: Missing - need to create';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'PAYMENTS TABLE: Error accessing - %', SQLERRM;
END $$;