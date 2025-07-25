-- HHWH Online Clinic - Complete Database Setup
-- Run this in your Supabase Dashboard -> SQL Editor

-- ==============================================
-- 1. CREATE DOCTORS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS doctors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    full_name text NOT NULL,
    specialization text,
    qualification text,
    hpcsa_number text,
    consultation_fee numeric DEFAULT 850.00,
    bio text,
    profile_image_url text,
    available_days text[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    available_hours jsonb DEFAULT '{"start": "08:00", "end": "17:00"}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for doctors
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view active doctors
CREATE POLICY "Allow viewing active doctors" ON doctors
    FOR SELECT USING (is_active = true);

-- ==============================================
-- 2. CREATE APPOINTMENTS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS appointments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date date NOT NULL,
    appointment_time time NOT NULL,
    duration_minutes integer DEFAULT 30,
    payment_method text CHECK (payment_method IN ('cash', 'medical_aid')) NOT NULL,
    payment_status text CHECK (payment_status IN ('pending', 'paid', 'partial', 'validating', 'cancelled')) DEFAULT 'pending',
    consultation_fee numeric NOT NULL,
    amount_paid numeric DEFAULT 0,
    consultation_type text CHECK (consultation_type IN ('initial', 'follow_up', 'emergency')) DEFAULT 'initial',
    status text CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
    symptoms_description text,
    current_medications text,
    allergies text,
    video_room_url text,
    consultation_notes text,
    prescription text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Patients can view own appointments" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "Allow appointment booking" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow appointment updates" ON appointments
    FOR UPDATE USING (true);

-- Create indexes for appointments
CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_doctor_id_idx ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS appointments_date_time_idx ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON appointments(status);

-- ==============================================
-- 3. CREATE PAYMENTS TABLE
-- ==============================================
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

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_id ON payments(payment_gateway_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Enable RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
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

-- ==============================================
-- 4. SEED DATA - Sample Doctors
-- ==============================================
INSERT INTO doctors (full_name, specialization, qualification, hpcsa_number, consultation_fee, bio, available_days, available_hours) VALUES
('Dr. Anita Kruger', 'Endocrinologist & Hormone Specialist', 'MBChB, FCP(SA), Cert Endocrinology', 'MP0123456', 950.00, 'Dr. Kruger specializes in hormone replacement therapy and has over 15 years of experience treating menopausal women. She completed her fellowship at Groote Schuur Hospital and is passionate about helping women navigate their hormone health journey.', 
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "08:00", "end": "17:00"}'::jsonb),

('Dr. Sarah van der Merwe', 'Gynaecologist & Women''s Health Specialist', 'MBChB, MMed(O&G), FCOG(SA)', 'MP0234567', 850.00, 'Dr. van der Merwe focuses on women''s health across all life stages, with particular expertise in perimenopause and menopause management. She has been practicing for over 12 years and believes in personalized care for each patient.',
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "09:00", "end": "16:00"}'::jsonb),

('Dr. Priya Patel', 'Integrative Medicine & Hormone Therapy', 'MBChB, Dip Integrative Medicine', 'MP0345678', 800.00, 'Dr. Patel combines conventional medicine with holistic approaches to hormone health, offering comprehensive treatment plans that address both physical and emotional well-being during hormonal transitions.',
 ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 
 '{"start": "08:30", "end": "17:30"}'::jsonb)

ON CONFLICT (hpcsa_number) DO NOTHING;

-- ==============================================
-- 5. VERIFICATION QUERIES
-- ==============================================
-- Run these to verify everything was created correctly:

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'doctors', 'appointments', 'payments')
ORDER BY table_name;

-- Check doctors were inserted
SELECT COUNT(*) as doctor_count FROM doctors;

-- Show table structures
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('appointments', 'payments', 'doctors')
ORDER BY table_name, ordinal_position;