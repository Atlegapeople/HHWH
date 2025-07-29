import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params

    // Use service client to fetch patient data (bypasses RLS)
    const serviceClient = createServiceClient()
    
    // Get all appointments for the doctor with patient data
    const { data: appointments, error: appointmentError } = await serviceClient
      .from('appointments')
      .select(`
        *,
        patients (
          id,
          full_name,
          email,
          phone,
          date_of_birth,
          gender,
          medical_aid_scheme,
          medical_aid_number,
          street_address,
          city,
          province,
          postal_code,
          country,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship,
          profile_photo_url
        )
      `)
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false })

    if (appointmentError) {
      console.error('Error fetching appointments:', appointmentError)
      return NextResponse.json(
        { error: 'Failed to fetch patient data' },
        { status: 500 }
      )
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json([])
    }

    // Group appointments by patient and aggregate data
    const patientMap = new Map()
    
    appointments.forEach(appointment => {
      const patient = appointment.patients
      if (!patient) return

      const patientId = patient.id
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          full_name: patient.full_name,
          email: patient.email,
          phone: patient.phone,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          medical_aid_scheme: patient.medical_aid_scheme,
          medical_aid_number: patient.medical_aid_number,
          address: {
            street_address: patient.street_address,
            city: patient.city,
            province: patient.province,
            postal_code: patient.postal_code,
            country: patient.country
          },
          emergency_contact: {
            name: patient.emergency_contact_name,
            phone: patient.emergency_contact_phone,
            relationship: patient.emergency_contact_relationship
          },
          profile_photo_url: patient.profile_photo_url,
          appointments: [],
          totalAppointments: 0,
          lastAppointment: null,
          firstAppointment: null
        })
      }

      const patientData = patientMap.get(patientId)
      patientData.appointments.push({
        id: appointment.id,
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        consultation_type: appointment.consultation_type,
        appointment_status: appointment.status,
        payment_status: appointment.payment_status,
        symptoms_description: appointment.symptoms_description,
        current_medications: appointment.current_medications,
        allergies: appointment.allergies,
        consultation_fee: appointment.consultation_fee,
        created_at: appointment.created_at
      })
    })

    // Process each patient's data
    const patientsArray = Array.from(patientMap.values()).map(patient => {
      // Sort appointments by date (newest first)
      patient.appointments.sort((a, b) => {
        const dateTimeA = new Date(`${a.appointment_date} ${a.appointment_time}`)
        const dateTimeB = new Date(`${b.appointment_date} ${b.appointment_time}`)
        return dateTimeB.getTime() - dateTimeA.getTime()
      })

      const totalAppointments = patient.appointments.length
      const lastAppointment = patient.appointments[0] // Most recent
      const firstAppointment = patient.appointments[patient.appointments.length - 1] // Oldest

      return {
        ...patient,
        totalAppointments,
        lastAppointment: lastAppointment ? {
          date: lastAppointment.appointment_date,
          time: lastAppointment.appointment_time,
          type: lastAppointment.consultation_type,
          status: lastAppointment.appointment_status
        } : null,
        firstAppointment: firstAppointment ? {
          date: firstAppointment.appointment_date,
          time: firstAppointment.appointment_time
        } : null,
        // Calculate some stats
        completedAppointments: patient.appointments.filter(apt => apt.appointment_status === 'completed').length,
        scheduledAppointments: patient.appointments.filter(apt => apt.appointment_status === 'scheduled').length,
        totalRevenue: patient.appointments
          .filter(apt => apt.payment_status === 'completed' || apt.payment_status === 'paid')
          .reduce((sum, apt) => sum + (apt.consultation_fee || 0), 0)
      }
    })

    // Sort patients by most recent appointment first
    patientsArray.sort((a, b) => {
      if (!a.lastAppointment && !b.lastAppointment) return 0
      if (!a.lastAppointment) return 1
      if (!b.lastAppointment) return -1
      
      const dateA = new Date(`${a.lastAppointment.date} ${a.lastAppointment.time}`)
      const dateB = new Date(`${b.lastAppointment.date} ${b.lastAppointment.time}`)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(patientsArray)

  } catch (error) {
    console.error('Failed to fetch patient data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}