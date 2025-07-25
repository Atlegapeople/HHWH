'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Stethoscope, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText,
  Shield,
  CheckCircle,
  Eye,
  EyeOff 
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

interface DoctorRegistrationData {
  // Personal Information
  full_name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  
  // Professional Information
  specialization: string
  qualification: string
  hpcsa_number: string
  consultation_fee: number
  bio: string
  practice_address: string
  
  // Verification
  hpcsa_certificate: File | null
  medical_degree: File | null
}

const SPECIALIZATIONS = [
  'Endocrinologist',
  'Gynaecologist', 
  'General Practitioner',
  'Integrative Medicine',
  'Reproductive Endocrinologist',
  'Internal Medicine'
]

export default function DoctorRegisterPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<DoctorRegistrationData>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialization: 'Gynaecologist',
    qualification: '',
    hpcsa_number: '',
    consultation_fee: 850,
    bio: '',
    practice_address: '',
    hpcsa_certificate: null,
    medical_degree: null
  })

  const { signUp } = useAuth()
  const router = useRouter()

  const handleInputChange = (field: keyof DoctorRegistrationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Personal Information
        return !!(
          formData.full_name.trim() &&
          formData.email.trim() &&
          formData.phone.trim() &&
          formData.password.length >= 6 &&
          formData.password === formData.confirmPassword
        )
      case 1: // Professional Information
        return !!(
          formData.specialization &&
          formData.qualification.trim() &&
          formData.hpcsa_number.trim() &&
          formData.consultation_fee > 0 &&
          formData.bio.trim()
        )
      case 2: // Verification
        return true // Documents are optional for now
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      setError(null)
    } else {
      setError('Please fill in all required fields')
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please complete all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Use our custom doctor registration API
      const response = await fetch('/api/doctor/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
          specialization: formData.specialization,
          qualification: formData.qualification,
          hpcsa_number: formData.hpcsa_number,
          consultation_fee: formData.consultation_fee,
          bio: formData.bio,
          practice_address: formData.practice_address
        })
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
        return
      }

      console.log('Doctor registration successful:', result)
      
      // Redirect to verification pending page
      router.push('/auth/doctor/verification-pending')
      
    } catch (err) {
      console.error('Registration error:', err)
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: 'Personal Information',
      description: 'Basic contact details',
      icon: User
    },
    {
      title: 'Professional Details',
      description: 'Medical credentials',
      icon: Stethoscope
    },
    {
      title: 'Verification',
      description: 'Document upload',
      icon: Shield
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pale-pink via-white to-pale-cyan-blue py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <Image 
                src="/images/Logo-HHWH.png" 
                alt="HHWH Online Clinic" 
                width={160} 
                height={52}
                className="h-14 w-auto"
              />
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join HHWH Network</h1>
          <p className="text-gray-600">Register as a healthcare professional</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep
              
              return (
                <div key={index} className="flex flex-1 items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted 
                      ? 'bg-brand-green border-brand-green text-white' 
                      : isActive 
                        ? 'bg-brand-blue border-brand-blue text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${isCompleted ? 'bg-brand-green' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            {error && (
              <Alert className="border-vivid-red/20 bg-vivid-red/5 mb-4">
                <AlertDescription className="text-vivid-red text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Step 0: Personal Information */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name *</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Dr. John Smith"
                    className="mt-1"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email Address *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="doctor@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+27 11 234 5678"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <div className="relative mt-1">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                    <div className="relative mt-1">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Professional Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Specialization *</label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vivid-cyan-blue"
                    >
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qualifications *</label>
                    <Input
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      placeholder="MBChB, FCOG(SA)"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">HPCSA Number *</label>
                    <Input
                      value={formData.hpcsa_number}
                      onChange={(e) => handleInputChange('hpcsa_number', e.target.value)}
                      placeholder="HP123456"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Consultation Fee (ZAR) *</label>
                    <Input
                      type="number"
                      value={formData.consultation_fee}
                      onChange={(e) => handleInputChange('consultation_fee', parseFloat(e.target.value))}
                      placeholder="850"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Practice Address</label>
                  <Input
                    value={formData.practice_address}
                    onChange={(e) => handleInputChange('practice_address', e.target.value)}
                    placeholder="123 Medical Centre, Sandton, Johannesburg"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Professional Bio *</label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell patients about your experience, specializations, and approach to care..."
                    className="mt-1 min-h-24"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Verification */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Shield className="h-12 w-12 text-brand-blue mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Verification</h3>
                  <p className="text-sm text-gray-600">
                    Upload your credentials for verification. This helps maintain trust and quality in our network.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">HPCSA Certificate</label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your HPCSA registration certificate</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Medical Degree</label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload your medical degree certificate</p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-pale-cyan-blue p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your application will be reviewed by our medical team</li>
                    <li>• We'll verify your credentials with HPCSA</li>
                    <li>• You'll receive confirmation within 2-3 business days</li>
                    <li>• Once approved, you can start accepting appointments</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              <div>
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={loading}
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    className="bg-brand-blue hover:bg-brand-blue/90 text-white"
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    className="bg-brand-green hover:bg-brand-green/90 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/doctor/login" 
              className="text-vivid-cyan-blue hover:text-vivid-cyan-blue/80 font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}