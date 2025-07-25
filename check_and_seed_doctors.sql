-- Check if doctors table has data and add sample doctors if needed
-- Run this AFTER creating the payments table

-- First, check current doctor count
SELECT 
    'CURRENT DOCTORS COUNT' as section,
    COUNT(*) as total_doctors,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_doctors
FROM doctors;

-- Show existing doctors (if any)
SELECT 
    'EXISTING DOCTORS' as section,
    full_name,
    specialization,
    consultation_fee,
    is_active
FROM doctors
ORDER BY full_name;

-- Add sample doctors only if table is empty
INSERT INTO doctors (full_name, specialization, qualification, hpcsa_number, consultation_fee, bio, available_days, available_hours)
SELECT * FROM (
    VALUES 
        ('Dr. Anita Kruger', 'Endocrinologist & Hormone Specialist', 'MBChB, FCP(SA), Cert Endocrinology', 'MP0123456', 950.00, 'Dr. Kruger specializes in hormone replacement therapy and has over 15 years of experience treating menopausal women. She completed her fellowship at Groote Schuur Hospital and is passionate about helping women navigate their hormone health journey.', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], '{"start": "08:00", "end": "17:00"}'::jsonb),
        
        ('Dr. Sarah van der Merwe', 'Gynaecologist & Women''s Health Specialist', 'MBChB, MMed(O&G), FCOG(SA)', 'MP0234567', 850.00, 'Dr. van der Merwe focuses on women''s health across all life stages, with particular expertise in perimenopause and menopause management. She has been practicing for over 12 years and believes in personalized care for each patient.', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], '{"start": "09:00", "end": "16:00"}'::jsonb),
        
        ('Dr. Priya Patel', 'Integrative Medicine & Hormone Therapy', 'MBChB, Dip Integrative Medicine', 'MP0345678', 800.00, 'Dr. Patel combines conventional medicine with holistic approaches to hormone health, offering comprehensive treatment plans that address both physical and emotional well-being during hormonal transitions.', ARRAY['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], '{"start": "08:30", "end": "17:30"}'::jsonb)
) AS new_doctors
WHERE (SELECT COUNT(*) FROM doctors) = 0;

-- Final verification
SELECT 
    'FINAL VERIFICATION' as section,
    COUNT(*) as total_doctors_after_insert,
    STRING_AGG(full_name, ', ') as doctor_names
FROM doctors
WHERE is_active = true;