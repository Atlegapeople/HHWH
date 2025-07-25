'use client'

import { useState } from 'react'
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
import { createPatient } from '@/lib/supabase/patients'
import { PersonalInfoStep } from '@/components/forms/registration/PersonalInfoStep'
import { MedicalAidStep } from '@/components/forms/registration/MedicalAidStep'
import { AddressStep } from '@/components/forms/registration/AddressStep'
import { EmergencyContactStep } from '@/components/forms/registration/EmergencyContactStep'
import { DocumentUploadStep } from '@/components/forms/registration/DocumentUploadStep'
import { ReviewStep } from '@/components/forms/registration/ReviewStep'

const STEPS = [
  { id: 1, title: 'Personal Information', description: 'Basic details and contact information' },
  { id: 2, title: 'Medical Aid', description: 'Medical aid scheme and membership details' },
  { id: 3, title: 'Address', description: 'Residential and postal address' },
  { id: 4, title: 'Emergency Contact', description: 'Emergency contact person details' },
  { id: 5, title: 'Documents', description: 'Upload ID and medical aid documents' },
  { id: 6, title: 'Review', description: 'Review and submit your registration' },
]

export default function PatientRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const form = useForm<PatientRegistration>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: {
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
    },
    mode: 'onBlur'
  })

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
      console.log('Submitting registration data:', data)
      
      // Save to Supabase database
      const patient = await createPatient(data)
      console.log('Patient created successfully:', patient)
      
      setIsCompleted(true)
    } catch (error) {
      console.error('Registration failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-brand-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-brand-green" />
            </div>
            <CardTitle className="font-heading text-2xl text-brand-green">Registration Successful!</CardTitle>
            <CardDescription>
              Thank you for registering with HHWH Online Clinic. Your account has been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You will receive a confirmation email shortly with your account details and next steps.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/patient/book-appointment">
                  <Button className="btn-healthcare-primary w-full">
                    Book Your First Consultation
                  </Button>
                </Link>
                <Link href="/patient">
                  <Button variant="outline" className="w-full">
                    Go to Patient Portal
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
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/patient" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Patient Portal</span>
          </Link>
          <Badge variant="outline" className="text-brand-purple">
            Registration - Step {currentStep} of {STEPS.length}
          </Badge>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="container mx-auto px-4 mb-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-heading font-bold">Patient Registration</h1>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-4" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`text-center p-2 rounded ${
                  step.id === currentStep
                    ? 'bg-brand-orange text-white'
                    : step.id < currentStep
                    ? 'bg-brand-green text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="font-medium">{step.id}</div>
                <div className="hidden md:block">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-heading text-xl">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <div className="flex justify-between pt-6 mt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="btn-healthcare-primary"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-healthcare-primary"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Registration'}
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