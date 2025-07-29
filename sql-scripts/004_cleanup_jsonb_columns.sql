-- Clean up old JSONB columns after successful migration
-- ONLY run this after verifying the data migration was successful

-- First, let's verify the migration worked by showing a comparison
SELECT 
    id,
    email,
    
    -- Individual columns (new)
    street_address,
    city,
    province,
    postal_code,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    
    -- JSONB columns (old) - these should match the individual columns above
    address->>'street' as jsonb_street,
    address->>'city' as jsonb_city,
    address->>'province' as jsonb_province,
    address->>'postal_code' as jsonb_postal_code,
    emergency_contact->>'name' as jsonb_emergency_name,
    emergency_contact->>'relationship' as jsonb_emergency_relationship,
    emergency_contact->>'phone' as jsonb_emergency_phone
    
FROM patients 
WHERE address IS NOT NULL OR emergency_contact IS NOT NULL
LIMIT 10;

-- Only proceed with dropping JSONB columns if the above data looks correct
-- Uncomment the lines below ONLY after verifying the data migration

-- Drop the old JSONB columns (CAREFUL - this is irreversible!)
/*
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'address') THEN
        ALTER TABLE patients DROP COLUMN address;
        RAISE NOTICE 'Dropped address JSONB column';
    ELSE
        RAISE NOTICE 'address column does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
        ALTER TABLE patients DROP COLUMN emergency_contact;
        RAISE NOTICE 'Dropped emergency_contact JSONB column';
    ELSE
        RAISE NOTICE 'emergency_contact column does not exist';
    END IF;
END $$;
*/

-- Verify final table structure after cleanup
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;