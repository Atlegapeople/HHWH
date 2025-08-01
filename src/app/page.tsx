'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield, Users, Stethoscope, Heart, ArrowRight, CheckCircle, Star, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  
  const heroImages = [
    "/images/1.jpg",
    "/images/2.jpg", 
    "/images/3.jpg",
    "/images/4.jpg"
  ];

  const handleBookConsultation = () => {
    if (user) {
      // User is signed in, check their role
      if (userRole === 'patient' || !userRole) {
        // Patient or default user, go to book appointment
        router.push('/patient/book-appointment')
      } else {
        // Doctor or admin, redirect to patient login
        router.push('/auth/login')
      }
    } else {
      // User not signed in, redirect to login
      router.push('/auth/login')
    }
  }

  const handleDoctorPortal = () => {
    if (user && userRole === 'doctor') {
      router.push('/doctor/dashboard')
    } else {
      router.push('/auth/doctor/login')
    }
  }

  const handleAdminPortal = () => {
    if (user && userRole === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/auth/admin/login')
    }
  }

  return (
    <div className="min-h-screen">

      {/* Hero Section with Carousel */}
      <HeroCarousel images={heroImages}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 drop-shadow-2xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)]">
              Women&apos;s Hormone Health
              <span className="text-brand-green drop-shadow-2xl [text-shadow:_2px_2px_8px_rgb(0_0_0_/_80%)]"> Made Simple</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-xl [text-shadow:_1px_1px_4px_rgb(0_0_0_/_70%)]">
              Expert hormone health care for South African women through accessible virtual consultations and personalized treatment plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleBookConsultation}
                size="lg" 
                className="btn-healthcare-primary text-lg px-8 py-4 drop-shadow-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <Calendar className="mr-2 h-6 w-6" />
                Book Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link href="/about">
                <Button variant="outline" size="lg" className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-lg px-8 py-4 drop-shadow-lg backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </HeroCarousel>

      {/* Content Section */}
      <main className="bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 py-16">
        <div className="container mx-auto px-4">
          {/* Portal Access Section */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                Choose Your Portal
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Access your dedicated portal for seamless healthcare management and professional services.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Patient Portal */}
              <Card 
                className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-blue/50 hover:-translate-y-2 overflow-hidden relative cursor-pointer"
                onClick={handleBookConsultation}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <Users className="h-8 w-8 text-brand-blue group-hover:animate-bounce" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-blue transition-colors duration-300">Patient Portal</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-blue/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Book appointments, manage your health journey, and connect with specialists
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Book virtual consultations</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Manage medical records</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Track treatment progress</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Medical aid integration</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={handleBookConsultation}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Consultation
                    </Button>
                    <Link href="/auth/login" className="block">
                      <Button variant="outline" className="w-full border-brand-blue text-brand-blue hover:bg-brand-blue/5">
                        Sign In / Register
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Portal */}
              <Card 
                className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-green/50 hover:-translate-y-2 overflow-hidden relative cursor-pointer"
                onClick={handleDoctorPortal}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-green/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <Stethoscope className="h-8 w-8 text-brand-green group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-green transition-colors duration-300">Doctor Portal</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Manage patients, consultations, and grow your practice with our platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Patient management system</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Integrated video consultations</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Automated billing & payments</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>HealthBridge integration</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={handleDoctorPortal}
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white"
                    >
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Go to Dashboard
                    </Button>
                    <Link href="/auth/doctor/login" className="block">
                      <Button variant="outline" className="w-full border-brand-green text-brand-green hover:bg-brand-green/5">
                        Sign In / Register
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Portal */}
              <Card 
                className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-red/50 hover:-translate-y-2 overflow-hidden relative cursor-pointer"
                onClick={handleAdminPortal}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-red/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <Shield className="h-8 w-8 text-brand-red group-hover:animate-spin" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-red transition-colors duration-300">Admin Portal</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-red/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    System administration, doctor approvals, and platform management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Doctor application reviews</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>System analytics & reports</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>User management</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Platform configuration</span>
                    </div>
                  </div>
                  <div className="pt-4 space-y-3">
                    <Button 
                      onClick={handleAdminPortal}
                      className="w-full bg-brand-red hover:bg-brand-red/90 text-white"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                    <Link href="/auth/admin/login" className="block">
                      <Button variant="outline" className="w-full border-brand-red text-brand-red hover:bg-brand-red/5">
                        Admin Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Features Grid */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                Why Choose HHWH?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Advanced healthcare technology designed specifically for South African women's hormone health needs.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-green/50 hover:-translate-y-3 overflow-hidden relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-green/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <Shield className="h-8 w-8 text-brand-green group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-green transition-colors duration-300">Secure & Compliant</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    POPIA compliant platform with end-to-end encryption for your medical data and privacy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-blue/50 hover:-translate-y-3 overflow-hidden relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-blue/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <Stethoscope className="h-8 w-8 text-brand-blue group-hover:animate-bounce" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-blue transition-colors duration-300">Expert Care</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-blue/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Specialized hormone health doctors with years of experience in women&apos;s health and menopause care.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="card-healthcare group hover:shadow-2xl transition-all duration-500 border-2 hover:border-brand-amber/50 hover:-translate-y-3 overflow-hidden relative cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="text-center pb-4 relative z-10">
                  <div className="mx-auto w-16 h-16 bg-brand-amber/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-amber/20 transition-all duration-500 mb-4 group-hover:scale-110 group-hover:rotate-6">
                    <CreditCard className="h-8 w-8 text-brand-amber group-hover:animate-spin" />
                  </div>
                  <CardTitle className="font-heading text-xl group-hover:text-brand-amber transition-colors duration-300">Medical Aid Friendly</CardTitle>
                  <div className="w-12 h-0.5 bg-brand-amber/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                    Optimized for South African medical aid schemes with streamlined billing and validation processes.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Status Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 border">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-brand-amber rounded-full animate-pulse delay-150"></div>
                <div className="w-3 h-3 bg-brand-blue rounded-full animate-pulse delay-300"></div>
              </div>
              <span className="text-sm font-medium">Development Environment Active</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}