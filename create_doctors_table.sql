-- SQL to run in Supabase Dashboard -> SQL Editor
-- This creates the doctors table and seeds it with sample South African hormone specialists

-- Create doctors table (if not exists from migrations)
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

-- Insert sample South African hormone specialists
INSERT INTO doctors (full_name, specialization, qualification, hpcsa_number, consultation_fee, bio, available_days, available_hours) VALUES
('Dr. Anita Kruger', 'Endocrinologist & Hormone Specialist', 'MBChB, FCP(SA), Cert Endocrinology', 'MP0123456', 950.00, 'Dr. Kruger specializes in hormone replacement therapy and has over 15 years of experience treating menopausal women. She completed her fellowship at Groote Schuur Hospital and is passionate about helping women navigate their hormone health journey.', 
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "08:00", "end": "16:00"}'),

('Dr. Sarah van der Merwe', 'Gynaecologist & Women''s Health Specialist', 'MBChB, FCOG(SA), Cert Reproductive Medicine', 'MP0234567', 850.00, 'Dr. van der Merwe has dedicated her career to women''s health, with special focus on perimenopause and menopause management. She practices evidence-based hormone therapy and takes a holistic approach to women''s wellness.',
 ARRAY['monday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "09:00", "end": "17:00"}'),

('Dr. Michael Thompson', 'Internal Medicine & Hormone Therapy', 'MBChB, FCP(SA), Dip HIV Medicine', 'MP0345678', 800.00, 'Dr. Thompson brings a comprehensive approach to hormone health, combining internal medicine expertise with specialized hormone therapy knowledge. He has extensive experience in treating complex hormone imbalances.',
 ARRAY['tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "08:30", "end": "16:30"}'),

('Dr. Priya Patel', 'Family Medicine & Integrative Health', 'MBChB, Dip Family Medicine, Cert Integrative Medicine', 'MP0456789', 750.00, 'Dr. Patel combines traditional family medicine with integrative approaches to hormone health. She believes in personalized treatment plans that address both physical and emotional aspects of hormonal changes.',
 ARRAY['monday', 'tuesday', 'thursday', 'friday'], 
 '{"start": "08:00", "end": "17:30"}'),

('Dr. James Oosthuizen', 'Endocrinologist & Metabolic Specialist', 'MBChB, FCP(SA), MMed Endocrinology', 'MP0567890', 920.00, 'Dr. Oosthuizen is a leading endocrinologist with expertise in complex hormone disorders. He has published research on hormone replacement therapy and is known for his patient-centered approach to treatment.',
 ARRAY['monday', 'tuesday', 'wednesday', 'friday'], 
 '{"start": "07:30", "end": "15:30"}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS doctors_specialization_idx ON doctors(specialization);
CREATE INDEX IF NOT EXISTS doctors_active_idx ON doctors(is_active);
CREATE INDEX IF NOT EXISTS doctors_consultation_fee_idx ON doctors(consultation_fee);

-- Verify doctors were created
SELECT id, full_name, specialization, consultation_fee, hpcsa_number, is_active 
FROM doctors 
ORDER BY consultation_fee;