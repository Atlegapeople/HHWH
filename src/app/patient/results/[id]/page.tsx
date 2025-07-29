'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Thermometer, Moon, Brain, Heart, Activity } from 'lucide-react'
import Link from 'next/link'
import { getAssessmentById, calculateAssessmentScores, formatAssessmentDate, getSeverityBadge, generateRecommendations } from '@/lib/supabase/assessments'
import { useAuth } from '@/contexts/AuthContext'

export default function AssessmentResultsPage() {
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssessmentResults = async () => {
      if (!params.id) {
        setError('No assessment ID provided')
        setLoading(false)
        return
      }

      try {
        console.log('Loading assessment results for ID:', params.id)
        const assessmentData = await getAssessmentById(params.id as string)
        
        if (assessmentData) {
          console.log('Assessment data loaded:', assessmentData)
          setAssessmentResult(assessmentData)
        } else {
          setError('Assessment not found')
        }
      } catch (error) {
        console.error('Failed to load assessment:', error)
        setError('Failed to load assessment results')
      } finally {
        setLoading(false)
      }
    }

    loadAssessmentResults()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading assessment results...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !assessmentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Assessment Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The requested assessment could not be found.'}</p>
            <Link href="/patient/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate scores and get recommendations
  const scores = calculateAssessmentScores(assessmentResult.assessment_data)
  const badgeConfig = getSeverityBadge(assessmentResult.severity_level)
  const recommendations = assessmentResult.recommendations || generateRecommendations(assessmentResult.assessment_data, scores)

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/patient/dashboard#health" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Health Records</span>
          </Link>
          <Badge variant="outline" className="text-brand-purple">
            Assessment Results
          </Badge>
        </div>
      </header>

      {/* Results Content */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <div className="bg-brand-green/10 p-4 rounded-full w-fit mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-brand-green" />
            </div>
            <CardTitle className="font-heading text-2xl text-brand-green">
              Assessment Complete
            </CardTitle>
            <CardDescription className="text-lg">
              Your comprehensive hormone health assessment results
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Summary Card */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-brand-green/5 border-brand-green/20">
                <CardHeader>
                  <CardTitle className="text-lg">Overall Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-brand-green">
                      {assessmentResult.total_score}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`${badgeConfig.className} capitalize`}
                    >
                      {assessmentResult.severity_level.replace('_', ' ')} Impact
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completed: {formatAssessmentDate(assessmentResult.completed_at)}
                  </div>
                </CardContent>
              </Card>

              {/* Score Breakdown */}
              <Card className="bg-brand-purple/5 border-brand-purple/20">
                <CardHeader>
                  <CardTitle className="text-lg">Symptom Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Vasomotor (Hot Flashes)</span>
                    <span className="font-medium">{scores.vasomotorScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Psychological (Mood/Sleep)</span>
                    <span className="font-medium">{scores.psychologicalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Physical Symptoms</span>
                    <span className="font-medium">{scores.physicalScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sexual/Urogenital</span>
                    <span className="font-medium">{scores.sexualScore}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clinical Recommendations */}
            {recommendations && recommendations.length > 0 && (
              <Card className="bg-brand-green/5 border border-brand-green/20">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-green">Clinical Recommendations</CardTitle>
                  <CardDescription>
                    Based on your assessment, our medical team recommends:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {recommendations.slice(0, 6).map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-brand-green font-bold mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                    {recommendations.length > 6 && (
                      <li className="text-muted-foreground italic">
                        + {recommendations.length - 6} more recommendations available in your consultation
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 text-brand-blue">What Happens Next?</h3>
              <ul className="text-sm text-muted-foreground space-y-2 text-left">
                <li>• Your assessment has been securely saved to your patient record</li>
                <li>• Our medical team will review your results before your consultation</li>
                <li>• This detailed analysis helps your doctor provide personalized treatment</li>
                <li>• Schedule a consultation to discuss your results and treatment options</li>
                <li>• You can view your complete assessment anytime in your dashboard</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/patient/book-appointment">
                <Button className="btn-healthcare-primary">
                  Book Consultation to Discuss Results
                </Button>
              </Link>
              <Link href="/patient/dashboard">
                <Button variant="outline">
                  View Patient Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}