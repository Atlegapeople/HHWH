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

  profile_photo_url: z.string().url().optional().nullable(),
  
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
    ], {
      errorMap: () => ({ message: "Please select your province" })
    }),
    postal_code: z
      .string()
      .regex(/^\d{4}$/, 'Postal code must be 4 digits')
  }),
  
  emergency_contact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().regex(phoneRegex, 'Please enter a valid phone number')
  }),
  
  id_document_url: z.string().optional(),
  medical_aid_card_url: z.string().optional()
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
  
  consultation_type: z.enum(['initial', 'follow_up', 'emergency'], {
    errorMap: () => ({ message: "Please select a consultation type" })
  }),
  
  payment_method: z.enum(['cash', 'medical_aid'], {
    errorMap: () => ({ message: "Please select a payment method" })
  }),
  
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
  hot_flashes_frequency: z.enum(['0', '1', '2', '3', '4'], {
    errorMap: () => ({ message: "Please select how often you experience hot flashes" })
  }),
  hot_flashes_severity: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please select the severity of your hot flashes" })
  }),
  night_sweats_frequency: z.enum(['0', '1', '2', '3', '4'], {
    errorMap: () => ({ message: "Please select how often you experience night sweats" })
  }),
  night_sweats_severity: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please select the severity of your night sweats" })
  }),
  
  // Sleep & Mood Symptoms
  sleep_quality: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your sleep quality" })
  }),
  sleep_onset_difficulty: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please select how often you have difficulty falling asleep" })
  }),
  early_morning_wakening: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please select how often you wake up too early" })
  }),
  mood_swings: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience mood swings" })
  }),
  irritability: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you feel irritable" })
  }),
  anxiety: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your anxiety levels" })
  }),
  depression: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you feel depressed" })
  }),
  
  // Cognitive Symptoms
  concentration_difficulty: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your difficulty concentrating" })
  }),
  memory_problems: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience memory problems" })
  }),
  mental_fatigue: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your mental fatigue levels" })
  }),
  
  // Physical Symptoms
  fatigue: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your fatigue levels" })
  }),
  joint_aches: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience joint aches" })
  }),
  muscle_tension: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate your muscle tension levels" })
  }),
  headaches: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience headaches" })
  }),
  breast_tenderness: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience breast tenderness" })
  }),
  weight_gain: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate any recent weight gain" })
  }),
  bloating: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience bloating" })
  }),
  
  // Sexual & Urogenital Symptoms
  decreased_libido: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate changes in your libido" })
  }),
  vaginal_dryness: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience vaginal dryness" })
  }),
  painful_intercourse: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience painful intercourse" })
  }),
  urinary_urgency: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience urinary urgency" })
  }),
  urinary_frequency: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how often you experience frequent urination" })
  }),
  
  // Menstrual History
  menstrual_status: z.enum(['regular', 'irregular', 'stopped_less_than_1_year', 'stopped_more_than_1_year', 'hysterectomy'], {
    errorMap: () => ({ message: "Please select your current menstrual status" })
  }),
  last_menstrual_period: z.string().optional(),
  menstrual_flow_changes: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please select any changes in your menstrual flow" })
  }),
  
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
  smoking_status: z.enum(['never', 'former', 'current_light', 'current_moderate', 'current_heavy'], {
    errorMap: () => ({ message: "Please select your smoking status" })
  }),
  alcohol_frequency: z.enum(['never', 'rarely', 'weekly', 'daily', 'multiple_daily'], {
    errorMap: () => ({ message: "Please select how often you consume alcohol" })
  }),
  exercise_frequency: z.enum(['none', 'rarely', '1-2_weekly', '3-4_weekly', '5+_weekly'], {
    errorMap: () => ({ message: "Please select how often you exercise" })
  }),
  exercise_intensity: z.enum(['light', 'moderate', 'vigorous'], {
    errorMap: () => ({ message: "Please select your typical exercise intensity" })
  }),
  stress_level: z.enum(['low', 'moderate', 'high', 'very_high'], {
    errorMap: () => ({ message: "Please rate your current stress level" })
  }),
  
  // Current Medications & Supplements
  current_medications: z.string().max(1000).optional(),
  vitamins_supplements: z.string().max(500).optional(),
  herbal_remedies: z.string().max(500).optional(),
  
  // Quality of Life Impact
  work_productivity_impact: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how symptoms affect your work productivity" })
  }),
  social_activities_impact: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how symptoms affect your social activities" })
  }),
  relationship_impact: z.enum(['0', '1', '2', '3'], {
    errorMap: () => ({ message: "Please rate how symptoms affect your relationships" })
  }),
  overall_wellbeing: z.enum(['excellent', 'good', 'fair', 'poor', 'very_poor'], {
    errorMap: () => ({ message: "Please rate your overall wellbeing" })
  }),
  
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