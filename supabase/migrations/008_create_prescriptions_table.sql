-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    prescription_number VARCHAR(50) UNIQUE NOT NULL,
    issued_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'filled', 'cancelled')),
    doctor_name VARCHAR(255) NOT NULL,
    doctor_hpcsa_number VARCHAR(50) NOT NULL,
    practice_name VARCHAR(255),
    practice_address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    strength VARCHAR(100) NOT NULL,
    dosage_form VARCHAR(100) NOT NULL, -- tablet, capsule, liquid, etc.
    quantity INTEGER NOT NULL,
    directions TEXT NOT NULL,
    refills_allowed INTEGER DEFAULT 0,
    refills_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_issued_date ON prescriptions(issued_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescription_number ON prescriptions(prescription_number);
CREATE INDEX IF NOT EXISTS idx_medications_prescription_id ON medications(prescription_id);

-- Enable Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prescriptions
-- Patients can only see their own prescriptions
CREATE POLICY "Users can view their own prescriptions" ON prescriptions
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT user_id::text FROM patients WHERE id = prescriptions.patient_id
        )
    );

-- Doctors can view prescriptions they issued
CREATE POLICY "Doctors can view prescriptions they issued" ON prescriptions
    FOR SELECT USING (
        auth.uid()::text IN (
            SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

-- Doctors can insert new prescriptions
CREATE POLICY "Doctors can create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        auth.uid()::text IN (
            SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

-- Doctors can update prescriptions they issued
CREATE POLICY "Doctors can update their prescriptions" ON prescriptions
    FOR UPDATE USING (
        auth.uid()::text IN (
            SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
        )
    );

-- Create RLS policies for medications
-- Users can view medications for prescriptions they have access to
CREATE POLICY "Users can view medications for accessible prescriptions" ON medications
    FOR SELECT USING (
        prescription_id IN (
            SELECT id FROM prescriptions
            WHERE auth.uid()::text IN (
                SELECT user_id::text FROM patients WHERE id = prescriptions.patient_id
            ) OR auth.uid()::text IN (
                SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
            )
        )
    );

-- Doctors can insert medications for prescriptions they created
CREATE POLICY "Doctors can add medications to their prescriptions" ON medications
    FOR INSERT WITH CHECK (
        prescription_id IN (
            SELECT id FROM prescriptions
            WHERE auth.uid()::text IN (
                SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
            )
        )
    );

-- Doctors can update medications for prescriptions they created
CREATE POLICY "Doctors can update medications in their prescriptions" ON medications
    FOR UPDATE USING (
        prescription_id IN (
            SELECT id FROM prescriptions
            WHERE auth.uid()::text IN (
                SELECT user_id::text FROM doctors WHERE id = prescriptions.doctor_id
            )
        )
    );

-- Create function to automatically update prescription status based on valid_until date
CREATE OR REPLACE FUNCTION update_prescription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to expired if valid_until date has passed
    IF NEW.valid_until < CURRENT_DATE AND NEW.status = 'active' THEN
        NEW.status := 'expired';
    END IF;
    
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update prescription status
CREATE TRIGGER trigger_update_prescription_status
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_prescription_status();

-- Create function to generate unique prescription numbers
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER := 0;
BEGIN
    LOOP
        -- Generate prescription number: HHWH + YYMMDD + random 4 digits
        new_number := 'HHWH' || TO_CHAR(CURRENT_DATE, 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Check if this number already exists
        IF NOT EXISTS (SELECT 1 FROM prescriptions WHERE prescription_number = new_number) THEN
            RETURN new_number;
        END IF;
        
        counter := counter + 1;
        -- Prevent infinite loop
        IF counter > 100 THEN
            -- Fallback with timestamp
            new_number := 'HHWH' || TO_CHAR(NOW(), 'YYMMDDHHMI') || LPAD(FLOOR(RANDOM() * 100)::TEXT, 2, '0');
            RETURN new_number;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add sample prescription data for testing (optional - remove in production)
-- This creates sample prescriptions for testing purposes
INSERT INTO prescriptions (
    patient_id, 
    doctor_id, 
    prescription_number, 
    issued_date, 
    valid_until, 
    status,
    doctor_name,
    doctor_hpcsa_number,
    practice_name,
    notes
) 
SELECT 
    p.id as patient_id,
    d.id as doctor_id,
    generate_prescription_number() as prescription_number,
    CURRENT_DATE as issued_date,
    CURRENT_DATE + INTERVAL '30 days' as valid_until,
    'active' as status,
    d.full_name as doctor_name,
    d.hpcsa_number as doctor_hpcsa_number,
    'HHWH Online Clinic' as practice_name,
    'Sample prescription for testing digital prescription system' as notes
FROM patients p
CROSS JOIN doctors d
WHERE p.email LIKE '%@%' -- Only patients with valid emails
LIMIT 3; -- Create 3 sample prescriptions for testing

-- Add sample medications for the prescriptions
INSERT INTO medications (
    prescription_id,
    medication_name,
    generic_name,
    strength,
    dosage_form,
    quantity,
    directions,
    refills_allowed
)
SELECT 
    pr.id as prescription_id,
    'Estradiol' as medication_name,
    'Estradiol' as generic_name,
    '1mg' as strength,
    'Tablet' as dosage_form,
    30 as quantity,
    'Take 1 tablet daily with food' as directions,
    2 as refills_allowed
FROM prescriptions pr
WHERE pr.prescription_number LIKE 'HHWH%'
LIMIT 2;

INSERT INTO medications (
    prescription_id,
    medication_name,
    generic_name, 
    strength,
    dosage_form,
    quantity,
    directions,
    refills_allowed
)
SELECT 
    pr.id as prescription_id,
    'Progesterone' as medication_name,
    'Micronized Progesterone' as generic_name,
    '100mg' as strength,
    'Capsule' as dosage_form,
    30 as quantity,
    'Take 1 capsule at bedtime' as directions,
    2 as refills_allowed
FROM prescriptions pr
WHERE pr.prescription_number LIKE 'HHWH%'
LIMIT 1;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON prescriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON medications TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;