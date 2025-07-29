import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ doctorId: string }> }
) {
  try {
    const { doctorId } = await params

    // Use service client to fetch doctor data (bypasses RLS)
    const serviceClient = createServiceClient()
    const { data: doctor, error } = await serviceClient
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single()

    if (error) {
      console.error('Error fetching doctor profile:', error)
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(doctor)

  } catch (error) {
    console.error('Failed to fetch doctor profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}