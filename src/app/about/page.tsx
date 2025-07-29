'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Heart, 
  Users, 
  Stethoscope, 
  Globe, 
  Shield, 
  Target,
  CheckCircle,
  Award,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Zap,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function AboutPage() {
  const { user } = useAuth()
  
  // Helper function to get the correct URL based on user authentication
  const getAuthRedirectUrl = (targetUrl: string) => {
    return user ? targetUrl : '/auth/signup'
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-green-light/20">
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
              Hormone Health with Heart
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
              South Africa's premier women's hormone health online clinic, supporting you through every stage of your hormonal journey with compassion, expertise, and evidence-based care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={getAuthRedirectUrl("/patient/register")}>
                <Button className="btn-healthcare-primary text-lg px-8 py-3">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="text-lg px-8 py-3 border-brand-green text-brand-green hover:bg-brand-green hover:text-white">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gradient-to-r from-white/50 via-brand-pink/5 to-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/30 animate-pulse">
              Our Purpose
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">
              Empowering Women Through Hormonal Wellness
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-brand-green to-brand-blue mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mission */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                  <Target className="h-8 w-8 text-brand-green group-hover:animate-spin" />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-green group-hover:text-brand-green/80 transition-colors">Our Mission</CardTitle>
                <div className="w-12 h-0.5 bg-brand-green mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-center leading-relaxed group-hover:text-foreground/80 transition-colors">
                  To provide <span className="font-semibold text-brand-green">accessible, personalized, and evidence-based</span> hormone health care for South African women aged 35-65, 
                  supporting them through premenopause, perimenopause, and postmenopause with expert virtual consultations, 
                  comprehensive screening, and holistic management plans that leverage medical aid benefits wherever possible.
                </p>
                <div className="mt-6 flex justify-center">
                  <Badge variant="outline" className="bg-brand-green/5 text-brand-green border-brand-green/30">
                    <Heart className="h-3 w-3 mr-1" />
                    Compassionate Care
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-brand-blue/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group cursor-pointer">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-blue/20">
                  <Globe className="h-8 w-8 text-brand-blue group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-blue group-hover:text-brand-blue/80 transition-colors">Our Vision</CardTitle>
                <div className="w-12 h-0.5 bg-brand-blue mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-center leading-relaxed group-hover:text-foreground/80 transition-colors">
                  To become the <span className="font-semibold text-brand-blue">leading women's hormone health platform</span> across Southern Africa, breaking down barriers to expert care 
                  and empowering women with the knowledge, support, and treatment they need to thrive through every stage of their hormonal journey.
                </p>
                <div className="mt-6 flex justify-center">
                  <Badge variant="outline" className="bg-brand-blue/5 text-brand-blue border-brand-blue/30">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Regional Leader
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-pink/10 text-brand-pink border-brand-pink/30">
              Our Community
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Supporting Women Across Southern Africa</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We understand that every woman's hormonal journey is unique. Our specialized care serves diverse communities across the region.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Busy Professionals */}
            <Card className="border-brand-purple/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-purple/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-purple/20">
                  <Clock className="h-6 w-6 text-brand-purple" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-purple transition-colors">Busy Professionals</CardTitle>
                <div className="w-8 h-0.5 bg-brand-purple/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Career-focused women who need <span className="font-semibold">convenient, flexible access</span> to hormone health care that fits around their demanding schedules.
                </p>
              </CardContent>
            </Card>

            {/* Rural & Underserved Areas */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-green/20">
                  <MapPin className="h-6 w-6 text-brand-green" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-green transition-colors">Rural Communities</CardTitle>
                <div className="w-8 h-0.5 bg-brand-green/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Women in rural or underserved areas, including <span className="font-semibold">farmers' wives and professionals</span>, who lack access to specialized hormone health care locally.
                </p>
              </CardContent>
            </Card>

            {/* Regional Coverage */}
            <Card className="border-brand-blue/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-blue/20">
                  <Globe className="h-6 w-6 text-brand-blue group-hover:animate-spin" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-blue transition-colors">Southern Africa</CardTitle>
                <div className="w-8 h-0.5 bg-brand-blue/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Extending our services to <span className="font-semibold">Zimbabwe, Swaziland, Mozambique, Botswana, and Namibia</span>, where specialized care is limited.
                </p>
              </CardContent>
            </Card>

            {/* Age Group */}
            <Card className="border-brand-pink/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-pink/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-pink/20">
                  <Users className="h-6 w-6 text-brand-pink" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-pink transition-colors">Women 35-65</CardTitle>
                <div className="w-8 h-0.5 bg-brand-pink/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Targeting women experiencing <span className="font-semibold">premenopause, perimenopause, and postmenopause</span> transitions who need expert, empathetic care.
                </p>
              </CardContent>
            </Card>

            {/* Fragmented Care */}
            <Card className="border-brand-amber/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-amber/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-amber/20">
                  <Stethoscope className="h-6 w-6 text-brand-amber" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-amber transition-colors">Seeking Better Care</CardTitle>
                <div className="w-8 h-0.5 bg-brand-amber/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Women currently receiving <span className="font-semibold">fragmented or unclear menopause-related care</span> who want a comprehensive, coordinated approach.
                </p>
              </CardContent>
            </Card>

            {/* Holistic Approach */}
            <Card className="border-brand-green/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative z-10">
                <div className="w-12 h-12 bg-brand-green/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 group-hover:bg-brand-green/20">
                  <Heart className="h-6 w-6 text-brand-green group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-lg group-hover:text-brand-green transition-colors">Holistic Wellness</CardTitle>
                <div className="w-8 h-0.5 bg-brand-green/30 group-hover:w-16 transition-all duration-300"></div>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                  Women seeking a <span className="font-semibold">comprehensive approach</span> that combines medical treatment, lifestyle modifications, and supplemental strategies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-green/10 text-brand-green border-brand-green/30">
              Our Approach
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Evidence-Based, Personalized Care</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We combine the latest medical research with personalized attention to provide comprehensive hormone health solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Comprehensive Screening */}
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-brand-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                <CheckCircle className="h-10 w-10 text-white group-hover:animate-bounce" />
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-brand-purple mb-2 group-hover:scale-110 transition-transform duration-300">65+</div>
                <h3 className="text-xl font-bold group-hover:text-brand-purple transition-colors">Comprehensive Assessment</h3>
                <div className="w-12 h-0.5 bg-brand-purple/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
              </div>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                Our detailed <span className="font-semibold text-brand-purple">65+ risk factor screening</span> helps us understand your unique hormonal profile and create personalized treatment plans.
              </p>
            </div>

            {/* Expert Care */}
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                <Award className="h-10 w-10 text-white group-hover:animate-pulse" />
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-brand-green mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                <h3 className="text-xl font-bold group-hover:text-brand-green transition-colors">Expert Consultations</h3>
                <div className="w-12 h-0.5 bg-brand-green/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
              </div>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                Virtual consultations with <span className="font-semibold text-brand-green">qualified hormone health specialists</span> who understand the South African healthcare landscape and medical aid systems.
              </p>
            </div>

            {/* Holistic Support */}
            <div className="text-center group cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-br from-brand-pink to-brand-purple rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2">
                <Heart className="h-10 w-10 text-white group-hover:animate-heartbeat" />
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-brand-pink mb-2 group-hover:scale-110 transition-transform duration-300">360°</div>
                <h3 className="text-xl font-bold group-hover:text-brand-pink transition-colors">Holistic Treatment</h3>
                <div className="w-12 h-0.5 bg-brand-pink/30 mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
              </div>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                Combining <span className="font-semibold text-brand-pink">medical interventions with lifestyle guidance</span> and supplemental strategies for comprehensive hormonal wellness.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 bg-gradient-to-r from-brand-green/10 via-brand-blue/10 to-brand-purple/10 rounded-2xl p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-brand-green mb-2 group-hover:scale-110 transition-transform duration-300">6</div>
                <div className="text-sm font-medium text-muted-foreground">Countries Served</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-brand-blue mb-2 group-hover:scale-110 transition-transform duration-300">35-65</div>
                <div className="text-sm font-medium text-muted-foreground">Age Range Focus</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-brand-purple mb-2 group-hover:scale-110 transition-transform duration-300">3</div>
                <div className="text-sm font-medium text-muted-foreground">Menopause Stages</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-brand-pink mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
                <div className="text-sm font-medium text-muted-foreground">Dedicated to Women</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 bg-brand-blue/10 text-brand-blue border-brand-blue/30">
              Why Choose HHWH
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Leading Hormone Health Care in Southern Africa</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Medical Aid Optimization</h3>
                  <p className="text-muted-foreground">We help you maximize your medical aid benefits while providing transparent pricing for private consultations.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-brand-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Convenient Access</h3>
                  <p className="text-muted-foreground">Virtual consultations that fit your schedule, eliminating travel time and waiting rooms.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Specialized Expertise</h3>
                  <p className="text-muted-foreground">Our doctors specialize in women's hormone health and understand the unique needs of South African women.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-pink/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-brand-pink" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Compassionate Care</h3>
                  <p className="text-muted-foreground">We provide empathetic, personalized care that addresses both physical symptoms and emotional well-being.</p>
                </div>
              </div>
            </div>

            <Card className="border-brand-green/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="text-center relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="h-8 w-8 text-white group-hover:animate-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold text-brand-green group-hover:text-brand-green/80 transition-colors">Ready to Transform Your Health?</CardTitle>
                <CardDescription className="text-lg group-hover:text-foreground/80 transition-colors">
                  Join thousands of women who have taken control of their hormonal wellness
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-brand-green/5 group-hover:bg-brand-green/10 transition-colors">
                    <div className="w-8 h-8 bg-brand-green/20 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-brand-green" />
                    </div>
                    <span className="text-sm font-medium">Comprehensive Assessment</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-brand-blue/5 group-hover:bg-brand-blue/10 transition-colors">
                    <div className="w-8 h-8 bg-brand-blue/20 rounded-full flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-brand-blue" />
                    </div>
                    <span className="text-sm font-medium">Expert Virtual Care</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-brand-purple/5 group-hover:bg-brand-purple/10 transition-colors">
                    <div className="w-8 h-8 bg-brand-purple/20 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-brand-purple" />
                    </div>
                    <span className="text-sm font-medium">Personalized Treatment</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href={getAuthRedirectUrl("/patient/register")} className="flex-1">
                    <Button className="w-full btn-healthcare-primary text-lg py-3 group-hover:shadow-lg transition-shadow">
                      <RefreshCw className="h-5 w-5 mr-2 group-hover:animate-spin" />
                      Begin Your Journey
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href={getAuthRedirectUrl("/patient/assessment")} className="flex-1">
                    <Button variant="outline" className="w-full text-lg py-3 border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-all">
                      Free Assessment
                    </Button>
                  </Link>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-green" />
                    No commitment required • 100% confidential • Medical aid friendly
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-gradient-to-r from-brand-green/10 to-brand-blue/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-muted-foreground">
              Have questions? We're here to help you on your hormone health journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-brand-green" />
              </div>
              <h3 className="font-bold mb-2">Call Us</h3>
              <div className="text-muted-foreground space-y-1">
                <p>+27 (0)11 685 5021</p>
                <p>+27 (0)79 262 8749</p>
              </div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-brand-blue" />
              </div>
              <h3 className="font-bold mb-2">Email Us</h3>
              <p className="text-muted-foreground">hello@hhwh.co.za</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-brand-purple" />
              </div>
              <h3 className="font-bold mb-2">Our Office</h3>
              <div className="text-muted-foreground space-y-1">
                <p>Ground floor, 8 Merchant Place</p>
                <p>1 Fredman Drive, Sandton 2196</p>
                <p>South Africa</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}