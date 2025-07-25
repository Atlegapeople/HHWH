-- SQL to run in Supabase Dashboard -> SQL Editor
-- Create doctors table first, then add data

-- Create doctors table
CREATE TABLE doctors (
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

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view active doctors
CREATE POLICY "Allow viewing active doctors" ON doctors
    FOR SELECT USING (is_active = true);