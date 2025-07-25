-- Add missing approval-related columns to doctors table
-- Run this script in Supabase SQL Editor

-- Add approval_status column
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS approval_status text;

-- Add approval_date column  
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS approval_date timestamptz;

-- Add rejection_reason column
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add constraint to approval_status (drop first if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_approval_status_check') THEN
        ALTER TABLE doctors ADD CONSTRAINT doctors_approval_status_check 
            CHECK (approval_status IN ('approved', 'rejected'));
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_approval_status ON doctors(approval_status);
CREATE INDEX IF NOT EXISTS idx_doctors_approval_date ON doctors(approval_date);

-- Add comments to document the new columns
COMMENT ON COLUMN doctors.approval_status IS 'Admin approval status: approved or rejected';
COMMENT ON COLUMN doctors.approval_date IS 'Date when admin approved/rejected the application';
COMMENT ON COLUMN doctors.rejection_reason IS 'Reason provided when application is rejected';

-- Update existing active doctors to have approved status
UPDATE doctors 
SET approval_status = 'approved', 
    approval_date = created_at 
WHERE is_active = true 
AND approval_status IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name IN ('approval_status', 'approval_date', 'rejection_reason')
ORDER BY column_name;

-- Show current doctors with approval status
SELECT id, full_name, specialization, is_active, approval_status, approval_date, created_at
FROM doctors 
ORDER BY created_at DESC 
LIMIT 10;

-- Success message
SELECT 'Missing approval columns added successfully' as status;