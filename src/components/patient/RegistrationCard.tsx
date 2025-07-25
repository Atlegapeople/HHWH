'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, CheckCircle, Clock, FileText, AlertCircle } from "lucide-react"
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
      setPatientStatus(getPatientStatus(patient))
    } catch (error) {
      console.error('Failed to check patient status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (preFetchedPatientData) {
      // Use pre-fetched data
      setPatientData(preFetchedPatientData)
      setPatientStatus(getPatientStatus(preFetchedPatientData))
      setLoading(false)
    } else if (userEmail && !hideLoading) {
      checkStatus(userEmail)
    }
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
            <div className="mx-auto w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
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
            Enter your email to check your registration status or start a new registration.
          </CardDescription>
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent"
            />
            <Button 
              onClick={handleCheckStatus}
              disabled={!email || loading}
              className="btn-healthcare-primary w-full"
            >
              {loading ? 'Checking...' : 'Check Status'}
            </Button>
          </div>
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowEmailInput(true)}
              className="mt-2 text-xs"
            >
              Check different email
            </Button>
          </CardContent>
        )

      case 'registered':
      case 'active':
        return (
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="mx-auto bg-brand-green/10 p-3 rounded-full mb-3 w-fit">
                <CheckCircle className="h-6 w-6 text-brand-green" />
              </div>
              <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                Registration Complete
              </Badge>
            </div>
            <CardDescription className="mb-4">
              Welcome back, {patientData?.full_name}! Your registration is complete.
            </CardDescription>
            <div className="space-y-2">
              <Link href="/patient/dashboard">
                <Button className="btn-healthcare-primary w-full">
                  View Dashboard
                </Button>
              </Link>
              <Link href="/patient/book-appointment">
                <Button variant="outline" className="w-full">
                  Book Consultation
                </Button>
              </Link>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowEmailInput(true)}
              className="mt-2 text-xs"
            >
              Check different email
            </Button>
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowEmailInput(true)}
              className="mt-2 text-xs"
            >
              Check different email
            </Button>
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
      case 'registered':
      case 'active':
        return <CheckCircle className="h-8 w-8 text-brand-green" />
      case 'documents_pending':
        return <Clock className="h-8 w-8 text-brand-amber" />
      default:
        return <UserPlus className="h-8 w-8 text-brand-orange" />
    }
  }

  const getCardTitle = () => {
    switch (patientStatus) {
      case 'registered':
      case 'active':
        return 'Registration Complete'
      case 'documents_pending':
        return 'Registration Pending'
      default:
        return 'New Patient Registration'
    }
  }

  return (
    <Card className="card-healthcare group hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="text-center">
        <div className="mx-auto bg-brand-orange/10 p-3 rounded-full mb-3 group-hover:bg-brand-orange/20 transition-colors">
          {getCardIcon()}
        </div>
        <CardTitle className="font-heading text-lg">{getCardTitle()}</CardTitle>
      </CardHeader>
      {renderCardContent()}
    </Card>
  )
}