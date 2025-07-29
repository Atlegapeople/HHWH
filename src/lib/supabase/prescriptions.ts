import { createClient } from './client'

export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  prescription_number: string
  issued_date: string
  valid_until: string
  status: 'active' | 'expired' | 'filled' | 'cancelled'
  medications: Medication[]
  doctor_name: string
  doctor_hpcsa_number: string
  practice_name?: string
  practice_address?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  prescription_id: string
  medication_name: string
  generic_name?: string
  strength: string
  dosage_form: string // tablet, capsule, liquid, etc.
  quantity: number
  directions: string
  refills_allowed: number
  refills_used: number
  created_at: string
}

export async function getPatientPrescriptions(patientEmail: string): Promise<Prescription[]> {
  // Temporarily return mock data in development to avoid database issues
  if (process.env.NODE_ENV === 'development') {
    console.log('Using mock prescription data for development')
    return getMockPrescriptions()
  }

  const supabase = createClient()
  
  try {
    console.log('Starting to fetch prescriptions for:', patientEmail)
    
    // Get patient ID first
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('email', patientEmail)
      .single()

    if (patientError) {
      console.error('Patient lookup error:', {
        error: patientError,
        code: patientError.code,
        message: patientError.message,
        details: patientError.details
      })
      return []
    }

    if (!patient) {
      console.log('No patient found for email:', patientEmail)
      return []
    }

    console.log('Patient found:', patient.id)

    // Check if prescriptions table exists by trying a simple query first
    console.log('Checking if prescriptions table exists...')
    const { data: tableCheck, error: tableError } = await supabase
      .from('prescriptions')
      .select('id')
      .limit(1)

    if (tableError) {
      console.log('Prescriptions table check failed:', {
        error: tableError,
        code: tableError.code,
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint
      })
      
      // Return empty array if table doesn't exist - this is not an error for the user
      return []
    }

    console.log('Prescriptions table exists, fetching data...')

    // Get prescriptions with medications
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        medications (*),
        doctor:doctors (
          full_name,
          hpcsa_number,
          practice_name,          
          practice_address
        )
      `)
      .eq('patient_id', patient.id)
      .order('issued_date', { ascending: false })

    if (error) {
      console.error('Error fetching prescriptions:', {
        error: error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return []
    }

    console.log('Prescriptions fetched successfully:', prescriptions?.length || 0)

    // Transform data to match interface
    return (prescriptions || []).map(prescription => ({
      ...prescription,
      doctor_name: prescription.doctor?.full_name || 'Unknown Doctor',
      doctor_hpcsa_number: prescription.doctor?.hpcsa_number || '',
      practice_name: prescription.doctor?.practice_name,
      practice_address: prescription.doctor?.practice_address,
      medications: prescription.medications || []
    }))

  } catch (error) {
    console.error('Failed to fetch prescriptions - caught exception:', {
      error: error,
      type: typeof error,
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return []
  }
}

export function formatPrescriptionDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getPrescriptionStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return {
        className: 'bg-brand-green/10 text-brand-green border-brand-green/30',
        label: 'Active'
      }
    case 'expired':
      return {
        className: 'bg-brand-red/10 text-brand-red border-brand-red/30',
        label: 'Expired' 
      }
    case 'filled':
      return {
        className: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
        label: 'Filled'
      }
    case 'cancelled':
      return {
        className: 'bg-brand-gray/10 text-brand-gray border-brand-gray/30',
        label: 'Cancelled'
      }
    default:
      return {
        className: 'bg-brand-amber/10 text-brand-amber border-brand-amber/30',
        label: 'Unknown'
      }
  }
}

export function isExpiringSoon(validUntil: string, daysThreshold: number = 7): boolean {
  const expiryDate = new Date(validUntil)
  const today = new Date()
  const diffTime = expiryDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= daysThreshold && diffDays > 0
}

export function isExpired(validUntil: string): boolean {
  const expiryDate = new Date(validUntil)
  const today = new Date()
  return expiryDate < today
}

// Generate prescription PDF/download functionality
export function generatePrescriptionText(prescription: Prescription): string {
  const header = `
DIGITAL PRESCRIPTION
Prescription #: ${prescription.prescription_number}
Issued: ${formatPrescriptionDate(prescription.issued_date)}
Valid Until: ${formatPrescriptionDate(prescription.valid_until)}

DOCTOR INFORMATION:
${prescription.doctor_name}
HPCSA Number: ${prescription.doctor_hpcsa_number}
${prescription.practice_name ? `Practice: ${prescription.practice_name}` : ''}
${prescription.practice_address ? `Address: ${prescription.practice_address}` : ''}

MEDICATIONS:
`

  const medications = prescription.medications.map((med, index) => `
${index + 1}. ${med.medication_name} ${med.strength}
   Form: ${med.dosage_form}
   Quantity: ${med.quantity}
   Directions: ${med.directions}
   Refills: ${med.refills_used}/${med.refills_allowed}
`).join('')

  const footer = `
${prescription.notes ? `Notes: ${prescription.notes}` : ''}

This is a digital prescription issued through HHWH Online Clinic.
Present this prescription to any licensed pharmacy in South Africa.
`

  return header + medications + footer
}

// Mock data for testing UI when database table doesn't exist
function getMockPrescriptions(): Prescription[] {
  const today = new Date()
  const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  const pastDate = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  
  return [
    {
      id: 'mock-1',
      patient_id: 'mock-patient-1',
      doctor_id: 'mock-doctor-1',
      prescription_number: 'HHWH250129001',
      issued_date: today.toISOString().split('T')[0],
      valid_until: futureDate.toISOString().split('T')[0],
      status: 'active',
      doctor_name: 'Dr. Sarah van der Merwe',
      doctor_hpcsa_number: 'MP0123456',
      practice_name: 'HHWH Online Clinic',
      practice_address: 'Cape Town, South Africa',
      notes: 'Sample prescription for hormone replacement therapy',
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      medications: [
        {
          id: 'mock-med-1',
          prescription_id: 'mock-1',
          medication_name: 'Estradiol',
          generic_name: 'Estradiol',
          strength: '1mg',
          dosage_form: 'Tablet',
          quantity: 30,
          directions: 'Take 1 tablet daily with food',
          refills_allowed: 2,
          refills_used: 0,
          created_at: today.toISOString()
        }
      ]
    },
    {
      id: 'mock-2',
      patient_id: 'mock-patient-1',
      doctor_id: 'mock-doctor-1',
      prescription_number: 'HHWH250115002',
      issued_date: pastDate.toISOString().split('T')[0],
      valid_until: today.toISOString().split('T')[0],
      status: 'filled',
      doctor_name: 'Dr. Sarah van der Merwe',
      doctor_hpcsa_number: 'MP0123456',
      practice_name: 'HHWH Online Clinic',
      practice_address: 'Cape Town, South Africa',
      notes: 'Previous prescription - now filled',
      created_at: pastDate.toISOString(),
      updated_at: today.toISOString(),
      medications: [
        {
          id: 'mock-med-2',
          prescription_id: 'mock-2',
          medication_name: 'Progesterone',
          generic_name: 'Micronized Progesterone',
          strength: '100mg',
          dosage_form: 'Capsule',
          quantity: 30,
          directions: 'Take 1 capsule at bedtime',
          refills_allowed: 1,
          refills_used: 1,
          created_at: pastDate.toISOString()
        }
      ]
    }
  ]
}