-- SQL to run in Supabase Dashboard -> SQL Editor
-- Create symptom_assessments table (if not exists from types)

CREATE TABLE IF NOT EXISTS symptom_assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    assessment_data jsonb NOT NULL,
    risk_factors jsonb,
    total_score integer,
    severity_level text CHECK (severity_level IN ('mild', 'moderate', 'severe', 'very_severe')),
    recommendations text[],
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE symptom_assessments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow patients to view their own assessments
CREATE POLICY "Patients can view own assessments" ON symptom_assessments
    FOR SELECT USING (true); -- For now, allow all reads for testing

-- Policy: Allow anyone to insert assessments
CREATE POLICY "Allow assessment creation" ON symptom_assessments
    FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX symptom_assessments_patient_id_idx ON symptom_assessments(patient_id);
CREATE INDEX symptom_assessments_severity_idx ON symptom_assessments(severity_level);
CREATE INDEX symptom_assessments_completed_at_idx ON symptom_assessments(completed_at);

-- Verify table was created
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'symptom_assessments' 
ORDER BY ordinal_position;