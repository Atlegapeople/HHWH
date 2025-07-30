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

// Hormone stage types based on clinical assessment
export type HormoneStage = 'premenopause' | 'perimenopause' | 'postmenopause'

// Calculate assessment scores and determine hormone stage
export function calculateAssessmentScores(data: SymptomAssessment) {
  let totalScore = 0
  let vasomotorScore = 0
  let psychologicalScore = 0
  let physicalScore = 0
  let sexualScore = 0

  // Vasomotor symptoms (hot flashes, night sweats) - Higher weight for hormone stage determination
  const hotFlashScore = parseInt(data.hot_flashes_frequency) * parseInt(data.hot_flashes_severity)
  const nightSweatScore = parseInt(data.night_sweats_frequency) * parseInt(data.night_sweats_severity)
  vasomotorScore = hotFlashScore + nightSweatScore

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

  // Sexual/urogenital symptoms - Important for stage determination
  const libidoScore = parseInt(data.decreased_libido)
  const drynessScore = parseInt(data.vaginal_dryness)
  const painScore = parseInt(data.painful_intercourse)
  const urinaryScore = parseInt(data.urinary_urgency) + parseInt(data.urinary_frequency)
  sexualScore = libidoScore + drynessScore + painScore + urinaryScore

  totalScore = vasomotorScore + psychologicalScore + physicalScore + sexualScore

  // Determine hormone stage based on symptoms and menstrual status
  const hormoneStage = determineHormoneStage(data, {
    vasomotorScore,
    sexualScore,
    totalScore,
    hotFlashScore,
    nightSweatScore,
    drynessScore
  })

  // Determine severity level within the stage
  const severityLevel = determineSeverityLevel(totalScore, hormoneStage)

  return {
    totalScore,
    vasomotorScore,
    psychologicalScore,
    physicalScore,
    sexualScore,
    severityLevel,
    hormoneStage,
    stageConfidence: calculateStageConfidence(data, hormoneStage)
  }
}

// Determine hormone stage based on clinical indicators
function determineHormoneStage(data: SymptomAssessment, scores: any): HormoneStage {
  const age = data.age || 45 // Default age if not provided
  const menstrualStatus = data.menstrual_status
  const { vasomotorScore, sexualScore, drynessScore } = scores

  // Postmenopause indicators (strongest evidence)
  if (
    menstrualStatus?.includes('stopped') ||
    age > 55 ||
    (drynessScore >= 4 && vasomotorScore >= 8 && age > 50) ||
    (sexualScore >= 8 && vasomotorScore >= 6 && age > 48)
  ) {
    return 'postmenopause'
  }

  // Perimenopause indicators (transitional phase)
  if (
    age >= 40 &&
    (
      menstrualStatus?.includes('irregular') ||
      vasomotorScore >= 4 ||
      (vasomotorScore >= 2 && scores.totalScore >= 12) ||
      (age >= 45 && scores.totalScore >= 8)
    )
  ) {
    return 'perimenopause'
  }

  // Premenopause (default for younger women with regular cycles)
  return 'premenopause'
}

// Calculate confidence level in stage determination
function calculateStageConfidence(data: SymptomAssessment, stage: HormoneStage): number {
  let confidence = 0.5 // Base confidence

  const age = data.age || 45
  const menstrualStatus = data.menstrual_status

  // High confidence indicators
  if (menstrualStatus?.includes('stopped') && stage === 'postmenopause') confidence += 0.4
  if (menstrualStatus?.includes('regular') && age < 40 && stage === 'premenopause') confidence += 0.3
  if (menstrualStatus?.includes('irregular') && age >= 45 && stage === 'perimenopause') confidence += 0.3

  // Age-based confidence adjustments
  if (stage === 'postmenopause' && age > 52) confidence += 0.2
  if (stage === 'perimenopause' && age >= 45 && age <= 55) confidence += 0.2  
  if (stage === 'premenopause' && age < 45) confidence += 0.2

  return Math.min(1.0, confidence)
}

// Determine severity level within hormone stage
function determineSeverityLevel(totalScore: number, stage: HormoneStage): 'mild' | 'moderate' | 'severe' | 'very_severe' {
  // Adjust scoring thresholds based on hormone stage
  let mildThreshold = 8
  let moderateThreshold = 18
  let severeThreshold = 30

  // Perimenopause and postmenopause typically have higher symptom severity
  if (stage === 'perimenopause') {
    mildThreshold = 6
    moderateThreshold = 15
    severeThreshold = 25
  } else if (stage === 'postmenopause') {
    mildThreshold = 5
    moderateThreshold = 12
    severeThreshold = 22
  }

  if (totalScore <= mildThreshold) {
    return 'mild'
  } else if (totalScore <= moderateThreshold) {
    return 'moderate'
  } else if (totalScore <= severeThreshold) {
    return 'severe'
  } else {
    return 'very_severe'
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

  // Stage-specific recommendations
  const stageRecommendations = generateStageRecommendations(scores.hormoneStage, scores)
  recommendations.push(...stageRecommendations)

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

// Generate stage-specific recommendations and package suggestions
function generateStageRecommendations(stage: HormoneStage, scores: any): string[] {
  const recommendations: string[] = []

  switch (stage) {
    case 'premenopause':
      recommendations.push('Focus on lifestyle optimization and symptom management')
      recommendations.push('Consider tracking menstrual patterns for future reference')
      if (scores.totalScore >= 10) {
        recommendations.push('Early intervention may prevent symptom progression')
      }
      break

    case 'perimenopause':
      recommendations.push('Perimenopause transition management is key to symptom relief')
      recommendations.push('Consider comprehensive hormone evaluation and treatment options')
      recommendations.push('Regular monitoring as hormone levels fluctuate during this phase')
      if (scores.severityLevel === 'moderate' || scores.severityLevel === 'severe') {
        recommendations.push('Active treatment recommended to improve quality of life')
      }
      break

    case 'postmenopause':
      recommendations.push('Long-term hormone health management and preventive care')
      recommendations.push('Focus on bone health, cardiovascular health, and symptom management')
      recommendations.push('Consider ongoing hormone replacement therapy with regular review')
      if (scores.sexualScore >= 4) {
        recommendations.push('Urogenital symptoms require targeted treatment approach')
      }
      break
  }

  return recommendations
}

// Recommend appropriate care package based on assessment results
export function recommendPackage(scores: any, hasInsurance: boolean = true): {
  recommendedPackage: 'medical_aid' | 'cash'
  urgency: 'routine' | 'priority' | 'urgent'
  additionalServices: string[]
  reasoning: string[]
} {
  const { hormoneStage, severityLevel, totalScore, psychologicalScore } = scores
  const reasoning: string[] = []
  const additionalServices: string[] = []

  // Base package recommendation on user's insurance preference
  const recommendedPackage = hasInsurance ? 'medical_aid' : 'cash'

  // Determine urgency based on stage and severity
  let urgency: 'routine' | 'priority' | 'urgent' = 'routine'

  if (severityLevel === 'severe' || severityLevel === 'very_severe') {
    urgency = 'urgent'
    reasoning.push('High symptom severity requires immediate comprehensive care')
  } else if (
    (hormoneStage === 'perimenopause' && totalScore >= 15) ||
    (hormoneStage === 'postmenopause' && totalScore >= 12)
  ) {
    urgency = 'priority'
    reasoning.push('Moderate to severe symptoms in hormone transition phase')
  }

  // Stage-specific reasoning
  switch (hormoneStage) {
    case 'premenopause':
      reasoning.push('Early intervention package recommended for symptom prevention')
      if (totalScore >= 12) {
        reasoning.push('Comprehensive evaluation needed despite pre-menopausal status')
      }
      break

    case 'perimenopause':
      reasoning.push('Perimenopause requires coordinated care approach with multiple consultations')
      reasoning.push('Package format ideal for managing fluctuating hormone levels')
      if (severityLevel !== 'mild') {
        additionalServices.push('dietitian_cgm')
        reasoning.push('Metabolic support recommended during hormone transition')
      }
      break

    case 'postmenopause':
      reasoning.push('Long-term management approach with regular monitoring')
      reasoning.push('Package provides comprehensive care coordination for complex needs')
      additionalServices.push('dietitian_cgm')
      if (psychologicalScore >= 8) {
        additionalServices.push('counsellor_dnalysis')
        reasoning.push('Psychological support recommended for mood and mental health')
      }
      break
  }

  // Additional services based on symptom patterns
  if (psychologicalScore >= 10) {
    if (!additionalServices.includes('counsellor_dnalysis')) {
      additionalServices.push('counsellor_dnalysis')
      reasoning.push('High psychological symptom score suggests benefit from counselling support')
    }
  }

  if (totalScore >= 20 && hormoneStage !== 'premenopause') {
    if (!additionalServices.includes('dietitian_cgm')) {
      additionalServices.push('dietitian_cgm')
      reasoning.push('High overall symptom burden suggests need for metabolic and nutritional support')
    }
  }

  return {
    recommendedPackage,
    urgency,
    additionalServices,
    reasoning
  }
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

// Get assessment by ID
export async function getAssessmentById(assessmentId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('symptom_assessments')
      .select(`
        *,
        patient:patients(full_name, email)
      `)
      .eq('id', assessmentId)
      .single()

    if (error) {
      console.error('Error fetching assessment by ID:', error)
      throw error
    }

    return data

  } catch (error) {
    console.error('Failed to fetch assessment by ID:', error)
    throw error
  }
}