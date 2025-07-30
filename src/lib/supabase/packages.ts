import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

// Types for package system
export interface Package {
  id: string
  name: string
  description?: string
  package_type: 'medical_aid' | 'cash'
  price_medical_aid?: number
  price_cash?: number
  validity_months: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PackageConsultation {
  id: string
  package_id: string
  consultation_name: string
  duration_minutes: number
  practitioner_type: 'gp' | 'auxiliary' | 'dietitian' | 'counsellor' | 'biokineticist'
  price_medical_aid: number
  price_cash: number
  procedure_codes?: string[]
  sequence_order: number
  is_required: boolean
  created_at: string
}

export interface PackageAddon {
  id: string
  name: string
  description?: string
  addon_type: 'cgm_discount' | 'dnalysis_discount' | 'dietitian_bundle' | 'counsellor_bundle'
  base_price?: number
  discount_percentage: number
  duration_months: number
  consultation_count: number
  is_active: boolean
  created_at: string
}

export interface PackageSelection {
  id: string
  patient_id: string
  package_id: string
  purchase_date: string
  expiry_date?: string
  total_price: number
  payment_method: 'cash' | 'medical_aid'
  payment_status: 'pending' | 'paid' | 'partial' | 'validating' | 'cancelled' | 'refunded'
  usage_status: 'active' | 'completed' | 'expired' | 'cancelled'
  consultations_used: number
  consultations_total: number
  discount_applied: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface PackageAddonSelection {
  id: string
  package_selection_id: string
  addon_id: string
  purchase_date: string
  expiry_date?: string
  price_paid: number
  usage_status: 'active' | 'completed' | 'expired' | 'cancelled'
  consultations_used: number
  discount_claimed: boolean
  created_at: string
}

// Get all active packages with their consultations
export async function getActivePackages(): Promise<{
  packages: Package[]
  consultations: Record<string, PackageConsultation[]>
  addons: PackageAddon[]
}> {
  try {
    // Get packages
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('package_type', { ascending: true })

    if (packagesError) throw packagesError

    // Get consultations for all packages
    const { data: consultations, error: consultationsError } = await supabase
      .from('package_consultations')
      .select('*')
      .order('sequence_order', { ascending: true })

    if (consultationsError) throw consultationsError

    // Get active addons
    const { data: addons, error: addonsError } = await supabase
      .from('package_addons')
      .select('*')
      .eq('is_active', true)

    if (addonsError) throw addonsError

    // Group consultations by package_id
    const consultationsByPackage = consultations?.reduce((acc, consultation) => {
      if (!acc[consultation.package_id]) {
        acc[consultation.package_id] = []
      }
      acc[consultation.package_id].push(consultation)
      return acc
    }, {} as Record<string, PackageConsultation[]>) || {}

    return {
      packages: packages || [],
      consultations: consultationsByPackage,
      addons: addons || []
    }
  } catch (error) {
    console.error('Error fetching packages:', error)
    throw error
  }
}

// Get package by ID with consultations
export async function getPackageById(packageId: string): Promise<{
  package: Package | null
  consultations: PackageConsultation[]
}> {
  try {
    // Get package
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (packageError) throw packageError

    // Get consultations for this package
    const { data: consultations, error: consultationsError } = await supabase
      .from('package_consultations')
      .select('*')
      .eq('package_id', packageId)
      .order('sequence_order', { ascending: true })

    if (consultationsError) throw consultationsError

    return {
      package: packageData,
      consultations: consultations || []
    }
  } catch (error) {
    console.error('Error fetching package:', error)
    throw error
  }
}

// Create a package selection (purchase a package)
export async function createPackageSelection(
  patientId: string,
  packageId: string,
  paymentMethod: 'cash' | 'medical_aid',
  addonIds: string[] = []
): Promise<PackageSelection> {
  try {
    // Get package details for pricing
    const { package: packageData, consultations } = await getPackageById(packageId)
    if (!packageData) throw new Error('Package not found')

    // Calculate total price
    const basePrice = paymentMethod === 'medical_aid' 
      ? packageData.price_medical_aid || 0
      : packageData.price_cash || 0

    // Create package selection
    const { data: packageSelection, error: selectionError } = await supabase
      .from('package_selections')
      .insert({
        patient_id: patientId,
        package_id: packageId,
        total_price: basePrice,
        payment_method: paymentMethod,
        payment_status: 'pending',
        usage_status: 'active',
        consultations_used: 0,
        discount_applied: 0
      })
      .select()
      .single()

    if (selectionError) throw selectionError

    // Add addon selections if any
    if (addonIds.length > 0) {
      const { data: addons, error: addonsError } = await supabase
        .from('package_addons')
        .select('*')
        .in('id', addonIds)

      if (addonsError) throw addonsError

      const addonSelections = addons.map(addon => ({
        package_selection_id: packageSelection.id,
        addon_id: addon.id,
        price_paid: addon.base_price || 0,
        usage_status: 'active' as const,
        consultations_used: 0,
        discount_claimed: false
      }))

      const { error: addonInsertError } = await supabase
        .from('package_addon_selections')
        .insert(addonSelections)

      if (addonInsertError) throw addonInsertError
    }

    return packageSelection
  } catch (error) {
    console.error('Error creating package selection:', error)
    throw error
  }
}

// Get patient's package selections
export async function getPatientPackageSelections(patientId: string): Promise<{
  selections: PackageSelection[]
  packages: Record<string, Package>
}> {
  try {
    // Get package selections
    const { data: selections, error: selectionsError } = await supabase
      .from('package_selections')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (selectionsError) throw selectionsError

    if (!selections || selections.length === 0) {
      return { selections: [], packages: {} }
    }

    // Get package details
    const packageIds = [...new Set(selections.map(s => s.package_id))]
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .in('id', packageIds)

    if (packagesError) throw packagesError

    // Create packages lookup
    const packagesById = packages?.reduce((acc, pkg) => {
      acc[pkg.id] = pkg
      return acc
    }, {} as Record<string, Package>) || {}

    return {
      selections: selections || [],
      packages: packagesById
    }
  } catch (error) {
    console.error('Error fetching patient package selections:', error)
    throw error
  }
}

// Update package selection payment status
export async function updatePackagePaymentStatus(
  selectionId: string,
  paymentStatus: PackageSelection['payment_status'],
  amountPaid?: number
): Promise<void> {
  try {
    const updateData: any = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    }

    if (amountPaid !== undefined) {
      updateData.amount_paid = amountPaid
    }

    const { error } = await supabase
      .from('package_selections')
      .update(updateData)
      .eq('id', selectionId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating package payment status:', error)
    throw error
  }
}

// Get package usage statistics
export async function getPackageUsageStats(packageId: string): Promise<{
  totalSelections: number
  activeSelections: number
  completedSelections: number
  averageUsage: number
}> {
  try {
    const { data: selections, error } = await supabase
      .from('package_selections')
      .select('usage_status, consultations_used, consultations_total')
      .eq('package_id', packageId)

    if (error) throw error

    const totalSelections = selections?.length || 0
    const activeSelections = selections?.filter(s => s.usage_status === 'active').length || 0
    const completedSelections = selections?.filter(s => s.usage_status === 'completed').length || 0
    
    const averageUsage = selections?.length 
      ? selections.reduce((sum, s) => sum + (s.consultations_used / s.consultations_total), 0) / selections.length
      : 0

    return {
      totalSelections,
      activeSelections,
      completedSelections,
      averageUsage: Math.round(averageUsage * 100) / 100
    }
  } catch (error) {
    console.error('Error fetching package usage stats:', error)
    throw error
  }
}