'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getPatientStatus, getProfileCompletionSteps } from '@/lib/supabase/patient-status';

interface ProfileCompletionBannerProps {
  patient: any;
  appointments?: any[];
  assessments?: any[];
  className?: string;
}

export default function ProfileCompletionBanner({ 
  patient, 
  appointments = [], 
  assessments = [],
  className = ""
}: ProfileCompletionBannerProps) {
  console.log('ProfileCompletionBanner props:', { patient, appointments, assessments });
  
  // Since we have assessments data available, we can determine status directly
  const determinePatientStatus = () => {
    if (!patient) return 'not_registered'
    
    const hasEssentialInfo = patient.full_name && 
                            patient.email && 
                            patient.phone && 
                            patient.date_of_birth

    if (!hasEssentialInfo) return 'profile_incomplete'
    
    // Use the assessments prop to determine if patient has completed assessment
    return assessments.length > 0 ? 'active' : 'assessment_needed'
  }
  
  const status = determinePatientStatus();
  const steps = getProfileCompletionSteps(patient);
  
  console.log('Banner status and steps:', { status, steps });
  
  // Update step completion based on actual data
  const updatedSteps = steps.map(step => {
    if (step.id === 'assessment') {
      return { ...step, completed: assessments.length > 0 };
    }
    if (step.id === 'booking') {
      return { ...step, completed: appointments.length > 0 };
    }
    return step;
  });

  const completedSteps = updatedSteps.filter(step => step.completed).length;
  const totalSteps = updatedSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const nextStep = updatedSteps.find(step => !step.completed && step.required);
  
  console.log('Banner calculations:', { 
    updatedSteps, 
    completedSteps, 
    totalSteps, 
    progressPercentage, 
    nextStep,
    shouldHide: status === 'active' && completedSteps === totalSteps
  });
  
  // Don't show banner if profile is completely done
  if (status === 'active' && completedSteps === totalSteps) {
    console.log('Banner hidden - profile complete');
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'not_registered':
        return {
          title: 'Welcome to HHWH Online Clinic',
          message: 'Complete your registration to access all features',
          color: 'bg-luminous-vivid-orange/10 border-luminous-vivid-orange/20',
          icon: <AlertCircle className="h-5 w-5 text-luminous-vivid-orange" />
        };
      case 'profile_incomplete':
        return {
          title: 'Complete Your Profile',
          message: 'Fill in your essential information to get started',
          color: 'bg-luminous-vivid-amber/10 border-luminous-vivid-amber/20',
          icon: <AlertCircle className="h-5 w-5 text-luminous-vivid-amber" />
        };
      case 'assessment_needed':
        return {
          title: 'Take Your Health Assessment',
          message: 'Complete your hormone health assessment for personalized care',
          color: 'bg-vivid-purple/10 border-vivid-purple/20',
          icon: <AlertCircle className="h-5 w-5 text-vivid-purple" />
        };
      default:
        return {
          title: 'Getting Started',
          message: 'Complete these steps to get the most from your care',
          color: 'bg-vivid-cyan-blue/10 border-vivid-cyan-blue/20',
          icon: <AlertCircle className="h-5 w-5 text-vivid-cyan-blue" />
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Card className={`${statusConfig.color} ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white/50 p-2 rounded-full">
            {statusConfig.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-cardo font-bold text-lg text-gray-900">
                {statusConfig.title}
              </h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                {completedSteps}/{totalSteps} Complete
              </Badge>
            </div>
            
            <p className="text-gray-700 mb-4">
              {statusConfig.message}
            </p>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>

            {/* Steps List */}
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              {updatedSteps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 p-3 rounded-lg border ${
                    step.completed 
                      ? 'bg-light-green-cyan/20 border-light-green-cyan/30' 
                      : 'bg-white/30 border-gray-200'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-vivid-green-cyan" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${
                    step.completed ? 'text-gray-700 font-medium' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                  {step.required && !step.completed && (
                    <Badge variant="outline" className="text-xs ml-auto bg-red-100 text-red-700 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Primary next step */}
              {nextStep && (
                <>
                  {nextStep.id === 'register' && (
                    <Link href="/patient/register">
                      <Button className="bg-luminous-vivid-orange hover:bg-luminous-vivid-orange/90 text-white">
                        Complete Registration
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {nextStep.id === 'profile' && (
                    <Link href="/patient/register">
                      <Button className="bg-luminous-vivid-orange hover:bg-luminous-vivid-orange/90 text-white">
                        Update Profile
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {nextStep.id === 'assessment' && (
                    <Link href="/patient/assessment">
                      <Button className="bg-vivid-purple hover:bg-vivid-purple/90 text-white">
                        Take Assessment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                  {nextStep.id === 'booking' && (
                    <Link href="/patient/book-appointment">
                      <Button className="bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90 text-white">
                        Book Consultation
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {/* Secondary actions for available options */}
              {patient && (
                <>
                  {/* Assessment button if not completed */}
                  {assessments.length === 0 && nextStep?.id !== 'assessment' && (
                    <Link href="/patient/assessment">
                      <Button variant="outline" className="border-vivid-purple text-vivid-purple hover:bg-vivid-purple hover:text-white">
                        Take Health Assessment
                      </Button>
                    </Link>
                  )}
                  
                  {/* Booking button if assessment is complete but no appointments */}
                  {assessments.length > 0 && appointments.length === 0 && nextStep?.id !== 'booking' && (
                    <Link href="/patient/book-appointment">
                      <Button variant="outline" className="border-vivid-cyan-blue text-vivid-cyan-blue hover:bg-vivid-cyan-blue hover:text-white">
                        Book First Consultation
                      </Button>
                    </Link>
                  )}
                  
                  {/* Update profile button (always available) */}
                  {nextStep?.id !== 'profile' && nextStep?.id !== 'register' && (
                    <Link href="/patient/register">
                      <Button variant="outline" className="border-luminous-vivid-orange text-luminous-vivid-orange hover:bg-luminous-vivid-orange hover:text-white">
                        Update Profile
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}