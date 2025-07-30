'use client'

import React, { useState } from 'react'
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
  CheckCircle,
  Target,
  Package,
  Info
} from 'lucide-react'
import Link from 'next/link'

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

export default function QuickScreening({ onComplete, patientEmail }: QuickScreeningProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [results, setResults] = useState<any>(null)

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-brand-green/10 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-brand-green" />
              </div>
            </div>
            <CardTitle className="text-2xl">Quick Screening Complete</CardTitle>
            <CardDescription>
              Here's your personalized hormone health overview
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hormone Stage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-brand-purple" />
                Hormone Health Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold mb-3 ${
                  results.hormoneStage === 'premenopause' ? 'bg-brand-green/10 text-brand-green' :
                  results.hormoneStage === 'perimenopause' ? 'bg-brand-amber/10 text-brand-amber' :
                  'bg-brand-purple/10 text-brand-purple'
                }`}>
                  {results.hormoneStage === 'premenopause' ? 'Premenopause' :
                   results.hormoneStage === 'perimenopause' ? 'Perimenopause' : 
                   'Postmenopause'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Score: {results.totalScore}/24
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Action */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-blue" />
                Recommended Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                    results.urgency === 'urgent' ? 'bg-brand-red/10 text-brand-red' :
                    results.urgency === 'priority' ? 'bg-brand-amber/10 text-brand-amber' :
                    'bg-brand-green/10 text-brand-green'
                  }`}>
                    <Info className="h-4 w-4" />
                    {results.urgency === 'urgent' ? 'Urgent Consultation' :
                     results.urgency === 'priority' ? 'Priority Assessment' : 
                     'Routine Monitoring'}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center">
                  {results.recommendedAction === 'immediate_consultation' && 
                    'We recommend booking a consultation as soon as possible to address your symptoms.'}
                  {results.recommendedAction === 'comprehensive_assessment' && 
                    'Consider taking our full assessment for personalized treatment recommendations.'}
                  {results.recommendedAction === 'routine_monitoring' && 
                    'Continue monitoring your symptoms and consider regular check-ups.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-blue" />
              Symptom Category Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-brand-red/10 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Thermometer className="h-6 w-6 text-brand-red" />
                </div>
                <div className="text-xl font-bold text-brand-red">{results.scores.vasomotor}</div>
                <div className="text-xs text-muted-foreground">Vasomotor</div>
              </div>
              <div className="text-center">
                <div className="bg-brand-blue/10 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-brand-blue" />
                </div>
                <div className="text-xl font-bold text-brand-blue">{results.scores.psychological}</div>
                <div className="text-xs text-muted-foreground">Psychological</div>
              </div>
              <div className="text-center">
                <div className="bg-brand-green/10 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-brand-green" />
                </div>
                <div className="text-xl font-bold text-brand-green">{results.scores.physical}</div>
                <div className="text-xs text-muted-foreground">Physical</div>
              </div>
              <div className="text-center">
                <div className="bg-brand-pink/10 p-3 rounded-full w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-brand-pink" />
                </div>
                <div className="text-xl font-bold text-brand-pink">{results.scores.sexual}</div>
                <div className="text-xs text-muted-foreground">Sexual Health</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {results.urgency === 'urgent' && (
            <Link href="/patient/packages">
              <Button className="btn-healthcare-primary">
                <Package className="h-4 w-4 mr-2" />
                View Care Packages
              </Button>
            </Link>
          )}
          <Link href="/patient/assessment">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Take Full Assessment
            </Button>
          </Link>
          {patientEmail && (
            <Link href="/patient/book-appointment">
              <Button variant="outline">
                Book Consultation
              </Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl">Quick Hormone Health Screening</CardTitle>
              <CardDescription>
                Question {currentStep + 1} of {screeningQuestions.length}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-brand-blue border-brand-blue/30">
              {Math.round(progress)}% Complete
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-brand-blue/10 p-3 rounded-full">
              <currentQuestion.icon className="h-6 w-6 text-brand-blue" />
            </div>
            <div>
              <CardTitle className="text-lg">{currentQuestion.title}</CardTitle>
              <CardDescription>{currentQuestion.question}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name={currentQuestion.id as keyof QuickScreeningData}
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormControl>
                    {currentQuestion.type === 'number' ? (
                      <div className="space-y-2">
                        <FormLabel>Enter your age</FormLabel>
                        <input
                          type="number"
                          min="18"
                          max="100"
                          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                          placeholder="e.g., 45"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </div>
                    ) : (
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {currentQuestion.options?.map((option) => (
                          <div key={option.value} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:border-brand-blue/30 hover:bg-brand-blue/5 transition-all cursor-pointer">
                            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                            <Label className="flex-1 cursor-pointer" htmlFor={option.value}>
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="btn-healthcare-primary"
        >
          {currentStep === screeningQuestions.length - 1 ? 'Complete Screening' : 'Next'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}