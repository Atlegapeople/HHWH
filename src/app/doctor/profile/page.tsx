'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Stethoscope,
  DollarSign,
  Clock,
  Calendar,
  Save,
  Upload,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  Edit,
  Camera,
  Star,
  Award,
  Heart,
  Activity
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

interface DoctorProfile {
  id: string
  full_name: string
  specialization: string
  qualification: string
  hpcsa_number: string
  consultation_fee: number
  bio: string
  profile_image_url: string | null
  available_days: string[]
  available_hours: {
    start: string
    end: string
  }
  is_active: boolean
  email: string
  phone: string
  practice_address: string
}

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

const SPECIALIZATIONS = [
  'Endocrinologist',
  'Gynaecologist', 
  'General Practitioner',
  'Integrative Medicine',
  'Reproductive Endocrinologist',
  'Internal Medicine'
]

export default function DoctorProfilePage() {
  // Start with empty profile - let the API load the correct user's data
  const [profile, setProfile] = useState<DoctorProfile>({
    id: '',
    full_name: '',
    specialization: 'General Practitioner',
    qualification: '',
    hpcsa_number: '',
    consultation_fee: 850,
    bio: '',
    profile_image_url: null,
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    available_hours: {
      start: '08:00',
      end: '17:00'
    },
    is_active: true,
    email: '',
    phone: '',
    practice_address: ''
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { user } = useAuth()
  const supabase = createClient()

  // Load the actual user's profile data
  useEffect(() => {
    if (!user) return
    
    const loadProfile = async () => {
      try {
        console.log('Loading profile for user:', user.email)
        const response = await fetch('/api/doctors/profile')
        if (response.ok) {
          const data = await response.json()
          console.log('Loaded profile data:', data.profile)
          if (data.profile) {
            setProfile(data.profile)
          } else {
            console.log('No profile found - user can create one by saving')
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    
    loadProfile()
  }, [user]) // Depend on user so it loads when user is available

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!profile.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!profile.email.trim()) newErrors.email = 'Email is required'
    if (!profile.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!profile.hpcsa_number.trim()) newErrors.hpcsa_number = 'HPCSA number is required'
    if (!profile.specialization) newErrors.specialization = 'Specialization is required'
    if (!profile.consultation_fee || profile.consultation_fee <= 0) newErrors.consultation_fee = 'Valid consultation fee is required'
    if (!profile.bio.trim()) newErrors.bio = 'Professional bio is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setErrors({}) // Clear any previous errors
    
    try {
      const response = await fetch('/api/doctors/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })
      
      if (!response.ok) {
        const responseText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(responseText)
        } catch {
          errorData = { error: responseText }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Just show success - don't touch the profile state
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ general: `Failed to save profile: ${error instanceof Error ? error.message : 'Unknown error'}` })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof DoctorProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvailableDaysChange = (day: string, checked: boolean) => {
    const updatedDays = checked 
      ? [...profile.available_days, day]
      : profile.available_days.filter(d => d !== day)
    
    setProfile(prev => ({
      ...prev,
      available_days: updatedDays
    }))
  }

  const handleAvailableHoursChange = (type: 'start' | 'end', value: string) => {
    setProfile(prev => ({
      ...prev,
      available_hours: {
        ...prev.available_hours,
        [type]: value
      }
    }))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue/10 via-brand-green/5 to-brand-blue/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-brand-blue" />
              </div>
              Profile Management
            </h1>
            <p className="text-muted-foreground mt-2">Manage your professional profile and practice settings</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {saved && (
              <div className="flex items-center gap-2 text-brand-green bg-brand-green/10 px-3 py-2 rounded-xl">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Saved successfully</span>
              </div>
            )}
            {errors.general && (
              <div className="flex items-center gap-2 text-brand-red bg-brand-red/10 px-3 py-2 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{errors.general}</span>
              </div>
            )}
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-brand-blue hover:bg-brand-blue/90 text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white border-2 border-brand-blue/10 rounded-2xl p-2">
          <TabsTrigger 
            value="personal" 
            className="data-[state=active]:bg-brand-blue data-[state=active]:text-white rounded-xl transition-all duration-300"
          >
            Personal Info
          </TabsTrigger>
          <TabsTrigger 
            value="professional" 
            className="data-[state=active]:bg-brand-green data-[state=active]:text-white rounded-xl transition-all duration-300"
          >
            Professional
          </TabsTrigger>
          <TabsTrigger 
            value="availability" 
            className="data-[state=active]:bg-brand-amber data-[state=active]:text-white rounded-xl transition-all duration-300"
          >
            Availability
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-brand-red data-[state=active]:text-white rounded-xl transition-all duration-300"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-blue/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Camera className="h-5 w-5 text-brand-blue" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 ring-4 ring-brand-blue/20 group-hover:ring-brand-blue/40 transition-all duration-300">
                      <AvatarImage src={profile.profile_image_url || undefined} alt={profile.full_name} />
                      <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-2xl">
                        {profile.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all duration-300"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 2MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="lg:col-span-2 card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-green/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Edit className="h-5 w-5 text-brand-green" />
                  Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <Input
                      value={profile.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.full_name ? 'border-brand-red' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.full_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.email ? 'border-brand-red' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.phone ? 'border-brand-red' : ''}`}
                      placeholder="+27 11 123 4567"
                    />
                    {errors.phone && (
                      <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">HPCSA Number</label>
                    <Input
                      value={profile.hpcsa_number}
                      onChange={(e) => handleInputChange('hpcsa_number', e.target.value)}
                      className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.hpcsa_number ? 'border-brand-red' : ''}`}
                      placeholder="HP123456"
                    />
                    {errors.hpcsa_number && (
                      <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.hpcsa_number}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Practice Address</label>
                  <Input
                    value={profile.practice_address}
                    onChange={(e) => handleInputChange('practice_address', e.target.value)}
                    className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.practice_address ? 'border-brand-red' : ''}`}
                    placeholder="123 Medical Centre, Sandton, Johannesburg"
                  />
                  {errors.practice_address && (
                    <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.practice_address}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Professional Information */}
        <TabsContent value="professional" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-green/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-brand-green" />
                  Professional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm font-medium text-foreground">Specialization</label>
                  <select
                    value={profile.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className={`w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-300 ${errors.specialization ? 'border-brand-red focus:ring-brand-red/20' : 'border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20'}`}
                  >
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Qualifications</label>
                  <Input
                    value={profile.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="e.g., MBChB, FCOG(SA)"
                    className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.qualification ? 'border-brand-red' : ''}`}
                  />
                  {errors.qualification && (
                    <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.qualification}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Consultation Fee (ZAR)</label>
                  <Input
                    type="number"
                    value={profile.consultation_fee}
                    onChange={(e) => handleInputChange('consultation_fee', parseFloat(e.target.value))}
                    className={`mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20 ${errors.consultation_fee ? 'border-brand-red' : ''}`}
                    placeholder="850"
                  />
                  {errors.consultation_fee && (
                    <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.consultation_fee}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare border-2 hover:border-brand-amber/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-amber/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Award className="h-5 w-5 text-brand-amber" />
                  Professional Bio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div>
                  <label className="text-sm font-medium text-foreground">About You</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell patients about your experience, specializations, and approach to care..."
                    className={`mt-1 min-h-32 border-brand-amber/20 focus:border-brand-amber focus:ring-brand-amber/20 ${errors.bio ? 'border-brand-red' : ''}`}
                  />
                  {errors.bio && (
                    <p className="text-xs text-brand-red mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.bio}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">This will be displayed on your public profile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Availability */}
        <TabsContent value="availability" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-healthcare border-2 hover:border-brand-amber/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-amber/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-amber" />
                  Available Days
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={day}
                        checked={profile.available_days.includes(day)}
                        onChange={(e) => handleAvailableDaysChange(day, e.target.checked)}
                        className="w-4 h-4 text-brand-amber rounded focus:ring-brand-amber border-brand-amber/30"
                      />
                      <label htmlFor={day} className="text-sm font-medium capitalize text-foreground cursor-pointer">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-green/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Clock className="h-5 w-5 text-brand-green" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div>
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={profile.available_hours.start}
                    onChange={(e) => handleAvailableHoursChange('start', e.target.value)}
                    className="mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">End Time</label>
                  <Input
                    type="time"
                    value={profile.available_hours.end}
                    onChange={(e) => handleAvailableHoursChange('end', e.target.value)}
                    className="mt-1 border-brand-green/20 focus:border-brand-green focus:ring-brand-green/20"
                  />
                </div>
                <div className="p-4 bg-brand-green/5 rounded-xl border border-brand-green/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-brand-green" />
                    <span className="text-sm font-medium text-brand-green">Current Schedule</span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {profile.available_days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {profile.available_hours.start} - {profile.available_hours.end}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-healthcare border-2 hover:border-brand-red/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-red/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Settings className="h-5 w-5 text-brand-red" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between p-4 bg-brand-red/5 rounded-xl border border-brand-red/20">
                  <div>
                    <div className="font-medium text-foreground">Profile Status</div>
                    <div className="text-sm text-muted-foreground">Control your profile visibility</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={profile.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-brand-green rounded focus:ring-brand-green border-brand-green/30"
                    />
                    <Badge 
                      className={profile.is_active 
                        ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                        : 'bg-brand-red/10 text-brand-red border-brand-red/20'
                      }
                    >
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t border-brand-red/10 pt-4">
                  <div className="space-y-3">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-brand-red" />
                      Security
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white transition-all duration-300"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start border-brand-amber/20 text-brand-amber hover:bg-brand-amber hover:text-white transition-all duration-300"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300">
              <CardHeader className="border-b border-brand-blue/10">
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Star className="h-5 w-5 text-brand-blue" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-brand-blue/5 rounded-xl">
                    <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-brand-blue" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{profile.full_name}</div>
                      <div className="text-sm text-brand-blue">{profile.specialization}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-brand-green/5 rounded-xl">
                    <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center">
                      <span className="text-brand-green font-bold text-sm">R</span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">R{profile.consultation_fee}</div>
                      <div className="text-sm text-brand-green">Rand - Consultation Fee</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-brand-amber/5 rounded-xl">
                    <div className="w-10 h-10 bg-brand-amber/10 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-brand-amber" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{profile.available_days.length} Days/Week</div>
                      <div className="text-sm text-brand-amber">Available</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-brand-red/5 rounded-xl">
                    <div className="w-10 h-10 bg-brand-red/10 rounded-xl flex items-center justify-center">
                      <Shield className="h-5 w-5 text-brand-red" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{profile.hpcsa_number}</div>
                      <div className="text-sm text-brand-red">HPCSA Registration</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}