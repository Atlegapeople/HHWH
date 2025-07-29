import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const { doctorId } = await params

    // Create regular client for appointments (user has access to their doctor's appointments)
    const supabase = await createClient()
    
    // First get appointments
    let appointmentQuery = supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctorId)

    if (date) {
      appointmentQuery = appointmentQuery.eq('appointment_date', date)
    }

    const { data: appointments, error: appointmentError } = await appointmentQuery
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })

    if (appointmentError) {
      console.error('Error fetching doctor appointments:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json([])
    }

    // Get unique patient IDs
    const patientIds = [...new Set(appointments.map(apt => apt.patient_id))]

    // Use service client to fetch patient data (bypasses RLS)
    const serviceClient = createServiceClient()
    const { data: patients, error: patientError } = await serviceClient
      .from('patients')
      .select('id, full_name, email, phone')
      .in('id', patientIds)

    if (patientError) {
      console.error('Error fetching patient data:', patientError)
      // Continue without patient data if there's an error
    }

    // Create a patient lookup map
    const patientMap = new Map()
    if (patients) {
      patients.forEach(patient => {
        patientMap.set(patient.id, patient)
      })
    }

    // Transform data to match expected format
    const transformedData = appointments.map(appointment => {
      const patient = patientMap.get(appointment.patient_id)
      return {
        ...appointment,
        patient_name: patient?.full_name || 'Unknown Patient',
        patient_email: patient?.email || '',
        patient_phone: patient?.phone || '',
        appointment_status: appointment.status,
        payment_status: appointment.payment_status || 'pending'
      }
    })

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('Failed to fetch doctor appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}