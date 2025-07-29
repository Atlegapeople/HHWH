'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Cookie, 
  Shield, 
  Settings, 
  Eye, 
  BarChart3,
  ArrowLeft,
  Info,
  Clock,
  CheckCircle,
  AlertTriangle,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Lock,
  RefreshCw,
  Mail,
  Phone,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/10">
      {/* Header */}
      <section className="py-16 bg-gradient-to-r from-brand-amber/10 to-brand-blue/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-brand-amber/10 rounded-2xl flex items-center justify-center">
                <Cookie className="h-8 w-8 text-brand-amber" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Cookie Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              How we use cookies and similar technologies to enhance your healthcare experience
            </p>
            <Badge variant="outline" className="bg-brand-amber/10 text-brand-amber border-brand-amber/30">
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
            <Card className="mb-8 border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">What Are Cookies?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files that are stored on your device when you visit HHWH Online Clinic. They help us provide you with a better, more personalized healthcare experience by remembering your preferences and improving the functionality of our platform.
                </p>
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-1">Your Privacy Matters</p>
                      <p className="text-sm text-muted-foreground">
                        We use cookies responsibly and in compliance with South African privacy laws (POPIA). You have full control over cookie preferences and can manage them at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Types of Cookies */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Types of Cookies We Use</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Essential Cookies */}
                  <Card className="border-brand-green/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-brand-green" />
                        <CardTitle className="text-lg">Essential Cookies</CardTitle>
                      </div>
                      <Badge variant="outline" className="w-fit bg-brand-green/10 text-brand-green border-brand-green/30">
                        Always Active
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        These cookies are necessary for the basic functionality of our healthcare platform and cannot be disabled.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>User authentication and session management</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Security and fraud prevention</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>Load balancing and performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-brand-green mt-0.5 flex-shrink-0" />
                          <span>GDPR/POPIA consent management</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Functional Cookies */}
                  <Card className="border-brand-blue/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-brand-blue" />
                        <CardTitle className="text-lg">Functional Cookies</CardTitle>
                      </div>
                      <Badge variant="outline" className="w-fit bg-brand-blue/10 text-brand-blue border-brand-blue/30">
                        Optional
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        These cookies enhance your user experience by remembering your preferences and settings.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Monitor className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Language and region preferences</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Accessibility settings and display preferences</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Smartphone className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Device and browser optimization</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Database className="h-4 w-4 text-brand-blue mt-0.5 flex-shrink-0" />
                          <span>Form data and progress saving</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Analytics Cookies */}
                  <Card className="border-brand-purple/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-brand-purple" />
                        <CardTitle className="text-lg">Analytics Cookies</CardTitle>
                      </div>
                      <Badge variant="outline" className="w-fit bg-brand-purple/10 text-brand-purple border-brand-purple/30">
                        Optional
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        These cookies help us understand how our platform is used so we can improve our healthcare services.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>Website usage and performance metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>Popular pages and feature usage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>Error tracking and bug identification</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <RefreshCw className="h-4 w-4 text-brand-purple mt-0.5 flex-shrink-0" />
                          <span>User journey and conversion analysis</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Marketing Cookies */}
                  <Card className="border-brand-pink/20 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-brand-pink" />
                        <CardTitle className="text-lg">Marketing Cookies</CardTitle>
                      </div>
                      <Badge variant="outline" className="w-fit bg-brand-pink/10 text-brand-pink border-brand-pink/30">
                        Optional
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        These cookies help us show you relevant health information and educational content.
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Eye className="h-4 w-4 text-brand-pink mt-0.5 flex-shrink-0" />
                          <span>Personalized health content recommendations</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Globe className="h-4 w-4 text-brand-pink mt-0.5 flex-shrink-0" />
                          <span>Educational material targeting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <BarChart3 className="h-4 w-4 text-brand-pink mt-0.5 flex-shrink-0" />
                          <span>Campaign effectiveness measurement</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Database className="h-4 w-4 text-brand-pink mt-0.5 flex-shrink-0" />
                          <span>Cross-platform experience optimization</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            {/* Third Party Cookies */}
            <Card className="mb-8 border-brand-blue/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-brand-blue" />
                  <CardTitle className="text-2xl">Third-Party Services</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  We use trusted third-party services to enhance our healthcare platform. These services may set their own cookies when you interact with their features.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-blue">Healthcare Integration</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Video Consultation Platform</p>
                          <p className="text-xs text-muted-foreground">Secure video calls with healthcare providers</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Database className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Payment Processing</p>
                          <p className="text-xs text-muted-foreground">Secure payment gateway and medical aid billing</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Communication Services</p>
                          <p className="text-xs text-muted-foreground">Email notifications and SMS alerts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green">Analytics & Support</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <BarChart3 className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Website Analytics</p>
                          <p className="text-xs text-muted-foreground">Usage statistics and performance monitoring</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Zap className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Error Tracking</p>
                          <p className="text-xs text-muted-foreground">Bug reporting and system monitoring</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Customer Support</p>
                          <p className="text-xs text-muted-foreground">Live chat and support ticket system</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-blue mb-1">Third-Party Privacy</p>
                      <p className="text-sm text-muted-foreground">
                        These services have their own privacy policies and cookie practices. We ensure all third-party providers 
                        meet our security and privacy standards before integration.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookie Management */}
            <Card className="mb-8 border-brand-green/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-green" />
                  <CardTitle className="text-2xl">Managing Your Cookie Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-green">Platform Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <ToggleRight className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Cookie Consent Manager</p>
                          <p className="text-xs text-muted-foreground">Manage preferences through our consent banner</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Settings className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Account Settings</p>
                          <p className="text-xs text-muted-foreground">Update preferences in your patient portal</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RefreshCw className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Preference Updates</p>
                          <p className="text-xs text-muted-foreground">Change settings at any time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-brand-blue">Browser Controls</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Monitor className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Browser Settings</p>
                          <p className="text-xs text-muted-foreground">Configure cookie preferences in your browser</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Trash2 className="h-5 w-5 text-brand-red mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Clear Cookies</p>
                          <p className="text-xs text-muted-foreground">Delete existing cookies from your device</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">Private Browsing</p>
                          <p className="text-xs text-muted-foreground">Use incognito/private mode for limited tracking</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-2">Impact of Disabling Cookies</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        Disabling certain cookies may affect your experience on our healthcare platform:
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• You may need to log in more frequently</li>
                        <li>• Some features may not work as expected</li>
                        <li>• Your preferences may not be saved</li>
                        <li>• The platform may not remember your settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card className="mb-8 border-brand-purple/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-purple" />
                  <CardTitle className="text-2xl">Cookie Retention & Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-brand-green" />
                    </div>
                    <h3 className="font-semibold text-brand-green mb-2">Session Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Deleted when you close your browser or end your session
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Database className="h-8 w-8 text-brand-blue" />
                    </div>
                    <h3 className="font-semibold text-brand-blue mb-2">Persistent Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Stored for specific periods, typically 30 days to 2 years
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-8 w-8 text-brand-purple" />
                    </div>
                    <h3 className="font-semibold text-brand-purple mb-2">Preference Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      Maintained until you change settings or delete them
                    </p>
                  </div>
                </div>
                
                <div className="bg-brand-purple/5 border border-brand-purple/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-brand-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-purple mb-1">Automatic Cleanup</p>
                      <p className="text-sm text-muted-foreground">
                        We automatically remove expired cookies and regularly review retention periods to ensure 
                        we only keep cookies as long as necessary for their intended purpose.
                      </p>
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
                  <CardTitle className="text-2xl">Questions About Cookies?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about our cookie policy or need help managing your preferences, please contact us:
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-brand-blue mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Privacy Team</p>
                        <p className="text-sm text-muted-foreground">privacy@hhwh.co.za</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">Support Line</p>
                        <p className="text-sm text-muted-foreground">+27 (0)11 685 5021</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
                    <h4 className="font-semibold text-brand-blue mb-2">Quick Response</h4>
                    <p className="text-sm text-muted-foreground">
                      We typically respond to cookie-related inquiries within 48 hours during business days.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card className="border-brand-amber/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-brand-amber" />
                  <CardTitle className="text-2xl">Policy Updates</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time to reflect changes in our technology, 
                  legal requirements, or service improvements. We will notify you of significant changes through our platform.
                </p>
                
                <div className="bg-brand-amber/5 border border-brand-amber/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-brand-amber mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-brand-amber mb-1">Current Version</p>
                      <p className="text-sm text-muted-foreground">
                        This Cookie Policy was last updated on January 29, 2025. Check back regularly for updates 
                        or subscribe to our notifications for important changes.
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