'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Shield, 
  Stethoscope, 
  Heart, 
  Phone, 
  Clock,
  ArrowLeft,
  Info,
  UserCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  Ban,
  Globe,
  Scale,
  RefreshCw,
  Mail,
  Zap,
  Eye,
  Users,
  Lock,
  Activity
} from 'lucide-react'
import Link from 'next/link'

export default function MedicalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/10">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-brand-red/10 to-brand-amber/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-brand-red" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Medical Disclaimer
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Important information about the scope and limitations of our healthcare services
            </p>
            <Badge variant="outline" className="bg-brand-red/10 text-brand-red border-brand-red/30">
              <Clock className="h-3 w-3 mr-1" />
              Effective: January 2025
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

            {/* Important Notice */}
            <Card className="mb-8 border-brand-red/20 bg-brand-red/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-brand-red" />
                  <CardTitle className="text-2xl text-brand-red">Important Medical Notice</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-brand-red/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-brand-red mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-red mb-2 text-lg">Please Read Carefully</p>
                      <p className="text-muted-foreground leading-relaxed">
                        The information and services provided by HHWH Online Clinic are for informational and healthcare consultation purposes only. 
                        This platform does not replace the need for professional medical advice, diagnosis, or treatment from qualified healthcare providers 
                        in appropriate clinical settings.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Scope */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Scope of Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      What We Provide
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-brand-green/5 rounded-lg border border-brand-green/20">
                        <Heart className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Hormone Health Consultations</p>
                          <p className="text-xs text-muted-foreground">Virtual consultations with qualified hormone specialists</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-blue/5 rounded-lg border border-brand-blue/20">
                        <FileText className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Health Assessments</p>
                          <p className="text-xs text-muted-foreground">Comprehensive questionnaires and risk factor evaluation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/20">
                        <Activity className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Treatment Planning</p>
                          <p className="text-xs text-muted-foreground">Personalized hormone health management plans</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-pink/5 rounded-lg border border-brand-pink/20">
                        <Users className="h-5 w-5 text-brand-pink mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Ongoing Support</p>
                          <p className="text-xs text-muted-foreground">Follow-up consultations and monitoring</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-red flex items-center gap-2">
                      <Ban className="h-5 w-5" />
                      What We Don't Provide
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-brand-red/5 rounded-lg border border-brand-red/20">
                        <AlertTriangle className="h-5 w-5 text-brand-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Emergency Medical Care</p>
                          <p className="text-xs text-muted-foreground">Acute medical emergencies or urgent interventions</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-amber/5 rounded-lg border border-brand-amber/20">
                        <Eye className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Physical Examinations</p>
                          <p className="text-xs text-muted-foreground">In-person physical assessments or procedures</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-blue/5 rounded-lg border border-brand-blue/20">
                        <Activity className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Laboratory Services</p>
                          <p className="text-xs text-muted-foreground">Blood tests, imaging, or diagnostic procedures</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/20">
                        <Ban className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Controlled Substances</p>
                          <p className="text-xs text-muted-foreground">Prescription of scheduled or controlled medications</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Disclaimer */}
            <Card className="mb-8 border-brand-red/30 bg-gradient-to-r from-brand-red/10 to-brand-amber/10">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-brand-red" />
                  <CardTitle className="text-2xl text-brand-red">Medical Emergencies</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border-2 border-brand-red/30 rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center">
                        <Phone className="h-8 w-8 text-brand-red animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-brand-red mb-2">In Case of Emergency</h3>
                      <p className="text-muted-foreground mb-4">
                        If you are experiencing a medical emergency, do not use this platform. Contact emergency services immediately.
                      </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-brand-red/5 rounded-lg border border-brand-red/20">
                        <Phone className="h-6 w-6 text-brand-red mx-auto mb-2" />
                        <p className="font-semibold text-brand-red text-lg">10177</p>
                        <p className="text-xs text-muted-foreground">SA Emergency Services</p>
                      </div>
                      <div className="p-4 bg-brand-amber/5 rounded-lg border border-brand-amber/20">
                        <Activity className="h-6 w-6 text-brand-amber mx-auto mb-2" />
                        <p className="font-semibold text-brand-amber text-sm">Nearest Hospital</p>
                        <p className="text-xs text-muted-foreground">Emergency Department</p>
                      </div>
                      <div className="p-4 bg-brand-blue/5 rounded-lg border border-brand-blue/20">
                        <Heart className="h-6 w-6 text-brand-blue mx-auto mb-2" />
                        <p className="font-semibold text-brand-blue text-sm">Your Doctor</p>
                        <p className="text-xs text-muted-foreground">Emergency Contact</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-2">Emergency Symptoms Include:</p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <ul className="space-y-1">
                          <li>• Chest pain or difficulty breathing</li>
                          <li>• Severe allergic reactions</li>
                          <li>• Loss of consciousness</li>
                        </ul>
                        <ul className="space-y-1">
                          <li>• Severe bleeding or trauma</li>
                          <li>• Signs of stroke or heart attack</li>
                          <li>• Severe mental health crisis</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Qualifications */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Professional Qualifications & Standards</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green">Our Healthcare Providers</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">HPCSA Registration</p>
                          <p className="text-xs text-muted-foreground">All doctors are registered with the Health Professions Council of South Africa</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Stethoscope className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Specialized Training</p>
                          <p className="text-xs text-muted-foreground">Expertise in women's hormone health and menopause management</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <RefreshCw className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Continuing Education</p>
                          <p className="text-xs text-muted-foreground">Regular training updates and professional development</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-blue">Quality Standards</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Evidence-Based Practice</p>
                          <p className="text-xs text-muted-foreground">Treatment recommendations based on current medical research</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Eye className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Peer Review</p>
                          <p className="text-xs text-muted-foreground">Regular case review and quality assurance processes</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Lock className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Ethics Compliance</p>
                          <p className="text-xs text-muted-foreground">Adherence to medical ethics and professional standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limitations & Responsibilities */}
            <Card className="mb-8 border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-brand-purple" />
                  <CardTitle className="text-2xl">Limitations & Patient Responsibilities</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-purple">Platform Limitations</h3>
                    <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>Virtual consultations cannot replace all aspects of in-person medical care</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Internet connectivity issues may affect service quality</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Visual and physical examination limitations in virtual settings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-brand-red mt-0.5 flex-shrink-0" />
                          <span>Technology failures may temporarily interrupt services</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green">Patient Responsibilities</h3>
                    <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Provide accurate and complete medical information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Follow prescribed treatment plans and recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>Seek immediate medical attention for emergencies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <RefreshCw className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>Maintain regular communication with your healthcare provider</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-2">Informed Consent</p>
                      <p className="text-sm text-muted-foreground">
                        By using our services, you acknowledge that you understand the limitations of telemedicine and 
                        virtual healthcare consultations. You consent to receive care within these defined parameters 
                        and understand when additional in-person medical care may be necessary.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information Accuracy */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Medical Information & Research</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-blue">Information Sources</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Evidence-Based Content</p>
                          <p className="text-xs text-muted-foreground">Information based on peer-reviewed medical research</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <UserCheck className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Expert Review</p>
                          <p className="text-xs text-muted-foreground">Content reviewed by qualified medical professionals</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <RefreshCw className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Regular Updates</p>
                          <p className="text-xs text-muted-foreground">Information updated to reflect current medical standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-amber">Important Disclaimers</h3>
                    <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-brand-amber mt-0.5 flex-shrink-0" />
                          <span>Medical knowledge evolves constantly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Users className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Individual medical needs vary significantly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Scale className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>Always consult your primary healthcare provider</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>General information cannot replace personalized care</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Medical Questions & Concerns</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about this medical disclaimer or concerns about our healthcare services, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Medical Director</p>
                        <p className="text-sm text-muted-foreground">medical@hhwh.co.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Patient Care Line</p>
                        <p className="text-sm text-muted-foreground">+27 (0)11 685 5021</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
                    <h4 className="font-semibold text-brand-green mb-2">Clinical Hours</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 2:00 PM</p>
                      <p>Medical emergencies: Contact 10177</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">Disclaimer Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  This medical disclaimer may be updated to reflect changes in medical practice, technology, 
                  or regulatory requirements. We will notify users of significant changes through our platform.
                </p>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-1">Current Version</p>
                      <p className="text-sm text-muted-foreground">
                        This Medical Disclaimer was last updated on January 29, 2025. 
                        By continuing to use our services, you acknowledge understanding and acceptance of these terms.
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