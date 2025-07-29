-- Verify the final patients table structure and test functionality
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

-- Show all constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'patients'
ORDER BY tc.constraint_type, tc.constraint_name;

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

-- Test data validation (this should show any constraint violations)
SELECT 
    id,
    email,
    phone,
    postal_code,
    province,
    emergency_contact_phone,
    CASE 
        WHEN phone !~ '^(\+27|0)[6-8][0-9]{8}$' THEN 'Invalid phone format'
        WHEN postal_code != '' AND postal_code !~ '^\d{4}$' THEN 'Invalid postal code format'
        WHEN province IS NOT NULL AND province NOT IN (
            'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
            'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
        ) THEN 'Invalid province'
        WHEN emergency_contact_phone != '' AND emergency_contact_phone !~ '^(\+27|0)[6-8][0-9]{8}$' THEN 'Invalid emergency phone format'
        ELSE 'Valid'
    END as validation_status
FROM patients
WHERE phone !~ '^(\+27|0)[6-8][0-9]{8}$'
   OR (postal_code != '' AND postal_code !~ '^\d{4}$')
   OR (province IS NOT NULL AND province NOT IN (
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
        'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
      ))
   OR (emergency_contact_phone != '' AND emergency_contact_phone !~ '^(\+27|0)[6-8][0-9]{8}$');

-- Show table size and statistics
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    CASE 
        WHEN most_common_vals IS NOT NULL THEN array_to_string(most_common_vals[1:3], ', ')
        ELSE 'No common values'
    END as top_values,
    null_frac
FROM pg_stats 
WHERE tablename = 'patients'
AND schemaname = 'public'
ORDER BY attname;