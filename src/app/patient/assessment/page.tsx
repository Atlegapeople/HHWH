'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Thermometer, Moon, Brain, Heart, Activity } from 'lucide-react'
import Link from 'next/link'
import { SymptomAssessment, symptomAssessmentSchema } from '@/lib/validations/patient'
import { createAssessment, calculateAssessmentScores, formatAssessmentDate, getAssessmentById } from '@/lib/supabase/assessments'
import { getCurrentUserPatient } from '@/lib/supabase/patients'
import { useAuth } from '@/contexts/AuthContext'

const ASSESSMENT_STEPS = [
  { id: 1, title: 'Vasomotor Symptoms', description: 'Hot flashes and night sweats', icon: Thermometer },
  { id: 2, title: 'Sleep & Mood', description: 'Sleep quality and emotional wellbeing', icon: Moon },
  { id: 3, title: 'Cognitive & Physical', description: 'Memory, concentration, and physical symptoms', icon: Brain },
  { id: 4, title: 'Sexual & Urinary', description: 'Intimate health and urinary symptoms', icon: Heart },
  { id: 5, title: 'Medical History', description: 'Health background and family history', icon: FileText },
  { id: 6, title: 'Lifestyle & Impact', description: 'Daily habits and quality of life', icon: Activity }
]

// Symptom severity options
const severityOptions = [
  { value: '0', label: 'None', description: 'Not present' },
  { value: '1', label: 'Mild', description: 'Noticeable but not bothersome' },
  { value: '2', label: 'Moderate', description: 'Bothersome but manageable' },
  { value: '3', label: 'Severe', description: 'Significantly impacts daily life' }
]

const frequencyOptions = [
  { value: '0', label: 'Never', description: 'Not experienced' },
  { value: '1', label: 'Rarely', description: 'Less than once per day' },
  { value: '2', label: 'Sometimes', description: '1-5 times per day' },
  { value: '3', label: 'Often', description: '6-10 times per day' },
  { value: '4', label: 'Very Often', description: 'More than 10 times per day' }
]

function SymptomAssessmentContent() {
  const { user, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [patientEmail, setPatientEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null)
  const [isViewingResults, setIsViewingResults] = useState(false)
  const [loadingResults, setLoadingResults] = useState(false)

  // Function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  const form = useForm<SymptomAssessment>({
    resolver: zodResolver(symptomAssessmentSchema),
    defaultValues: {
      // Initialize with clean assessment - use valid enum values for required fields
      hot_flashes_frequency: undefined as any,
      hot_flashes_severity: undefined as any,
      night_sweats_frequency: undefined as any,
      night_sweats_severity: undefined as any,
      sleep_quality: undefined as any,
      sleep_onset_difficulty: undefined as any,
      early_morning_wakening: undefined as any,
      mood_swings: undefined as any,
      irritability: undefined as any,
      anxiety: undefined as any,
      depression: undefined as any,
      concentration_difficulty: undefined as any,
      memory_problems: undefined as any,
      mental_fatigue: undefined as any,
      fatigue: undefined as any,
      joint_aches: undefined as any,
      muscle_tension: undefined as any,
      headaches: undefined as any,
      breast_tenderness: undefined as any,
      weight_gain: undefined as any,
      bloating: undefined as any,
      decreased_libido: undefined as any,
      vaginal_dryness: undefined as any,
      painful_intercourse: undefined as any,
      urinary_urgency: undefined as any,
      urinary_frequency: undefined as any,
      menstrual_status: undefined as any,
      last_menstrual_period: '',
      menstrual_flow_changes: undefined as any,
      age: undefined as any,
      previous_hrt: false,
      current_hrt: false,
      hrt_type: '',
      thyroid_disorder: false,
      diabetes: false,
      high_blood_pressure: false,
      heart_disease: false,
      osteoporosis: false,
      breast_cancer_history: false,
      family_breast_cancer: false,
      family_heart_disease: false,
      family_osteoporosis: false,
      blood_clots_history: false,
      smoking_status: undefined as any,
      alcohol_frequency: undefined as any,
      exercise_frequency: undefined as any,
      exercise_intensity: undefined as any,
      stress_level: undefined as any,
      work_productivity_impact: undefined as any,
      social_activities_impact: undefined as any,
      relationship_impact: undefined as any,
      overall_wellbeing: undefined as any,
      primary_concerns: [],
      treatment_preferences: [],
      treatment_concerns: [],
      current_medications: '',
      vitamins_supplements: '',
      herbal_remedies: '',
      additional_symptoms: '',
      questions_for_doctor: ''
    }
  })

  const { handleSubmit, trigger, formState: { errors } } = form

  // Auto-populate email for authenticated users but still show explanation screen
  useEffect(() => {
    if (!authLoading && user?.email) {
      setPatientEmail(user.email)
      // Keep showEmailInput true to show explanation screen, but email will be pre-filled
    }
  }, [user, authLoading])

  // Load patient data and calculate age from date of birth
  useEffect(() => {
    const loadPatientData = async () => {
      if (!authLoading && user) {
        try {
          const patient = await getCurrentUserPatient()
          if (patient) {
            setPatientData(patient)
            console.log('Patient data loaded:', patient)
            
            // Calculate age from date of birth if available
            if (patient.date_of_birth) {
              const age = calculateAge(patient.date_of_birth)
              setCalculatedAge(age)
              console.log('Calculated age:', age, 'from date of birth:', patient.date_of_birth)
              
              // Set the age in the form
              form.setValue('age', age)
            }
          }
        } catch (error) {
          console.error('Failed to load patient data:', error)
        }
      }
    }

    loadPatientData()
  }, [user, authLoading, form])

  // Check for results view mode from URL params
  useEffect(() => {
    const view = searchParams.get('view')
    const id = searchParams.get('id')
    
    if (view === 'results' && id) {
      console.log('Loading assessment results for ID:', id)
      setIsViewingResults(true)
      setLoadingResults(true)
      
      // Load the specific assessment data
      const loadAssessmentResults = async () => {
        try {
          const assessmentData = await getAssessmentById(id)
          if (assessmentData) {
            console.log('Assessment data loaded:', assessmentData)
            setAssessmentResult(assessmentData)
            setIsCompleted(true) // Show results view
          } else {
            console.error('Assessment not found')
          }
        } catch (error) {
          console.error('Failed to load assessment:', error)
        } finally {
          setLoadingResults(false)
        }
      }
      
      loadAssessmentResults()
    }
  }, [searchParams])

  const nextStep = async () => {
    let isValid = true
    
    // Validate current step fields
    switch (currentStep) {
      case 1:
        isValid = await trigger(['hot_flashes_frequency', 'hot_flashes_severity', 'night_sweats_frequency', 'night_sweats_severity'])
        break
      case 2:
        isValid = await trigger(['sleep_quality', 'sleep_onset_difficulty', 'early_morning_wakening', 'mood_swings', 'irritability', 'anxiety', 'depression'])
        break
      case 3:
        isValid = await trigger(['concentration_difficulty', 'memory_problems', 'mental_fatigue', 'fatigue', 'joint_aches', 'muscle_tension', 'headaches', 'breast_tenderness', 'weight_gain', 'bloating'])
        break
      case 4:
        isValid = await trigger(['decreased_libido', 'vaginal_dryness', 'painful_intercourse', 'urinary_urgency', 'urinary_frequency', 'menstrual_status', 'menstrual_flow_changes'])
        break
      case 5:
        isValid = await trigger(['age', 'previous_hrt', 'current_hrt', 'thyroid_disorder', 'diabetes', 'high_blood_pressure', 'heart_disease', 'osteoporosis', 'breast_cancer_history', 'family_breast_cancer', 'family_heart_disease', 'family_osteoporosis', 'blood_clots_history'])
        break
      case 6:
        isValid = await trigger(['smoking_status', 'alcohol_frequency', 'exercise_frequency', 'exercise_intensity', 'stress_level', 'work_productivity_impact', 'social_activities_impact', 'relationship_impact', 'overall_wellbeing', 'primary_concerns'])
        break
    }

    if (!isValid) return

    setCurrentStep(prev => Math.min(prev + 1, ASSESSMENT_STEPS.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: SymptomAssessment) => {
    if (!patientEmail) {
      alert('Please enter your email address first.')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Submitting assessment:', data)
      
      // Save assessment to database
      const savedAssessment = await createAssessment(data, patientEmail)
      console.log('Assessment saved successfully:', savedAssessment)
      
      // Calculate scores for display
      const scores = calculateAssessmentScores(data)
      
      setAssessmentResult({
        ...savedAssessment,
        scores
      })
      setIsCompleted(true)
    } catch (error) {
      console.error('Failed to submit assessment:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save assessment. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / ASSESSMENT_STEPS.length) * 100

  // Loading state for authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-green-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Email input screen
  if (showEmailInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/10 via-white to-brand-blue-light/15">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/patient/dashboard" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <Badge variant="outline" className="text-brand-purple">
              Symptom Assessment
            </Badge>
          </div>
        </header>

        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-brand-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-brand-green" />
              </div>
              <CardTitle className="font-heading text-2xl">Comprehensive Health Assessment</CardTitle>
              <CardDescription className="text-base">
                Complete our detailed 65-point hormone health evaluation to help your doctor provide personalized care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What This Assessment Covers:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Hot flashes, night sweats, and vasomotor symptoms</li>
                    <li>• Sleep quality, mood changes, and cognitive function</li>
                    <li>• Physical symptoms and sexual health</li>
                    <li>• Medical history and family health background</li>
                    <li>• Lifestyle factors and quality of life impact</li>
                    <li>• Treatment preferences and goals</li>
                  </ul>
                </div>

                {/* Email input section - only show for non-authenticated users */}
                {!user && (
                  <div className="space-y-4">
                    <Label htmlFor="email">Your Email Address</Label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your registered email address"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    />
                    <p className="text-sm text-muted-foreground">
                      This links your assessment to your patient profile for your doctor's review.
                    </p>
                  </div>
                )}

                {/* Welcome message for authenticated users */}
                {user && (
                  <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                    <p className="text-sm">
                      <span className="font-medium">Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!</span>
                      <br />
                      Your assessment will be linked to your patient profile: <strong>{user.email}</strong>
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (user || patientEmail.trim()) {
                      setShowEmailInput(false)
                    } else {
                      alert('Please enter your email address')
                    }
                  }}
                  disabled={!user && !patientEmail.trim()}
                  className="btn-healthcare-primary w-full"
                >
                  Start Assessment (15-20 minutes)
                </Button>

                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Don't have an account?{' '}
                      <Link href="/patient/register" className="text-brand-green hover:underline">
                        Register here first
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Completion screen
  if (isCompleted && assessmentResult) {
    const { scores, severity_level, total_score, recommendations } = assessmentResult
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/15 via-white to-brand-green-light/15 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-brand-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-brand-green" />
            </div>
            <CardTitle className="font-heading text-2xl text-brand-green">Assessment Complete!</CardTitle>
            <CardDescription>
              Your comprehensive hormone health assessment has been analyzed and saved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assessment Results Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Summary */}
              <Card className="bg-brand-blue/5 border-brand-blue/20">
                <CardHeader>
                  <CardTitle className="text-lg">Assessment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Score:</span>
                    <span className="font-bold text-lg">{total_score}/60+</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Severity Level:</span>
                    <Badge variant="outline" className={`${
                      severity_level === 'mild' ? 'bg-brand-green/10 text-brand-green border-brand-green/20' :
                      severity_level === 'moderate' ? 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' :
                      severity_level === 'severe' ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' :
                      'bg-brand-red/10 text-brand-red border-brand-red/20'
                    }`}>
                      {severity_level.charAt(0).toUpperCase() + severity_level.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed: {formatAssessmentDate(assessmentResult.completed_at)}
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="bg-brand-purple/5 border-brand-purple/20">
                <CardHeader>
                  <CardTitle className="text-lg">Symptom Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Vasomotor (Hot Flashes)</span>
                    <span className="font-medium">{scores.vasomotorScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Psychological (Mood/Sleep)</span>
                    <span className="font-medium">{scores.psychologicalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Physical Symptoms</span>
                    <span className="font-medium">{scores.physicalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sexual/Urogenital</span>
                    <span className="font-medium">{scores.sexualScore}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clinical Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <Card className="bg-brand-green/5 border border-brand-green/20">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-green">Clinical Recommendations</CardTitle>
                  <CardDescription>
                    Based on your assessment, our medical team recommends:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {recommendations.slice(0, 6).map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-brand-green font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                    {recommendations.length > 6 && (
                      <li className="text-muted-foreground italic">
                        + {recommendations.length - 6} more recommendations available in your consultation
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-brand-blue">What Happens Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Your assessment has been securely saved to your patient record</li>
                <li>• Our medical team will review your results before your consultation</li>
                <li>• This detailed analysis helps your doctor provide personalized treatment</li>
                <li>• Schedule a consultation to discuss your results and treatment options</li>
                <li>• You can view your complete assessment anytime in your dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/patient/book-appointment">
                <Button className="btn-healthcare-primary">
                  Book Consultation to Discuss Results
                </Button>
              </Link>
              <Link href="/patient/dashboard">
                <Button variant="outline">
                  View Patient Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/10 via-white to-brand-blue-light/15">
      {/* Header */}
      <header className="border-b border-brand-gray/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium bg-brand-purple/10 text-brand-purple border-brand-purple/30">
              Assessment - Step {currentStep} of {ASSESSMENT_STEPS.length}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-brand-gray/20 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-heading font-bold text-foreground">Hormone Health Assessment</h1>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-green">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
          <Progress value={progressPercentage} className="mb-6 h-3" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
            {ASSESSMENT_STEPS.map((step) => {
              const IconComponent = step.icon
              return (
                <div
                  key={step.id}
                  className={`text-center p-3 rounded-lg flex flex-col items-center gap-2 transition-all duration-200 ${
                    step.id === currentStep
                      ? 'bg-brand-green text-white shadow-md scale-105'
                      : step.id < currentStep
                      ? 'bg-brand-green/15 text-brand-green border border-brand-green/30'
                      : 'bg-brand-gray/10 text-brand-gray border border-brand-gray/20'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="font-medium text-xs hidden md:block leading-tight">{step.title}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Assessment Form */}
      <div className="container mx-auto px-6 pb-12">
        <Card className="max-w-4xl mx-auto border border-brand-gray/20 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="font-heading text-2xl flex items-center gap-3 text-foreground">
              {React.createElement(ASSESSMENT_STEPS[currentStep - 1].icon, { className: "h-6 w-6 text-brand-green" })}
              {ASSESSMENT_STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {ASSESSMENT_STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 1: Vasomotor Symptoms */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">About Hot Flashes & Night Sweats</h3>
                      <p className="text-sm text-muted-foreground">
                        These are the most common symptoms of hormonal changes. Please rate both the frequency (how often) and severity (how bothersome) of each symptom.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Hot Flashes */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg text-brand-red flex items-center gap-2">
                          <Thermometer className="h-5 w-5" />
                          Hot Flashes
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name="hot_flashes_frequency"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How often do you experience hot flashes?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-3"
                                >
                                  {frequencyOptions.slice(0, 5).map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-red/30 hover:bg-brand-red/5 transition-all cursor-pointer">
                                      <RadioGroupItem value={option.value} id={`hf_freq_${option.value}`} className="mt-1" />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`hf_freq_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {option.description}
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hot_flashes_severity"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How severe are your hot flashes when they occur?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-2"
                                >
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`hf_sev_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`hf_sev_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {option.description}
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Night Sweats */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg text-brand-blue flex items-center gap-2">
                          <Moon className="h-5 w-5" />
                          Night Sweats
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name="night_sweats_frequency"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How often do you experience night sweats?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-3"
                                >
                                  {frequencyOptions.slice(0, 5).map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem value={option.value} id={`ns_freq_${option.value}`} className="mt-1" />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`ns_freq_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {option.description}
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="night_sweats_severity"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How severe are your night sweats when they occur?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="space-y-3"
                                >
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem value={option.value} id={`ns_sev_${option.value}`} className="mt-1" />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`ns_sev_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">
                                          {option.description}
                                        </div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Sleep & Mood Symptoms */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-xl p-6 shadow-sm">
                      <h3 className="font-semibold mb-3 text-brand-blue">Sleep Quality & Emotional Wellbeing</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Hormonal changes significantly affect sleep patterns and emotional regulation. These questions help assess the impact on your daily functioning.
                      </p>
                    </div>

                    <div className="grid gap-8">
                      {/* Sleep Quality Section */}
                      <div className="space-y-6">
                        <h4 className="font-semibold text-lg text-brand-blue flex items-center gap-2">
                          <Moon className="h-5 w-5" />
                          Sleep Assessment
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name="sleep_quality"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Overall, how would you rate your sleep quality over the past month?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="0" id="sleep_0" />
                                    <Label htmlFor="sleep_0" className="flex-1">
                                      <span className="font-medium">Excellent</span>
                                      <span className="text-sm text-muted-foreground ml-2">Sleep is very satisfying, feel well-rested</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="1" id="sleep_1" />
                                    <Label htmlFor="sleep_1" className="flex-1">
                                      <span className="font-medium">Good</span>
                                      <span className="text-sm text-muted-foreground ml-2">Generally sleep well, occasional issues</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="2" id="sleep_2" />
                                    <Label htmlFor="sleep_2" className="flex-1">
                                      <span className="font-medium">Poor</span>
                                      <span className="text-sm text-muted-foreground ml-2">Frequently disrupted, feel tired during day</span>
                                    </Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="3" id="sleep_3" />
                                    <Label htmlFor="sleep_3" className="flex-1">
                                      <span className="font-medium">Very Poor</span>
                                      <span className="text-sm text-muted-foreground ml-2">Severely disrupted, significantly impacts daily function</span>
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="sleep_onset_difficulty"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How often do you have trouble falling asleep within 30 minutes?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {[
                                    { value: '0', label: 'Never', desc: 'Fall asleep easily most nights' },
                                    { value: '1', label: 'Sometimes', desc: '1-2 nights per week' },
                                    { value: '2', label: 'Often', desc: '3-4 nights per week' },
                                    { value: '3', label: 'Always', desc: '5+ nights per week' }
                                  ].map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`sleep_onset_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`sleep_onset_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.desc}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="early_morning_wakening"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How often do you wake up earlier than planned and can't get back to sleep?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`wake_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`wake_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Mood & Emotional Symptoms */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-brand-purple flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Emotional & Psychological Symptoms
                        </h4>
                        
                        <FormField
                          control={form.control}
                          name="mood_swings"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Mood swings or emotional ups and downs</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`mood_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`mood_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="irritability"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Irritability or feeling easily annoyed</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`irritability_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`irritability_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="anxiety"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Anxiety, nervousness, or feeling tense</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`anxiety_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`anxiety_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="depression"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Feeling sad, down, or depressed</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={"depression-" + option.value} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={"depression-" + option.value}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Cognitive & Physical Symptoms */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">Cognitive Function & Physical Symptoms</h3>
                      <p className="text-sm text-muted-foreground">
                        Hormonal changes can affect cognitive function, energy levels, and cause various physical symptoms. Rate how these symptoms impact your daily life.
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Cognitive Symptoms */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-orange border-b pb-2">Cognitive & Mental Function</h4>
                        
                        <FormField
                          control={form.control}
                          name="concentration_difficulty"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Difficulty concentrating or focusing on tasks</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={"concentration-" + option.value} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={"concentration-" + option.value}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="memory_problems"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Memory problems (forgetting names, appointments, where you put things)</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`memory_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`memory_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="mental_fatigue"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Mental fatigue or "brain fog" - feeling mentally sluggish</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`mental_fatigue_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`mental_fatigue_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Physical Symptoms */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-green border-b pb-2">Physical Symptoms</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fatigue"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Physical fatigue or lack of energy</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`fatigue_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`fatigue_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="joint_aches"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Joint aches and pains</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`joint_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`joint_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="muscle_tension"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Muscle tension or stiffness</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`muscle_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`muscle_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="headaches"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Headaches (frequency or severity changes)</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`headaches_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`headaches_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="breast_tenderness"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Breast tenderness or sensitivity</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`breast_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`breast_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="weight_gain"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Weight gain or difficulty losing weight</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`weight_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`weight_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="bloating"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Bloating or abdominal discomfort</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`bloating_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`bloating_${option.value}`}>
                                          {option.label}
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Sexual & Urogenital Symptoms */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">Sexual Health & Urogenital Symptoms</h3>
                      <p className="text-sm text-muted-foreground">
                        Hormonal changes commonly affect sexual function and urinary health. These questions help assess symptoms that may benefit from hormone therapy. All responses are confidential.
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Sexual Health */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-red border-b pb-2">Sexual Function</h4>
                        
                        <FormField
                          control={form.control}
                          name="decreased_libido"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Decreased interest in sex or sexual activity</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`libido_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`libido_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="vaginal_dryness"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Vaginal dryness or lack of natural lubrication</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`dryness_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`dryness_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="painful_intercourse"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Pain or discomfort during sexual intercourse</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`pain_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`pain_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Urinary Symptoms */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-blue border-b pb-2">Urinary Health</h4>
                        
                        <FormField
                          control={form.control}
                          name="urinary_urgency"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Sudden, strong urges to urinate that are difficult to control</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`urgency_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`urgency_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="urinary_frequency"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Needing to urinate more frequently than usual, including at night</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  {severityOptions.map((option) => (
                                    <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value={option.value} id={`frequency_${option.value}`} />
                                      <Label className="flex-1 cursor-pointer" htmlFor={`frequency_${option.value}`}>
                                        <div className="font-medium text-foreground">{option.label}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                      </Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Menstrual History */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-purple border-b pb-2">Menstrual History</h4>
                        
                        <FormField
                          control={form.control}
                          name="menstrual_status"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">What best describes your current menstrual status?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="regular" id="regular" />
                                    <Label htmlFor="regular">Regular periods (cycles 21-35 days apart)</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="irregular" id="irregular" />
                                    <Label htmlFor="irregular">Irregular periods (unpredictable timing or flow)</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="stopped_less_than_1_year" id="stopped_recent" />
                                    <Label htmlFor="stopped_recent">Periods stopped less than 1 year ago</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="stopped_more_than_1_year" id="stopped_over_year" />
                                    <Label htmlFor="stopped_over_year">Periods stopped more than 1 year ago</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="hysterectomy" id="hysterectomy" />
                                    <Label htmlFor="hysterectomy">Have had hysterectomy</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="last_menstrual_period"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">When was your last menstrual period? (approximate date)</FormLabel>
                              <FormControl>
                                <input
                                  type="month"
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="menstrual_flow_changes"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Have you noticed changes in your menstrual flow over the past year?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="0" id="flow_0" />
                                    <Label htmlFor="flow_0">No change in flow</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="1" id="flow_1" />
                                    <Label htmlFor="flow_1">Flow became lighter</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="2" id="flow_2" />
                                    <Label htmlFor="flow_2">Flow became heavier</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="3" id="flow_3" />
                                    <Label htmlFor="flow_3">Flow became very irregular (unpredictable)</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Medical History */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">Medical & Family History</h3>
                      <p className="text-sm text-muted-foreground">
                        Your medical history and family health background help determine the safest and most effective treatment options for you.
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-purple border-b pb-2">Basic Information</h4>
                        
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Your current age</FormLabel>
                              <FormControl>
                                {calculatedAge !== null ? (
                                  <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-32 rounded-md border border-input bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                                      {calculatedAge} years
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      (calculated from your date of birth)
                                    </span>
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    min="18"
                                    max="100"
                                    placeholder="Enter your age"
                                    className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Hormone Therapy History */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-green border-b pb-2">Hormone Therapy Experience</h4>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="previous_hrt"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Have you ever used hormone replacement therapy (HRT) in the past?
                                </FormLabel>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="current_hrt"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Are you currently using any form of hormone therapy?
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="hrt_type"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">If yes, what type of hormone therapy? (current or most recent)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="e.g., Estradiol patches, Progesterone capsules, Combined HRT tablets, etc."
                                  className="min-h-[60px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Personal Medical History */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-orange border-b pb-2">Personal Medical History</h4>
                        <p className="text-sm text-muted-foreground">
                          Please check all conditions that apply to you:
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { name: 'thyroid_disorder', label: 'Thyroid disorder (hyper/hypothyroidism)' },
                            { name: 'diabetes', label: 'Diabetes (Type 1 or Type 2)' },
                            { name: 'high_blood_pressure', label: 'High blood pressure (hypertension)' },
                            { name: 'heart_disease', label: 'Heart disease or cardiovascular problems' },
                            { name: 'osteoporosis', label: 'Osteoporosis or low bone density' },
                            { name: 'breast_cancer_history', label: 'Personal history of breast cancer' },
                            { name: 'blood_clots_history', label: 'History of blood clots (DVT, PE, stroke)' }
                          ].map((condition) => (
                            <FormField
                              key={condition.name}
                              control={form.control}
                              name={condition.name as any}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {condition.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Family History */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-red border-b pb-2">Family Medical History</h4>
                        <p className="text-sm text-muted-foreground">
                          Please check conditions that run in your immediate family (parents, siblings, children):
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            { name: 'family_breast_cancer', label: 'Breast cancer' },
                            { name: 'family_heart_disease', label: 'Heart disease or heart attacks' },
                            { name: 'family_osteoporosis', label: 'Osteoporosis or hip fractures' }
                          ].map((condition) => (
                            <FormField
                              key={condition.name}
                              control={form.control}
                              name={condition.name as any}
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {condition.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Lifestyle & Impact */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold mb-2">Lifestyle Factors & Quality of Life Impact</h3>
                      <p className="text-sm text-muted-foreground">
                        Lifestyle factors affect hormone therapy recommendations and treatment outcomes. Understanding the impact on your quality of life helps us provide personalized care.
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {/* Lifestyle Factors */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-amber border-b pb-2">Lifestyle Habits</h4>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="smoking_status"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Smoking status</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="never" id="smoke_never" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="smoke_never">Never smoked</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="former" id="smoke_former" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="smoke_former">Former smoker (quit)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="current_light" id="smoke_light" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="smoke_light">Current smoker (1-10 per day)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="current_moderate" id="smoke_moderate" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="smoke_moderate">Current smoker (11-20 per day)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="current_heavy" id="smoke_heavy" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="smoke_heavy">Current smoker (20+ per day)</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="alcohol_frequency"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Alcohol consumption</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="never" id="alcohol_never" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="alcohol_never">Never or rarely</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="rarely" id="alcohol_rarely" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="alcohol_rarely">1-2 drinks per month</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="weekly" id="alcohol_weekly" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="alcohol_weekly">1-7 drinks per week</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="daily" id="alcohol_daily" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="alcohol_daily">1-2 drinks daily</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="multiple_daily" id="alcohol_multiple" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="alcohol_multiple">3+ drinks daily</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="exercise_frequency"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Exercise frequency</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="none" id="exercise_none" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="exercise_none">No regular exercise</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="rarely" id="exercise_rarely" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="exercise_rarely">Rarely (less than weekly)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="1-2_weekly" id="exercise_12" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="exercise_12">1-2 times per week</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="3-4_weekly" id="exercise_34" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="exercise_34">3-4 times per week</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="5+_weekly" id="exercise_5plus" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="exercise_5plus">5+ times per week</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="exercise_intensity"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Exercise intensity (when you do exercise)</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="light" id="intensity_light" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="intensity_light">Light (walking, gentle yoga)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="moderate" id="intensity_moderate" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="intensity_moderate">Moderate (brisk walking, swimming)</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="vigorous" id="intensity_vigorous" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="intensity_vigorous">Vigorous (running, intense fitness)</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="stress_level"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">How would you rate your current stress level?</FormLabel>
                              <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="low" id="stress_low" />
                                    <Label htmlFor="stress_low">Low</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="moderate" id="stress_moderate" />
                                    <Label htmlFor="stress_moderate">Moderate</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="high" id="stress_high" />
                                    <Label htmlFor="stress_high">High</Label>
                                  </div>
                                  <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                    <RadioGroupItem className="mt-1" value="very_high" id="stress_very_high" />
                                    <Label htmlFor="stress_very_high">Very High</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Current Medications */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-blue border-b pb-2">Current Medications & Supplements</h4>
                        
                        <div className="grid gap-4">
                          <FormField
                            control={form.control}
                            name="current_medications"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Current prescription medications</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="List all prescription medications with dosages (e.g., Metformin 500mg twice daily)"
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="vitamins_supplements"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Vitamins and supplements</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="List vitamins, minerals, and supplements (e.g., Vitamin D 2000IU, Calcium 600mg)"
                                    className="min-h-[60px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="herbal_remedies"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">Herbal remedies or natural products</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Include any herbal remedies, natural products, or alternative treatments"
                                    className="min-h-[60px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Quality of Life Impact */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-purple border-b pb-2">Quality of Life Impact</h4>
                        
                        <div className="grid gap-6">
                          <FormField
                            control={form.control}
                            name="work_productivity_impact"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">How do your symptoms affect your work productivity?</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {[
                                      { value: '0', label: 'No impact', desc: 'Symptoms don\'t affect work performance' },
                                      { value: '1', label: 'Mild impact', desc: 'Occasionally affects concentration or energy' },
                                      { value: '2', label: 'Moderate impact', desc: 'Regularly affects work quality or efficiency' },
                                      { value: '3', label: 'Severe impact', desc: 'Significantly impairs work performance' }
                                    ].map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`work_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`work_${option.value}`}>
                                          <div className="font-medium text-foreground">{option.label}</div>
                                          <div className="text-sm text-muted-foreground mt-1">{option.desc}</div>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="social_activities_impact"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">How do your symptoms affect your social activities?</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`social_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`social_${option.value}`}>
                                          <div className="font-medium text-foreground">{option.label}</div>
                                          <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="relationship_impact"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">How do your symptoms affect your personal relationships?</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    {severityOptions.map((option) => (
                                      <div key={option.value} className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                        <RadioGroupItem className="mt-1" value={option.value} id={`relationship_${option.value}`} />
                                        <Label className="flex-1 cursor-pointer" htmlFor={`relationship_${option.value}`}>
                                          <div className="font-medium text-foreground">{option.label}</div>
                                          <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="overall_wellbeing"
                            render={({ field }) => (
                              <FormItem className="space-y-4">
                                <FormLabel className="text-base font-medium">How would you rate your overall sense of wellbeing?</FormLabel>
                                <FormControl>
                                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="excellent" id="wellbeing_excellent" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="wellbeing_excellent">Excellent</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="good" id="wellbeing_good" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="wellbeing_good">Good</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="fair" id="wellbeing_fair" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="wellbeing_fair">Fair</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="poor" id="wellbeing_poor" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="wellbeing_poor">Poor</Label>
                                    </div>
                                    <div className="flex items-start space-x-3 p-3 rounded-lg border border-brand-gray/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                                      <RadioGroupItem className="mt-1" value="very_poor" id="wellbeing_very_poor" />
                                      <Label className="flex-1 cursor-pointer" htmlFor="wellbeing_very_poor">Very Poor</Label>
                                    </div>
                                  </RadioGroup>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Treatment Goals */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-green border-b pb-2">Treatment Goals & Preferences</h4>
                        
                        <FormField
                          control={form.control}
                          name="primary_concerns"
                          render={() => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base">What are your main concerns you'd like to address? (Select all that apply)</FormLabel>
                              <div className="grid md:grid-cols-2 gap-3 mt-3">
                                {[
                                  'Hot flashes/night sweats',
                                  'Sleep problems',
                                  'Mood changes/depression',
                                  'Sexual health issues',
                                  'Weight management',
                                  'Energy/fatigue',
                                  'Cognitive function',
                                  'Bone health',
                                  'Heart health',
                                  'Overall quality of life'
                                ].map((concern) => (
                                  <FormField
                                    key={concern}
                                    control={form.control}
                                    name="primary_concerns"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={concern}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(concern)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, concern])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== concern
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {concern}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="treatment_preferences"
                          render={() => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base">Treatment preferences (Select all that interest you)</FormLabel>
                              <div className="grid md:grid-cols-2 gap-3 mt-3">
                                {[
                                  'Hormone replacement therapy (HRT)',
                                  'Natural/herbal remedies',
                                  'Lifestyle modifications',
                                  'Nutritional supplements',
                                  'Alternative therapies',
                                  'Minimal intervention approach',
                                  'Comprehensive treatment plan',
                                  'Short-term symptom relief',
                                  'Long-term health optimization'
                                ].map((preference) => (
                                  <FormField
                                    key={preference}
                                    control={form.control}
                                    name="treatment_preferences"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={preference}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(preference)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, preference])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== preference
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {preference}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="treatment_concerns"
                          render={() => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base">Any concerns about treatment options? (Select all that apply)</FormLabel>
                              <div className="grid md:grid-cols-2 gap-3 mt-3">
                                {[
                                  'Cancer risk',
                                  'Blood clot risk',
                                  'Weight gain',
                                  'Side effects',
                                  'Long-term safety',
                                  'Cost of treatment',
                                  'Natural vs synthetic options',
                                  'Interactions with other medications',
                                  'Monitoring requirements'
                                ].map((concern) => (
                                  <FormField
                                    key={concern}
                                    control={form.control}
                                    name="treatment_concerns"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={concern}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(concern)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, concern])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== concern
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {concern}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-brand-blue border-b pb-2">Additional Information</h4>
                        
                        <FormField
                          control={form.control}
                          name="additional_symptoms"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Any other symptoms or concerns not covered above?</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe any other symptoms, patterns you've noticed, or health concerns..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="questions_for_doctor"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel className="text-base font-medium">Questions you'd like to discuss with your doctor</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="List any specific questions or topics you'd like to address during your consultation..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 mt-8 border-t border-brand-gray/20">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-brand-gray/30 hover:border-brand-green/50 hover:bg-brand-green/5 disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < ASSESSMENT_STEPS.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="btn-healthcare-primary cursor-pointer shadow-md hover:shadow-lg transition-all"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-healthcare-primary cursor-pointer shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
                      {!isSubmitting && <CheckCircle className="h-4 w-4 ml-2" />}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SymptomAssessmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-green-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    }>
      <SymptomAssessmentContent />
    </Suspense>
  )
}