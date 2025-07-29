import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    // Create regular client for appointments
    const supabase = await createClient()
    
    // First get the appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (appointmentError) {
      console.error('Error fetching appointment:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to fetch appointment' },
        { status: 500 }
      )
    }

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    // Use service client to fetch patient data (bypasses RLS)
    const serviceClient = createServiceClient()
    const { data: patient, error: patientError } = await serviceClient
      .from('patients')
      .select('id, full_name, email, phone, profile_photo_url')
      .eq('id', appointment.patient_id)
      .single()

    if (patientError) {
      console.error('Error fetching patient data:', patientError)
      // Continue without patient data if there's an error
    }

    // Get doctor data
    const { data: doctor, error: doctorError } = await serviceClient
      .from('doctors')
      .select('id, full_name, specialization, profile_photo_url')
      .eq('id', appointment.doctor_id)
      .single()

    if (doctorError) {
      console.error('Error fetching doctor data:', doctorError)
      // Continue without doctor data if there's an error
    }

    // Transform data to match expected format for consultation page
    const consultationData = {
      ...appointment,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      consultation_type: appointment.consultation_type || 'initial',
      status: appointment.status || 'scheduled',
      symptoms_description: appointment.symptoms_description,
      current_medications: appointment.current_medications,
      allergies: appointment.allergies,
      meeting_room_id: appointment.meeting_room_id,
      doctor: doctor ? {
        id: doctor.id,
        full_name: doctor.full_name,
        specialization: doctor.specialization,
        profile_photo_url: doctor.profile_photo_url
      } : {
        id: appointment.doctor_id,
        full_name: 'Dr. Sarah van der Merwe',
        specialization: 'Women\'s Health Specialist',
        profile_photo_url: null
      },
      patient: patient ? {
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        profile_photo_url: patient.profile_photo_url
      } : {
        id: appointment.patient_id,
        full_name: 'Patient',
        email: '',
        phone: '',
        profile_photo_url: null
      }
    }

    return NextResponse.json(consultationData)

  } catch (error) {
    console.error('Failed to fetch consultation data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}