'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Shield, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Info,
  Clock,
  Scale,
  Gavel,
  UserCheck,
  Ban,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  Heart,
  Stethoscope,
  Lock
} from 'lucide-react'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/10">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-brand-blue/10 to-brand-green/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <FileText className="h-8 w-8 text-brand-blue" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Legal terms and conditions governing your use of HHWH Online Clinic services
            </p>
            <Badge variant="outline" className="bg-brand-blue/10 text-brand-blue border-brand-blue/30">
              <Clock className="h-3 w-3 mr-1" />
              Effective Date: January 2025
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Back Navigation */}
            <div className="mb-8">
              <Link href="/">
                <Button variant="outline" className="mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Acceptance */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Acceptance of Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using HHWH Online Clinic ("the Platform," "our Service," or "we"), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service ("Terms") constitute a legally binding agreement between you and HHWH Online Clinic (Pty) Ltd.
                </p>
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-green mb-1">Important Notice</p>
                      <p className="text-sm text-muted-foreground">
                        If you do not agree to abide by these Terms, please do not use this service. Your continued use of the Platform constitutes acceptance of these Terms.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Services */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Medical Services & Scope</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-brand-blue">Our Healthcare Services</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-brand-green">Provided Services</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Virtual hormone health consultations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Comprehensive health assessments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Personalized treatment plans</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Medical aid assistance and billing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Ongoing monitoring and support</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-brand-red">Service Limitations</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Emergency medical services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>In-person physical examinations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Laboratory testing services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Prescription of controlled substances</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Mental health crisis intervention</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-red mb-2">Medical Emergency Disclaimer</p>
                      <p className="text-sm text-muted-foreground">
                        This platform is not intended for medical emergencies. In case of emergency, call 10177 (South Africa emergency services) 
                        or visit your nearest emergency room immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card className="mb-8 border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-brand-purple" />
                  <CardTitle className="text-2xl">User Responsibilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-purple">Account Management</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Provide accurate and complete personal information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Maintain confidentiality of login credentials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Update information promptly when changes occur</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Notify us immediately of any security breaches</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-blue">Medical Information</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Provide complete and accurate medical history</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Disclose all current medications and supplements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Follow prescribed treatment plans as directed</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Attend scheduled consultations punctually</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-brand-green">Prohibited Uses</h3>
                  <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Sharing account credentials with others</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Attempting to access unauthorized areas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Uploading malicious software or content</span>
                        </li>
                      </ul>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Providing false or misleading information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Using the service for illegal activities</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Ban className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Harassment of healthcare providers or staff</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="mb-8 border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">Payment Terms & Medical Aid</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-amber">Payment Methods</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                        <span>Direct payment via secure payment gateway</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Medical aid scheme billing (where applicable)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Corporate billing arrangements</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green">Medical Aid</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>We assist with medical aid authorization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Direct billing to major South African schemes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                        <span>Coverage depends on your specific benefits</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-brand-blue">Fees & Refunds</h3>
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Initial Consultation:</span>
                        <span className="text-brand-blue font-semibold">R800 - R1,200</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Follow-up Consultation:</span>
                        <span className="text-brand-green font-semibold">R400 - R600</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">Treatment Plan Review:</span>
                        <span className="text-brand-purple font-semibold">R200 - R500</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-brand-amber mb-1">Refund Policy</p>
                        <p className="text-sm text-muted-foreground">
                          Refunds are available for cancelled consultations with 24-hour notice. 
                          Medical aid claims cannot be reversed once processed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Privacy & Data Protection</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy and the security of your medical information are paramount. Our data handling practices 
                  are governed by our comprehensive Privacy Policy and comply with South Africa's Protection of Personal Information Act (POPIA).
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-brand-green">Data Security</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-brand-green" />
                        <span>End-to-end encryption for all communications</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-brand-green" />
                        <span>Secure, encrypted database storage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-brand-green" />
                        <span>Access controls and audit logging</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-brand-blue">Your Rights</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-blue" />
                        <span>Access to your personal information</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-brand-blue" />
                        <span>Correction of inaccurate data</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Ban className="h-4 w-4 text-brand-blue" />
                        <span>Deletion of personal information</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-green mb-1">Privacy Policy Reference</p>
                      <p className="text-sm text-muted-foreground">
                        For complete details on how we collect, use, and protect your information, please review our 
                        <Link href="/privacy" className="text-brand-green hover:underline ml-1">Privacy Policy</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liability & Disclaimers */}
            <Card className="mb-8 border-brand-red/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-brand-red" />
                  <CardTitle className="text-2xl">Liability & Disclaimers</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-red mb-2">Important Medical Disclaimer</p>
                      <p className="text-sm text-muted-foreground">
                        The information and services provided through this platform are for informational and healthcare purposes only. 
                        They are not intended to replace professional medical advice, diagnosis, or treatment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-brand-blue">Limitation of Liability</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-brand-green">Our Responsibilities</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Provide qualified healthcare professionals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Maintain platform security and functionality</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Protect your personal information</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-brand-amber">Limitations</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>No guarantee of specific medical outcomes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>Technology limitations and internet dependencies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>Third-party service provider limitations</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="mb-8 border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-brand-purple" />
                  <CardTitle className="text-2xl">Governing Law & Disputes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-brand-purple">Jurisdiction</h3>
                    <p className="text-sm text-muted-foreground">
                      These Terms shall be governed by and construed in accordance with the laws of the Republic of South Africa. 
                      Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the South African courts.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-brand-blue">Dispute Resolution</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Initial resolution through direct communication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Mediation before legal proceedings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Scale className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>South African court jurisdiction</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Contact Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about these Terms of Service or need assistance with our platform, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Legal & Compliance</p>
                        <p className="text-sm text-muted-foreground">legal@hhwh.co.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Customer Support</p>
                        <p className="text-sm text-muted-foreground">+27 (0)11 685 5021</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                    <h4 className="font-semibold text-brand-blue mb-2">Business Hours</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Monday - Friday: 8:00 AM - 5:00 PM SAST</p>
                      <p>Saturday: 9:00 AM - 1:00 PM SAST</p>
                      <p>Sunday & Public Holidays: Closed</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">Changes to Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on our website. 
                  We will notify users of significant changes via email or platform notifications.
                </p>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-1">Current Version</p>
                      <p className="text-sm text-muted-foreground">
                        These Terms of Service were last updated on January 29, 2025, and are effective immediately.
                        Your continued use of the service after changes constitutes acceptance of the new terms.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}