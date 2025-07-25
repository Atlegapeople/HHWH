-- Create patients table
CREATE TABLE patients (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    full_name text NOT NULL,
    phone text NOT NULL,
    date_of_birth date,
    medical_aid_scheme text,
    medical_aid_number text,
    medical_aid_dependent_code text,
    address jsonb,
    emergency_contact jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can only see their own data
CREATE POLICY "Patients can view own data" ON patients
    FOR SELECT USING (auth.uid()::text = id::text);

-- Policy: Allow insert for authenticated users
CREATE POLICY "Allow registration" ON patients
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX patients_email_idx ON patients(email);
CREATE INDEX patients_created_at_idx ON patients(created_at);