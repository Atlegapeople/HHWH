import { createClient } from './client'
import { AppointmentBooking } from '@/lib/validations/patient'
import { Database } from '@/types/database'
import { getDoctorById } from './doctors'
import { checkPatientByEmail } from './patient-status'

type Appointment = Database['public']['Tables']['appointments']['Insert']

export async function createAppointment(
  bookingData: AppointmentBooking, 
  patientEmail: string
) {
  const supabase = createClient()
  
  try {
    // Get patient by email
    console.log('Finding patient by email:', patientEmail)
    const { exists, patient } = await checkPatientByEmail(patientEmail)
    
    if (!exists || !patient) {
      throw new Error('Patient not found. Please complete registration first.')
    }

    // Get doctor details for consultation fee
    console.log('Getting doctor details for:', bookingData.doctor_id)
    const doctor = await getDoctorById(bookingData.doctor_id)
    
    if (!doctor) {
      throw new Error('Doctor not found.')
    }

    // Check if time slot is already booked
    const existingAppointment = await checkTimeSlotAvailability(
      bookingData.doctor_id,
      bookingData.appointment_date,
      bookingData.appointment_time
    )

    if (existingAppointment) {
      throw new Error('This time slot is no longer available. Please select a different time.')
    }

    // Create appointment data
    const appointmentData: Appointment = {
      patient_id: patient.id,
      doctor_id: bookingData.doctor_id,
      appointment_date: bookingData.appointment_date,
      appointment_time: bookingData.appointment_time,
      payment_method: bookingData.payment_method,
      consultation_fee: doctor.consultation_fee || 0,
      consultation_type: bookingData.consultation_type,
      symptoms_description: bookingData.symptoms_description,
      current_medications: bookingData.current_medications || null,
      allergies: bookingData.allergies || null,
      status: 'scheduled',
      payment_status: bookingData.payment_method === 'medical_aid' ? 'validating' : 'pending'
    }

    console.log('Creating appointment with data:', appointmentData)

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .single()

    if (error) {
      console.error('Supabase error creating appointment:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to create appointment: ${error.message}`)
    }

    console.log('Appointment created successfully:', appointment)
    return appointment

  } catch (error) {
    console.error('Failed to create appointment:', error)
    throw error
  }
}

export async function checkTimeSlotAvailability(
  doctorId: string,
  date: string,
  time: string
): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .neq('status', 'cancelled')
      .single()

    if (error && error.code === 'PGRST116') {
      // No existing appointment found - slot is available
      return false
    }

    if (error) {
      console.error('Error checking availability:', error)
      return false
    }

    // Appointment exists - slot is taken
    return true

  } catch (error) {
    console.error('Failed to check time slot availability:', error)
    return false
  }
}

export async function getPatientAppointments(patientEmail: string) {
  const supabase = createClient()
  
  try {
    // First get patient
    const { exists, patient } = await checkPatientByEmail(patientEmail)
    
    if (!exists || !patient) {
      return []
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors(*)
      `)
      .eq('patient_id', patient.id)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }

    return data

  } catch (error) {
    console.error('Failed to fetch patient appointments:', error)
    throw error
  }
}

export async function getDoctorAppointments(doctorId: string, date?: string) {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*)
      `)
      .eq('doctor_id', doctorId)
      .neq('status', 'cancelled')

    if (date) {
      query = query.eq('appointment_date', date)
    }

    const { data, error } = await query
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })

    if (error) {
      console.error('Error fetching doctor appointments:', error)
      throw error
    }

    return data

  } catch (error) {
    console.error('Failed to fetch doctor appointments:', error)
    throw error
  }
}

export function formatAppointmentDateTime(date: string, time: string): string {
  const appointmentDate = new Date(`${date}T${time}`)
  return appointmentDate.toLocaleString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function generateAppointmentReference(): string {
  const prefix = 'HHWH'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Appointment service class
export class AppointmentService {
  private supabase = createClient()

  async updateAppointment(id: string, updates: Partial<Database['public']['Tables']['appointments']['Update']>): Promise<Database['public']['Tables']['appointments']['Row']> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment:', error)
      throw error
    }

    return data
  }

  async getAppointmentById(id: string): Promise<Database['public']['Tables']['appointments']['Row'] & { patient: Database['public']['Tables']['patients']['Row']; doctor: Database['public']['Tables']['doctors']['Row'] }> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching appointment:', error)
      throw error
    }

    return data
  }

  async getDoctorAppointments(doctorId: string, date?: string): Promise<any[]> {
    try {
      // Use API route to fetch appointments with patient data
      const url = new URL(`/api/appointments/doctor/${doctorId}`, window.location.origin)
      if (date) {
        url.searchParams.set('date', date)
      }

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Error fetching doctor appointments:', error)
      throw error
    }
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Database['public']['Tables']['appointments']['Row']> {
    const { data, error } = await this.supabase
      .from('appointments')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating appointment status:', error)
      throw error
    }

    return data
  }
}

export const appointmentService = new AppointmentService()