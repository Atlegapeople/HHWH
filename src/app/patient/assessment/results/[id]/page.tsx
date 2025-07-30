'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  FileText, 
  Activity, 
  AlertCircle, 
  Shield, 
  Thermometer,
  Brain,
  Heart,
  Calendar,
  Target,
  Package,
  TrendingUp,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatAssessmentDate, getSeverityBadge, calculateAssessmentScores, recommendPackage } from '@/lib/supabase/assessments'
import { useAuth } from '@/contexts/AuthContext'

export default function AssessmentResultsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [assessment, setAssessment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const assessmentId = params.id as string
  
  console.log('AssessmentResultsPage loaded')
  console.log('Assessment ID:', assessmentId)
  console.log('User:', user)

  useEffect(() => {
    console.log('useEffect triggered for fetchAssessment')
    const fetchAssessment = async () => {
      if (!assessmentId) {
        console.log('No assessment ID provided')
        setError('No assessment ID provided')
        setLoading(false)
        return
      }
      
      console.log('Fetching assessment with ID:', assessmentId)

      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('symptom_assessments')
          .select(`
            *,
            patient:patients(full_name, email)
          `)
          .eq('id', assessmentId)
          .single()

        if (error) {
          console.error('Error fetching assessment:', error)
          setError('Failed to load assessment results')
          return
        }

        if (!data) {
          setError('Assessment not found')
          return
        }

        setAssessment(data)
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAssessment()
  }, [assessmentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto mb-4"></div>
            <p>Loading assessment results...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
        <div className="container mx-auto px-4 py-8">
          <Card className="w-full max-w-md mx-auto text-center">
            <CardContent className="p-6">
              <AlertCircle className="h-12 w-12 text-brand-red mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Assessment Not Found</h3>
              <p className="text-muted-foreground mb-4">{error || 'The requested assessment could not be found.'}</p>
              <Link href="/patient/dashboard">
                <Button className="btn-healthcare-primary">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const scores = assessment.assessment_data ? calculateAssessmentScores(assessment.assessment_data) : null
  const badgeConfig = getSeverityBadge(assessment.severity_level)
  const packageRecommendation = scores ? recommendPackage(scores, true) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/patient/dashboard#health">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Health Records
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold">Assessment Results</h1>
            <p className="text-muted-foreground">Detailed hormone health assessment report</p>
          </div>
        </div>

        {/* Assessment Overview */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-brand-purple/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-brand-purple" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Assessment Report
                    <Badge 
                      variant="outline" 
                      className={`${badgeConfig.className} capitalize`}
                    >
                      {assessment.severity_level.replace('_', ' ')} Impact
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Completed: {formatAssessmentDate(assessment.completed_at)}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-brand-purple">
                  {assessment.total_score}
                </div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Score Breakdown */}
        {scores && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-brand-blue" />
                Symptom Category Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-brand-red/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Thermometer className="h-8 w-8 text-brand-red" />
                  </div>
                  <div className="text-2xl font-bold text-brand-red mb-1">
                    {scores.vasomotorScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Vasomotor Symptoms</div>
                  <div className="text-xs text-muted-foreground mt-1">Hot flashes, night sweats</div>
                </div>
                
                <div className="text-center">
                  <div className="bg-brand-blue/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-brand-blue" />
                  </div>
                  <div className="text-2xl font-bold text-brand-blue mb-1">
                    {scores.psychologicalScore}  
                  </div>
                  <div className="text-sm text-muted-foreground">Psychological</div>
                  <div className="text-xs text-muted-foreground mt-1">Mood, sleep, cognitive</div>
                </div>

                <div className="text-center">
                  <div className="bg-brand-green/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-brand-green" />
                  </div>
                  <div className="text-2xl font-bold text-brand-green mb-1">
                    {scores.physicalScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Physical</div>
                  <div className="text-xs text-muted-foreground mt-1">Energy, pain, physical symptoms</div>
                </div>

                <div className="text-center">
                  <div className="bg-brand-pink/10 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-brand-pink" />
                  </div>
                  <div className="text-2xl font-bold text-brand-pink mb-1">
                    {scores.sexualScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Sexual Health</div>
                  <div className="text-xs text-muted-foreground mt-1">Libido, urogenital symptoms</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hormone Stage Assessment */}
        {scores && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Hormone Stage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-brand-purple" />
                  Hormone Health Stage
                </CardTitle>
                <CardDescription>
                  Based on your symptoms and menstrual patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${
                      scores.hormoneStage === 'premenopause' ? 'bg-brand-green/10 text-brand-green' :
                      scores.hormoneStage === 'perimenopause' ? 'bg-brand-amber/10 text-brand-amber' :
                      'bg-brand-purple/10 text-brand-purple'
                    }`}>
                      <TrendingUp className="h-5 w-5" />
                      {scores.hormoneStage === 'premenopause' ? 'Premenopause' :
                       scores.hormoneStage === 'perimenopause' ? 'Perimenopause' : 
                       'Postmenopause'}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Confidence Level: {Math.round(scores.stageConfidence * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    {scores.hormoneStage === 'premenopause' && 
                      'Regular menstrual cycles with minimal hormonal symptoms. Focus on preventive care and lifestyle optimization.'}
                    {scores.hormoneStage === 'perimenopause' && 
                      'Transitional phase with fluctuating hormones. Active management recommended for symptom relief.'}
                    {scores.hormoneStage === 'postmenopause' && 
                      'Post-menopausal phase requiring long-term hormone health management and preventive care.'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Package Recommendation */}
            {packageRecommendation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-brand-blue" />
                    Recommended Care Package
                  </CardTitle>
                  <CardDescription>
                    Personalized treatment plan based on your assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                        packageRecommendation.urgency === 'urgent' ? 'bg-brand-red/10 text-brand-red' :
                        packageRecommendation.urgency === 'priority' ? 'bg-brand-amber/10 text-brand-amber' :
                        'bg-brand-green/10 text-brand-green'
                      }`}>
                        <Info className="h-4 w-4" />
                        {packageRecommendation.urgency === 'urgent' ? 'Urgent Care' :
                         packageRecommendation.urgency === 'priority' ? 'Priority Care' : 
                         'Routine Care'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recommended Package:</div>
                      <div className="text-xs text-muted-foreground">
                        {packageRecommendation.recommendedPackage === 'medical_aid' ? 
                          'Medical Aid Package (R2,660)' : 'Cash Package (R2,400)'}
                      </div>
                    </div>

                    {packageRecommendation.additionalServices.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Recommended Add-ons:</div>
                        <div className="space-y-1">
                          {packageRecommendation.additionalServices.map((service, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              • {service === 'dietitian_cgm' ? 'Dietitian + CGM (R1,200)' : 'Counsellor + DNAlysis (R1,500)'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t">
                      <Link href="/patient/packages">
                        <Button className="w-full btn-healthcare-primary" size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          View Care Packages
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Clinical Reasoning */}
        {packageRecommendation && packageRecommendation.reasoning.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-brand-blue" />
                Clinical Assessment Reasoning
              </CardTitle>
              <CardDescription>
                Why these recommendations were made for your specific situation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {packageRecommendation.reasoning.map((reason, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-brand-blue/5 rounded-lg">
                    <div className="w-6 h-6 bg-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-brand-blue">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Symptom Breakdown */}
        {assessment.assessment_data && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-purple" />
                Detailed Assessment Results
              </CardTitle>
              <CardDescription>
                Individual symptom scores and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vasomotor Symptoms */}
                <div className="space-y-3">
                  <h6 className="font-semibold text-brand-red flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Vasomotor Symptoms
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hot Flashes Frequency:</span>
                      <span className="font-medium">{assessment.assessment_data.hot_flashes_frequency || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hot Flashes Severity:</span>
                      <span className="font-medium">{assessment.assessment_data.hot_flashes_severity || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Night Sweats Frequency:</span>
                      <span className="font-medium">{assessment.assessment_data.night_sweats_frequency || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Night Sweats Severity:</span>
                      <span className="font-medium">{assessment.assessment_data.night_sweats_severity || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Psychological Symptoms */}
                <div className="space-y-3">
                  <h6 className="font-semibold text-brand-blue flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Psychological Symptoms
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sleep Quality:</span>
                      <span className="font-medium">{assessment.assessment_data.sleep_quality || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anxiety:</span>
                      <span className="font-medium">{assessment.assessment_data.anxiety || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depression:</span>
                      <span className="font-medium">{assessment.assessment_data.depression || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mood Swings:</span>
                      <span className="font-medium">{assessment.assessment_data.mood_swings || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory Problems:</span>
                      <span className="font-medium">{assessment.assessment_data.memory_problems || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Concentration:</span>
                      <span className="font-medium">{assessment.assessment_data.concentration_difficulty || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Physical Symptoms */}
                <div className="space-y-3">
                  <h6 className="font-semibold text-brand-green flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Physical Symptoms
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fatigue:</span>
                      <span className="font-medium">{assessment.assessment_data.fatigue || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joint Aches:</span>
                      <span className="font-medium">{assessment.assessment_data.joint_aches || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Headaches:</span>
                      <span className="font-medium">{assessment.assessment_data.headaches || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight Gain:</span>
                      <span className="font-medium">{assessment.assessment_data.weight_gain || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Muscle Tension:</span>
                      <span className="font-medium">{assessment.assessment_data.muscle_tension || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Breast Tenderness:</span>
                      <span className="font-medium">{assessment.assessment_data.breast_tenderness || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Sexual Health */}
                <div className="space-y-3">
                  <h6 className="font-semibold text-brand-pink flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Sexual Health
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Decreased Libido:</span>
                      <span className="font-medium">{assessment.assessment_data.decreased_libido || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vaginal Dryness:</span>
                      <span className="font-medium">{assessment.assessment_data.vaginal_dryness || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Painful Intercourse:</span>
                      <span className="font-medium">{assessment.assessment_data.painful_intercourse || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Urinary Urgency:</span>
                      <span className="font-medium">{assessment.assessment_data.urinary_urgency || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Urinary Frequency:</span>
                      <span className="font-medium">{assessment.assessment_data.urinary_frequency || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Factors */}
                <div className="space-y-3">
                  <h6 className="font-semibold text-brand-orange flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Lifestyle & Health
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overall Wellbeing:</span>
                      <span className="font-medium capitalize">{assessment.assessment_data.overall_wellbeing?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Exercise Frequency:</span>
                      <span className="font-medium capitalize">{assessment.assessment_data.exercise_frequency?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stress Level:</span>
                      <span className="font-medium capitalize">{assessment.assessment_data.stress_level || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Smoking Status:</span>
                      <span className="font-medium capitalize">{assessment.assessment_data.smoking_status?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Menstrual Status:</span>
                      <span className="font-medium capitalize">{assessment.assessment_data.menstrual_status?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Concerns */}
                {assessment.assessment_data.primary_concerns && assessment.assessment_data.primary_concerns.length > 0 && (
                  <div className="space-y-3">
                    <h6 className="font-semibold text-brand-purple flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Primary Concerns
                    </h6>
                    <div className="space-y-1 text-sm">
                      {assessment.assessment_data.primary_concerns.map((concern: string, idx: number) => (
                        <div key={idx} className="text-muted-foreground">• {concern}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinical Recommendations */}
        {assessment.recommendations && assessment.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-brand-orange" />
                Clinical Recommendations
              </CardTitle>
              <CardDescription>
                Personalized treatment recommendations based on your assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assessment.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-brand-orange/5 rounded-lg">
                    <div className="w-6 h-6 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-brand-orange">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Assessment */}
        {assessment.risk_factors && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand-amber" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Health risk factors identified from your assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(assessment.risk_factors).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg border">
                    <div className="text-sm font-medium capitalize mb-1">
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div className={`text-xs font-medium ${value ? 'text-brand-red' : 'text-brand-green'}`}>
                      {value ? '⚠ Present' : '✓ Low Risk'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Link href="/patient/assessment">
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Take New Assessment
            </Button>
          </Link>
          <Link href="/patient/book-appointment">
            <Button className="btn-healthcare-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}