'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  CheckCircle
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  const [profile, setProfile] = useState<DoctorProfile>({
    id: 'a5c586a8-4366-4560-884d-7c3b5c379fa9',
    full_name: 'Dr. Sarah van der Merwe',
    specialization: 'Gynaecologist',
    qualification: 'MBChB, FCOG(SA)',
    hpcsa_number: 'HP123456',
    consultation_fee: 850,
    bio: 'Dr. Sarah van der Merwe is a qualified gynaecologist with over 15 years of experience in women\'s health. She specializes in hormone therapy, menopause management, and reproductive health. Dr. van der Merwe is passionate about providing personalized care and helping women navigate their health journey with confidence.',
    profile_image_url: null,
    available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    available_hours: {
      start: '08:00',
      end: '17:00'
    },
    is_active: true,
    email: 'sarah.vandermerwe@hhwh.co.za',
    phone: '+27 11 234 5678',
    practice_address: '123 Medical Centre, Sandton, Johannesburg'
  })

  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    
    try {
      // In real app, this would update the database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600">Manage your professional profile and practice settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {saved && (
            <div className="flex items-center space-x-2 text-vivid-green-cyan">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Saved successfully</span>
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Photo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                    {profile.profile_image_url ? (
                      <img 
                        src={profile.profile_image_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-gray-400" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Personal Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={profile.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">HPCSA Number</label>
                    <Input
                      value={profile.hpcsa_number}
                      onChange={(e) => handleInputChange('hpcsa_number', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Practice Address</label>
                  <Input
                    value={profile.practice_address}
                    onChange={(e) => handleInputChange('practice_address', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Professional Information */}
        <TabsContent value="professional" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Specialization</label>
                  <select
                    value={profile.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vivid-cyan-blue"
                  >
                    {SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Qualifications</label>
                  <Input
                    value={profile.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="e.g., MBChB, FCOG(SA)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Consultation Fee (ZAR)</label>
                  <Input
                    type="number"
                    value={profile.consultation_fee}
                    onChange={(e) => handleInputChange('consultation_fee', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium">About You</label>
                  <Textarea
                    value={profile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell patients about your experience, specializations, and approach to care..."
                    className="mt-1 min-h-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be displayed on your public profile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Availability */}
        <TabsContent value="availability" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Available Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={day}
                        checked={profile.available_days.includes(day)}
                        onChange={(e) => handleAvailableDaysChange(day, e.target.checked)}
                        className="w-4 h-4 text-vivid-cyan-blue rounded focus:ring-vivid-cyan-blue"
                      />
                      <label htmlFor={day} className="text-sm font-medium capitalize">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Working Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={profile.available_hours.start}
                    onChange={(e) => handleAvailableHoursChange('start', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={profile.available_hours.end}
                    onChange={(e) => handleAvailableHoursChange('end', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="p-3 bg-pale-cyan-blue rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-vivid-cyan-blue" />
                    <span className="text-sm font-medium">Current Schedule</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {profile.available_days.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Profile Status</div>
                    <div className="text-sm text-gray-600">Control your profile visibility</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={profile.is_active}
                      onChange={(e) => handleInputChange('is_active', e.target.checked)}
                      className="w-4 h-4 text-vivid-cyan-blue rounded focus:ring-vivid-cyan-blue"
                    />
                    <Badge variant={profile.is_active ? "default" : "secondary"}>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="font-medium">Security</div>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Two-Factor Authentication
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Stethoscope className="h-5 w-5 text-vivid-cyan-blue" />
                    <div>
                      <div className="font-medium">{profile.full_name}</div>
                      <div className="text-sm text-gray-600">{profile.specialization}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-vivid-green-cyan" />
                    <div>
                      <div className="font-medium">R{profile.consultation_fee}</div>
                      <div className="text-sm text-gray-600">Consultation Fee</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-vivid-purple" />
                    <div>
                      <div className="font-medium">{profile.available_days.length} Days/Week</div>
                      <div className="text-sm text-gray-600">Available</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-luminous-vivid-amber" />
                    <div>
                      <div className="font-medium">{profile.hpcsa_number}</div>
                      <div className="text-sm text-gray-600">HPCSA Registration</div>
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