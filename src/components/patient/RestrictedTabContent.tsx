'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, FileText, Calendar, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RestrictedTabContentProps {
  type: 'profile' | 'appointments' | 'health';
  reason: 'no_registration' | 'no_assessment' | 'no_appointments';
  patientName?: string;
}

export default function RestrictedTabContent({ type, reason, patientName }: RestrictedTabContentProps) {
  const getConfig = () => {
    if (type === 'profile' && reason === 'no_registration') {
      return {
        icon: <Lock className="h-12 w-12 text-luminous-vivid-orange" />,
        title: 'Complete Registration Required',
        message: 'Please complete your patient registration to view and manage your profile information.',
        actionText: 'Complete Registration',
        actionLink: '/patient/register',
        buttonClass: 'bg-luminous-vivid-orange hover:bg-luminous-vivid-orange/90'
      };
    }

    if (type === 'appointments' && reason === 'no_registration') {
      return {
        icon: <Calendar className="h-12 w-12 text-vivid-cyan-blue" />,
        title: 'Registration Required for Appointments',
        message: 'Complete your patient profile to view appointments and book consultations with our specialists.',
        actionText: 'Complete Registration',
        actionLink: '/patient/register',
        buttonClass: 'bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90'
      };
    }

    if (type === 'health' && reason === 'no_registration') {
      return {
        icon: <FileText className="h-12 w-12 text-vivid-purple" />,
        title: 'Registration Required for Health Records',
        message: 'Complete your registration to access health assessments and medical records.',
        actionText: 'Complete Registration', 
        actionLink: '/patient/register',
        buttonClass: 'bg-vivid-purple hover:bg-vivid-purple/90'
      };
    }

    if (type === 'health' && reason === 'no_assessment') {
      return {
        icon: <Activity className="h-12 w-12 text-vivid-purple" />,
        title: 'Take Your First Health Assessment',
        message: `${patientName ? `Hi ${patientName}! ` : ''}Complete your comprehensive hormone health assessment to build your health profile and receive personalized recommendations.`,
        actionText: 'Start Health Assessment',
        actionLink: '/patient/assessment',
        buttonClass: 'bg-vivid-purple hover:bg-vivid-purple/90'
      };
    }

    if (type === 'appointments' && reason === 'no_appointments') {
      return {
        icon: <Calendar className="h-12 w-12 text-vivid-cyan-blue" />,
        title: 'No Appointments Yet',
        message: `${patientName ? `Hi ${patientName}! ` : ''}Book your first consultation with one of our hormone health specialists to get started on your wellness journey.`,
        actionText: 'Book First Consultation',
        actionLink: '/patient/book-appointment',
        buttonClass: 'bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90'
      };
    }

    // Default fallback
    return {
      icon: <Lock className="h-12 w-12 text-cyan-bluish-gray" />,
      title: 'Access Restricted',
      message: 'Please complete the required steps to access this section.',
      actionText: 'Get Started',
      actionLink: '/patient',
      buttonClass: 'bg-cyan-bluish-gray hover:bg-cyan-bluish-gray/90'
    };
  };

  const config = getConfig();

  return (
    <Card className="border-2 border-dashed border-gray-200">
      <CardContent className="py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6 flex justify-center">
            {config.icon}
          </div>
          
          <CardTitle className="font-cardo text-2xl mb-4 text-gray-900">
            {config.title}
          </CardTitle>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {config.message}
          </p>

          <Link href={config.actionLink}>
            <Button className={`${config.buttonClass} text-white px-6 py-3`}>
              {config.actionText}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Need help? <Link href="/contact" className="text-vivid-cyan-blue hover:underline">Contact our support team</Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}