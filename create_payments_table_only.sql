-- HHWH Online Clinic - Create Missing Payments Table Only
-- Run this in your Supabase Dashboard -> SQL Editor
-- This only creates the missing payments table without affecting existing tables

-- ==============================================
-- CREATE PAYMENTS TABLE
-- ==============================================
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    payment_method TEXT,
    payment_gateway_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_gateway_id ON payments(payment_gateway_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to match your existing pattern
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE patient_id IN (
                SELECT id FROM patients WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (
        appointment_id IN (
            SELECT id FROM appointments WHERE patient_id IN (
                SELECT id FROM patients WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

CREATE POLICY "Users can update their own payments" ON payments
    FOR UPDATE USING (
        appointment_id IN (
            SELECT id FROM appointments WHERE patient_id IN (
                SELECT id FROM patients WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Verify the table was created successfully
SELECT 
    'VERIFICATION' as section,
    'payments table created successfully' as message,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'payments';

-- Show the new table structure
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