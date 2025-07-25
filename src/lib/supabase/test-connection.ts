import { createClient } from './client'

export async function testSupabaseConnection() {
  const supabase = createClient()
  
  try {
    // Test basic connection
    console.log('Testing Supabase connection...')
    
    // Test table access by attempting to fetch schema
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error }
    }
    
    console.log('Supabase connection successful!')
    console.log('Sample query result:', data)
    return { success: true, data }
    
  } catch (error) {
    console.error('Failed to connect to Supabase:', error)
    return { success: false, error }
  }
}

export async function testPatientInsert() {
  const supabase = createClient()
  
  const testData = {
    email: 'test@example.com',
    full_name: 'Test Patient',
    phone: '0812345678',
    date_of_birth: '1985-01-01',
    medical_aid_scheme: null,
    medical_aid_number: null,
    medical_aid_dependent_code: null,
    address: {
      street: '123 Test Street',
      city: 'Cape Town',
      province: 'Western Cape',
      postal_code: '8000'
    },
    emergency_contact: {
      name: 'Test Contact',
      relationship: 'Spouse',
      phone: '0813456789'
    }
  }
  
  try {
    console.log('Testing patient insert with data:', testData)
    
    const { data, error } = await supabase
      .from('patients')
      .insert([testData])
      .select()
      .single()
    
    if (error) {
      console.error('Insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error }
    }
    
    console.log('Insert successful:', data)
    
    // Clean up test data
    await supabase
      .from('patients')
      .delete()
      .eq('email', 'test@example.com')
    
    return { success: true, data }
    
  } catch (error) {
    console.error('Test insert failed:', error)
    return { success: false, error }
  }
}