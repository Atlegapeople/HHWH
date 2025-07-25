-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    payment_method TEXT,
    payment_gateway_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_payments_gateway_id ON payments(payment_gateway_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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