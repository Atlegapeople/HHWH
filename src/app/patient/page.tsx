'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { RegistrationCard } from "@/components/patient/RegistrationCard";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { checkPatientByEmail, getPatientStatus } from '@/lib/supabase/patient-status';

export default function PatientPortalPage() {
  const { user, loading: authLoading } = useAuth()
  const [checkingRegistration, setCheckingRegistration] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)
  const [registrationChecked, setRegistrationChecked] = useState(false)
  
  useEffect(() => {
    const checkPatientRegistration = async () => {
      if (user?.email && !registrationChecked) {
        setCheckingRegistration(true)
        try {
          const { exists, patient } = await checkPatientByEmail(user.email)
          setPatientData(patient)
          setRegistrationChecked(true)
        } catch (error) {
          console.error('Failed to check patient registration:', error)
          setRegistrationChecked(true)
        } finally {
          setCheckingRegistration(false)
        }
      }
    }

    checkPatientRegistration()
  }, [user?.email, registrationChecked])
  
  if (authLoading || checkingRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            {authLoading ? 'Loading...' : 'Checking your registration status...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Badge variant="outline" className="text-brand-purple">
            Patient Portal
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Patient Portal
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your hormone health journey with expert care and personalized treatment plans.
          </p>
        </div>

        {/* Patient Actions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <RegistrationCard userEmail={user?.email} patientData={patientData} hideLoading={true} />

          <Card className="card-healthcare group hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto bg-brand-blue/10 p-3 rounded-full mb-3 group-hover:bg-brand-blue/20 transition-colors">
                <Calendar className="h-8 w-8 text-brand-blue" />
              </div>
              <CardTitle className="font-heading text-lg">Book Consultation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Schedule an appointment with our hormone health specialists.
              </CardDescription>
              <Link href="/patient/book-appointment">
                <Button variant="outline" className="w-full">
                  Book Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-healthcare group hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto bg-brand-green/10 p-3 rounded-full mb-3 group-hover:bg-brand-green/20 transition-colors">
                <FileText className="h-8 w-8 text-brand-green" />
              </div>
              <CardTitle className="font-heading text-lg">Symptom Assessment</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Complete our comprehensive 65-point health assessment.
              </CardDescription>
              <Link href="/patient/assessment">
                <Button variant="outline" className="w-full">
                  Start Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-healthcare group hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto bg-brand-purple/10 p-3 rounded-full mb-3 group-hover:bg-brand-purple/20 transition-colors">
                <Shield className="h-8 w-8 text-brand-purple" />
              </div>
              <CardTitle className="font-heading text-lg">My Health Records</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="mb-4">
                Access your consultation history and treatment plans.
              </CardDescription>
              <Link href="/patient/dashboard">
                <Button variant="outline" className="w-full">
                  View Records
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-8 border">
          <h3 className="text-2xl font-heading font-bold text-center mb-6">
            Why Choose HHWH Online Clinic?
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-brand-green/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-brand-green" />
              </div>
              <h4 className="font-heading font-semibold mb-2">Medical Aid Optimized</h4>
              <p className="text-sm text-muted-foreground">
                Streamlined validation process for Discovery, Momentum, and other SA medical aids.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-brand-orange/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="h-8 w-8 text-brand-orange" />
              </div>
              <h4 className="font-heading font-semibold mb-2">Expert Specialists</h4>
              <p className="text-sm text-muted-foreground">
                HPCSA registered doctors with years of hormone health experience.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-brand-blue/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-brand-blue" />
              </div>
              <h4 className="font-heading font-semibold mb-2">Convenient Access</h4>
              <p className="text-sm text-muted-foreground">
                Virtual consultations from the comfort of your home, anywhere in SA.
              </p>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-amber/10 backdrop-blur-sm rounded-full px-6 py-3 border border-brand-amber/20">
            <div className="w-3 h-3 bg-brand-amber rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-brand-amber">Prototype Development Phase</span>
          </div>
        </div>
      </main>
    </div>
  );
}