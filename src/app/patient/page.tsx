'use client'

import { Badge } from "@/components/ui/badge";
import { Calendar, Shield, UserPlus, Heart, Stethoscope, Clock, Award, Users, CheckCircle } from "lucide-react";
import { RegistrationCard } from "@/components/patient/RegistrationCard";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { checkPatientByEmail, getPatientStatus } from '@/lib/supabase/patient-status';
import Image from 'next/image';

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

  const showHeroSection = !user || patientData?.status === 'not_registered' || !patientData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/10">
      {/* Hero Section - Only for non-registered users */}
      {showHeroSection && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-pink/10 to-brand-blue-light/10"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="text-center max-w-4xl mx-auto">
              {/* Heart Logo */}
              <div className="flex items-center justify-center mb-6">
                <Image 
                  src="/images/icon_heart_logo-removebg-preview.png"
                  alt="HHWH Heart Logo"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-2xl transition-all duration-500 ease-in-out hover:scale-125 hover:brightness-110 cursor-pointer transform-gpu animate-heartbeat"
                  style={{
                    filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3)) drop-shadow(0 30px 60px rgba(0, 0, 0, 0.2))'
                  }}
                />
              </div>
              
              {/* Badge */}
              <div className="mb-6">
                <Badge variant="outline" className="text-brand-green border-brand-green/30 bg-white/80 backdrop-blur-sm px-4 py-2 animate-pulse">
                  <Heart className="h-4 w-4 mr-2" />
                  Patient Portal
                </Badge>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6 leading-tight">
                Your Hormone Health
                <span className="text-brand-green"> Journey</span>
                <br />Starts Here
              </h1>
              
              {/* Subheading */}
              <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Take control of your hormonal wellness with personalized care, expert consultations, and comprehensive support designed specifically for South African women aged 35-65.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-6 mb-12 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-brand-green" />
                  <span>HPCSA Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-blue" />
                  <span>Medical Aid Accepted</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Simple Header for registered users */}
      {!showHeroSection && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Badge variant="outline" className="text-brand-green border-brand-green/30 bg-white/80 backdrop-blur-sm px-4 py-2">
                <Heart className="h-4 w-4 mr-2" />
                Patient Portal
              </Badge>
            </div>
          </div>
        </section>
      )}

      {/* Registration Section - Different content for registered vs new users */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          {showHeroSection && (
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                Get Started Today
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of women who have transformed their hormone health with our expert care.
              </p>
            </div>
          )}
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <RegistrationCard userEmail={user?.email} patientData={patientData} hideLoading={true} />
            </div>
          </div>

          {/* Quick Actions for Registered Users */}
          {!showHeroSection && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 text-center">
                  <div className="bg-brand-blue/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-brand-blue" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Book Appointment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Schedule your next consultation</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 text-center">
                  <div className="bg-brand-green/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-brand-green" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Health Assessment</h3>
                  <p className="text-sm text-muted-foreground mb-4">Track your progress</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 text-center">
                  <div className="bg-brand-pink/10 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-brand-pink" />
                  </div>
                  <h3 className="font-heading font-semibold mb-2">Treatment Plan</h3>
                  <p className="text-sm text-muted-foreground mb-4">View your personalized plan</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works - Only for new users */}
      {showHeroSection && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">
                Simple Steps to Better Health
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process makes it easy to access expert hormone care from anywhere in South Africa.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 p-6 rounded-2xl mb-6 group-hover:from-brand-green/20 group-hover:to-brand-green/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="bg-brand-green/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <UserPlus className="h-8 w-8 text-brand-green group-hover:animate-bounce" />
                  </div>
                  <div className="bg-brand-green text-white text-sm font-semibold rounded-full w-8 h-8 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-brand-green transition-colors">Register & Assess</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
                    Complete your profile and take our comprehensive 65-point hormone health assessment.
                  </p>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 p-6 rounded-2xl mb-6 group-hover:from-brand-blue/20 group-hover:to-brand-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="bg-brand-blue/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-brand-blue group-hover:animate-pulse" />
                  </div>
                  <div className="bg-brand-blue text-white text-sm font-semibold rounded-full w-8 h-8 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-brand-blue transition-colors">Book Consultation</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
                    Schedule a virtual consultation with our hormone specialists at your convenience.
                  </p>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="bg-gradient-to-br from-brand-pink/10 to-brand-pink/5 p-6 rounded-2xl mb-6 group-hover:from-brand-pink/20 group-hover:to-brand-pink/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                  <div className="bg-brand-pink/20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Stethoscope className="h-8 w-8 text-brand-pink group-hover:animate-spin" />
                  </div>
                  <div className="bg-brand-pink text-white text-sm font-semibold rounded-full w-8 h-8 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3 group-hover:text-brand-pink transition-colors">Get Treatment</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground transition-colors">
                    Receive your personalized treatment plan and ongoing support for optimal results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section - Only for new users */}
      {showHeroSection && (
        <section className="py-16 bg-gradient-to-r from-brand-pink/5 to-brand-blue-light/5">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-6">
                  Why Choose HHWH Online Clinic?
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  We're South Africa's leading online hormone health platform, combining medical expertise 
                  with convenient technology to deliver exceptional care.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-green/10 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-brand-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Medical Aid Optimized</h4>
                      <p className="text-sm text-muted-foreground">
                        Streamlined process for Discovery, Momentum, and other SA medical aids
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-amber/10 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-brand-amber" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Expert Specialists</h4>
                      <p className="text-sm text-muted-foreground">
                        HPCSA registered doctors with extensive hormone health experience
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-blue/10 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Convenient Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Virtual consultations from anywhere in South Africa
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-brand-pink/10 p-2 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-brand-pink" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Holistic Approach</h4>
                      <p className="text-sm text-muted-foreground">
                        Medical, lifestyle, and supplemental strategies for complete care
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-brand-green to-brand-blue p-4 rounded-2xl mb-4 inline-block shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <Heart className="h-8 w-8 text-white animate-heartbeat" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">Ready to Start?</h3>
                  <p className="text-muted-foreground text-sm">
                    Join the growing community of women taking control of their hormone health.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-brand-green/5 rounded-lg">
                    <span className="text-sm font-medium">Initial Consultation</span>
                    <span className="text-brand-green font-semibold">R800 - R1200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-brand-blue/5 rounded-lg">
                    <span className="text-sm font-medium">Follow-up Sessions</span>
                    <span className="text-brand-blue font-semibold">R400 - R600</span>
                  </div>
                  <div className="text-center pt-4">
                    <p className="text-xs text-muted-foreground mb-4">
                      Medical aid benefits may cover consultation costs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Development Notice */}
      <div className="py-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-brand-amber/10 backdrop-blur-sm rounded-full px-6 py-3 border border-brand-amber/20">
          <div className="w-3 h-3 bg-brand-amber rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-brand-amber">Prototype Development Phase</span>
        </div>
      </div>
    </div>
  );
}