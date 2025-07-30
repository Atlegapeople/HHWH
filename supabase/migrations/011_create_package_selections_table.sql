-- Create table to track patient package purchases and usage
CREATE TABLE IF NOT EXISTS package_selections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
    package_id uuid REFERENCES packages(id) ON DELETE RESTRICT,
    purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date timestamp with time zone, -- Calculated based on package validity
    total_price numeric NOT NULL,
    payment_method text CHECK (payment_method IN ('cash', 'medical_aid')) NOT NULL,
    payment_status text CHECK (payment_status IN ('pending', 'paid', 'partial', 'validating', 'cancelled', 'refunded')) DEFAULT 'pending',
    usage_status text CHECK (usage_status IN ('active', 'completed', 'expired', 'cancelled')) DEFAULT 'active',
    consultations_used integer DEFAULT 0,
    consultations_total integer NOT NULL, -- Total consultations in package
    discount_applied numeric DEFAULT 0, -- Any bundle discount applied
    notes text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table to track addon services purchased with packages
CREATE TABLE IF NOT EXISTS package_addon_selections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_selection_id uuid REFERENCES package_selections(id) ON DELETE CASCADE,
    addon_id uuid REFERENCES package_addons(id) ON DELETE RESTRICT,
    purchase_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    expiry_date timestamp with time zone,
    price_paid numeric NOT NULL,
    usage_status text CHECK (usage_status IN ('active', 'completed', 'expired', 'cancelled')) DEFAULT 'active',
    consultations_used integer DEFAULT 0, -- For consultation-based addons
    discount_claimed boolean DEFAULT false, -- For discount-based addons (CGM, DNAlysis)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table to track individual consultation bookings within packages
CREATE TABLE IF NOT EXISTS package_consultation_bookings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    package_selection_id uuid REFERENCES package_selections(id) ON DELETE CASCADE,
    package_consultation_id uuid REFERENCES package_consultations(id) ON DELETE RESTRICT,
    appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
    booking_date timestamp with time zone,
    status text CHECK (status IN ('pending', 'booked', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending',
    sequence_order integer NOT NULL, -- Order within the package
    is_required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE package_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_addon_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Policies: Patients can view their own package selections
CREATE POLICY "Patients can view own package selections" ON package_selections
    FOR SELECT USING (true); -- For now, allow all reads for testing

CREATE POLICY "Allow package selection creation" ON package_selections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow package selection updates" ON package_selections
    FOR UPDATE USING (true);

-- Similar policies for addon selections and consultation bookings
CREATE POLICY "Patients can view own addon selections" ON package_addon_selections
    FOR SELECT USING (true);

CREATE POLICY "Allow addon selection creation" ON package_addon_selections
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Patients can view own consultation bookings" ON package_consultation_bookings
    FOR SELECT USING (true);

CREATE POLICY "Allow consultation booking creation" ON package_consultation_bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow consultation booking updates" ON package_consultation_bookings
    FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS package_selections_patient_id_idx ON package_selections(patient_id);
CREATE INDEX IF NOT EXISTS package_selections_status_idx ON package_selections(usage_status, payment_status);
CREATE INDEX IF NOT EXISTS package_selections_expiry_idx ON package_selections(expiry_date);

CREATE INDEX IF NOT EXISTS package_addon_selections_package_selection_id_idx ON package_addon_selections(package_selection_id);
CREATE INDEX IF NOT EXISTS package_addon_selections_status_idx ON package_addon_selections(usage_status);

CREATE INDEX IF NOT EXISTS package_consultation_bookings_package_selection_id_idx ON package_consultation_bookings(package_selection_id);
CREATE INDEX IF NOT EXISTS package_consultation_bookings_appointment_id_idx ON package_consultation_bookings(appointment_id);
CREATE INDEX IF NOT EXISTS package_consultation_bookings_sequence_idx ON package_consultation_bookings(package_selection_id, sequence_order);

-- Create function to automatically set expiry date based on package validity
CREATE OR REPLACE FUNCTION set_package_expiry_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Set expiry date based on package validity months
    SELECT 
        NEW.purchase_date + INTERVAL '1 month' * p.validity_months
    INTO NEW.expiry_date
    FROM packages p
    WHERE p.id = NEW.package_id;
    
    -- Set total consultations count
    SELECT 
        COUNT(*)
    INTO NEW.consultations_total
    FROM package_consultations pc
    WHERE pc.package_id = NEW.package_id AND pc.is_required = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set expiry date
CREATE TRIGGER set_package_expiry_trigger
    BEFORE INSERT ON package_selections
    FOR EACH ROW
    EXECUTE FUNCTION set_package_expiry_date();

-- Create function to update package usage when appointments are completed
CREATE OR REPLACE FUNCTION update_package_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update when appointment status changes to 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.is_package_consultation = true THEN
        -- Update package selection usage
        UPDATE package_selections 
        SET 
            consultations_used = consultations_used + 1,
            usage_status = CASE 
                WHEN consultations_used + 1 >= consultations_total THEN 'completed'
                ELSE usage_status
            END,
            updated_at = timezone('utc'::text, now())
        WHERE id = (
            SELECT package_selection_id 
            FROM package_consultation_bookings 
            WHERE appointment_id = NEW.id
        );
        
        -- Update consultation booking status
        UPDATE package_consultation_bookings
        SET status = 'completed'
        WHERE appointment_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update package usage
CREATE TRIGGER update_package_usage_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_package_usage();