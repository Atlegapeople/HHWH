import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations
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
    const { doctorId } = await request.json()

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      )
    }

    // Activate the doctor
    const { data: doctor, error: updateError } = await supabaseAdmin
      .from('doctors')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', doctorId)
      .select()
      .single()

    if (updateError) {
      console.error('Doctor activation failed:', updateError)
      return NextResponse.json(
        { error: 'Failed to activate doctor', details: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doctor activated successfully',
      doctor
    })

  } catch (error) {
    console.error('Doctor activation error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Also allow GET to check doctor status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: doctor, error } = await supabaseAdmin
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      doctor
    })

  } catch (error) {
    console.error('Doctor lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}