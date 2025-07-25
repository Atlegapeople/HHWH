-- SQL to run in Supabase Dashboard -> SQL Editor
-- Create appointments table

CREATE TABLE appointments (
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

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow patients to view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments
    FOR SELECT USING (true); -- For now, allow all reads for testing

-- Policy: Allow anyone to insert appointments (for booking)
CREATE POLICY "Allow appointment booking" ON appointments
    FOR INSERT WITH CHECK (true);

-- Policy: Allow updates for appointment management
CREATE POLICY "Allow appointment updates" ON appointments
    FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX appointments_patient_id_idx ON appointments(patient_id);
CREATE INDEX appointments_doctor_id_idx ON appointments(doctor_id);
CREATE INDEX appointments_date_time_idx ON appointments(appointment_date, appointment_time);
CREATE INDEX appointments_status_idx ON appointments(status);

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;