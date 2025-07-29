-- Migrate existing JSONB data to individual columns
-- Run this after adding the missing columns

-- Check if we have any JSONB data to migrate
SELECT 
    id,
    email,
    full_name,
    address,
    emergency_contact
FROM patients 
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL
LIMIT 5;

-- Show count of records with JSONB data
SELECT 
    COUNT(*) as total_patients,
    COUNT(address) as patients_with_address_jsonb,
    COUNT(emergency_contact) as patients_with_emergency_contact_jsonb
FROM patients;

-- Migrate JSONB data to individual columns
UPDATE patients 
SET 
    street_address = COALESCE(
        CASE WHEN street_address IS NOT NULL AND street_address != '' THEN street_address ELSE NULL END,
        address->>'street', 
        ''
    ),
    city = COALESCE(
        CASE WHEN city IS NOT NULL AND city != '' THEN city ELSE NULL END,
        address->>'city', 
        ''
    ),
    province = COALESCE(
        CASE WHEN province IS NOT NULL AND province != '' THEN province ELSE NULL END,
        address->>'province', 
        NULL
    ),
    postal_code = COALESCE(
        CASE WHEN postal_code IS NOT NULL AND postal_code != '' THEN postal_code ELSE NULL END,
        address->>'postal_code', 
        ''
    ),
    emergency_contact_name = COALESCE(
        CASE WHEN emergency_contact_name IS NOT NULL AND emergency_contact_name != '' THEN emergency_contact_name ELSE NULL END,
        emergency_contact->>'name', 
        ''
    ),
    emergency_contact_relationship = COALESCE(
        CASE WHEN emergency_contact_relationship IS NOT NULL AND emergency_contact_relationship != '' THEN emergency_contact_relationship ELSE NULL END,
        emergency_contact->>'relationship', 
        ''
    ),
    emergency_contact_phone = COALESCE(
        CASE WHEN emergency_contact_phone IS NOT NULL AND emergency_contact_phone != '' THEN emergency_contact_phone ELSE NULL END,
        emergency_contact->>'phone', 
        ''
    )
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL;

-- Show results after migration
SELECT 
    id,
    email,
    full_name,
    street_address,
    city,
    province,
    postal_code,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    address, -- Will show the old JSONB data
    emergency_contact -- Will show the old JSONB data
FROM patients 
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL
LIMIT 5;