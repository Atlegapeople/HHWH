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

export type PatientStatus = 'not_registered' | 'profile_incomplete' | 'assessment_needed' | 'active'

export async function getPatientStatus(patient: any): Promise<PatientStatus> {
  if (!patient) return 'not_registered'
  
  // Check for incomplete essential fields
  const hasEssentialInfo = patient.full_name && 
                          patient.email && 
                          patient.phone && 
                          patient.date_of_birth

  if (!hasEssentialInfo) return 'profile_incomplete'
  
  // Check if patient has completed any assessments
  try {
    const supabase = createClient()
    const { data: assessments, error } = await supabase
      .from('symptom_assessments')
      .select('id')
      .eq('patient_id', patient.id)
      .limit(1)

    if (error) {
      console.error('Error checking assessment status:', error)
      // If we can't check assessments, assume they need to take one
      return 'assessment_needed'
    }

    // If they have at least one assessment, they're active
    return assessments && assessments.length > 0 ? 'active' : 'assessment_needed'
  } catch (error) {
    console.error('Failed to check assessment status:', error)
    return 'assessment_needed'
  }
}

export function getProfileCompletionSteps(patient: any) {
  const steps = []
  
  if (!patient) {
    return [
      { id: 'register', label: 'Complete Registration', completed: false, required: true },
      { id: 'assessment', label: 'Take Health Assessment', completed: false, required: true },
      { id: 'booking', label: 'Book First Consultation', completed: false, required: false }
    ]
  }

  // Check essential profile fields
  const hasEssentialInfo = patient.full_name && 
                          patient.email && 
                          patient.phone && 
                          patient.date_of_birth
  
  steps.push({
    id: 'profile',
    label: 'Complete Profile Information',
    completed: hasEssentialInfo,
    required: true
  })

  // Check for assessment (this would need to be determined from assessments table)
  steps.push({
    id: 'assessment',
    label: 'Complete Health Assessment',
    completed: false, // This should be checked against assessments table
    required: true
  })

  // Check for consultation booking
  steps.push({
    id: 'booking',
    label: 'Book Your First Consultation',
    completed: false, // This should be checked against appointments table
    required: false
  })

  return steps
}