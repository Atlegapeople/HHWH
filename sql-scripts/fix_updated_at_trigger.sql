-- Fix the updated_at trigger issue
-- The trigger is trying to set updated_at field that doesn't exist

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;

-- Drop the trigger function too if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Check if the updated_at column actually exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'doctors' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE 'updated_at column exists';
        
        -- Recreate the trigger only if column exists
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';

        CREATE TRIGGER update_doctors_updated_at
            BEFORE UPDATE ON doctors
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
            
        RAISE NOTICE 'updated_at trigger recreated';
    ELSE
        RAISE NOTICE 'updated_at column does not exist - no trigger needed';
    END IF;
END $$;

-- Show current table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND table_schema = 'public'
ORDER BY ordinal_position;