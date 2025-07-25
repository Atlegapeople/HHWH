import { createClient } from './client'
import { Database } from '@/types/database'

type Doctor = Database['public']['Tables']['doctors']['Row']

export async function getAllDoctors() {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('is_active', true)
      .order('consultation_fee', { ascending: true })

    if (error) {
      console.error('Error fetching doctors:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch doctors:', error)
    throw error
  }
}

export async function getDoctorById(id: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching doctor:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch doctor:', error)
    throw error
  }
}

// Generate available time slots for a doctor on a specific date
export function generateTimeSlots(doctor: Doctor, date: string): string[] {
  const selectedDate = new Date(date)
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  
  // Check if doctor is available on this day
  if (!doctor.available_days?.includes(dayName)) {
    return []
  }

  const slots: string[] = []
  const hours = doctor.available_hours as { start: string; end: string }
  
  if (!hours?.start || !hours?.end) {
    return []
  }

  const [startHour, startMinute] = hours.start.split(':').map(Number)
  const [endHour, endMinute] = hours.end.split(':').map(Number)
  
  const startTime = startHour * 60 + startMinute
  const endTime = endHour * 60 + endMinute
  
  // Generate 30-minute slots
  for (let time = startTime; time < endTime; time += 30) {
    const hour = Math.floor(time / 60)
    const minute = time % 60
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    slots.push(timeString)
  }
  
  return slots
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount)
}