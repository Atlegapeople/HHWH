'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react"
import { LoadingSpinner } from '@/components/ui/loading'
import Link from "next/link"
import { checkPatientByEmail, getPatientStatus, PatientStatus } from '@/lib/supabase/patient-status'

interface RegistrationCardProps {
  userEmail?: string // In the future, this will come from authentication
  patientData?: any // Pre-fetched patient data to avoid re-fetching
  hideLoading?: boolean // If true, won't show loading state in card
}

export function RegistrationCard({ userEmail, patientData: preFetchedPatientData, hideLoading = false }: RegistrationCardProps) {
  const [patientStatus, setPatientStatus] = useState<PatientStatus>('not_registered')
  const [patientData, setPatientData] = useState<any>(preFetchedPatientData || null)
  const [loading, setLoading] = useState(!!userEmail && !preFetchedPatientData && !hideLoading) // Start loading if we have userEmail but no pre-fetched data
  const [showEmailInput, setShowEmailInput] = useState(!userEmail)
  const [email, setEmail] = useState(userEmail || '')

  const checkStatus = async (emailToCheck: string) => {
    if (!emailToCheck) return
    
    setLoading(true)
    try {
      const { exists, patient } = await checkPatientByEmail(emailToCheck)
      setPatientData(patient)
      const status = await getPatientStatus(patient)
      setPatientStatus(status)
    } catch (error) {
      console.error('Failed to check patient status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const updateStatus = async () => {
      if (preFetchedPatientData) {
        // Use pre-fetched data
        setPatientData(preFetchedPatientData)
        const status = await getPatientStatus(preFetchedPatientData)
        setPatientStatus(status)
        setLoading(false)
      } else if (userEmail && !hideLoading) {
        checkStatus(userEmail)
      }
    }

    updateStatus()
  }, [userEmail, preFetchedPatientData, hideLoading])

  const handleCheckStatus = () => {
    if (email) {
      checkStatus(email)
      setShowEmailInput(false)
    }
  }

  const renderCardContent = () => {
    // Show loading state when checking user status (only if not hidden)
    if (loading && !hideLoading) {
      return (
        <CardContent className="text-center">
          <div className="py-8">
            <LoadingSpinner size="md" className="mx-auto mb-4" />
            <CardDescription>
              Checking your registration status...
            </CardDescription>
          </div>
        </CardContent>
      )
    }

    if (showEmailInput) {
      return (
        <CardContent className="text-center">
          <CardDescription className="mb-4">
            Please register to access your patient portal and begin your hormone health journey.
          </CardDescription>
          <Link href="/auth/signup">
            <Button className="btn-healthcare-primary w-full">
              Register Now
            </Button>
          </Link>
        </CardContent>
      )
    }

    switch (patientStatus) {
      case 'not_registered':
        return (
          <CardContent className="text-center">
            <CardDescription className="mb-4">
              Complete your profile and medical information to get started.
            </CardDescription>
            <Link href="/patient/register">
              <Button className="btn-healthcare-primary w-full">
                Register Now
              </Button>
            </Link>
          </CardContent>
        )

      case 'profile_incomplete':
        return (
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="mx-auto bg-brand-blue/10 p-3 rounded-full mb-3 w-fit">
                <UserPlus className="h-6 w-6 text-brand-blue" />
              </div>
              <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                Profile Incomplete
              </Badge>
            </div>
            <CardDescription className="mb-4">
              Please complete your profile to access all features.
            </CardDescription>
            <div className="space-y-2">
              <Link href="/patient/register">
                <Button className="btn-healthcare-primary w-full">
                  Complete Profile
                </Button>
              </Link>
              <Link href="/patient/dashboard">
                <Button variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        )

      case 'assessment_needed':
      case 'active':
        return (
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="mx-auto bg-brand-green/10 p-3 rounded-full mb-3 w-fit">
                <CheckCircle className="h-6 w-6 text-brand-green" />
              </div>
              <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                {patientStatus === 'assessment_needed' ? 'Assessment Ready' : 'Active'}
              </Badge>
            </div>
            <CardDescription className="mb-4">
              {patientStatus === 'assessment_needed' 
                ? 'Your registration is complete. Take your health assessment next.'
                : 'Your profile is all set.'
              }
            </CardDescription>
            <div className="space-y-2">
              <Link href="/patient/dashboard">
                <Button className="btn-healthcare-primary w-full">
                  View Dashboard
                </Button>
              </Link>
              {patientStatus === 'assessment_needed' ? (
                <Link href="/patient/assessment">
                  <Button variant="outline" className="w-full">
                    Take Health Assessment
                  </Button>
                </Link>
              ) : (
                <Link href="/patient/book-appointment">
                  <Button variant="outline" className="w-full">
                    Book Consultation
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        )

      case 'documents_pending':
        return (
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="mx-auto bg-brand-amber/10 p-3 rounded-full mb-3 w-fit">
                <Clock className="h-6 w-6 text-brand-amber" />
              </div>
              <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">
                Documents Pending
              </Badge>
            </div>
            <CardDescription className="mb-4">
              Your registration is complete, but we're still verifying your documents.
            </CardDescription>
            <div className="space-y-2">
              <Link href="/patient/dashboard">
                <Button className="btn-healthcare-primary w-full">
                  View Status
                </Button>
              </Link>
              <Link href="/patient/upload-documents">
                <Button variant="outline" className="w-full">
                  Upload Missing Docs
                </Button>
              </Link>
            </div>
          </CardContent>
        )

      default:
        return (
          <CardContent className="text-center">
            <CardDescription className="mb-4">
              Complete your profile and medical information to get started.
            </CardDescription>
            <Link href="/patient/register">
              <Button className="btn-healthcare-primary w-full">
                Register Now
              </Button>
            </Link>
          </CardContent>
        )
    }
  }

  const getCardIcon = () => {
    switch (patientStatus) {
      case 'profile_incomplete':
        return <UserPlus className="h-8 w-8 text-brand-blue" />
      case 'assessment_needed':
        return <CheckCircle className="h-8 w-8 text-brand-green" />
      case 'active':
        return <CheckCircle className="h-8 w-8 text-brand-green" />
      default:
        return <UserPlus className="h-8 w-8 text-brand-green" />
    }
  }

  const getCardTitle = () => {
    switch (patientStatus) {
      case 'profile_incomplete':
        return 'Complete Your Profile'
      case 'assessment_needed':
        return 'Take Assessment'
      case 'active':
        return 'Patient Dashboard'
      default:
        return 'New Patient Registration'
    }
  }

  return (
    <Card className="card-healthcare group hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="text-center">
        <div className="mx-auto bg-brand-green/10 p-3 rounded-full mb-3 group-hover:bg-brand-green/20 transition-colors group-hover:scale-110 transition-all duration-300">
          {getCardIcon()}
        </div>
        <CardTitle className="font-heading text-lg">{getCardTitle()}</CardTitle>
      </CardHeader>
      {renderCardContent()}
    </Card>
  )
}