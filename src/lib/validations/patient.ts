import { z } from 'zod'

// South African phone number validation
const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/

// South African medical aid schemes
export const medicalAidSchemes = [
  'Discovery Health',
  'Momentum Health',
  'Bonitas',
  'Fedhealth',
  'Gems',
  'Keyhealth',
  'Medihelp',
  'Polmed',
  'Profmed',
  'Resolution Health',
  'Sizani',
  'Other'
] as const

export const patientRegistrationSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  
  email: z
    .string()
    .email('Please enter a valid email address'),
  
  phone: z
    .string()
    .regex(phoneRegex, 'Please enter a valid South African phone number (e.g., 0812345678 or +27812345678)'),
  
  date_of_birth: z
    .string()
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 18 && age <= 100
    }, 'You must be between 18 and 100 years old'),
  
  medical_aid_scheme: z
    .string()
    .optional(),
  
  medical_aid_number: z
    .string()
    .optional(),
  
  medical_aid_dependent_code: z
    .string()
    .optional(),
  
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    province: z.enum([
      'Eastern Cape',
      'Free State',
      'Gauteng',
      'KwaZulu-Natal',
      'Limpopo',
      'Mpumalanga',
      'North West',
      'Northern Cape',
      'Western Cape'
    ]),
    postal_code: z
      .string()
      .regex(/^\d{4}$/, 'Postal code must be 4 digits')
  }),
  
  emergency_contact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number')
  })
}).refine((data) => {
  // If medical aid scheme is selected, medical aid number is required
  if (data.medical_aid_scheme && data.medical_aid_scheme !== 'none') {
    return data.medical_aid_number && data.medical_aid_number.length > 0
  }
  return true
}, {
  message: 'Medical aid number is required when medical aid scheme is selected',
  path: ['medical_aid_number']
})

export const appointmentBookingSchema = z.object({
  doctor_id: z.string().uuid('Please select a doctor'),
  
  appointment_date: z
    .string()
    .refine((date) => {
      const appointmentDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return appointmentDate >= today
    }, 'Appointment date cannot be in the past'),
  
  appointment_time: z.string().min(1, 'Please select an appointment time'),
  
  consultation_type: z.enum(['initial', 'follow_up', 'emergency']),
  
  payment_method: z.enum(['cash', 'medical_aid']),
  
  symptoms_description: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your symptoms')
    .max(1000, 'Description must be less than 1000 characters'),
  
  current_medications: z
    .string()
    .max(500, 'Current medications must be less than 500 characters')
    .optional(),
  
  allergies: z
    .string()
    .max(500, 'Allergies must be less than 500 characters')
    .optional()
})

export const symptomAssessmentSchema = z.object({
  // Vasomotor Symptoms (Hot Flashes & Night Sweats)
  hot_flashes_frequency: z.enum(['0', '1', '2', '3', '4']), // 0=none, 1=<1/day, 2=1-5/day, 3=6-10/day, 4=>10/day
  hot_flashes_severity: z.enum(['0', '1', '2', '3']), // 0=none, 1=mild, 2=moderate, 3=severe
  night_sweats_frequency: z.enum(['0', '1', '2', '3', '4']),
  night_sweats_severity: z.enum(['0', '1', '2', '3']),
  
  // Sleep & Mood Symptoms
  sleep_quality: z.enum(['0', '1', '2', '3']), // 0=excellent, 1=good, 2=poor, 3=very poor
  sleep_onset_difficulty: z.enum(['0', '1', '2', '3']), // 0=never, 1=sometimes, 2=often, 3=always
  early_morning_wakening: z.enum(['0', '1', '2', '3']),
  mood_swings: z.enum(['0', '1', '2', '3']),
  irritability: z.enum(['0', '1', '2', '3']),
  anxiety: z.enum(['0', '1', '2', '3']),
  depression: z.enum(['0', '1', '2', '3']),
  
  // Cognitive Symptoms
  concentration_difficulty: z.enum(['0', '1', '2', '3']),
  memory_problems: z.enum(['0', '1', '2', '3']),
  mental_fatigue: z.enum(['0', '1', '2', '3']),
  
  // Physical Symptoms
  fatigue: z.enum(['0', '1', '2', '3']),
  joint_aches: z.enum(['0', '1', '2', '3']),
  muscle_tension: z.enum(['0', '1', '2', '3']),
  headaches: z.enum(['0', '1', '2', '3']),
  breast_tenderness: z.enum(['0', '1', '2', '3']),
  weight_gain: z.enum(['0', '1', '2', '3']),
  bloating: z.enum(['0', '1', '2', '3']),
  
  // Sexual & Urogenital Symptoms
  decreased_libido: z.enum(['0', '1', '2', '3']),
  vaginal_dryness: z.enum(['0', '1', '2', '3']),
  painful_intercourse: z.enum(['0', '1', '2', '3']),
  urinary_urgency: z.enum(['0', '1', '2', '3']),
  urinary_frequency: z.enum(['0', '1', '2', '3']),
  
  // Menstrual History
  menstrual_status: z.enum(['regular', 'irregular', 'stopped_less_than_1_year', 'stopped_more_than_1_year', 'hysterectomy']),
  last_menstrual_period: z.string().optional(),
  menstrual_flow_changes: z.enum(['0', '1', '2', '3']), // 0=no change, 1=lighter, 2=heavier, 3=very irregular
  
  // Medical History
  age: z.number().min(18).max(100),
  previous_hrt: z.boolean(),
  current_hrt: z.boolean(),
  hrt_type: z.string().optional(),
  thyroid_disorder: z.boolean(),
  diabetes: z.boolean(),
  high_blood_pressure: z.boolean(),
  heart_disease: z.boolean(),
  osteoporosis: z.boolean(),
  breast_cancer_history: z.boolean(),
  family_breast_cancer: z.boolean(),
  family_heart_disease: z.boolean(),
  family_osteoporosis: z.boolean(),
  blood_clots_history: z.boolean(),
  
  // Lifestyle Factors
  smoking_status: z.enum(['never', 'former', 'current_light', 'current_moderate', 'current_heavy']),
  alcohol_frequency: z.enum(['never', 'rarely', 'weekly', 'daily', 'multiple_daily']),
  exercise_frequency: z.enum(['none', 'rarely', '1-2_weekly', '3-4_weekly', '5+_weekly']),
  exercise_intensity: z.enum(['light', 'moderate', 'vigorous']),
  stress_level: z.enum(['low', 'moderate', 'high', 'very_high']),
  
  // Current Medications & Supplements
  current_medications: z.string().max(1000).optional(),
  vitamins_supplements: z.string().max(500).optional(),
  herbal_remedies: z.string().max(500).optional(),
  
  // Quality of Life Impact
  work_productivity_impact: z.enum(['0', '1', '2', '3']), // 0=no impact, 3=severe impact
  social_activities_impact: z.enum(['0', '1', '2', '3']),
  relationship_impact: z.enum(['0', '1', '2', '3']),
  overall_wellbeing: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor']),
  
  // Treatment Goals & Preferences
  primary_concerns: z.array(z.string()).min(1, 'Please select at least one primary concern'),
  treatment_preferences: z.array(z.string()),
  treatment_concerns: z.array(z.string()),
  
  // Additional Information
  additional_symptoms: z.string().max(1000).optional(),
  questions_for_doctor: z.string().max(1000).optional()
})

export type PatientRegistration = z.infer<typeof patientRegistrationSchema>
export type AppointmentBooking = z.infer<typeof appointmentBookingSchema>
export type SymptomAssessment = z.infer<typeof symptomAssessmentSchema>