import { createClient } from './client'
import { PatientRegistration } from '../validations/patient'
import { Database } from '@/types/database'

type Patient = Database['public']['Tables']['patients']['Insert']

export async function createPatient(data: PatientRegistration) {
  const supabase = createClient()
  
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('You must be logged in to create a patient profile.')
    }

    // First check if user already has a patient record
    console.log('Checking if user already has patient record:', user.id)
    const existingPatient = await getPatientByUserId(user.id)
    
    if (existingPatient) {
      throw new Error('You already have a patient profile. Please update your existing profile instead.')
    }

    // Transform the form data to match database schema (individual columns)
    const patientData: Patient = {
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      profile_photo_url: data.profile_photo_url || null,
      medical_aid_scheme: data.medical_aid_scheme === 'none' ? null : data.medical_aid_scheme,
      medical_aid_number: data.medical_aid_number || null,
      medical_aid_dependent_code: data.medical_aid_dependent_code || null,
      
      // Address fields (individual columns)
      street_address: data.address.street,
      city: data.address.city,
      province: data.address.province,
      postal_code: data.address.postal_code,
      country: 'South Africa',
      
      // Emergency contact fields (individual columns)
      emergency_contact_name: data.emergency_contact.name,
      emergency_contact_relationship: data.emergency_contact.relationship,
      emergency_contact_phone: data.emergency_contact.phone,

      // Document URLs
      id_document_url: data.id_document_url || null,
      medical_aid_card_url: data.medical_aid_card_url || null,
    }

    // The user_id will be set automatically by the trigger

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

export async function updatePatientProfile(data: PatientRegistration) {
  const supabase = createClient()
  
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('You must be logged in to update your patient profile.')
    }

    // Get existing patient record
    const existingPatient = await getPatientByUserId(user.id)
    
    if (!existingPatient) {
      throw new Error('No existing patient profile found. Please create a profile first.')
    }

    // Transform the form data to match database schema (using individual columns)
    const updateData: Partial<Patient> = {
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      profile_photo_url: data.profile_photo_url || null,
      medical_aid_scheme: data.medical_aid_scheme || null,
      medical_aid_number: data.medical_aid_number || null,
      medical_aid_dependent_code: data.medical_aid_dependent_code || null,
      
      // Address fields (individual columns)
      street_address: data.address.street,
      city: data.address.city,
      province: data.address.province,
      postal_code: data.address.postal_code,
      country: 'South Africa',
      
      // Emergency contact fields (individual columns)
      emergency_contact_name: data.emergency_contact.name,
      emergency_contact_relationship: data.emergency_contact.relationship,
      emergency_contact_phone: data.emergency_contact.phone,

      // Document URLs
      id_document_url: data.id_document_url || null,
      medical_aid_card_url: data.medical_aid_card_url || null,
      
      // Update timestamp
      updated_at: new Date().toISOString(),
    }

    // Update the patient record
    const updatedPatient = await updatePatient(existingPatient.id, updateData)
    
    console.log('Patient profile updated successfully:', updatedPatient)
    return updatedPatient

  } catch (error) {
    console.error('Error updating patient profile:', error)
    throw error
  }
}

export async function getPatientByUserId(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error
  }

  return data
}

export async function getCurrentUserPatient() {
  const supabase = createClient()
  
  // Get current authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }

  // Fallback to email-based lookup if user_id column doesn't exist yet
  try {
    return await getPatientByUserId(user.id)
  } catch (error) {
    console.log('user_id lookup failed, trying email fallback:', error)
    // Fallback to email lookup
    if (user.email) {
      return await getPatientByEmail(user.email)
    }
    return null
  }
}

export async function updatePatientDocuments(userId: string, documentUpdates: Partial<Patient>) {
  const supabase = createClient()
  
  try {
    // Get existing patient record by user_id
    const existingPatient = await getPatientByUserId(userId)
    
    if (!existingPatient) {
      throw new Error('No patient profile found. Please create a profile first.')
    }

    // Update only the document fields
    const { data, error } = await supabase
      .from('patients')
      .update({
        ...documentUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data

  } catch (error) {
    console.error('Error updating patient documents:', error)
    throw error
  }
}