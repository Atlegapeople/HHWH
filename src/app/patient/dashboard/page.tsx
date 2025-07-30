'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  FileText,
  Activity,
  Brain,
  Thermometer,
  Upload,
  Download,
  Eye,
  Trash2,
  Camera,
  File,
  Pill,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  Timer
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import { getPatientAppointments, formatAppointmentDateTime } from '@/lib/supabase/appointments'
import { getCurrentUserPatient } from '@/lib/supabase/patients'
import { checkPatientByEmail } from '@/lib/supabase/patient-status'
import { formatCurrency } from '@/lib/supabase/doctors'
import { getPatientAssessments, formatAssessmentDate, getSeverityColor, getSeverityBadge, calculateAssessmentScores } from '@/lib/supabase/assessments'
import { getPatientPrescriptions, formatPrescriptionDate, getPrescriptionStatusBadge, isExpiringSoon, isExpired, generatePrescriptionText } from '@/lib/supabase/prescriptions'
import { useAuth } from '@/contexts/AuthContext'
import ProfileCompletionBanner from '@/components/patient/ProfileCompletionBanner'
import RestrictedTabContent from '@/components/patient/RestrictedTabContent'
import AssessmentResultsModal from '@/components/patient/AssessmentResultsModal'
import DocumentUploadModal from '@/components/patient/DocumentUploadModal'
import { getPatientStatus } from '@/lib/supabase/patient-status'
import { useToast } from '@/components/ui/toast'

export default function PatientDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const router = useRouter()
  const [patientData, setPatientData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [patientEmail, setPatientEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(!user?.email) // Only show email input if user is not authenticated
  const [activeTab, setActiveTab] = useState('appointments')

  // Helper function to generate user initials
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Helper function to normalize patient data format
  const normalizePatientData = (data: any) => {
    if (!data) return null
    
    return {
      ...data,
      address: data.address || {
        street: data.street_address || data.address_line_1,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code
      },
      emergency_contact: data.emergency_contact || {
        name: data.emergency_contact_name,
        relationship: data.emergency_contact_relationship,
        phone: data.emergency_contact_phone
      }
    }
  }

  // Auto-load data for authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      setShowEmailInput(false)
      loadAuthenticatedPatientData()
    } else if (!authLoading && !user) {
      setShowEmailInput(true)
    }
  }, [user, authLoading])

  // Handle hash navigation to switch tabs
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'health') {
        setActiveTab('health')
      } else if (hash === 'profile') {
        setActiveTab('profile')
      } else if (hash === 'appointments') {
        setActiveTab('appointments')
      }
    }

    // Check hash on component mount
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  const loadAuthenticatedPatientData = async () => {
    setLoading(true)
    
    try {
      console.log('Loading authenticated patient data...')
      console.log('Current user:', user)
      
      // Get current user's patient record
      const patient = await getCurrentUserPatient()
      console.log('Patient lookup result:', patient)
      
      if (!patient) {
        console.log('No patient profile found for authenticated user')
        // Don't immediately give up - user might have just completed registration
        // Set patientData to null but don't prevent navigation
        setPatientData(null)
        setLoading(false)
        return
      }

      console.log('Patient found:', patient)
      setPatientData(normalizePatientData(patient))
      setPatientEmail(patient.email)

      // Get patient appointments
      console.log('Loading appointments for patient:', patient.email)
      try {
        const appointmentData = await getPatientAppointments(patient.email)
        console.log('Appointments loaded:', appointmentData)
        setAppointments(appointmentData || [])
      } catch (apptError) {
        console.error('Failed to load appointments:', apptError)
        setAppointments([])
      }

      // Get patient assessments
      console.log('Loading assessments for patient:', patient.email)
      try {
        const assessmentData = await getPatientAssessments(patient.email)
        console.log('Assessments loaded:', assessmentData)
        setAssessments(assessmentData || [])
      } catch (assessError) {
        console.error('Failed to load assessments:', assessError)
        setAssessments([])
      }

      // Get patient prescriptions
      console.log('Loading prescriptions for patient:', patient.email)
      try {
        const prescriptionData = await getPatientPrescriptions(patient.email)
        console.log('Prescriptions loaded:', prescriptionData)
        setPrescriptions(prescriptionData || [])
      } catch (prescError) {
        console.error('Failed to load prescriptions:', prescError)
        // Set empty array - not critical for app functionality
        setPrescriptions([])
      }

    } catch (error) {
      console.error('Failed to load patient data - detailed error:', {
        error,
        message: error.message,
        stack: error.stack,
        user: user?.id
      })
      
      // More specific error handling
      if (error.message?.includes('user_id')) {
        alert('Database connection issue. Please refresh the page and try again.')
      } else if (error.message?.includes('auth')) {
        alert('Authentication issue. Please sign out and sign in again.')
      } else {
        alert(`Failed to load patient information: ${error.message}. Please try again.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUploadSuccess = () => {
    // Refresh patient data when documents are uploaded
    if (user) {
      loadAuthenticatedPatientData()
    }
    showToast('Document uploaded successfully!', 'success', 3000)
  }

  const loadPatientData = async (email: string) => {
    if (!email.trim()) {
      alert('Please enter a valid email address.')
      return
    }

    setLoading(true)
    
    try {
      console.log('Loading patient data for:', email)
      
      // This is the fallback for non-authenticated users - keep existing logic
      const { exists, patient } = await checkPatientByEmail(email)
      
      if (!exists || !patient) {
        alert('Patient not found. Please check your email address or complete registration first.')
        setLoading(false)
        return
      }

      console.log('Patient found:', patient)
      setPatientData(normalizePatientData(patient))

      // Get patient appointments
      console.log('Loading appointments for patient...')
      const appointmentData = await getPatientAppointments(email)
      console.log('Appointments loaded:', appointmentData)
      setAppointments(appointmentData)

      // Get patient assessments
      console.log('Loading assessments for patient...')
      const assessmentData = await getPatientAssessments(email)
      console.log('Assessments loaded:', assessmentData)
      setAssessments(assessmentData)
      
      setShowEmailInput(false)

    } catch (error) {
      console.error('Failed to load patient data:', error)
      alert('Failed to load patient information. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentStatusBadge = (appointment: any) => {
    const status = appointment.status
    const paymentStatus = appointment.payment_status

    if (status === 'cancelled') {
      return <Badge variant="outline" className="bg-brand-red/10 text-brand-red border-brand-red/30">Cancelled</Badge>
    }
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30">Completed</Badge>
    }
    if (paymentStatus === 'validating') {
      return <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30">Validating Benefits</Badge>
    }
    if (status === 'scheduled') {
      return <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/30">Scheduled</Badge>
    }
    
    return <Badge variant="outline">{status}</Badge>
  }

  const getAppointmentIcon = (appointment: any) => {
    if (appointment.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-brand-green" />
    }
    if (appointment.status === 'cancelled') {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (appointment.payment_status === 'validating') {
      return <AlertCircle className="h-5 w-5 text-brand-amber" />
    }
    return <Calendar className="h-5 w-5 text-brand-blue" />
  }

  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
    return appointmentDateTime > new Date() && apt.status !== 'cancelled'
  })

  const pastAppointments = appointments.filter(apt => {
    const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`)
    return appointmentDateTime <= new Date() || apt.status === 'completed' || apt.status === 'cancelled'
  })

  if (showEmailInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink via-white to-brand-blue-light/30">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/patient" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Patient Portal</span>
            </Link>
            <Badge variant="outline" className="text-brand-purple">
              Patient Dashboard
            </Badge>
          </div>
        </header>

        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-xl">Access Your Dashboard</CardTitle>
              <CardDescription>
                Enter your email address to view your appointments and health records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your registered email address"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && patientEmail) {
                      loadPatientData(patientEmail)
                    }
                  }}
                />
                <Button
                  onClick={() => patientEmail && loadPatientData(patientEmail)}
                  disabled={!patientEmail || loading}
                  className="btn-healthcare-primary w-full"
                >
                  {loading ? 'Loading...' : 'Access Dashboard'}
                </Button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/patient/register" className="text-brand-blue hover:underline">
                      Register here
                    </Link>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-green-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gray/30 mx-auto"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-brand-green absolute top-0 left-1/2 -translate-x-1/2"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Loading Dashboard</h3>
            <p className="text-muted-foreground animate-pulse">Preparing your health overview...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/20">
      <ToastContainer />
      
      {/* Header */}
      <header className="border-b border-brand-gray/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/patient" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Patient Portal
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
                Patient Dashboard
              </Badge>
              {!user?.email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => {
                    setShowEmailInput(true)
                    setPatientData(null)
                    setAppointments([])
                    setAssessments([])
                  }}
                >
                  Switch Patient
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-xl border border-brand-gray/20 bg-white shadow-lg p-4 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-brand-green/20">
                <AvatarImage 
                  src={patientData?.profile_photo_url || undefined} 
                  alt={`${patientData?.full_name}'s profile photo`}
                />
                <AvatarFallback className="bg-brand-green/10 text-brand-green text-lg font-semibold">
                  {getInitials(patientData?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand-green border-2 border-white shadow-sm"></div>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Welcome back, {patientData?.full_name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Manage your hormone health journey and appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      <div className="container mx-auto px-4 sm:px-6 mb-8">
        <ProfileCompletionBanner
          patient={patientData}
          appointments={appointments}
          assessments={assessments}
        />
      </div>

      {/* Quick Actions Section */}
      <div className="container mx-auto px-4 sm:px-6 mb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Get Started</h2>
          <p className="text-muted-foreground">Take the next step in your hormone health journey</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {/* Complete/Update Registration */}
          <Link href="/patient/register" className="group block">
            <Card className="relative overflow-hidden border border-brand-green/20 bg-gradient-to-br from-brand-green-light/10 to-brand-green/5 hover:shadow-xl hover:shadow-brand-green/20 transition-all duration-300 group-hover:scale-[1.02] h-[520px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="relative p-8 text-center h-full flex flex-col justify-between">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-green/10 mx-auto mb-6 group-hover:scale-110 group-hover:bg-brand-green/20 transition-all duration-300">
                    <User className="h-10 w-10 text-brand-green" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {patientData ? 'Profile Summary' : 'Complete Registration'}
                  </h3>
                  
                  {patientData ? (
                    // Show profile summary
                    <div className="mb-6 space-y-4">
                      <div className="rounded-lg border border-brand-gray/20 bg-white/80 p-4 text-left space-y-3 shadow-sm">
                        <div className="text-sm font-semibold text-foreground">
                          {patientData.full_name}
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {patientData.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {patientData.phone}
                          </div>
                          {patientData.date_of_birth && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(patientData.date_of_birth).toLocaleDateString()}
                            </div>
                          )}
                          {patientData.medical_aid_scheme && (
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              {patientData.medical_aid_scheme}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Profile complete. Update your information anytime.
                      </p>
                    </div>
                  ) : (
                    // Show registration prompt
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      Create your comprehensive patient profile with essential health information and preferences
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white shadow-sm cursor-pointer">
                    {patientData ? 'Update Profile' : 'Start Registration'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {/* Status indicator */}
                  {patientData ? (
                    <Badge variant="secondary" className="bg-brand-green/10 text-brand-green border-brand-green/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Profile Complete
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-brand-amber/10 text-brand-amber/80 border-brand-amber/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Setup Required
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Take Health Assessment */}
          <div 
            onClick={() => {
              // If user is authenticated, allow navigation (even if patientData is still loading)
              if (user || patientData) {
                // If there are assessments, navigate to latest results, otherwise to new assessment
                if (assessments.length > 0) {
                  router.push(`/patient/assessment/results/${assessments[0].id}`);
                } else {
                  router.push("/patient/assessment");
                }
              } else {
                showToast(
                  "Please complete your patient registration first to access the health assessment.",
                  "warning",
                  8000
                );
                setTimeout(() => {
                  router.push("/patient/register");
                }, 3000);
              }
            }}
            className="group cursor-pointer block hover:cursor-pointer"
          >
            <Card className="relative overflow-hidden border border-brand-blue/20 bg-gradient-to-br from-brand-blue-light/10 to-brand-blue/5 hover:shadow-xl hover:shadow-brand-blue/20 transition-all duration-300 group-hover:scale-[1.02] h-[520px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="relative p-8 text-center h-full flex flex-col justify-between">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-blue/10 mx-auto mb-6 group-hover:scale-110 group-hover:bg-brand-blue/20 transition-all duration-300">
                    <Activity className="h-10 w-10 text-brand-blue" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {assessments.length > 0 ? 'Latest Assessment' : 'Health Assessment'}
                  </h3>
                
                {assessments.length > 0 ? (
                  // Show latest assessment summary
                  <div className="mb-6">
                    {(() => {
                      const latestAssessment = assessments[0] // Most recent assessment
                      const scores = calculateAssessmentScores(latestAssessment.assessment_data)
                      const badgeConfig = getSeverityBadge(latestAssessment.severity_level)
                      
                      return (
                        <div className="rounded-lg border border-brand-gray/20 bg-white/80 p-4 mb-4 space-y-4 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-muted-foreground">
                              {formatAssessmentDate(latestAssessment.completed_at)}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${badgeConfig.className} capitalize text-xs`}
                            >
                              {latestAssessment.severity_level.replace('_', ' ')} Impact
                            </Badge>
                          </div>
                          
                          <div className="text-lg font-semibold text-foreground">
                            Total Score: {latestAssessment.total_score}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-muted-foreground">
                              Vasomotor: <span className="font-medium text-foreground">{scores.vasomotorScore}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Psychological: <span className="font-medium text-foreground">{scores.psychologicalScore}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Physical: <span className="font-medium text-foreground">{scores.physicalScore}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Sexual Health: <span className="font-medium text-foreground">{scores.sexualScore}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                    
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {assessments.length > 1 
                        ? `You have ${assessments.length} assessments completed. Track your progress over time.`
                        : 'Your hormone health assessment results. Take a new assessment to track changes.'
                      }
                    </p>
                  </div>
                ) : (
                  // Show assessment prompt for new users
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Complete our comprehensive 65-point hormone health assessment for personalized treatment recommendations
                  </p>
                )}
                </div>
                
                <div className="space-y-4">
                  <div className={`${assessments.length > 0 ? 'grid grid-cols-2 gap-3' : ''}`}>
                    {assessments.length > 0 ? (
                      <>
                        <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                          <AssessmentResultsModal 
                            assessmentId={assessments[0].id}
                            trigger={
                              <Button 
                                size="sm"
                                variant="outline" 
                                className="w-full border-brand-blue/30 text-brand-blue hover:bg-brand-blue/10 cursor-pointer"
                              >
                                View Results
                              </Button>
                            }
                          />
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="cursor-pointer">
                          <Button 
                            size="sm"
                            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm cursor-pointer"
                            onClick={() => {
                              if (user || patientData) {
                                router.push("/patient/assessment");
                              }
                            }}
                          >
                            New Assessment
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm cursor-pointer">
                        Start Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  {assessments.length > 0 ? (
                    <Badge variant="secondary" className="bg-brand-blue/10 text-brand-blue border-brand-blue/30">
                      <Activity className="h-3 w-3 mr-1" />
                      Latest: {new Date(assessments[0].completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-brand-amber/10 text-brand-amber/80 border-brand-amber/30">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Started
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Consultation */}
          <div 
            onClick={() => {
              // If user is authenticated, allow navigation (even if patientData is still loading)  
              if (user || patientData) {
                // If there's an upcoming appointment, navigate to consultation page
                if (upcomingAppointments.length > 0) {
                  router.push(`/patient/consultation/${upcomingAppointments[0].id}`);
                } else {
                  // Otherwise navigate to booking page
                  router.push("/patient/book-appointment");
                }
              } else {
                showToast(
                  "Please complete your patient registration first to book a consultation with our specialists.",
                  "warning",
                  8000
                );
                setTimeout(() => {
                  router.push("/patient/register");
                }, 3000);
              }
            }}
            className="group cursor-pointer block hover:cursor-pointer"
          >
            <Card className="relative overflow-hidden border border-brand-red/20 bg-gradient-to-br from-brand-pink/30 to-brand-red/5 hover:shadow-xl hover:shadow-brand-red/20 transition-all duration-300 group-hover:scale-[1.02] h-[520px] flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="relative p-8 text-center h-full flex flex-col justify-between">
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-red/10 mx-auto mb-6 group-hover:scale-110 group-hover:bg-brand-red/20 transition-all duration-300">
                    <Calendar className="h-10 w-10 text-brand-red" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    {upcomingAppointments.length > 0 ? 'Next Consultation' : 'Book Consultation'}
                  </h3>
                  
                  {upcomingAppointments.length > 0 ? (
                    // Show next appointment details
                    <div className="mb-6">
                      <div className="bg-brand-blue-light/20 border border-brand-blue/30 rounded-lg p-4 mb-4">
                        <div className="text-sm font-medium text-brand-blue mb-2">
                          {formatAppointmentDateTime(upcomingAppointments[0].appointment_date, upcomingAppointments[0].appointment_time)}
                        </div>
                        <div className="text-sm text-brand-blue/80 mb-1">
                          Dr. {upcomingAppointments[0].doctor?.full_name || 'TBA'}
                        </div>
                        <div className="text-xs text-brand-blue/70">
                          {upcomingAppointments[0].consultation_type === 'initial' ? 'Initial Consultation' : 
                           upcomingAppointments[0].consultation_type === 'follow_up' ? 'Follow-up' : 
                           'Consultation'}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {upcomingAppointments.length > 1 
                          ? `You have ${upcomingAppointments.length - 1} more upcoming appointment${upcomingAppointments.length - 1 !== 1 ? 's' : ''} after this one.`
                          : 'Your consultation is coming up. You can also schedule additional appointments.'
                        }
                      </p>
                    </div>
                  ) : (
                    // Show booking prompt
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {appointments.length > 0 
                        ? 'Schedule your next consultation for continued care and monitoring.'
                        : 'Schedule your first virtual consultation with our specialized hormone health experts'
                      }
                    </p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent parent card click
                      if (user || patientData) {
                        router.push("/patient/book-appointment");
                      } else {
                        showToast(
                          "Please complete your patient registration first to book a consultation with our specialists.",
                          "warning",
                          8000
                        );
                        setTimeout(() => {
                          router.push("/patient/register");
                        }, 3000);
                      }
                    }}
                    className="w-full bg-brand-red hover:bg-brand-red/90 text-white shadow-sm cursor-pointer"
                  >
                    {upcomingAppointments.length > 0 ? 'Book Another' : appointments.length > 0 ? 'Book Next' : 'Book First Consultation'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  
                  {/* Status indicator */}
                  {upcomingAppointments.length > 0 ? (
                    <Badge variant="secondary" className="bg-brand-red/10 text-brand-red border-brand-red/30">
                      <Calendar className="h-3 w-3 mr-1" />
                      Next: {formatAppointmentDateTime(upcomingAppointments[0].appointment_date, upcomingAppointments[0].appointment_time).split(' at ')[0]}
                    </Badge>
                  ) : appointments.length > 0 ? (
                    <Badge variant="secondary" className="bg-brand-green/10 text-brand-green border-brand-green/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {appointments.length} Previous
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-brand-amber/10 text-brand-amber/80 border-brand-amber/30">
                      <Heart className="h-3 w-3 mr-1" />
                      Ready to Book
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 sm:px-6 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="health" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" />
              Health Records
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-8">
            {!patientData ? (
              <RestrictedTabContent
                type="appointments"
                reason="no_registration"
              />
            ) : appointments.length === 0 ? (
              <RestrictedTabContent
                type="appointments"
                reason="no_appointments"
                patientName={patientData.full_name}
              />
            ) : (
              <>

            {/* Upcoming Appointments */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  Upcoming Appointments
                </CardTitle>
                <CardDescription className="text-base">
                  Your scheduled consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="rounded-xl border bg-white/60 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAppointmentIcon(appointment)}
                            <div>
                              <h4 className="font-semibold">{appointment.doctor?.full_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {appointment.doctor?.specialization}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {formatAppointmentDateTime(
                                  appointment.appointment_date,
                                  appointment.appointment_time
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {appointment.consultation_type} consultation • {formatCurrency(appointment.consultation_fee)}
                              </p>
                            </div>
                          </div>
                          {getAppointmentStatusBadge(appointment)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Upcoming Appointments</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule your first consultation to get started
                    </p>
                    <Link href="/patient/book-appointment">
                      <Button className="btn-healthcare-primary">
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <Card className="border border-brand-gray/20 shadow-lg bg-gradient-to-br from-brand-gray/5 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-gray/20 ring-2 ring-brand-gray/30">
                      <Clock className="h-5 w-5 text-brand-gray" />
                    </div>
                    Appointment History
                  </CardTitle>
                  <CardDescription className="text-base">
                    Your previous consultations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="rounded-xl border border-brand-gray/20 bg-white/80 p-6 shadow-sm hover:shadow-lg transition-all duration-200 hover:border-brand-gray/40">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAppointmentIcon(appointment)}
                            <div>
                              <h4 className="font-semibold">{appointment.doctor?.full_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatAppointmentDateTime(
                                  appointment.appointment_date,
                                  appointment.appointment_time
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground capitalize">
                                {appointment.consultation_type} consultation
                              </p>
                            </div>
                          </div>
                          {getAppointmentStatusBadge(appointment)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
              </>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            {!patientData ? (
              <RestrictedTabContent
                type="profile"
                reason="no_registration"
              />
            ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50/50 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                        <User className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                        <p className="text-base font-semibold">{patientData?.full_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                        <Mail className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-base font-semibold">{patientData?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base font-semibold">{patientData?.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-base font-semibold">
                          {patientData?.date_of_birth ? 
                            new Date(patientData.date_of_birth).toLocaleDateString() : 
                            'Not provided'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Aid Information */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50/50 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    Medical Aid Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientData?.medical_aid_scheme && patientData.medical_aid_scheme !== 'none' ? (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                            <Shield className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Medical Aid Scheme</p>
                            <p className="text-base font-semibold">{patientData.medical_aid_scheme}</p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Member Number</p>
                            <p className="text-base font-semibold">{patientData.medical_aid_number}</p>
                          </div>
                        </div>
                      </div>
                      {patientData.medical_aid_dependent_code && (
                        <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                              <User className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Dependent Code</p>
                              <p className="text-base font-semibold">{patientData.medical_aid_dependent_code}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border bg-orange-50/50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                          <Heart className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                          <p className="text-base font-semibold">Private Pay</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50/50 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                      <MapPin className="h-5 w-5 text-indigo-600" />
                    </div>
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                        <MapPin className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Address</p>
                        <p className="text-base font-semibold leading-relaxed">
                          {patientData?.address?.street}<br />
                          {patientData?.address?.city}, {patientData?.address?.province}<br />
                          {patientData?.address?.postal_code}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50/50 to-transparent">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                      <Heart className="h-5 w-5 text-rose-600" />
                    </div>
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
                        <User className="h-4 w-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-base font-semibold">{patientData?.emergency_contact?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Heart className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Relationship</p>
                        <p className="text-base font-semibold">{patientData?.emergency_contact?.relationship}</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                        <Phone className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-base font-semibold">{patientData?.emergency_contact?.phone}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health" className="space-y-8">
            {!patientData ? (
              <RestrictedTabContent
                type="health"
                reason="no_registration"
              />
            ) : assessments.length === 0 ? (
              <RestrictedTabContent
                type="health"
                reason="no_assessment"
                patientName={patientData.full_name}
              />
            ) : (
              <>
              {/* Three-column layout: Assessments, Documents & Prescriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                
                {/* Left Column: Assessments */}
                <Card className="border border-brand-purple/20 shadow-lg bg-gradient-to-br from-brand-purple/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10 ring-2 ring-brand-purple/20">
                        <FileText className="h-5 w-5 text-brand-purple" />
                      </div>
                      Health Assessments
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your completed symptom assessments and risk evaluations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessments.length > 0 ? (
                      <div className="space-y-4">
                        {/* Latest Assessment - Expanded */}
                        {(() => {
                          const latestAssessment = assessments[0]
                          const badgeConfig = getSeverityBadge(latestAssessment.severity_level)
                          const scores = latestAssessment.assessment_data ? calculateAssessmentScores(latestAssessment.assessment_data) : null
                          return (
                            <div className="rounded-xl border border-brand-purple/30 bg-white/90 p-6 shadow-sm">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/10">
                                    <FileText className="h-5 w-5 text-brand-purple" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold flex items-center gap-2">
                                      Latest Assessment
                                      <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 text-xs">
                                        Most Recent
                                      </Badge>
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      Completed: {formatAssessmentDate(latestAssessment.completed_at)}
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                      Total Score: {latestAssessment.total_score}
                                    </p>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`${badgeConfig.className} capitalize`}
                                >
                                  {latestAssessment.severity_level.replace('_', ' ')} Impact
                                </Badge>
                              </div>

                              {/* Assessment Summary */}
                              {scores && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <Thermometer className="h-4 w-4 text-brand-red" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Vasomotor</p>
                                      <p className="font-medium text-sm">{scores.vasomotorScore}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-brand-blue" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Psychological</p>
                                      <p className="font-medium text-sm">{scores.psychologicalScore}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-brand-green" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Physical</p>
                                      <p className="font-medium text-sm">{scores.physicalScore}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Heart className="h-4 w-4 text-brand-pink" />
                                    <div>
                                      <p className="text-xs text-muted-foreground">Sexual Health</p>
                                      <p className="font-medium text-sm">{scores.sexualScore}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Button */}
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Link href={`/patient/assessment/results/${latestAssessment.id}`} className="flex-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="w-full"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </Link>
                                <Link href="/patient/assessment">
                                  <Button 
                                    size="sm"
                                    className="bg-brand-purple hover:bg-brand-purple/90 text-white"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Assessment
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )
                        })()}

                        {/* Previous Assessments - Compact */}
                        {assessments.length > 1 && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Previous Assessments ({assessments.length - 1})
                            </h5>
                            {assessments.slice(1, 4).map((assessment, index) => {
                              const badgeConfig = getSeverityBadge(assessment.severity_level)
                              return (
                                <div key={assessment.id} className="rounded-lg border border-brand-gray/20 bg-white/70 p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/10 flex-shrink-0">
                                        <FileText className="h-4 w-4 text-brand-purple" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">
                                          Assessment #{assessments.length - (index + 1)}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {formatAssessmentDate(assessment.completed_at)} • Score: {assessment.total_score}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <Badge 
                                        variant="outline" 
                                        className={`${badgeConfig.className} capitalize text-xs`}
                                      >
                                        {assessment.severity_level.replace('_', ' ')}
                                      </Badge>
                                      <Link href={`/patient/assessment/results/${assessment.id}`}>
                                        <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                            {assessments.length > 4 && (
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  + {assessments.length - 4} more assessments
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-semibold mb-2">No Assessments Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Complete your first hormone health assessment to track your symptoms
                        </p>
                        <Link href="/patient/assessment">
                          <Button className="btn-healthcare-primary">
                            <Activity className="h-4 w-4 mr-2" />
                            Start Assessment
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Right Column: Documents */}
                <Card className="border border-brand-blue/20 shadow-lg bg-gradient-to-br from-brand-blue/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue/10 ring-2 ring-brand-blue/20">
                        <File className="h-5 w-5 text-brand-blue" />
                      </div>
                      Medical Documents
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your uploaded identification and medical documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Current Documents */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5 text-brand-blue" />
                          Current Documents
                        </h4>
                        
                        <div className="space-y-3">
                          {/* ID Document */}
                          <div className="rounded-xl border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 flex-shrink-0">
                                  <Camera className="h-4 w-4 text-brand-green" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-sm truncate">ID Document</h5>
                                  <p className="text-xs text-muted-foreground truncate">South African ID</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {patientData?.id_document_url ? (
                                  <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Missing
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                              {patientData?.id_document_url ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => window.open(patientData.id_document_url, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="sm:w-auto"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = patientData.id_document_url;
                                      link.download = 'id-document';
                                      link.click();
                                    }}
                                  >
                                    <Download className="h-3 w-3 sm:mr-0" />
                                    <span className="sm:hidden ml-1">Download</span>
                                  </Button>
                                </>
                              ) : (
                                <Link href="/patient/register" className="flex-1">
                                  <Button size="sm" className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs">
                                    <Upload className="h-3 w-3 mr-1" />
                                    Upload ID
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Medical Aid Card */}
                          <div className="rounded-xl border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-purple/10 flex-shrink-0">
                                  <Shield className="h-4 w-4 text-brand-purple" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-sm truncate">Medical Aid Card</h5>
                                  <p className="text-xs text-muted-foreground truncate">Insurance card</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {patientData?.medical_aid_card_url ? (
                                  <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Missing
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                              {patientData?.medical_aid_card_url ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => window.open(patientData.medical_aid_card_url, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="sm:w-auto"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = patientData.medical_aid_card_url;
                                      link.download = 'medical-aid-card';
                                      link.click();
                                    }}
                                  >
                                    <Download className="h-3 w-3 sm:mr-0" />
                                    <span className="sm:hidden ml-1">Download</span>
                                  </Button>
                                </>
                              ) : (
                                <Link href="/patient/register" className="flex-1">
                                  <Button size="sm" className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white text-xs">
                                    <Upload className="h-3 w-3 mr-1" />
                                    Upload Card
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Profile Photo */}
                          <div className="rounded-xl border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pink/10 flex-shrink-0">
                                  <User className="h-4 w-4 text-brand-pink" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-semibold text-sm truncate">Profile Photo</h5>
                                  <p className="text-xs text-muted-foreground truncate">Your profile picture</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {patientData?.profile_photo_url ? (
                                  <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Uploaded
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Missing
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2">
                              {patientData?.profile_photo_url ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-xs"
                                    onClick={() => window.open(patientData.profile_photo_url, '_blank')}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="sm:w-auto"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = patientData.profile_photo_url;
                                      link.download = 'profile-photo';
                                      link.click();
                                    }}
                                  >
                                    <Download className="h-3 w-3 sm:mr-0" />
                                    <span className="sm:hidden ml-1">Download</span>
                                  </Button>
                                </>
                              ) : (
                                <Link href="/patient/register" className="flex-1">
                                  <Button size="sm" className="w-full bg-brand-pink hover:bg-brand-pink/90 text-white text-xs">
                                    <Upload className="h-3 w-3 mr-1" />
                                    Upload Photo
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          {/* Upload Additional Documents Card */}
                          <div className="rounded-xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 p-4 shadow-sm hover:border-brand-blue/50 hover:bg-brand-blue/10 transition-all duration-200">
                            <div className="text-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10 mx-auto mb-2">
                                <Plus className="h-4 w-4 text-brand-blue" />
                              </div>
                              <h5 className="font-semibold text-sm mb-2">Additional Documents</h5>
                              <p className="text-xs text-muted-foreground mb-3">
                                Upload medical reports, lab results, or other health documents
                              </p>
                              <DocumentUploadModal onUploadSuccess={handleDocumentUploadSuccess}>
                                <Button
                                  size="sm"
                                  className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white text-xs"
                                >
                                  <Upload className="h-3 w-3 mr-1" />
                                  Upload Documents
                                </Button>
                              </DocumentUploadModal>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Guidelines */}
                      <div className="rounded-lg border border-brand-amber/20 bg-brand-amber/5 p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-brand-amber mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-brand-amber text-sm mb-1">Guidelines</h5>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              <li>• Max 5MB, JPG/PNG/PDF formats</li>
                              <li>• Ensure documents are clear and readable</li>
                              <li>• Documents are securely encrypted</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-brand-gray/20">
                        <Link href="/patient/register" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Update All
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            const hasDocuments = patientData?.id_document_url || patientData?.medical_aid_card_url || patientData?.profile_photo_url;
                            if (hasDocuments) {
                              alert('Document download feature coming soon. You can view individual documents using the View buttons above.');
                            } else {
                              alert('No documents available to download. Please upload documents first.');
                            }
                          }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download All
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Third Column: Prescriptions */}
                <Card className="border border-brand-green/20 shadow-lg bg-gradient-to-br from-brand-green/5 to-transparent">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 ring-2 ring-brand-green/20">
                        <Pill className="h-5 w-5 text-brand-green" />
                      </div>
                      Digital Prescriptions
                    </CardTitle>
                    <CardDescription className="text-base">
                      Your prescribed medications and digital scripts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      
                      {/* Current Prescriptions */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-brand-green" />
                          Active Prescriptions
                        </h4>
                        
                        <div className="space-y-3">
                          {prescriptions.length > 0 ? (
                            prescriptions
                              .filter(prescription => prescription.status === 'active' && !isExpired(prescription.valid_until))
                              .slice(0, 3)
                              .map((prescription) => {
                                const statusBadge = getPrescriptionStatusBadge(prescription.status)
                                const expiringSoon = isExpiringSoon(prescription.valid_until)
                                
                                return (
                                  <div key={prescription.id} className="rounded-xl border border-brand-gray/20 bg-white/90 p-4 shadow-sm">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green/10 flex-shrink-0">
                                          <Pill className="h-4 w-4 text-brand-green" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h5 className="font-semibold text-sm truncate">
                                            Rx #{prescription.prescription_number}
                                          </h5>
                                          <p className="text-xs text-muted-foreground truncate">
                                            Dr. {prescription.doctor_name}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                        <Badge variant="outline" className={statusBadge.className}>
                                          {statusBadge.label}
                                        </Badge>
                                        {expiringSoon && (
                                          <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30 text-xs">
                                            <Timer className="h-3 w-3 mr-1" />
                                            Expires Soon
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Medications Summary */}
                                    <div className="space-y-2 mb-4">
                                      <p className="text-xs text-muted-foreground">
                                        Issued: {formatPrescriptionDate(prescription.issued_date)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Valid until: {formatPrescriptionDate(prescription.valid_until)}
                                      </p>
                                      <div className="text-xs">
                                        <p className="font-medium text-brand-green">
                                          {prescription.medications.length} medication{prescription.medications.length !== 1 ? 's' : ''}:
                                        </p>
                                        <ul className="list-disc list-inside text-muted-foreground mt-1 space-y-0.5">
                                          {prescription.medications.slice(0, 2).map((med) => (
                                            <li key={med.id} className="truncate">
                                              {med.medication_name} {med.strength}
                                            </li>
                                          ))}
                                          {prescription.medications.length > 2 && (
                                            <li className="text-brand-green font-medium">
                                              +{prescription.medications.length - 2} more
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="flex-1 text-xs"
                                        onClick={() => {
                                          // View prescription details
                                          const prescriptionText = generatePrescriptionText(prescription)
                                          alert(prescriptionText)
                                        }}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                      </Button>
                                      <Button 
                                        size="sm"
                                        className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white text-xs"
                                        onClick={() => {
                                          // Download prescription
                                          const prescriptionText = generatePrescriptionText(prescription)
                                          const blob = new Blob([prescriptionText], { type: 'text/plain' })
                                          const url = URL.createObjectURL(blob)
                                          const a = document.createElement('a')
                                          a.href = url
                                          a.download = `prescription-${prescription.prescription_number}.txt`
                                          document.body.appendChild(a)
                                          a.click()
                                          document.body.removeChild(a)
                                          URL.revokeObjectURL(url)
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                )
                              })
                          ) : (
                            <div className="rounded-xl border-2 border-dashed border-brand-green/30 bg-brand-green/5 p-6 text-center">
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-green/10 mx-auto mb-3">
                                <Pill className="h-6 w-6 text-brand-green" />
                              </div>
                              <h5 className="font-semibold text-sm text-brand-green mb-2">No Active Prescriptions</h5>
                              <p className="text-xs text-muted-foreground mb-3">
                                You don't have any active prescriptions yet. Your doctor will issue digital prescriptions during consultations.
                              </p>
                              <Link href="/patient/book-appointment">
                                <Button size="sm" className="bg-brand-green hover:bg-brand-green/90 text-white text-xs">
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  Book Consultation
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Prescription History */}
                      {prescriptions.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />  
                            Recent Prescriptions ({prescriptions.length})
                          </h5>
                          {prescriptions.slice(0, 3).map((prescription) => {
                            const statusBadge = getPrescriptionStatusBadge(prescription.status)
                            return (
                              <div key={prescription.id} className="rounded-lg border border-brand-gray/20 bg-white/70 p-3 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-green/10 flex-shrink-0">
                                      <Pill className="h-3 w-3 text-brand-green" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-xs truncate">
                                        Rx #{prescription.prescription_number}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {formatPrescriptionDate(prescription.issued_date)} • Dr. {prescription.doctor_name}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className={`${statusBadge.className} text-xs`}>
                                    {statusBadge.label}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                          
                          {prescriptions.length > 3 && (
                            <div className="text-center pt-2">
                              <Button variant="outline" size="sm" className="text-xs">
                                View All ({prescriptions.length}) Prescriptions
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Prescription Guidelines */}
                      <div className="rounded-lg border border-brand-green/20 bg-brand-green/5 p-3">
                        <div className="flex items-start gap-2">
                          <Stethoscope className="h-4 w-4 text-brand-green mt-0.5" />
                          <div>
                            <h5 className="font-semibold text-brand-green text-sm mb-1">Digital Prescriptions</h5>
                            <ul className="text-xs text-muted-foreground space-y-0.5">
                              <li>• Valid at all South African pharmacies</li>
                              <li>• Download or show digital copy</li>
                              <li>• Check expiry dates before use</li>
                              <li>• Follow dosage instructions exactly</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}