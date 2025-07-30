'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { 
  Thermometer, 
  Moon, 
  Brain, 
  Heart, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  Package,
  Info,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { createQuickScreeningAssessment } from '@/lib/supabase/assessments'

// Quick screening schema - essential questions only
const quickScreeningSchema = z.object({
  age: z.number().min(18).max(100),
  menstrual_status: z.enum(['regular', 'irregular', 'stopped_less_than_year', 'stopped_more_than_year']),
  hot_flashes: z.enum(['0', '1', '2', '3']),
  night_sweats: z.enum(['0', '1', '2', '3']),
  sleep_quality: z.enum(['0', '1', '2', '3']),
  mood_changes: z.enum(['0', '1', '2', '3']),
  energy_levels: z.enum(['0', '1', '2', '3']),
  sexual_health: z.enum(['0', '1', '2', '3'])
})

type QuickScreeningData = z.infer<typeof quickScreeningSchema>

interface QuickScreeningProps {
  onComplete?: (results: any) => void
  patientEmail?: string
  patientAge?: number
}

// Quick scoring algorithm
function calculateQuickScore(data: QuickScreeningData) {
  const age = data.age
  const scores = {
    vasomotor: parseInt(data.hot_flashes) + parseInt(data.night_sweats),
    psychological: parseInt(data.sleep_quality) + parseInt(data.mood_changes),
    physical: parseInt(data.energy_levels),
    sexual: parseInt(data.sexual_health)
  }
  
  const totalScore = scores.vasomotor + scores.psychological + scores.physical + scores.sexual
  
  // Determine hormone stage - simplified logic
  let hormoneStage: 'premenopause' | 'perimenopause' | 'postmenopause' = 'premenopause'
  
  if (data.menstrual_status === 'stopped_more_than_year' || age > 55) {
    hormoneStage = 'postmenopause'
  } else if (data.menstrual_status === 'irregular' || data.menstrual_status === 'stopped_less_than_year' || 
             (age >= 40 && scores.vasomotor >= 2)) {
    hormoneStage = 'perimenopause'
  }
  
  // Determine severity
  let severityLevel: 'mild' | 'moderate' | 'severe' = 'mild'
  if (totalScore >= 8) {
    severityLevel = 'severe'
  } else if (totalScore >= 4) {
    severityLevel = 'moderate'
  }
  
  // Determine urgency
  let urgency: 'routine' | 'priority' | 'urgent' = 'routine'
  if (severityLevel === 'severe' || (hormoneStage !== 'premenopause' && totalScore >= 6)) {
    urgency = 'urgent'
  } else if (severityLevel === 'moderate' || (hormoneStage === 'perimenopause' && totalScore >= 3)) {
    urgency = 'priority'
  }
  
  return {
    totalScore,
    scores,
    hormoneStage,
    severityLevel,
    urgency,
    recommendedAction: urgency === 'urgent' ? 'immediate_consultation' :
                      urgency === 'priority' ? 'comprehensive_assessment' : 'routine_monitoring'
  }
}

const screeningQuestions = [
  {
    id: 'age',
    title: 'Age',
    type: 'number' as const,
    question: 'What is your current age?',
    icon: Activity
  },
  {
    id: 'menstrual_status',
    title: 'Menstrual Status',
    type: 'radio' as const,
    question: 'How would you describe your menstrual periods?',
    icon: Heart,
    options: [
      { value: 'regular', label: 'Regular (every 21-35 days)' },
      { value: 'irregular', label: 'Irregular or unpredictable' },
      { value: 'stopped_less_than_year', label: 'Stopped less than 12 months ago' },
      { value: 'stopped_more_than_year', label: 'Stopped more than 12 months ago' }
    ]
  },
  {
    id: 'hot_flashes',
    title: 'Hot Flashes',
    type: 'radio' as const,
    question: 'How bothersome are hot flashes?',
    icon: Thermometer,
    options: [
      { value: '0', label: 'None or minimal' },
      { value: '1', label: 'Mild - noticeable but not disruptive' },
      { value: '2', label: 'Moderate - somewhat disruptive to daily life' },
      { value: '3', label: 'Severe - significantly impacts daily activities' }
    ]
  },
  {
    id: 'night_sweats',
    title: 'Night Sweats',
    type: 'radio' as const,
    question: 'How disruptive are night sweats to your sleep?',
    icon: Moon,
    options: [
      { value: '0', label: 'None or minimal' },
      { value: '1', label: 'Mild - occasionally wake up' },
      { value: '2', label: 'Moderate - frequently wake up' },
      { value: '3', label: 'Severe - consistently disrupt sleep' }
    ]
  },
  {
    id: 'sleep_quality',
    title: 'Sleep Quality',
    type: 'radio' as const,
    question: 'How would you rate your overall sleep quality?',
    icon: Moon,
    options: [
      { value: '0', label: 'Excellent - restful and refreshing' },
      { value: '1', label: 'Good - mostly restful' },
      { value: '2', label: 'Fair - somewhat restless' },
      { value: '3', label: 'Poor - frequently restless or unrefreshing' }
    ]
  },
  {
    id: 'mood_changes',
    title: 'Mood Changes',
    type: 'radio' as const,
    question: 'How much do mood swings or irritability affect you?',
    icon: Brain,
    options: [
      { value: '0', label: 'Not at all' },
      { value: '1', label: 'Mild - occasional mood changes' },
      { value: '2', label: 'Moderate - noticeable mood swings' },
      { value: '3', label: 'Severe - significant mood instability' }
    ]
  },
  {
    id: 'energy_levels',
    title: 'Energy Levels',
    type: 'radio' as const,
    question: 'How are your energy levels throughout the day?',
    icon: Activity,
    options: [
      { value: '0', label: 'High - consistently energetic' },
      { value: '1', label: 'Good - mostly energetic' },
      { value: '2', label: 'Fair - often tired' },
      { value: '3', label: 'Low - frequently exhausted' }
    ]
  },
  {
    id: 'sexual_health',
    title: 'Sexual Health',
    type: 'radio' as const,
    question: 'How have changes in sexual desire or comfort affected you?',
    icon: Heart,
    options: [
      { value: '0', label: 'No changes or concerns' },
      { value: '1', label: 'Mild changes - not concerning' },
      { value: '2', label: 'Moderate changes - somewhat concerning' },
      { value: '3', label: 'Significant changes - very concerning' }
    ]
  }
]

export default function QuickScreening({ onComplete, patientEmail, patientAge }: QuickScreeningProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<QuickScreeningData>({
    resolver: zodResolver(quickScreeningSchema),
    defaultValues: {
      age: undefined as any,
      menstrual_status: undefined as any,
      hot_flashes: undefined as any,
      night_sweats: undefined as any,
      sleep_quality: undefined as any,
      mood_changes: undefined as any,
      energy_levels: undefined as any,
      sexual_health: undefined as any
    }
  })

  const currentQuestion = screeningQuestions[currentStep]
  const progress = ((currentStep + 1) / screeningQuestions.length) * 100

  // Don't prepopulate form fields - let users enter their own data

  const handleNext = async () => {
    const fieldName = currentQuestion.id as keyof QuickScreeningData
    const isValid = await form.trigger(fieldName)
    
    if (!isValid) return

    if (currentStep < screeningQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete the screening
      const formData = form.getValues()
      const screeningResults = calculateQuickScore(formData)
      setResults(screeningResults)
      setIsCompleted(true)
      
      // Save to database if patient email is available
      if (patientEmail) {
        setIsSaving(true)
        try {
          await createQuickScreeningAssessment(formData, screeningResults, patientEmail)
          console.log('Quick screening assessment saved successfully')
        } catch (error) {
          console.error('Failed to save quick screening assessment:', error)
          // Continue showing results even if save fails
        } finally {
          setIsSaving(false)
        }
      }
      
      onComplete?.(screeningResults)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/10 via-white to-brand-blue-light/15">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          {/* Stunning Results Header */}
          <div className="text-center space-y-8 py-12">
            <div className="relative inline-flex">
              <div className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple p-6 rounded-3xl shadow-2xl">
                <CheckCircle className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-3 shadow-lg animate-bounce">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-green/20 to-brand-blue/20 rounded-3xl blur-xl scale-110 -z-10" />
            </div>
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-green/10 to-brand-blue/10 rounded-full px-6 py-2 border border-brand-green/20">
                <Target className="h-4 w-4 text-brand-green" />
                <span className="text-sm font-medium text-brand-green">Health Assessment Complete</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-heading font-bold">
                <span className="bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple bg-clip-text text-transparent">
                  Your Health
                </span>
                <br />
                <span className="text-foreground">Insights</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Based on your responses, we've analyzed your hormone health stage and created personalized recommendations for your wellness journey.
              </p>
            </div>
          </div>

          {/* Hero Stats Section */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Hormone Stage Card */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
                results.hormoneStage === 'premenopause' ? 'from-brand-green to-brand-green' :
                results.hormoneStage === 'perimenopause' ? 'from-brand-amber to-brand-amber' :
                'from-brand-purple to-brand-purple'
              }`} />
              <div className="absolute top-4 right-4 opacity-10">
                <Target className="h-16 w-16" />
              </div>
              <CardContent className="relative p-8 text-center space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  results.hormoneStage === 'premenopause' ? 'bg-brand-green/10 text-brand-green' :
                  results.hormoneStage === 'perimenopause' ? 'bg-brand-amber/10 text-brand-amber' :
                  'bg-brand-purple/10 text-brand-purple'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    results.hormoneStage === 'premenopause' ? 'bg-brand-green' :
                    results.hormoneStage === 'perimenopause' ? 'bg-brand-amber' :
                    'bg-brand-purple'
                  }`} />
                  Health Stage
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold ${
                    results.hormoneStage === 'premenopause' ? 'text-brand-green' :
                    results.hormoneStage === 'perimenopause' ? 'text-brand-amber' :
                    'text-brand-purple'
                  }`}>
                    {results.hormoneStage === 'premenopause' ? 'Premenopause' :
                     results.hormoneStage === 'perimenopause' ? 'Perimenopause' : 
                     'Postmenopause'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {results.hormoneStage === 'premenopause' ? 'Regular reproductive phase' :
                     results.hormoneStage === 'perimenopause' ? 'Transitional phase' : 
                     'Post-reproductive phase'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Total Score Card */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-blue/10" />
              <div className="absolute top-4 right-4 opacity-10">
                <Activity className="h-16 w-16" />
              </div>
              <CardContent className="relative p-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-blue/10 text-brand-blue">
                  <div className="w-2 h-2 rounded-full bg-brand-blue" />
                  Assessment Score
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl font-bold text-brand-blue">
                    {results.totalScore}
                    <span className="text-xl text-muted-foreground">/24</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Symptom severity index
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Urgency Level Card */}
            <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative group hover:scale-105 transition-all duration-300">
              <div className={`absolute inset-0 bg-gradient-to-br opacity-5 ${
                results.urgency === 'urgent' ? 'from-red-500 to-red-500' :
                results.urgency === 'priority' ? 'from-brand-amber to-brand-amber' :
                'from-brand-green to-brand-green'
              }`} />
              <div className="absolute top-4 right-4 opacity-10">
                <Info className="h-16 w-16" />
              </div>
              <CardContent className="relative p-8 text-center space-y-4">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                  results.urgency === 'urgent' ? 'bg-red-100 text-red-600' :
                  results.urgency === 'priority' ? 'bg-brand-amber/10 text-brand-amber' :
                  'bg-brand-green/10 text-brand-green'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    results.urgency === 'urgent' ? 'bg-red-500' :
                    results.urgency === 'priority' ? 'bg-brand-amber' :
                    'bg-brand-green'
                  }`} />
                  Care Priority
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-bold ${
                    results.urgency === 'urgent' ? 'text-red-600' :
                    results.urgency === 'priority' ? 'text-brand-amber' :
                    'text-brand-green'
                  }`}>
                    {results.urgency === 'urgent' ? 'Urgent' :
                     results.urgency === 'priority' ? 'Priority' : 
                     'Routine'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {results.urgency === 'urgent' ? 'Needs immediate attention' :
                     results.urgency === 'priority' ? 'Requires follow-up' : 
                     'Regular monitoring'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Recommendations */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-brand-blue/5 to-brand-purple/5 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-3 rounded-2xl">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Personalized Recommendations</h2>
                  <p className="text-muted-foreground">Based on your hormone health stage and symptom profile</p>
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Immediate Action */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      results.urgency === 'urgent' ? 'bg-red-100' :
                      results.urgency === 'priority' ? 'bg-brand-amber/10' :
                      'bg-brand-green/10'
                    }`}>
                      <Calendar className={`h-5 w-5 ${
                        results.urgency === 'urgent' ? 'text-red-600' :
                        results.urgency === 'priority' ? 'text-brand-amber' :
                        'text-brand-green'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold">Immediate Action</h3>
                  </div>
                  <div className={`p-4 rounded-xl border-l-4 ${
                    results.urgency === 'urgent' ? 'bg-red-50 border-red-500' :
                    results.urgency === 'priority' ? 'bg-brand-amber/5 border-brand-amber' :
                    'bg-brand-green/5 border-brand-green'
                  }`}>
                    <p className="text-sm leading-relaxed">
                      {results.recommendedAction === 'immediate_consultation' && 
                        'Schedule a consultation with our hormone specialists as soon as possible. Your symptoms indicate you would benefit from professional evaluation and potentially immediate intervention.'}
                      {results.recommendedAction === 'comprehensive_assessment' && 
                        'Consider taking our comprehensive assessment for detailed analysis. Your initial screening suggests areas that warrant deeper evaluation.'}
                      {results.recommendedAction === 'routine_monitoring' && 
                        'Continue monitoring your symptoms and maintain regular wellness check-ups. Focus on lifestyle optimization and preventive care.'}
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-purple/10 p-2 rounded-xl">
                      <ArrowRight className="h-5 w-5 text-brand-purple" />
                    </div>
                    <h3 className="text-lg font-semibold">Next Steps</h3>
                  </div>
                  <div className="space-y-3">
                    {results.urgency === 'urgent' && (
                      <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">Book consultation within 1-2 weeks</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-brand-blue/5 rounded-lg">
                      <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Consider comprehensive assessment for detailed insights</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-brand-green/5 rounded-lg">
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Maintain symptom diary for tracking progress</span>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-brand-purple/5 rounded-lg">
                      <div className="w-2 h-2 bg-brand-purple rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">Explore lifestyle modifications and wellness strategies</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptom Analysis */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-brand-green/5 to-brand-blue/5 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-brand-green to-brand-blue p-3 rounded-2xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Symptom Analysis</h2>
                  <p className="text-muted-foreground">Detailed breakdown of your health indicators by category</p>
                </div>
              </div>
            </div>
            <CardContent className="p-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Vasomotor */}
                <div className="group">
                  <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-2xl p-6 text-center space-y-4 group-hover:shadow-lg transition-all duration-300 border border-red-100">
                    <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Thermometer className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-red-600">{results.scores.vasomotor}</div>
                      <div className="text-sm font-semibold text-red-700">Vasomotor</div>
                      <div className="text-xs text-red-600/70 leading-relaxed">Hot flashes, night sweats, and heat-related symptoms</div>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(results.scores.vasomotor / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Psychological */}
                <div className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 text-center space-y-4 group-hover:shadow-lg transition-all duration-300 border border-blue-100">
                    <div className="bg-gradient-to-br from-brand-blue to-blue-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-brand-blue">{results.scores.psychological}</div>
                      <div className="text-sm font-semibold text-blue-700">Psychological</div>
                      <div className="text-xs text-blue-600/70 leading-relaxed">Mood changes, sleep quality, and emotional wellbeing</div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-blue to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(results.scores.psychological / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Physical */}
                <div className="group">
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 text-center space-y-4 group-hover:shadow-lg transition-all duration-300 border border-green-100">
                    <div className="bg-gradient-to-br from-brand-green to-green-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-brand-green">{results.scores.physical}</div>
                      <div className="text-sm font-semibold text-green-700">Physical</div>
                      <div className="text-xs text-green-600/70 leading-relaxed">Energy levels, fatigue, and physical symptoms</div>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-green to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(results.scores.physical / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sexual Health */}
                <div className="group">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-2xl p-6 text-center space-y-4 group-hover:shadow-lg transition-all duration-300 border border-pink-100">
                    <div className="bg-gradient-to-br from-brand-pink to-pink-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-4xl font-bold text-brand-pink">{results.scores.sexual}</div>
                      <div className="text-sm font-semibold text-pink-700">Sexual Health</div>
                      <div className="text-xs text-pink-600/70 leading-relaxed">Intimacy, comfort, and sexual wellness</div>
                    </div>
                    <div className="w-full bg-pink-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-brand-pink to-pink-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(results.scores.sexual / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Center */}
          <div className="bg-gradient-to-r from-brand-pink/5 via-brand-blue/5 to-brand-purple/5 rounded-3xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Ready for Your Next Step?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Based on your results, here are the recommended actions to continue your hormone health journey
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Primary Action based on urgency */}
              {results.urgency === 'urgent' && (
                <Link href="/patient/packages" className="group">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                        <Package className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-red-700 mb-2">View Care Packages</h3>
                        <p className="text-sm text-red-600/70">Immediate care options for urgent symptoms</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-red-600 mx-auto group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              )}
              
              {/* Comprehensive Assessment */}
              <Link href="/patient/assessment" className="group">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="bg-gradient-to-r from-brand-blue to-blue-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-blue mb-2">Full Assessment</h3>
                      <p className="text-sm text-blue-600/70">Complete 65-question evaluation for detailed insights</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-brand-blue mx-auto group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
              
              {/* Book Consultation */}
              {patientEmail && (
                <Link href="/patient/book-appointment" className="group">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="bg-gradient-to-r from-brand-purple to-purple-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                        <Calendar className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-purple mb-2">Book Consultation</h3>
                        <p className="text-sm text-purple-600/70">Schedule with our hormone specialists</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-brand-purple mx-auto group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              )}
              
              {/* Dashboard */}
              <Link href="/patient/dashboard" className="group">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="bg-gradient-to-r from-brand-green to-green-600 p-4 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-green mb-2">View Dashboard</h3>
                      <p className="text-sm text-green-600/70">Access your health records and progress</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-brand-green mx-auto group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Modern Progress Header */}
      <div className="mb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-brand-green to-brand-blue p-2 rounded-xl">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
              Quick Health Screening
            </h1>
          </div>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Answer {screeningQuestions.length} essential questions to understand your hormone health stage
          </p>
        </div>
        
        {/* Sleek Progress Bar */}
        <div className="relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentStep + 1} of {screeningQuestions.length}
            </span>
            <Badge className="bg-gradient-to-r from-brand-green to-brand-blue text-white border-0">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-brand-green to-brand-blue rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modern Question Card */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-8">
          <div className="text-center space-y-4">
            <div className="bg-gradient-to-br from-brand-green/10 to-brand-blue/10 p-4 rounded-2xl w-20 h-20 mx-auto flex items-center justify-center">
              <currentQuestion.icon className="h-10 w-10 text-brand-green" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl md:text-2xl font-heading text-foreground">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                {currentQuestion.question}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <FormField
              control={form.control}
              name={currentQuestion.id as keyof QuickScreeningData}
              render={({ field }) => (
                <FormItem className="space-y-6">
                  <FormControl>
                    {currentQuestion.type === 'number' ? (
                      <div className="space-y-4">
                        <FormLabel className="text-base font-medium text-center block">Enter your age</FormLabel>
                        <div className="max-w-xs mx-auto">
                          <input
                            type="number"
                            min="18"
                            max="100"
                            className="w-full p-4 text-center text-lg font-medium border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all duration-200 bg-white/50 backdrop-blur-sm"
                            placeholder="45"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </div>
                      </div>
                    ) : (
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-3 max-w-2xl mx-auto"
                      >
                        {currentQuestion.options?.map((option) => (
                          <div key={option.value} className="relative">
                            <Label 
                              className={`flex items-center w-full p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-brand-green/40 hover:bg-brand-green/5 ${
                                field.value === option.value 
                                  ? 'border-brand-green bg-gradient-to-r from-brand-green/10 to-brand-blue/10 shadow-lg scale-[1.02]' 
                                  : 'border-gray-200'
                              }`}
                              htmlFor={option.value}
                              onClick={() => field.onChange(option.value)}
                            >
                              <div className="flex items-center space-x-4 w-full">
                                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  field.value === option.value 
                                    ? 'border-brand-green bg-brand-green' 
                                    : 'border-gray-300'
                                }`}>
                                  <div className={`w-2 h-2 bg-white rounded-full transition-opacity duration-200 ${
                                    field.value === option.value ? 'opacity-100' : 'opacity-0'
                                  }`} />
                                </div>
                                <span className="flex-1 text-sm md:text-base font-medium text-foreground leading-relaxed">
                                  {option.label}
                                </span>
                              </div>
                            </Label>
                            <RadioGroupItem 
                              value={option.value} 
                              id={option.value} 
                              className="sr-only" 
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Modern Navigation */}
      <div className="flex justify-between items-center mt-8">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {screeningQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-brand-green to-brand-blue scale-125' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={isSaving}
          className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green/90 hover:to-brand-blue/90 text-white border-0 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              {currentStep === screeningQuestions.length - 1 ? 'Complete Screening' : 'Next Question'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}