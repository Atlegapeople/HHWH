'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration } from '@/lib/validations/patient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Shield, MapPin, Heart, FileText, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReviewStepProps {
  form: UseFormReturn<PatientRegistration>
}

export function ReviewStep({ form }: ReviewStepProps) {
  const { watch } = form
  const formData = watch()

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-brand-green" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2">Review Your Information</h3>
        <p className="text-sm text-muted-foreground">
          Please review all the information below before submitting your registration.
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          By submitting this registration, you confirm that all information provided is accurate and complete.
          You can update your information anytime from your patient dashboard.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-brand-orange" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{formData.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{formData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{formData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">
                  {formData.date_of_birth ? new Date(formData.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Aid Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand-green" />
              Medical Aid Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {formData.medical_aid_scheme && formData.medical_aid_scheme !== 'none' ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Medical Aid Scheme</p>
                    <p className="font-medium">{formData.medical_aid_scheme}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-fit">Member</Badge>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Number</p>
                    <p className="font-medium">{formData.medical_aid_number}</p>
                  </div>
                </div>
                {formData.medical_aid_dependent_code && (
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-fit">Dependent</Badge>
                    <div>
                      <p className="text-sm text-muted-foreground">Dependent Code</p>
                      <p className="font-medium">{formData.medical_aid_dependent_code}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-brand-orange/5 rounded-lg">
                <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange">Private Pay</Badge>
                <p className="text-sm text-muted-foreground">
                  You have chosen to pay privately for consultations
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-brand-blue" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">
                  {formData.address?.street}<br />
                  {formData.address?.city}, {formData.address?.province}<br />
                  {formData.address?.postal_code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-brand-red" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{formData.emergency_contact?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-fit">{formData.emergency_contact?.relationship}</Badge>
              <div>
                <p className="text-sm text-muted-foreground">Relationship</p>
                <p className="font-medium">{formData.emergency_contact?.relationship}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{formData.emergency_contact?.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card className="border-brand-purple/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-purple" />
              Terms & Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>By submitting this registration, you acknowledge and agree to:</p>
            <ul className="space-y-1 ml-4">
              <li>• Our <strong>Privacy Policy</strong> and how we handle your medical information</li>
              <li>• Our <strong>Terms of Service</strong> for using the HHWH Online Clinic platform</li>
              <li>• Our <strong>Medical Disclaimer</strong> regarding virtual consultations</li>
              <li>• That all information provided is accurate and complete</li>
              <li>• To notify us of any changes to your information promptly</li>
            </ul>
            <p className="text-xs mt-4 p-3 bg-brand-blue/5 rounded border border-brand-blue/20">
              <strong>POPIA Compliance:</strong> Your personal information is collected and processed 
              in accordance with the Protection of Personal Information Act (POPIA). 
              You have the right to access, correct, or delete your personal information at any time.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Steps */}
      <div className="bg-brand-green/5 p-4 rounded-lg border border-brand-green/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-green/10 p-2 rounded-full">
            <CheckCircle className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <h4 className="font-medium text-brand-green mb-1">What Happens Next?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your registration will be reviewed within 24 hours</li>
              <li>• You'll receive a confirmation email with your account details</li>
              <li>• Document verification will be completed by our admin team</li>
              <li>• You can immediately book consultations (payment required if docs pending)</li>
              <li>• Welcome package with platform guide will be sent via email</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}