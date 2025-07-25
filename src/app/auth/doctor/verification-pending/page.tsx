'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  Clock, 
  Mail, 
  FileText, 
  Shield,
  Stethoscope,
  ArrowRight
} from 'lucide-react'

export default function VerificationPendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink via-white to-brand-blue-light flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600">Your doctor registration is under review</p>
        </div>

        {/* Status Card */}
        <Card className="shadow-xl border-0 mb-6">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-luminous-vivid-amber" />
              <span>Verification in Progress</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Timeline */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-vivid-green-cyan rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Application Received</h3>
                  <p className="text-sm text-gray-600">Your registration details have been successfully submitted</p>
                  <p className="text-xs text-gray-500 mt-1">Just now</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-brand-amber rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Document Review</h3>
                  <p className="text-sm text-gray-600">Our medical team is reviewing your credentials</p>
                  <p className="text-xs text-gray-500 mt-1">In progress</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-500">HPCSA Verification</h3>
                  <p className="text-sm text-gray-500">Verification with Health Professions Council</p>
                  <p className="text-xs text-gray-400 mt-1">Pending</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-500">Account Activation</h3>
                  <p className="text-sm text-gray-500">Your doctor portal will be activated</p>
                  <p className="text-xs text-gray-400 mt-1">Pending</p>
                </div>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-brand-blue-light/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-brand-blue flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What to expect</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You'll receive email updates on your application status</li>
                    <li>• Verification typically takes 2-3 business days</li>
                    <li>• We may contact you if additional documentation is needed</li>
                    <li>• Once approved, you'll get login credentials for the doctor portal</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Application Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Application ID:</span>
                  <p className="font-medium">#DOC-{Date.now().toString().slice(-6)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Specialization:</span>
                  <p className="font-medium">Gynaecologist</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-amber/20 text-brand-amber">
                    Under Review
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/auth/doctor/login">
              Check Application Status
            </Link>
          </Button>
          
          <Button className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white" asChild>
            <Link href="/">
              <span>Return to Homepage</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Questions about your application?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <a 
              href="mailto:doctors@hhwh.co.za" 
              className="text-brand-blue hover:text-brand-blue/80"
            >
              doctors@hhwh.co.za
            </a>
            <span className="text-gray-400">|</span>
            <a 
              href="tel:+27115551234" 
              className="text-brand-blue hover:text-brand-blue/80"
            >
              +27 11 555 1234
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}