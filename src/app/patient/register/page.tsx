'use client'

import { useState } from 'react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Form } from '@/components/ui/form'
import { ArrowLeft, ArrowRight, Upload, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { PatientRegistration, patientRegistrationSchema, medicalAidSchemes } from '@/lib/validations/patient'
import { createPatient, updatePatientProfile, getCurrentUserPatient } from '@/lib/supabase/patients'
import { PersonalInfoStep } from '@/components/forms/registration/PersonalInfoStep'
import { MedicalAidStep } from '@/components/forms/registration/MedicalAidStep'
import { AddressStep } from '@/components/forms/registration/AddressStep'
import { EmergencyContactStep } from '@/components/forms/registration/EmergencyContactStep'
import { DocumentUploadStep } from '@/components/forms/registration/DocumentUploadStep'
import { ReviewStep } from '@/components/forms/registration/ReviewStep'
import { useAuth } from '@/contexts/AuthContext'

const STEPS = [
  { id: 1, title: 'Personal Information', description: 'Basic details and contact information' },
  { id: 2, title: 'Medical Aid', description: 'Medical aid scheme and membership details' },
  { id: 3, title: 'Address', description: 'Residential and postal address' },
  { id: 4, title: 'Emergency Contact', description: 'Emergency contact person details' },
  { id: 5, title: 'Documents', description: 'Upload ID and medical aid documents' },
  { id: 6, title: 'Review', description: 'Review and submit your registration' },
]

export default function PatientRegistrationPage() {
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [existingPatient, setExistingPatient] = useState<any>(null)
  const [isUpdateMode, setIsUpdateMode] = useState(false)
  const [loadingPatient, setLoadingPatient] = useState(true)

  // Get user data for prepopulation
  const getUserDefaultValues = () => {
    // If we have existing patient data (update mode), use that
    if (existingPatient) {
      return {
        full_name: existingPatient.full_name || '',
        email: existingPatient.email || '',
        phone: existingPatient.phone || '',
        date_of_birth: existingPatient.date_of_birth || '',
        medical_aid_scheme: existingPatient.medical_aid_scheme || '',
        medical_aid_number: existingPatient.medical_aid_number || '',
        medical_aid_dependent_code: existingPatient.medical_aid_dependent_code || '',
        address: {
          street: existingPatient.street_address || '',
          city: existingPatient.city || '',
          province: existingPatient.province,
          postal_code: existingPatient.postal_code || '',
        },
        emergency_contact: {
          name: existingPatient.emergency_contact_name || '',
          relationship: existingPatient.emergency_contact_relationship || '',
          phone: existingPatient.emergency_contact_phone || '',
        },
        id_document_url: existingPatient.id_document_url || '',
        medical_aid_card_url: existingPatient.medical_aid_card_url || '',
      }
    }

    // If no existing patient and no user, return empty values
    if (!user) {
      return {
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        medical_aid_scheme: '',
        medical_aid_number: '',
        medical_aid_dependent_code: '',
        address: {
          street: '',
          city: '',
          province: undefined,
          postal_code: '',
        },
        emergency_contact: {
          name: '',
          relationship: '',
          phone: '',
        }
      }
    }

    // New registration with user data
    return {
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      email: user.email || '',
      phone: user.user_metadata?.phone || '',
      date_of_birth: user.user_metadata?.date_of_birth || '',
      medical_aid_scheme: '',
      medical_aid_number: '',
      medical_aid_dependent_code: '',
      address: {
        street: '',
        city: '',
        province: undefined,
        postal_code: '',
      },
      emergency_contact: {
        name: '',
        relationship: '',
        phone: '',
      }
    }
  }

  const form = useForm<PatientRegistration>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: getUserDefaultValues(),
    mode: 'onBlur'
  })

  // Check for existing patient profile on component mount
  React.useEffect(() => {
    const checkExistingPatient = async () => {
      if (!authLoading && user) {
        try {
          const patient = await getCurrentUserPatient()
          if (patient) {
            setExistingPatient(patient)
            setIsUpdateMode(true)
            console.log('Existing patient found, switching to update mode:', patient)
          } else {
            setIsUpdateMode(false)
            console.log('No existing patient found, staying in create mode')
          }
        } catch (error) {
          console.error('Error checking for existing patient:', error)
          setIsUpdateMode(false)
        } finally {
          setLoadingPatient(false)
        }
      }
    }

    checkExistingPatient()
  }, [authLoading, user])

  // Update form values when patient data loads
  React.useEffect(() => {
    if (!loadingPatient && (user || existingPatient)) {
      const newValues = getUserDefaultValues()
      form.reset(newValues)
      console.log('Form reset with values:', newValues)
    }
  }, [loadingPatient, user, existingPatient, form])

  const { handleSubmit, trigger, formState: { errors } } = form

  const nextStep = async () => {
    let isValid = true
    
    switch (currentStep) {
      case 1:
        isValid = await trigger(['full_name', 'email', 'phone', 'date_of_birth'])
        break
      case 2:
        // For medical aid step, only validate if scheme is selected
        const scheme = form.getValues('medical_aid_scheme')
        if (scheme && scheme !== 'none' && scheme !== '') {
          isValid = await trigger(['medical_aid_number'])
        }
        break
      case 3:
        isValid = await trigger(['address'])
        break
      case 4:
        isValid = await trigger(['emergency_contact'])
        break
      case 5:
        // Document upload step - no validation needed for prototype
        isValid = true
        break
    }

    if (!isValid) return

    setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: PatientRegistration) => {
    setIsSubmitting(true)
    try {
      console.log('Submitting patient data:', data)
      console.log('Update mode:', isUpdateMode)
      
      let patient
      if (isUpdateMode) {
        // Update existing patient
        patient = await updatePatientProfile(data)
        console.log('Patient profile updated successfully:', patient)
      } else {
        // Create new patient
        patient = await createPatient(data)
        console.log('Patient created successfully:', patient)
      }
      
      setIsCompleted(true)
    } catch (error) {
      console.error('Operation failed:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        data: data,
        isUpdateMode,
        existingPatient
      })
      
      let errorMessage = 'Operation failed. Please try again.'
      if (error instanceof Error) {
        errorMessage = error.message
        // More specific error handling
        if (error.message.includes('duplicate key')) {
          errorMessage = 'A profile with this email already exists.'
        } else if (error.message.includes('validation')) {
          errorMessage = 'Please check your form data and try again.'
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      alert(`Error: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  // Show loading state while checking for existing patient
  if (authLoading || loadingPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217B82] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardHeader className="pb-6">
            <div className="mx-auto bg-gradient-to-br from-[#217B82]/10 to-[#217B82]/5 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-[#217B82]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#217B82] mb-2">
              {isUpdateMode ? 'Profile Updated!' : 'Registration Successful!'}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {isUpdateMode 
                ? 'Your profile has been updated successfully.'
                : 'Thank you for registering with HHWH Online Clinic. Your account has been created successfully.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg">
                You will receive a confirmation email shortly with your account details and next steps.
              </p>
              <div className="flex flex-col gap-3">
                <Link href={isUpdateMode ? "/patient/dashboard" : "/patient/book-appointment"}>
                  <Button className="w-full bg-gradient-to-r from-[#217B82] to-[#1a6b72] hover:from-[#1a6b72] hover:to-[#217B82] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    {isUpdateMode ? "Return to Dashboard" : "Book Your First Consultation"}
                  </Button>
                </Link>
                <Link href={isUpdateMode ? "/patient/book-appointment" : "/patient"}>
                  <Button variant="outline" className="w-full border-[#217B82]/20 text-[#217B82] hover:bg-[#217B82]/5">
                    {isUpdateMode ? "Book New Appointment" : "Go to Patient Portal"}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Header */}
      <header className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <Link href="/patient/dashboard" className="group flex items-center space-x-2 text-slate-600 hover:text-[#217B82] transition-colors">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <Badge variant="outline" className="bg-[#217B82]/10 text-[#217B82] border-[#217B82]/20 px-4 py-2">
            {isUpdateMode ? 'Update Profile' : 'Registration'} - Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 border-0 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-800">
              {isUpdateMode ? 'Update Patient Profile' : 'Patient Registration'}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#217B82] to-[#1a6b72] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          </div>
          <Progress value={progressPercentage} className="mb-6 h-2" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`relative text-center p-4 rounded-xl transition-all duration-300 ${
                  step.id === currentStep
                    ? 'bg-gradient-to-br from-[#217B82] to-[#1a6b72] text-white shadow-lg transform scale-105'
                    : step.id < currentStep
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <div className="font-bold text-lg mb-1">{step.id}</div>
                <div className="text-xs font-medium hidden sm:block leading-tight">{step.title}</div>
                {step.id === currentStep && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                )}
                {step.id < currentStep && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-emerald-600 bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#217B82] to-[#1a6b72] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold">{currentStep}</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-slate-600 mt-1">
                  {STEPS[currentStep - 1].description}
                </CardDescription>
              </div>
            </div>
            <div className="w-full h-px bg-gradient-to-r from-[#217B82]/20 via-[#217B82]/10 to-transparent"></div>
          </CardHeader>
          <CardContent className="pt-0">
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step Content */}
                {currentStep === 1 && <PersonalInfoStep form={form} />}
                {currentStep === 2 && <MedicalAidStep form={form} />}
                {currentStep === 3 && <AddressStep form={form} />}
                {currentStep === 4 && <EmergencyContactStep form={form} />}
                {currentStep === 5 && <DocumentUploadStep form={form} />}
                {currentStep === 6 && <ReviewStep form={form} />}

                {/* Navigation */}
                <div className="flex justify-between pt-8 mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-[#217B82]/20 hover:text-[#217B82] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="px-8 py-3 bg-gradient-to-r from-[#217B82] to-[#1a6b72] hover:from-[#1a6b72] hover:to-[#217B82] text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                    >
                      Next Step
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        {isSubmitting && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        )}
                        {isSubmitting 
                          ? (isUpdateMode ? 'Updating Profile...' : 'Completing Registration...') 
                          : (isUpdateMode ? 'Update Profile' : 'Complete Registration')
                        }
                        {!isSubmitting && <CheckCircle className="h-4 w-4 ml-2" />}
                      </div>
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