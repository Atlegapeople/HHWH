import { createClient } from './client'

export async function checkPatientByEmail(email: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code === 'PGRST116') {
      // No rows found - patient doesn't exist
      return { exists: false, patient: null }
    }

    if (error) {
      console.error('Error checking patient status:', error)
      throw error
    }

    return { exists: true, patient: data }
  } catch (error) {
    console.error('Failed to check patient status:', error)
    throw error
  }
}

export type PatientStatus = 'not_registered' | 'registered' | 'documents_pending' | 'active'

export function getPatientStatus(patient: any): PatientStatus {
  if (!patient) return 'not_registered'
  
  // For now, we'll consider all registered patients as active
  // In the future, we can add document verification status
  return 'active'
}