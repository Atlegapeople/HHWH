'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Lock, 
  Eye, 
  Users, 
  FileText, 
  Mail, 
  Phone, 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Globe,
  Database,
  UserCheck,
  Settings
} from 'lucide-react'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/10">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-brand-green/10 to-brand-blue/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-brand-green" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Your privacy and data protection are fundamental to our healthcare services
            </p>
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30">
              <Clock className="h-3 w-3 mr-1" />
              Last Updated: January 2025
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

            {/* Introduction */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Introduction</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  HHWH Online Clinic ("we," "our," or "us") is committed to protecting your privacy and ensuring the security of your personal and medical information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our online healthcare platform and services.
                </p>
                <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-green mb-1">POPIA Compliance</p>
                      <p className="text-sm text-muted-foreground">
                        We are fully compliant with South Africa's Protection of Personal Information Act (POPIA) and international healthcare data protection standards.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Information We Collect</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-brand-green" />
                      Personal Information
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Full name, date of birth, and contact details</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Email address and phone number</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Residential address and identification documents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                        <span>Medical aid information and membership details</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-brand-blue" />
                      Medical Information
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Health assessment responses and symptom data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Medical history and current medications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Consultation notes and treatment plans</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                        <span>Laboratory results and diagnostic reports</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-brand-purple" />
                    Technical Information
                  </h3>
                  <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>IP address, browser type, and device information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Login timestamps and platform usage analytics</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                        <span>Cookies and session data for functionality</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="mb-8 border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">How We Use Your Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-brand-green">Healthcare Services</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Provide personalized hormone health consultations</li>
                      <li>• Develop and monitor treatment plans</li>
                      <li>• Facilitate communication with healthcare providers</li>
                      <li>• Process medical aid claims and payments</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-brand-blue">Platform Operations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Maintain and improve platform functionality</li>
                      <li>• Ensure security and prevent fraudulent activity</li>
                      <li>• Provide customer support and technical assistance</li>
                      <li>• Send important updates and notifications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card className="mb-8 border-brand-red/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-brand-red" />
                  <CardTitle className="text-2xl">Information Sharing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-brand-red/5 border border-brand-red/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-red mb-2">Limited Sharing Policy</p>
                      <p className="text-sm text-muted-foreground">
                        We do not sell, rent, or trade your personal information. We only share information in specific, limited circumstances as outlined below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">With Your Consent</h4>
                    <p className="text-sm text-muted-foreground">We may share information when you explicitly provide consent for specific purposes.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Healthcare Providers</h4>
                    <p className="text-sm text-muted-foreground">Your assigned doctors and medical professionals access your information to provide care.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Medical Aid Schemes</h4>
                    <p className="text-sm text-muted-foreground">Limited information shared for claim processing and authorization purposes.</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Legal Requirements</h4>
                    <p className="text-sm text-muted-foreground">When required by South African law or legal proceedings.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Data Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-brand-green">Technical Safeguards</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-brand-green" />
                        <span>256-bit SSL encryption for all data transmission</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-brand-green" />
                        <span>Encrypted database storage with access controls</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-brand-green" />
                        <span>Regular security audits and vulnerability assessments</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-brand-blue">Operational Security</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-brand-blue" />
                        <span>Role-based access controls for staff</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-blue" />
                        <span>Comprehensive audit logging and monitoring</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-brand-blue" />
                        <span>Regular staff training on data protection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="mb-8 border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-brand-purple" />
                  <CardTitle className="text-2xl">Your Privacy Rights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">Under POPIA, you have the following rights regarding your personal information:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-purple">Access & Portability</h4>
                        <p className="text-sm text-muted-foreground">Request copies of your personal information and medical records.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-green">Correction</h4>
                        <p className="text-sm text-muted-foreground">Update or correct inaccurate personal information.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-blue">Deletion</h4>
                        <p className="text-sm text-muted-foreground">Request deletion of your personal information (subject to legal requirements).</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-amber">Objection</h4>
                        <p className="text-sm text-muted-foreground">Object to processing for marketing or non-essential purposes.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-red">Restriction</h4>
                        <p className="text-sm text-muted-foreground">Limit how we process your information in certain circumstances.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-brand-pink">Complaint</h4>
                        <p className="text-sm text-muted-foreground">Lodge complaints with the Information Regulator of South Africa.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Contact Us</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Data Protection Officer</p>
                        <p className="text-sm text-muted-foreground">privacy@hhwh.co.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Privacy Helpline</p>
                        <p className="text-sm text-muted-foreground">+27 (0)11 685 5021</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                    <h4 className="font-semibold text-brand-blue mb-2">Response Time</h4>
                    <p className="text-sm text-muted-foreground">
                      We aim to respond to all privacy-related inquiries within 30 days as required by POPIA.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">Policy Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                  We will notify you of significant changes by email or through our platform.
                </p>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-1">Current Version</p>
                      <p className="text-sm text-muted-foreground">
                        This Privacy Policy was last updated on January 29, 2025, and is effective immediately.
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