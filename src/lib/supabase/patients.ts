import { createClient } from './client'
import { PatientRegistration } from '../validations/patient'
import { Database } from '@/types/database'

type Patient = Database['public']['Tables']['patients']['Insert']

export async function createPatient(data: PatientRegistration) {
  const supabase = createClient()
  
  try {
    // First check if patient already exists
    console.log('Checking if patient already exists with email:', data.email)
    const existingPatient = await getPatientByEmail(data.email)
    
    if (existingPatient) {
      throw new Error('A patient with this email address is already registered. Please use a different email or contact support if this is your email.')
    }

    // Transform the form data to match database schema
    const patientData: Patient = {
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      medical_aid_scheme: data.medical_aid_scheme === 'none' ? null : data.medical_aid_scheme,
      medical_aid_number: data.medical_aid_number || null,
      medical_aid_dependent_code: data.medical_aid_dependent_code || null,
      address: data.address,
      emergency_contact: data.emergency_contact,
    }

    console.log('Attempting to insert patient data:', patientData)
    
    const { data: patient, error } = await supabase
      .from('patients')
      .insert([patientData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Database error: ${error.message}`)
    }

    return patient
  } catch (error) {
    console.error('Failed to create patient:', error)
    throw error
  }
}

export async function getPatientByEmail(email: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error
  }

  return data
}

export async function updatePatient(id: string, updates: Partial<Patient>) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}