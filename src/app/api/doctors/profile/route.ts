import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    // First, let's try a simple insert/update approach instead of upsert
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let updatedProfile, updateError

    if (existingProfile) {
      // Update existing profile
      const result = await supabase
        .from('doctors')
        .update({
          full_name: profileData.full_name,
          specialization: profileData.specialization,
          qualification: profileData.qualification,
          hpcsa_number: profileData.hpcsa_number,
          consultation_fee: profileData.consultation_fee,
          bio: profileData.bio,
          email: profileData.email,
          phone: profileData.phone,
          practice_address: profileData.practice_address,
          available_days: profileData.available_days,
          available_hours: profileData.available_hours,
          is_active: profileData.is_active
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      updatedProfile = result.data
      updateError = result.error
    } else {
      // Insert new profile
      const result = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          full_name: profileData.full_name,
          specialization: profileData.specialization,
          qualification: profileData.qualification,
          hpcsa_number: profileData.hpcsa_number,
          consultation_fee: profileData.consultation_fee,
          bio: profileData.bio,
          email: profileData.email,
          phone: profileData.phone,
          practice_address: profileData.practice_address,
          available_days: profileData.available_days,
          available_hours: profileData.available_hours,
          is_active: profileData.is_active
        })
        .select()
        .single()
      
      updatedProfile = result.data
      updateError = result.error
    }

    if (updateError) {
      console.error('Error updating doctor profile:', updateError)
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Error in profile update:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get doctor profile from the database
    const { data: profile, error: profileError } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Error fetching doctor profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Return profile or null if not found
    return NextResponse.json({ profile })

  } catch (error) {
    console.error('Error in profile fetch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}