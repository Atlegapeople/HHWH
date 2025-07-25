import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { doctorId, action, reason } = await request.json()

    if (!doctorId || !action) {
      return NextResponse.json(
        { error: 'Doctor ID and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      )
    }

    // Get doctor details first
    const { data: doctor, error: fetchError } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('id', doctorId)
      .single()

    if (fetchError || !doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    if (action === 'approve') {
      // Approve the doctor
      const { data: updatedDoctor, error: updateError } = await supabaseAdmin
        .from('doctors')
        .update({ 
          is_active: true,
          approval_date: new Date().toISOString(),
          approval_status: 'approved'
        })
        .eq('id', doctorId)
        .select()
        .single()

      if (updateError) {
        console.error('Doctor approval failed:', updateError)
        return NextResponse.json(
          { error: 'Failed to approve doctor', details: updateError.message },
          { status: 400 }
        )
      }

      // TODO: Send approval email to doctor
      console.log(`Doctor ${doctor.full_name} approved and activated`)

      return NextResponse.json({
        success: true,
        message: 'Doctor approved successfully',
        doctor: updatedDoctor
      })
      
    } else if (action === 'reject') {
      // Reject the doctor application
      const { data: updatedDoctor, error: updateError } = await supabaseAdmin
        .from('doctors')
        .update({ 
          is_active: false,
          approval_date: new Date().toISOString(),
          approval_status: 'rejected',
          rejection_reason: reason || 'Application rejected'
        })
        .eq('id', doctorId)
        .select()
        .single()

      if (updateError) {
        console.error('Doctor rejection failed:', updateError)
        return NextResponse.json(
          { error: 'Failed to reject doctor', details: updateError.message },
          { status: 400 }
        )
      }

      // TODO: Send rejection email to doctor
      console.log(`Doctor ${doctor.full_name} rejected: ${reason}`)

      return NextResponse.json({
        success: true,
        message: 'Doctor application rejected',
        doctor: updatedDoctor
      })
    }

  } catch (error) {
    console.error('Doctor approval/rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Get pending doctors
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'

    let query = supabaseAdmin
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false })

    if (status === 'pending') {
      query = query.eq('is_active', false).is('approval_status', null)
    } else if (status === 'approved') {
      query = query.eq('is_active', true)
    } else if (status === 'rejected') {
      query = query.eq('approval_status', 'rejected')
    } else if (status === 'all') {
      // No additional filters - return all doctors
    }

    const { data: doctors, error } = await query

    if (error) {
      console.error('Failed to fetch doctors:', error)
      console.error('Status requested:', status)
      console.error('Query details:', error.details)
      return NextResponse.json(
        { error: 'Failed to fetch doctors', details: error.message || error.toString() },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      doctors,
      count: doctors.length
    })

  } catch (error) {
    console.error('Fetch doctors error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}