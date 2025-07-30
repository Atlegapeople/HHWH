'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Package,
  Calendar,
  CreditCard,
  Users,
  Clock,
  FileText,
  Zap
} from 'lucide-react'
import PackageComparison from '@/components/packages/PackageComparison'
import { useAuth } from '@/contexts/AuthContext'

interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const wizardSteps: WizardStep[] = [
  {
    id: 'package',
    title: 'Select Package',
    description: 'Choose your care package',
    completed: false
  },
  {
    id: 'practitioners',
    title: 'Choose Practitioners', 
    description: 'Select your healthcare team',
    completed: false
  },
  {
    id: 'schedule',
    title: 'Schedule Consultations',
    description: 'Book your appointments',
    completed: false
  },
  {
    id: 'payment',
    title: 'Payment & Confirmation',
    description: 'Complete your purchase',
    completed: false
  }
]

interface SelectedPackage {
  id: string
  name: string
  type: 'medical_aid' | 'cash'
  totalPrice: number
  consultations: any[]
  features: string[]
}

export default function PackageSelectionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPackage, setSelectedPackage] = useState<SelectedPackage | null>(null)
  const [steps, setSteps] = useState(wizardSteps)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signup?redirect=/patient/packages')
    }
  }, [user, router])

  const updateStepCompletion = (stepIndex: number, completed: boolean) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed } : step
    ))
  }

  const handlePackageSelect = (packageId: string) => {
    // Mock package data - in real implementation, this would come from the database
    const mockPackages = {
      'medical-aid-package-1': {
        id: 'medical-aid-package-1',
        name: 'Package 1 - Medical Aid',
        type: 'medical_aid' as const,
        totalPrice: 2660,
        consultations: [
          { name: 'Initial GP Consultation', duration: 45, practitioner: 'Hormone Specialist', price: 1000 },
          { name: 'Follow-up GP Consultation', duration: 30, practitioner: 'Hormone Specialist', price: 1000 },
          { name: 'Auxiliary Practitioner Consultation', duration: 30, practitioner: 'Specialist Practitioner', price: 660 }
        ],
        features: [
          'Medical aid billing with procedure codes',
          'Invoice for medical aid submission', 
          'Reimbursement estimate provided',
          'Priority booking access',
          '9-month package validity',
          'Comprehensive care coordination'
        ]
      },
      'cash-package-1': {
        id: 'cash-package-1',
        name: 'Package 1 - Cash Payment',
        type: 'cash' as const,
        totalPrice: 2400,
        consultations: [
          { name: 'Initial GP Consultation', duration: 45, practitioner: 'Hormone Specialist', price: 950 },
          { name: 'Follow-up GP Consultation', duration: 30, practitioner: 'Hormone Specialist', price: 800 },
          { name: 'Auxiliary Practitioner Consultation', duration: 30, practitioner: 'Specialist Practitioner', price: 650 }
        ],
        features: [
          'Direct cash pricing - no medical aid needed',
          'Immediate booking confirmation',
          'No waiting for medical aid approval',
          'Digital receipts for tax/reimbursement',
          '9-month package validity',
          'Same expert care and coordination'
        ]
      }
    }

    const selected = mockPackages[packageId as keyof typeof mockPackages]
    if (selected) {
      setSelectedPackage(selected)
      updateStepCompletion(0, true)
    }
  }

  const handleNext = () => {
    if (currentStep === 0 && selectedPackage) {
      setCurrentStep(1)
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleGoToPractitionerSelection = () => {
    // Navigate to practitioner selection with selected package
    router.push(`/patient/book-appointment?package=${selectedPackage?.id}`)
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Select Your Care Package</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the comprehensive hormone health package that best fits your needs and payment preference.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`text-center p-3 rounded-lg border transition-all duration-300 ${
                  index === currentStep 
                    ? 'border-brand-green bg-brand-green/10' 
                    : index < currentStep 
                    ? 'border-brand-green/30 bg-brand-green/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  step.completed 
                    ? 'bg-brand-green text-white' 
                    : index === currentStep
                    ? 'bg-brand-green/20 text-brand-green border-2 border-brand-green'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <h3 className={`text-sm font-medium ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 0 && (
            <div>
              <PackageComparison 
                onPackageSelect={handlePackageSelect}
                selectedPackageId={selectedPackage?.id}
              />
            </div>
          )}

          {currentStep === 1 && selectedPackage && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-brand-green/20 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-brand-green">Package Selected</CardTitle>
                  <CardDescription>
                    You have selected <strong>{selectedPackage.name}</strong>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Package Summary */}
                  <div className="bg-brand-green/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{selectedPackage.name}</h3>
                      <Badge className="bg-brand-green text-white">
                        R{selectedPackage.totalPrice.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Consultations */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Included Consultations
                        </h4>
                        <div className="space-y-2">
                          {selectedPackage.consultations.map((consultation, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                              <div>
                                <div className="text-sm font-medium">{consultation.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {consultation.duration} min • {consultation.practitioner}
                                </div>
                              </div>
                              <div className="text-sm font-medium text-brand-green">
                                R{consultation.price}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Package Benefits
                        </h4>
                        <ul className="space-y-1">
                          {selectedPackage.features.slice(0, 4).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-brand-green" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Ready to proceed?</h3>
                    <p className="text-muted-foreground mb-6">
                      Next, you'll select your practitioners and schedule your consultations.
                    </p>
                    <Button 
                      onClick={handleGoToPractitionerSelection}
                      className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Choose Practitioners & Schedule
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for other steps */}
          {currentStep > 1 && (
            <div className="max-w-4xl mx-auto">
              <Card className="border-brand-blue/20 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle>Step {currentStep + 1} - {steps[currentStep].title}</CardTitle>
                  <CardDescription>
                    This step is under construction. You would continue with {steps[currentStep].description.toLowerCase()}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground mb-6">
                    This section would handle {steps[currentStep].description.toLowerCase()} functionality.
                  </div>
                  <Button 
                    onClick={() => router.push('/patient/book-appointment')}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                  >
                    Continue to Booking
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {selectedPackage ? (
              <span className="text-brand-green font-medium">
                Package selected: {selectedPackage.name}
              </span>
            ) : (
              'Select a package to continue'
            )}
          </div>

          <Button 
            onClick={handleNext}
            disabled={currentStep === 0 && !selectedPackage}
            className="flex items-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}