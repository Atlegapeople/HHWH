'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
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
  Thermometer
} from 'lucide-react'
import Link from 'next/link'
import { getPatientAppointments, formatAppointmentDateTime } from '@/lib/supabase/appointments'
import { checkPatientByEmail } from '@/lib/supabase/patient-status'
import { formatCurrency } from '@/lib/supabase/doctors'
import { getPatientAssessments, formatAssessmentDate, getSeverityColor, getSeverityBadge, calculateAssessmentScores } from '@/lib/supabase/assessments'
import { useAuth } from '@/contexts/AuthContext'

export default function PatientDashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [patientData, setPatientData] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [assessments, setAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [patientEmail, setPatientEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(!user?.email) // Only show email input if user is not authenticated

  // Auto-load data for authenticated users
  useEffect(() => {
    if (!authLoading && user?.email) {
      setPatientEmail(user.email)
      setShowEmailInput(false) // Never show email input for authenticated users
      loadPatientData(user.email)
    } else if (!authLoading && !user) {
      setShowEmailInput(true)
    }
  }, [user, authLoading])

  const loadPatientData = async (email: string) => {
    if (!email.trim()) {
      alert('Please enter a valid email address.')
      return
    }

    setLoading(true)
    
    try {
      console.log('Loading patient data for:', email)
      
      // Get patient information
      const { exists, patient } = await checkPatientByEmail(email)
      
      if (!exists || !patient) {
        alert('Patient not found. Please check your email address or complete registration first.')
        setLoading(false)
        return
      }

      console.log('Patient found:', patient)
      setPatientData(patient)

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
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Cancelled</Badge>
    }
    if (status === 'completed') {
      return <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">Completed</Badge>
    }
    if (paymentStatus === 'validating') {
      return <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">Validating Benefits</Badge>
    }
    if (status === 'scheduled') {
      return <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">Scheduled</Badge>
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
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
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
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p>Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/patient" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Patient Portal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-brand-purple">
              Patient Dashboard
            </Badge>
            {!user?.email && (
              <Button
                variant="ghost"
                size="sm"
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
      </header>

      {/* Welcome Section */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border">
          <div className="flex items-center gap-4">
            <div className="bg-brand-blue/10 p-3 rounded-full">
              <User className="h-8 w-8 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">
                Welcome back, {patientData?.full_name}
              </h1>
              <p className="text-muted-foreground">
                Manage your hormone health journey and appointments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="health">Health Records</TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-brand-green/20 bg-brand-green/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Book New Appointment</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule with your preferred specialist
                      </p>
                    </div>
                    <Link href="/patient/book-appointment">
                      <Button className="btn-healthcare-primary">
                        <Plus className="h-4 w-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-brand-blue/20 bg-brand-blue/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Quick Stats</h3>
                      <p className="text-sm text-muted-foreground">
                        {appointments.length} total appointments • {upcomingAppointments.length} upcoming
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-blue" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your scheduled consultations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    Appointment History
                  </CardTitle>
                  <CardDescription>
                    Your previous consultations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pastAppointments.slice(0, 5).map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
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
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-brand-orange" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{patientData?.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patientData?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patientData?.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">
                        {patientData?.date_of_birth ? 
                          new Date(patientData.date_of_birth).toLocaleDateString() : 
                          'Not provided'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Aid Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-green" />
                    Medical Aid Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientData?.medical_aid_scheme && patientData.medical_aid_scheme !== 'none' ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Medical Aid Scheme</p>
                          <p className="font-medium">{patientData.medical_aid_scheme}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-fit">Member</Badge>
                        <div>
                          <p className="text-sm text-muted-foreground">Member Number</p>
                          <p className="font-medium">{patientData.medical_aid_number}</p>
                        </div>
                      </div>
                      {patientData.medical_aid_dependent_code && (
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="w-fit">Dependent</Badge>
                          <div>
                            <p className="text-sm text-muted-foreground">Dependent Code</p>
                            <p className="font-medium">{patientData.medical_aid_dependent_code}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-brand-orange/5 rounded-lg">
                      <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange">Private Pay</Badge>
                      <p className="text-sm text-muted-foreground">
                        You have chosen to pay privately for consultations
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-blue" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {patientData?.address?.street}<br />
                        {patientData?.address?.city}, {patientData?.address?.province}<br />
                        {patientData?.address?.postal_code}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-brand-red" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{patientData?.emergency_contact?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-fit">{patientData?.emergency_contact?.relationship}</Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">{patientData?.emergency_contact?.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patientData?.emergency_contact?.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="health" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-brand-purple/20 bg-brand-purple/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Complete Assessment</h3>
                      <p className="text-sm text-muted-foreground">
                        Take our comprehensive hormone health assessment
                      </p>
                    </div>
                    <Link href="/patient/assessment">
                      <Button className="btn-healthcare-primary">
                        <Activity className="h-4 w-4 mr-2" />
                        Start Assessment
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-brand-green/20 bg-brand-green/5">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Assessment History</h3>
                      <p className="text-sm text-muted-foreground">
                        {assessments.length} completed assessment{assessments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assessments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-purple" />
                  Hormone Health Assessments
                </CardTitle>
                <CardDescription>
                  Your completed symptom assessments and risk evaluations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length > 0 ? (
                  <div className="space-y-4">
                    {assessments.map((assessment, index) => {
                      const badgeConfig = getSeverityBadge(assessment.severity_level)
                      const scores = assessment.assessment_data ? calculateAssessmentScores(assessment.assessment_data) : null
                      return (
                        <div key={assessment.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-brand-purple/10 p-2 rounded-full">
                                <FileText className="h-5 w-5 text-brand-purple" />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  Assessment #{assessments.length - index}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Completed: {formatAssessmentDate(assessment.completed_at)}
                                </p>
                                <p className="text-sm font-medium mt-1">
                                  Total Score: {assessment.total_score}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${badgeConfig.className} capitalize`}
                            >
                              {assessment.severity_level.replace('_', ' ')} Impact
                            </Badge>
                          </div>

                          {/* Assessment Summary */}
                          {scores && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

                          {/* Recommendations */}
                          {assessment.recommendations && assessment.recommendations.length > 0 && (
                            <div className="border-t pt-4">
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-brand-orange" />
                                Clinical Recommendations
                              </h5>
                              <div className="space-y-1">
                                {assessment.recommendations.slice(0, 3).map((rec: string, recIndex: number) => (
                                  <p key={recIndex} className="text-sm text-muted-foreground">
                                    • {rec}
                                  </p>
                                ))}
                                {assessment.recommendations.length > 3 && (
                                  <p className="text-sm text-brand-blue font-medium">
                                    +{assessment.recommendations.length - 3} more recommendations
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Risk Factors */}
                          {assessment.risk_factors && (
                            <div className="border-t pt-4 mt-4">
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-brand-amber" />
                                Risk Assessment
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {Object.entries(assessment.risk_factors).map(([key, value]) => (
                                  <div key={key} className="text-xs">
                                    <span className="text-muted-foreground capitalize">
                                      {key.replace(/_/g, ' ')}: 
                                    </span>
                                    <span className={`ml-1 font-medium ${value ? 'text-brand-red' : 'text-brand-green'}`}>
                                      {value ? 'Present' : 'Low Risk'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Assessments Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete your first hormone health assessment to track your symptoms and get personalized recommendations
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}