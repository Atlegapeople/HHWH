'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle, X, Calendar, TrendingUp, Heart, Brain, Thermometer, Activity } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading'
import Link from 'next/link'
import { getAssessmentById, calculateAssessmentScores, formatAssessmentDate, getSeverityBadge, generateRecommendations } from '@/lib/supabase/assessments'

interface AssessmentResultsModalProps {
  assessmentId: string
  trigger: React.ReactNode
}

export default function AssessmentResultsModal({ assessmentId, trigger }: AssessmentResultsModalProps) {
  const [assessmentResult, setAssessmentResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const loadAssessmentResults = async () => {
    if (!assessmentId) return

    setLoading(true)
    setError(null)

    try {
      console.log('Loading assessment results for ID:', assessmentId)
      const assessmentData = await getAssessmentById(assessmentId)
      
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

  // Load results when modal opens
  useEffect(() => {
    if (open && !assessmentResult) {
      loadAssessmentResults()
    }
  }, [open, assessmentResult, assessmentId])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset state when modal closes
      setAssessmentResult(null)
      setError(null)
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assessment Results</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="lg" className="mx-auto mb-4" />
              <p className="text-muted-foreground">Loading assessment results...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !assessmentResult) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assessment Not Found</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <X className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-muted-foreground mb-4">{error || 'The requested assessment could not be found.'}</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Calculate scores and get recommendations
  const scores = calculateAssessmentScores(assessmentResult.assessment_data)
  const badgeConfig = getSeverityBadge(assessmentResult.severity_level)
  const recommendations = assessmentResult.recommendations || generateRecommendations(assessmentResult.assessment_data, scores)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-brand-green" />
            Assessment Results
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header Summary */}
          <div className="bg-gradient-to-r from-brand-green/10 to-brand-blue/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-brand-green">Assessment Complete</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatAssessmentDate(assessmentResult.completed_at)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-green mb-1">
                  {assessmentResult.total_score}
                </div>
                <Badge 
                  variant="outline" 
                  className={`${badgeConfig.className} capitalize text-xs`}
                >
                  {assessmentResult.severity_level.replace('_', ' ')} Impact
                </Badge>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <Card className="bg-brand-purple/5 border-brand-purple/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Symptom Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-brand-red" />
                    <span className="text-sm font-medium">Vasomotor</span>
                  </div>
                  <span className="font-bold text-brand-red">{scores.vasomotorScore}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-brand-blue" />
                    <span className="text-sm font-medium">Psychological</span>
                  </div>
                  <span className="font-bold text-brand-blue">{scores.psychologicalScore}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-orange" />
                    <span className="text-sm font-medium">Physical</span>
                  </div>
                  <span className="font-bold text-brand-orange">{scores.physicalScore}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-brand-pink" />
                    <span className="text-sm font-medium">Sexual Health</span>
                  </div>
                  <span className="font-bold text-brand-pink">{scores.sexualScore}</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                <ul className="space-y-2 text-sm max-h-40 overflow-y-auto">
                  {recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-brand-green font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-lg p-4">
            <h3 className="font-semibold text-brand-blue mb-3">What Happens Next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Your assessment is securely saved to your patient record</li>
              <li>• Our medical team will review results before consultation</li>
              <li>• Schedule a consultation to discuss treatment options</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Link href="/patient/book-appointment" className="flex-1">
              <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
                Book Consultation
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Close Results
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}