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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Modern Results Header */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="bg-gradient-to-r from-brand-green to-brand-blue p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
              Screening Complete!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your personalized hormone health assessment reveals important insights about your wellness journey
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Modern Hormone Stage Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-green/10 to-brand-blue/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-gradient-to-r from-brand-green to-brand-blue p-2 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                Hormone Health Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-xl font-bold mb-3 shadow-lg ${
                  results.hormoneStage === 'premenopause' ? 'bg-gradient-to-r from-brand-green/20 to-brand-green/10 text-brand-green border-2 border-brand-green/20' :
                  results.hormoneStage === 'perimenopause' ? 'bg-gradient-to-r from-brand-amber/20 to-brand-amber/10 text-brand-amber border-2 border-brand-amber/20' :
                  'bg-gradient-to-r from-brand-purple/20 to-brand-purple/10 text-brand-purple border-2 border-brand-purple/20'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${
                    results.hormoneStage === 'premenopause' ? 'bg-brand-green' :
                    results.hormoneStage === 'perimenopause' ? 'bg-brand-amber' :
                    'bg-brand-purple'
                  }`} />
                  {results.hormoneStage === 'premenopause' ? 'Premenopause' :
                   results.hormoneStage === 'perimenopause' ? 'Perimenopause' : 
                   'Postmenopause'}
                </div>
                <div className="bg-gray-100 rounded-xl p-4">
                  <div className="text-2xl font-bold text-foreground">{results.totalScore}</div>
                  <div className="text-sm text-muted-foreground">Total Score out of 24</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modern Recommended Action Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-brand-blue/10 to-brand-purple/10 rounded-full -translate-y-16 -translate-x-16" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-2 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
                Recommended Next Step
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-6">
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-lg font-bold shadow-lg ${
                  results.urgency === 'urgent' ? 'bg-gradient-to-r from-red-500/20 to-red-400/10 text-red-600 border-2 border-red-200' :
                  results.urgency === 'priority' ? 'bg-gradient-to-r from-brand-amber/20 to-brand-amber/10 text-brand-amber border-2 border-brand-amber/20' :
                  'bg-gradient-to-r from-brand-green/20 to-brand-green/10 text-brand-green border-2 border-brand-green/20'
                }`}>
                  <Info className="h-5 w-5" />
                  {results.urgency === 'urgent' ? 'Urgent Consultation' :
                   results.urgency === 'priority' ? 'Priority Assessment' : 
                   'Routine Monitoring'}
                </div>
                
                <div className="bg-gray-100 rounded-xl p-4 text-center">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {results.recommendedAction === 'immediate_consultation' && 
                      'We recommend booking a consultation as soon as possible to address your symptoms and develop a personalized treatment plan.'}
                    {results.recommendedAction === 'comprehensive_assessment' && 
                      'Your symptoms suggest you would benefit from our comprehensive assessment for detailed analysis and personalized recommendations.'}
                    {results.recommendedAction === 'routine_monitoring' && 
                      'Continue monitoring your symptoms with regular check-ups. Consider lifestyle modifications and routine health maintenance.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Score Breakdown */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl justify-center">
              <div className="bg-gradient-to-r from-brand-blue to-brand-purple p-2 rounded-xl">
                <Activity className="h-6 w-6 text-white" />
              </div>
              Symptom Category Analysis
            </CardTitle>
            <CardDescription className="text-center max-w-2xl mx-auto">
              Your symptoms broken down by category to help identify areas of focus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="bg-gradient-to-br from-red-500/10 to-red-400/5 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Thermometer className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-3xl font-bold text-red-500 mb-1">{results.scores.vasomotor}</div>
                <div className="text-sm font-medium text-muted-foreground">Vasomotor</div>
                <div className="text-xs text-muted-foreground">Hot flashes & sweats</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Brain className="h-8 w-8 text-brand-blue" />
                </div>
                <div className="text-3xl font-bold text-brand-blue mb-1">{results.scores.psychological}</div>
                <div className="text-sm font-medium text-muted-foreground">Psychological</div>
                <div className="text-xs text-muted-foreground">Mood & sleep</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Activity className="h-8 w-8 text-brand-green" />
                </div>
                <div className="text-3xl font-bold text-brand-green mb-1">{results.scores.physical}</div>
                <div className="text-sm font-medium text-muted-foreground">Physical</div>
                <div className="text-xs text-muted-foreground">Energy & body</div>
              </div>
              <div className="text-center group hover:scale-105 transition-transform duration-200">
                <div className="bg-gradient-to-br from-brand-pink/10 to-brand-pink/5 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:shadow-lg transition-shadow">
                  <Heart className="h-8 w-8 text-brand-pink" />
                </div>
                <div className="text-3xl font-bold text-brand-pink mb-1">{results.scores.sexual}</div>
                <div className="text-sm font-medium text-muted-foreground">Sexual Health</div>
                <div className="text-xs text-muted-foreground">Intimacy & comfort</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modern Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          {results.urgency === 'urgent' && (
            <Link href="/patient/packages" className="group">
              <Button className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green/90 hover:to-brand-blue/90 text-white border-0 px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-xl group-hover:shadow-green-200">
                <Package className="h-5 w-5 mr-3" />
                View Care Packages
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
          <Link href="/patient/assessment" className="group">
            <Button variant="outline" className="border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg">
              <Activity className="h-5 w-5 mr-3" />
              Take Full Assessment
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {patientEmail && (
            <Link href="/patient/book-appointment" className="group">
              <Button variant="outline" className="border-2 border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <Calendar className="h-5 w-5 mr-3" />
                Book Consultation
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
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
          className="bg-gradient-to-r from-brand-green to-brand-blue hover:from-brand-green/90 hover:to-brand-blue/90 text-white border-0 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          {currentStep === screeningQuestions.length - 1 ? 'Complete Screening' : 'Next Question'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}