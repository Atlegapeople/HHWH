'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Stethoscope, 
  Heart, 
  Calendar, 
  FileText, 
  Pill, 
  Users, 
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
  Star,
  Phone,
  Video,
  MessageSquare,
  CreditCard,
  Activity,
  Brain,
  Thermometer,
  Target,
  Sparkles,
  TrendingUp,
  Zap,
  Layers,
  Award2,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function ServicesPage() {
  const { user } = useAuth()
  
  // Helper function to get the correct URL based on user authentication
  const getAuthRedirectUrl = (targetUrl: string) => {
    return user ? targetUrl : '/auth/signup'
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
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
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
              Expert Care for Every Stage
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Expert hormone specialists, comprehensive virtual consultations, and personalized treatment plans designed specifically for South African women aged 35-65.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={getAuthRedirectUrl("/patient/assessment")}>
                <Button className="btn-healthcare-primary text-lg px-8 py-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Zap className="h-5 w-5 mr-2" />
                  Start Assessment
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href={getAuthRedirectUrl("/patient/book-appointment")}>
                <Button variant="outline" className="text-lg px-8 py-3 border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Consultation
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-brand-green" />
                <span>HPCSA Registered</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-blue" />
                <span>Medical Aid Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-brand-pink" />
                <span>Women-Focused Care</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Core Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive hormone health care that addresses your unique needs through every stage of your journey.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Comprehensive Assessment */}
            <Card className="border-brand-purple/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                  <FileText className="h-8 w-8 text-white group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-brand-purple transition-colors duration-300">Comprehensive Assessment</CardTitle>
                <div className="w-12 h-0.5 bg-brand-purple/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                  Detailed 65+ risk factor screening and symptom evaluation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Vasomotor symptom tracking</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Psychological wellness evaluation</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Physical health assessment</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Sexual health screening</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Lifestyle factor analysis</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href={getAuthRedirectUrl("/patient/assessment")}>
                    <Button className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      Take Assessment
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Virtual Consultations */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                  <Video className="h-8 w-8 text-white group-hover:animate-spin" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-brand-green transition-colors duration-300">Virtual Consultations</CardTitle>
                <div className="w-12 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                  Expert consultations with qualified hormone health specialists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Initial consultations (45 minutes)</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Follow-up appointments (30 minutes)</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Secure video platform</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Medical aid billing support</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Digital prescriptions</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href={getAuthRedirectUrl("/patient/book-appointment")}>
                    <Button className="w-full bg-brand-green hover:bg-brand-green/90 text-white group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      Book Consultation
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Plans */}
            <Card className="border-brand-blue/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-purple rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                  <Heart className="h-8 w-8 text-white group-hover:animate-heartbeat" />
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-brand-blue transition-colors duration-300">Personalized Treatment</CardTitle>
                <div className="w-12 h-0.5 bg-brand-blue/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                <CardDescription className="text-base group-hover:text-foreground/80 transition-colors duration-300">
                  Holistic treatment plans tailored to your unique needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Hormone replacement therapy</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Lifestyle modification plans</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Nutritional guidance</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Supplement recommendations</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="text-sm group-hover:text-foreground transition-colors">Ongoing monitoring & support</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <Link href={getAuthRedirectUrl("/patient/register")}>
                    <Button className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consultation Types */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-green/10 text-brand-green border-brand-green/30">
              Consultation Options
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Choose Your Care Path</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Flexible consultation options designed to meet your needs and work with your medical aid benefits.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Initial Consultation */}
            <Card className="border-brand-purple/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="h-6 w-6 text-brand-purple" />
                </div>
                <CardTitle className="text-lg">Initial Consultation</CardTitle>
                <CardDescription>Comprehensive first appointment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-purple mb-2">R800-1200</div>
                  <div className="text-sm text-muted-foreground">45-60 minutes</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Complete health history review
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Detailed symptom assessment
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Personalized treatment plan
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Prescription if required
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Follow-up Consultation */}
            <Card className="border-brand-green/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-brand-green" />
                </div>
                <CardTitle className="text-lg">Follow-up Consultation</CardTitle>
                <CardDescription>Ongoing care and monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-green mb-2">R400-600</div>
                  <div className="text-sm text-muted-foreground">30 minutes</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Progress review & assessment
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Treatment plan adjustments
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    New prescriptions if needed
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Ongoing support & guidance
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Treatment Plans */}
            <Card className="border-brand-blue/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-brand-blue" />
                </div>
                <CardTitle className="text-lg">Treatment Plans</CardTitle>
                <CardDescription>Comprehensive care packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand-blue mb-2">R200-500</div>
                  <div className="text-sm text-muted-foreground">Per month</div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Monthly progress monitoring
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Lifestyle coaching support
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Educational resources
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    Priority booking access
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Symptom Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-pink/10 text-brand-pink border-brand-pink/30">
              Conditions We Treat
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Comprehensive Symptom Management</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We address the full spectrum of hormonal symptoms through premenopause, perimenopause, and postmenopause.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Vasomotor Symptoms */}
            <Card className="border-brand-red/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="w-14 h-14 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:bg-brand-red/20">
                  <Thermometer className="h-7 w-7 text-brand-red group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg text-brand-red group-hover:text-brand-red/80 transition-colors">Vasomotor</CardTitle>
                <div className="w-8 h-0.5 bg-brand-red/30 mx-auto mt-2 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-2 text-sm">
                  <li className="group-hover:translate-x-1 transition-transform duration-300 group-hover:text-foreground">• Hot flashes</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-75 group-hover:text-foreground">• Night sweats</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-150 group-hover:text-foreground">• Temperature regulation</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-200 group-hover:text-foreground">• Sleep disruption</li>
                </ul>
              </CardContent>
            </Card>

            {/* Psychological Symptoms */}
            <Card className="border-brand-blue/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:bg-brand-blue/20">
                  <Brain className="h-7 w-7 text-brand-blue group-hover:animate-spin" />
                </div>
                <CardTitle className="text-lg text-brand-blue group-hover:text-brand-blue/80 transition-colors">Psychological</CardTitle>
                <div className="w-8 h-0.5 bg-brand-blue/30 mx-auto mt-2 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-2 text-sm">
                  <li className="group-hover:translate-x-1 transition-transform duration-300 group-hover:text-foreground">• Mood changes</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-75 group-hover:text-foreground">• Anxiety & depression</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-150 group-hover:text-foreground">• Sleep quality</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-200 group-hover:text-foreground">• Memory & concentration</li>
                </ul>
              </CardContent>
            </Card>

            {/* Physical Symptoms */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="w-14 h-14 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:bg-brand-green/20">
                  <Activity className="h-7 w-7 text-brand-green group-hover:animate-bounce" />
                </div>
                <CardTitle className="text-lg text-brand-green group-hover:text-brand-green/80 transition-colors">Physical</CardTitle>
                <div className="w-8 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-2 text-sm">
                  <li className="group-hover:translate-x-1 transition-transform duration-300 group-hover:text-foreground">• Energy levels & fatigue</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-75 group-hover:text-foreground">• Joint aches & pains</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-150 group-hover:text-foreground">• Weight management</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-200 group-hover:text-foreground">• Muscle tension</li>
                </ul>
              </CardContent>
            </Card>

            {/* Sexual Health */}
            <Card className="border-brand-pink/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="w-14 h-14 bg-brand-pink/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 group-hover:bg-brand-pink/20">
                  <Heart className="h-7 w-7 text-brand-pink group-hover:animate-heartbeat" />
                </div>
                <CardTitle className="text-lg text-brand-pink group-hover:text-brand-pink/80 transition-colors">Sexual Health</CardTitle>
                <div className="w-8 h-0.5 bg-brand-pink/30 mx-auto mt-2 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-2 text-sm">
                  <li className="group-hover:translate-x-1 transition-transform duration-300 group-hover:text-foreground">• Libido changes</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-75 group-hover:text-foreground">• Vaginal dryness</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-150 group-hover:text-foreground">• Intimacy issues</li>
                  <li className="group-hover:translate-x-1 transition-transform duration-300 delay-200 group-hover:text-foreground">• Urogenital symptoms</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Payment & Medical Aid */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-green/10 text-brand-green border-brand-green/30">
              Payment Options
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Flexible Payment Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We work with your medical aid and offer transparent private payment options.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Medical Aid */}
            <Card className="border-brand-blue/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center relative z-10">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-brand-blue/20 shadow-lg group-hover:shadow-2xl">
                  <Shield className="h-8 w-8 text-brand-blue group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-xl text-brand-blue group-hover:text-brand-blue/80 transition-colors duration-300">Medical Aid Benefits</CardTitle>
                <div className="w-12 h-0.5 bg-brand-blue/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">Maximize your existing medical aid coverage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Manual validation & processing</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Coverage verification support</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Partial payment when needed</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Clear communication on costs</span>
                  </li>
                </ul>
                <div className="bg-brand-blue/5 rounded-lg p-4 group-hover:bg-brand-blue/10 transition-colors duration-300">
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <strong className="text-brand-blue">Popular medical aids:</strong> Discovery, Momentum, Fedhealth, and others
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Private Payment */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="text-center relative z-10">
                <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 group-hover:bg-brand-green/20 shadow-lg group-hover:shadow-2xl">
                  <CreditCard className="h-8 w-8 text-brand-green group-hover:animate-spin" />
                </div>
                <CardTitle className="text-xl text-brand-green group-hover:text-brand-green/80 transition-colors duration-300">Private Payment</CardTitle>
                <div className="w-12 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
                <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">Transparent pricing for self-paying patients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Secure online payment</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">No hidden fees</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-150">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Immediate appointment confirmation</span>
                  </li>
                  <li className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-200">
                    <CheckCircle className="h-5 w-5 text-brand-green group-hover:animate-bounce" />
                    <span className="group-hover:text-foreground transition-colors">Digital receipts provided</span>
                  </li>
                </ul>
                <div className="bg-brand-green/5 rounded-lg p-4 group-hover:bg-brand-green/10 transition-colors duration-300">
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    <strong className="text-brand-green">Payment methods:</strong> Credit/Debit cards, EFT, and digital wallets
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/30">
              Getting Started
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Your Journey to Better Health</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple steps to begin your personalized hormone health journey with expert care and support.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting lines */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-purple via-brand-blue via-brand-green to-brand-pink hidden md:block opacity-30"></div>
            
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2 relative z-10">
                  <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">1</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-brand-purple transition-colors duration-300">Complete Assessment</h3>
              <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
                Take our comprehensive 65+ factor health screening to understand your hormonal profile.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2 relative z-10">
                  <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">2</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-brand-blue transition-colors duration-300">Book Consultation</h3>
              <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
                Schedule your virtual consultation with our hormone health specialists at a convenient time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2 relative z-10">
                  <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">3</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-brand-green transition-colors duration-300">Receive Treatment Plan</h3>
              <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
                Get your personalized treatment plan combining medical, lifestyle, and supplemental strategies.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2 relative z-10">
                <span className="text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300">4</span>
              </div>
              <h3 className="text-lg font-bold mb-3 group-hover:text-brand-pink transition-colors duration-300">Ongoing Support</h3>
              <p className="text-muted-foreground text-sm group-hover:text-foreground transition-colors duration-300">
                Continue with follow-up consultations and ongoing monitoring to optimize your health outcomes.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto border-brand-green/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <Image 
                    src="/images/icon_heart_logo-removebg-preview.png"
                    alt="HHWH Heart Logo"
                    width={60}
                    height={60}
                    className="object-contain drop-shadow-xl transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:brightness-110 cursor-pointer transform-gpu animate-heartbeat"
                    style={{
                      filter: 'drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3)) drop-shadow(0 15px 35px rgba(0, 0, 0, 0.2))'
                    }}
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-green group-hover:text-brand-green/80 transition-colors duration-300">Ready to Begin?</CardTitle>
                <div className="w-16 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-24 transition-all duration-300"></div>
                <CardDescription className="text-lg group-hover:text-foreground/80 transition-colors duration-300">
                  Take the first step towards comprehensive hormone health care today.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={getAuthRedirectUrl("/patient/assessment")} className="flex-1">
                    <Button className="w-full btn-healthcare-primary text-lg py-3 group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <FileText className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                      Start Assessment
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href={getAuthRedirectUrl("/patient/book-appointment")} className="flex-1">
                    <Button variant="outline" className="w-full text-lg py-3 border-brand-green text-brand-green hover:bg-brand-green hover:text-white group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <Calendar className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                      Book Consultation
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  Questions? Contact us at <strong className="text-brand-green">hello@hhwh.co.za</strong> or <strong className="text-brand-green">+27 (0)11 685 5021</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}