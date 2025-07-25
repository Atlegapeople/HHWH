-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text, -- For future auth integration
    full_name text NOT NULL,
    specialization text,
    qualification text,
    hpcsa_number text, -- Health Professions Council of South Africa registration
    consultation_fee numeric DEFAULT 850.00, -- Standard SA consultation fee
    bio text,
    profile_image_url text,
    available_days text[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    available_hours jsonb DEFAULT '{"start": "08:00", "end": "17:00"}',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to view active doctors (for booking)
CREATE POLICY "Allow viewing active doctors" ON doctors
    FOR SELECT USING (is_active = true);