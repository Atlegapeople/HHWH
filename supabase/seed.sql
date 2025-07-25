-- Seed data for HHWH Online Clinic

-- Insert sample South African hormone specialists
INSERT INTO doctors (full_name, specialization, qualification, hpcsa_number, consultation_fee, bio, available_days, available_hours) VALUES
('Dr. Anita Kruger', 'Endocrinologist & Hormone Specialist', 'MBChB, FCP(SA), Cert Endocrinology', 'MP0123456', 950.00, 'Dr. Kruger specializes in hormone replacement therapy and has over 15 years of experience treating menopausal women.', 
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "08:00", "end": "17:00"}'),

('Dr. Sarah van der Merwe', 'Gynaecologist & Women''s Health Specialist', 'MBChB, MMed(O&G), FCOG(SA)', 'MP0234567', 850.00, 'Dr. van der Merwe focuses on women''s health across all life stages, with particular expertise in perimenopause and menopause management.',
 ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 
 '{"start": "09:00", "end": "16:00"}'),

('Dr. Priya Patel', 'Integrative Medicine & Hormone Therapy', 'MBChB, Dip Integrative Medicine', 'MP0345678', 800.00, 'Dr. Patel combines conventional medicine with holistic approaches to hormone health, offering comprehensive treatment plans.',
 ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 
 '{"start": "08:30", "end": "17:30"}')

ON CONFLICT DO NOTHING;