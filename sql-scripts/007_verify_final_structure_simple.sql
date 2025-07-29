-- Simplified verification script without array subscripting issues
-- Run this last to confirm everything is working correctly

-- Show complete table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Show all table constraints (simplified)
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'patients'
AND table_schema = 'public'
ORDER BY constraint_type, constraint_name;

-- Show check constraints specifically
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
)
ORDER BY constraint_name;

-- Show all indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'patients'
ORDER BY indexname;

-- Show RLS policies
SELECT 
    policyname,
    permissive,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients'
ORDER BY policyname;

-- Show triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'patients';

-- Count current patient records
SELECT 
    COUNT(*) as total_patients,
    COUNT(user_id) as patients_with_user_id,
    COUNT(street_address) as patients_with_address,
    COUNT(emergency_contact_name) as patients_with_emergency_contact,
    COUNT(id_document_url) as patients_with_id_document,
    COUNT(medical_aid_card_url) as patients_with_medical_aid_card
FROM patients;

-- Show sample data (without sensitive info)
SELECT 
    id,
    email,
    full_name,
    CASE 
        WHEN street_address IS NOT NULL AND street_address != '' THEN 'Has address'
        ELSE 'No address'
    END as address_status,
    CASE 
        WHEN emergency_contact_name IS NOT NULL AND emergency_contact_name != '' THEN 'Has emergency contact'
        ELSE 'No emergency contact'
    END as emergency_contact_status,
    province,
    medical_aid_scheme,
    user_id IS NOT NULL as has_user_id,
    created_at,
    updated_at
FROM patients 
ORDER BY created_at DESC
LIMIT 5;

-- Test data validation (show any constraint violations)
SELECT 
    id,
    email,
    phone,
    postal_code,
    province,
    emergency_contact_phone,
    CASE 
        WHEN phone IS NOT NULL AND phone !~ '^(\+27|0)[6-8][0-9]{8}$' THEN 'Invalid phone format'
        WHEN postal_code IS NOT NULL AND postal_code != '' AND postal_code !~ '^\d{4}$' THEN 'Invalid postal code format'
        WHEN province IS NOT NULL AND province NOT IN (
            'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
            'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
        ) THEN 'Invalid province'
        WHEN emergency_contact_phone IS NOT NULL AND emergency_contact_phone != '' 
             AND emergency_contact_phone !~ '^(\+27|0)[6-8][0-9]{8}$' THEN 'Invalid emergency phone format'
        ELSE 'Valid'
    END as validation_status
FROM patients
WHERE (phone IS NOT NULL AND phone !~ '^(\+27|0)[6-8][0-9]{8}$')
   OR (postal_code IS NOT NULL AND postal_code != '' AND postal_code !~ '^\d{4}$')
   OR (province IS NOT NULL AND province NOT IN (
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
        'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
      ))
   OR (emergency_contact_phone IS NOT NULL AND emergency_contact_phone != '' 
       AND emergency_contact_phone !~ '^(\+27|0)[6-8][0-9]{8}$');

-- Show basic table statistics (simplified)
SELECT 
    COUNT(*) as total_rows,
    COUNT(DISTINCT province) as unique_provinces,
    COUNT(DISTINCT medical_aid_scheme) as unique_medical_schemes,
    AVG(LENGTH(street_address)) as avg_address_length,
    MIN(created_at) as oldest_patient,
    MAX(created_at) as newest_patient
FROM patients;

-- Final success message
SELECT 'Patient table structure update completed successfully!' as status;