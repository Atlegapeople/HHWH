-- Create packages table for package-based service model
CREATE TABLE IF NOT EXISTS packages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    package_type text CHECK (package_type IN ('medical_aid', 'cash')) NOT NULL,
    price_medical_aid numeric,
    price_cash numeric,
    validity_months integer DEFAULT 9, -- Package validity period
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create package_consultations junction table to define what consultations are included
CREATE TABLE IF NOT EXISTS package_consultations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_id uuid REFERENCES packages(id) ON DELETE CASCADE,
    consultation_name text NOT NULL, -- e.g., "Initial GP Consultation", "Follow-up GP", "Auxiliary Practitioner"
    duration_minutes integer NOT NULL,
    practitioner_type text CHECK (practitioner_type IN ('gp', 'auxiliary', 'dietitian', 'counsellor', 'biokineticist')) NOT NULL,
    price_medical_aid numeric NOT NULL,
    price_cash numeric NOT NULL,
    procedure_codes text[], -- Medical aid procedure codes e.g., ['0129', '0192']
    sequence_order integer DEFAULT 1, -- Order of consultations in package
    is_required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create package_addons table for additional services like CGM, DNAlysis
CREATE TABLE IF NOT EXISTS package_addons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    addon_type text CHECK (addon_type IN ('cgm_discount', 'dnalysis_discount', 'dietitian_bundle', 'counsellor_bundle')) NOT NULL,
    base_price numeric,
    discount_percentage integer DEFAULT 0,
    duration_months integer DEFAULT 9, -- How long the addon/discount is valid
    consultation_count integer DEFAULT 0, -- For consultation bundles
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_addons ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anyone to view active packages (for selection interface)
CREATE POLICY "Allow viewing active packages" ON packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow viewing package consultations" ON package_consultations
    FOR SELECT USING (true);

CREATE POLICY "Allow viewing active addons" ON package_addons
    FOR SELECT USING (is_active = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS packages_type_active_idx ON packages(package_type, is_active);
CREATE INDEX IF NOT EXISTS package_consultations_package_id_idx ON package_consultations(package_id);
CREATE INDEX IF NOT EXISTS package_consultations_practitioner_type_idx ON package_consultations(practitioner_type);
CREATE INDEX IF NOT EXISTS package_addons_type_active_idx ON package_addons(addon_type, is_active);

-- Insert Package 1 as defined in requirements
INSERT INTO packages (name, description, package_type, price_medical_aid, price_cash) VALUES 
('Package 1 - Medical Aid', 'Comprehensive hormone health package with medical aid billing', 'medical_aid', 2660.00, 2660.00),
('Package 1 - Cash', 'Comprehensive hormone health package with cash pricing', 'cash', 2400.00, 2400.00);

-- Get the package IDs for the consultations
DO $$ 
DECLARE 
    medical_aid_package_id uuid;
    cash_package_id uuid;
BEGIN
    SELECT id INTO medical_aid_package_id FROM packages WHERE name = 'Package 1 - Medical Aid';
    SELECT id INTO cash_package_id FROM packages WHERE name = 'Package 1 - Cash';
    
    -- Insert consultations for medical aid package
    INSERT INTO package_consultations (package_id, consultation_name, duration_minutes, practitioner_type, price_medical_aid, price_cash, procedure_codes, sequence_order) VALUES
    (medical_aid_package_id, 'Initial GP Consultation', 45, 'gp', 1000.00, 1000.00, ARRAY['0129', '0192'], 1),
    (medical_aid_package_id, 'Follow-up GP Consultation', 30, 'gp', 1000.00, 1000.00, ARRAY['0130'], 2),
    (medical_aid_package_id, 'Auxiliary Practitioner Consultation', 30, 'auxiliary', 660.00, 660.00, ARRAY['0130'], 3);
    
    -- Insert consultations for cash package
    INSERT INTO package_consultations (package_id, consultation_name, duration_minutes, practitioner_type, price_medical_aid, price_cash, procedure_codes, sequence_order) VALUES
    (cash_package_id, 'Initial GP Consultation', 45, 'gp', 950.00, 950.00, ARRAY[]::text[], 1),
    (cash_package_id, 'Follow-up GP Consultation', 30, 'gp', 800.00, 800.00, ARRAY[]::text[], 2),
    (cash_package_id, 'Auxiliary Practitioner Consultation', 30, 'auxiliary', 650.00, 650.00, ARRAY[]::text[], 3);
END $$;

-- Insert addon services
INSERT INTO package_addons (name, description, addon_type, base_price, discount_percentage, consultation_count) VALUES
('Dietitian Package + CGM Discount', '3 dietitian consultations with 10% CGM discount', 'dietitian_bundle', 1800.00, 10, 3),
('Counsellor Package + DNAlysis Discount', '3 counsellor consultations with 15% DNAlysis discount', 'counsellor_bundle', 2100.00, 15, 3);