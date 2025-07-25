import { createClient } from './client'
import { SymptomAssessment } from '@/lib/validations/patient'
import { Database } from '@/types/database'
import { checkPatientByEmail } from './patient-status'

type Assessment = Database['public']['Tables']['symptom_assessments']['Insert']

export async function createAssessment(
  assessmentData: SymptomAssessment,
  patientEmail: string
) {
  const supabase = createClient()
  
  try {
    // Get patient by email
    console.log('Finding patient by email for assessment:', patientEmail)
    const { exists, patient } = await checkPatientByEmail(patientEmail)
    
    if (!exists || !patient) {
      throw new Error('Patient not found. Please complete registration first.')
    }

    // Calculate assessment scores and severity
    const scores = calculateAssessmentScores(assessmentData)
    
    // Create assessment record
    const assessment: Assessment = {
      patient_id: patient.id,
      assessment_data: assessmentData as any, // Store full form data as JSON
      risk_factors: calculateRiskFactors(assessmentData),
      total_score: scores.totalScore,
      severity_level: scores.severityLevel,
      recommendations: generateRecommendations(assessmentData, scores)
    }

    console.log('Creating assessment with data:', assessment)

    const { data: savedAssessment, error } = await supabase
      .from('symptom_assessments')
      .insert([assessment])
      .select(`
        *,
        patient:patients(full_name, email)
      `)
      .single()

    if (error) {
      console.error('Supabase error creating assessment:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to save assessment: ${error.message}`)
    }

    console.log('Assessment saved successfully:', savedAssessment)
    return savedAssessment

  } catch (error) {
    console.error('Failed to create assessment:', error)
    throw error
  }
}

// Calculate assessment scores based on symptom severity
export function calculateAssessmentScores(data: SymptomAssessment) {
  let totalScore = 0
  let vasomotorScore = 0
  let psychologicalScore = 0
  let physicalScore = 0
  let sexualScore = 0

  // Vasomotor symptoms (hot flashes, night sweats)
  vasomotorScore += parseInt(data.hot_flashes_frequency) * parseInt(data.hot_flashes_severity)
  vasomotorScore += parseInt(data.night_sweats_frequency) * parseInt(data.night_sweats_severity)

  // Psychological symptoms (mood, sleep, cognitive)
  psychologicalScore += parseInt(data.sleep_quality)
  psychologicalScore += parseInt(data.sleep_onset_difficulty)
  psychologicalScore += parseInt(data.early_morning_wakening)
  psychologicalScore += parseInt(data.mood_swings)
  psychologicalScore += parseInt(data.irritability)
  psychologicalScore += parseInt(data.anxiety)
  psychologicalScore += parseInt(data.depression)
  psychologicalScore += parseInt(data.concentration_difficulty)
  psychologicalScore += parseInt(data.memory_problems)
  psychologicalScore += parseInt(data.mental_fatigue)

  // Physical symptoms
  physicalScore += parseInt(data.fatigue)
  physicalScore += parseInt(data.joint_aches)
  physicalScore += parseInt(data.muscle_tension)
  physicalScore += parseInt(data.headaches)
  physicalScore += parseInt(data.breast_tenderness)
  physicalScore += parseInt(data.weight_gain)
  physicalScore += parseInt(data.bloating)

  // Sexual/urogenital symptoms
  sexualScore += parseInt(data.decreased_libido)
  sexualScore += parseInt(data.vaginal_dryness)
  sexualScore += parseInt(data.painful_intercourse)
  sexualScore += parseInt(data.urinary_urgency)
  sexualScore += parseInt(data.urinary_frequency)

  totalScore = vasomotorScore + psychologicalScore + physicalScore + sexualScore

  // Determine severity level based on scoring
  let severityLevel: 'mild' | 'moderate' | 'severe' | 'very_severe'
  if (totalScore <= 15) {
    severityLevel = 'mild'
  } else if (totalScore <= 30) {
    severityLevel = 'moderate'
  } else if (totalScore <= 45) {
    severityLevel = 'severe'
  } else {
    severityLevel = 'very_severe'
  }

  return {
    totalScore,
    vasomotorScore,
    psychologicalScore,
    physicalScore,
    sexualScore,
    severityLevel
  }
}

// Calculate risk factors for treatment planning
export function calculateRiskFactors(data: SymptomAssessment) {
  const riskFactors: any = {
    // Cardiovascular risk factors
    cardiovascular_risk: data.smoking_status !== 'never' || 
                        data.high_blood_pressure || 
                        data.diabetes || 
                        data.family_heart_disease,
    
    // Thrombosis risk factors
    thrombosis_risk: data.blood_clots_history || 
                    data.smoking_status.includes('current') ||
                    (data.age > 60),
    
    // Cancer risk factors
    breast_cancer_risk: data.breast_cancer_history || 
                       data.family_breast_cancer,
    
    // Bone health risk factors
    osteoporosis_risk: data.osteoporosis || 
                      data.family_osteoporosis || 
                      (data.age > 50 && data.menstrual_status.includes('stopped')),
    
    // Lifestyle risk factors
    lifestyle_risks: data.smoking_status !== 'never' ||
                    data.alcohol_frequency === 'multiple_daily' ||
                    data.exercise_frequency === 'none' ||
                    data.stress_level === 'very_high',
    
    // Quality of life impact
    severe_impact: parseInt(data.work_productivity_impact) >= 2 ||
                  parseInt(data.social_activities_impact) >= 2 ||
                  parseInt(data.relationship_impact) >= 2 ||
                  data.overall_wellbeing === 'poor' || 
                  data.overall_wellbeing === 'very_poor'
  }

  return riskFactors
}

// Generate clinical recommendations based on assessment
export function generateRecommendations(data: SymptomAssessment, scores: any): string[] {
  const recommendations: string[] = []

  // Vasomotor symptoms recommendations
  if (scores.vasomotorScore > 6) {
    recommendations.push('Consider hormone replacement therapy for moderate to severe vasomotor symptoms')
    recommendations.push('Lifestyle modifications: cooling strategies, layered clothing, avoid triggers')
  }

  // Sleep recommendations
  if (parseInt(data.sleep_quality) >= 2) {
    recommendations.push('Sleep hygiene assessment and potential sleep study referral')
    recommendations.push('Consider cognitive behavioral therapy for insomnia (CBT-I)')
  }

  // Mood/psychological recommendations
  if (scores.psychologicalScore > 8) {
    recommendations.push('Psychological support and mood assessment recommended')
    if (parseInt(data.depression) >= 2 || parseInt(data.anxiety) >= 2) {
      recommendations.push('Consider referral to mental health specialist')
    }
  }

  // Sexual health recommendations
  if (scores.sexualScore > 4) {
    recommendations.push('Sexual health assessment and potential local estrogen therapy')
    recommendations.push('Pelvic floor assessment and sexual counseling as appropriate')
  }

  // Risk-based recommendations
  const riskFactors = calculateRiskFactors(data)
  
  if (riskFactors.cardiovascular_risk) {
    recommendations.push('Cardiovascular risk assessment before hormone therapy')
    recommendations.push('Blood pressure and lipid monitoring recommended')
  }

  if (riskFactors.thrombosis_risk) {
    recommendations.push('Thrombosis risk assessment - consider transdermal HRT if indicated')
    recommendations.push('Regular monitoring for signs of thromboembolism')
  }

  if (riskFactors.breast_cancer_risk) {
    recommendations.push('Enhanced breast cancer screening and risk discussion')
    recommendations.push('Consider shorter duration HRT with regular review')
  }

  if (riskFactors.osteoporosis_risk) {
    recommendations.push('Bone density screening (DEXA scan) recommended')
    recommendations.push('Calcium and Vitamin D supplementation assessment')
  }

  // Lifestyle recommendations
  if (data.smoking_status !== 'never') {
    recommendations.push('Smoking cessation support - essential before hormone therapy')
  }

  if (data.exercise_frequency === 'none' || data.exercise_frequency === 'rarely') {
    recommendations.push('Structured exercise program including weight-bearing activities')
  }

  if (data.stress_level === 'high' || data.stress_level === 'very_high') {
    recommendations.push('Stress management techniques and relaxation therapies')
  }

  // General recommendations
  recommendations.push('Regular follow-up appointments for symptom monitoring')
  
  if (scores.severityLevel === 'severe' || scores.severityLevel === 'very_severe') {
    recommendations.push('Priority consultation for comprehensive treatment plan')
  }

  return recommendations
}

// Get patient assessments
export async function getPatientAssessments(patientEmail: string) {
  const supabase = createClient()
  
  try {
    // First get patient
    const { exists, patient } = await checkPatientByEmail(patientEmail)
    
    if (!exists || !patient) {
      return []
    }

    const { data, error } = await supabase
      .from('symptom_assessments')
      .select('*')
      .eq('patient_id', patient.id)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Error fetching assessments:', error)
      throw error
    }

    return data

  } catch (error) {
    console.error('Failed to fetch patient assessments:', error)
    throw error
  }
}

// Get latest assessment for a patient
export async function getLatestAssessment(patientEmail: string) {
  const assessments = await getPatientAssessments(patientEmail)
  return assessments.length > 0 ? assessments[0] : null
}

// Format assessment date
export function formatAssessmentDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get severity color for UI
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'mild':
      return 'text-brand-green'
    case 'moderate':
      return 'text-brand-amber'
    case 'severe':
      return 'text-brand-orange'
    case 'very_severe':
      return 'text-brand-red'
    default:
      return 'text-muted-foreground'
  }
}

// Get severity badge variant
export function getSeverityBadge(severity: string): { variant: string; className: string } {
  switch (severity) {
    case 'mild':
      return { variant: 'outline', className: 'bg-brand-green/10 text-brand-green border-brand-green/20' }
    case 'moderate':
      return { variant: 'outline', className: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20' }
    case 'severe':
      return { variant: 'outline', className: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20' }
    case 'very_severe':
      return { variant: 'outline', className: 'bg-brand-red/10 text-brand-red border-brand-red/20' }
    default:
      return { variant: 'outline', className: '' }
  }
}