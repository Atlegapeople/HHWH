'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  Globe,
  Shield,
  Bell,
  Mail,
  Phone,
  Clock,
  Banknote,
  Users,
  Database,
  Server,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface PlatformSettings {
  siteName: string
  siteDescription: string
  supportEmail: string
  supportPhone: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  appointmentBookingEnabled: boolean
  defaultConsultationFee: number
  maxAppointmentsPerDay: number
  appointmentDuration: number
  businessHours: {
    start: string
    end: string
  }
  timeZone: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  doctorApprovalAlerts: boolean
  appointmentReminders: boolean
  paymentNotifications: boolean
}

interface SecuritySettings {
  twoFactorAuth: boolean
  passwordExpiry: number
  sessionTimeout: number
  ipWhitelist: string[]
  auditLogging: boolean
}

export default function AdminSettingsPage() {
  const [currentTab, setCurrentTab] = useState('platform')
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteName: 'HHWH Online Clinic',
    siteDescription: 'Women\'s Hormone Health Online Clinic - Expert care for South African women',
    supportEmail: 'support@hhwh.co.za',
    supportPhone: '+27 11 123 4567',
    maintenanceMode: false,
    registrationEnabled: true,
    appointmentBookingEnabled: true,
    defaultConsultationFee: 850,
    maxAppointmentsPerDay: 50,
    appointmentDuration: 30,
    businessHours: {
      start: '08:00',
      end: '17:00'
    },
    timeZone: 'Africa/Johannesburg'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    doctorApprovalAlerts: true,
    appointmentReminders: true,
    paymentNotifications: true
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    passwordExpiry: 90,
    sessionTimeout: 120,
    ipWhitelist: [],
    auditLogging: true
  })

  const handleSaveSettings = async (section: string) => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('Settings saved successfully', {
        description: `${section} settings have been updated.`,
        duration: 4000
      })
    } catch (error) {
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support.',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset platform settings to defaults
      setPlatformSettings({
        siteName: 'HHWH Online Clinic',
        siteDescription: 'Women\'s Hormone Health Online Clinic - Expert care for South African women',
        supportEmail: 'support@hhwh.co.za',
        supportPhone: '+27 11 123 4567',
        maintenanceMode: false,
        registrationEnabled: true,
        appointmentBookingEnabled: true,
        defaultConsultationFee: 850,
        maxAppointmentsPerDay: 50,
        appointmentDuration: 30,
        businessHours: {
          start: '08:00',
          end: '17:00'
        },
        timeZone: 'Africa/Johannesburg'
      })
      
      toast.success('Settings reset to defaults', {
        description: 'All settings have been restored to their default values.',
        duration: 4000
      })
    } catch (error) {
      toast.error('Failed to reset settings', {
        description: 'Please try again or contact support.',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            System Settings
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Configure platform settings and system preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-brand-red via-brand-red to-brand-red/90 text-white border-0 px-6 py-3 shadow-lg rounded-2xl text-sm font-semibold">
            <Settings className="w-5 h-5 mr-2" />
            Admin Settings
          </Badge>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 rounded-3xl shadow-xl border border-gray-100 h-auto">
          <TabsTrigger 
            value="platform" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue data-[state=active]:via-brand-blue data-[state=active]:to-brand-blue/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Platform</span>
            <span className="sm:hidden">Platform</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:via-brand-green data-[state=active]:to-brand-green/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Bell className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Alerts</span>
          </TabsTrigger>
          <TabsTrigger 
            value="security"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red data-[state=active]:via-brand-red data-[state=active]:to-brand-red/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger 
            value="system"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-amber data-[state=active]:via-brand-amber data-[state=active]:to-brand-amber/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Server className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-8 mt-8">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-2xl shadow-lg flex-shrink-0">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">Platform Configuration</h3>
                  <p className="text-sm text-muted-foreground mt-1">Basic platform settings and information</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="siteName" className="text-base font-semibold text-foreground">Site Name</Label>
                    <Input
                      id="siteName"
                      value={platformSettings.siteName}
                      onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="siteDescription" className="text-base font-semibold text-foreground">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={platformSettings.siteDescription}
                      onChange={(e) => setPlatformSettings({...platformSettings, siteDescription: e.target.value})}
                      className="mt-2 rounded-xl border-2 border-gray-200 focus:border-brand-blue min-h-20"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supportEmail" className="text-base font-semibold text-foreground">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={platformSettings.supportEmail}
                      onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supportPhone" className="text-base font-semibold text-foreground">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={platformSettings.supportPhone}
                      onChange={(e) => setPlatformSettings({...platformSettings, supportPhone: e.target.value})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="consultationFee" className="text-base font-semibold text-foreground">Default Consultation Fee (ZAR)</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      value={platformSettings.defaultConsultationFee}
                      onChange={(e) => setPlatformSettings({...platformSettings, defaultConsultationFee: parseInt(e.target.value)})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maxAppointments" className="text-base font-semibold text-foreground">Max Appointments Per Day</Label>
                    <Input
                      id="maxAppointments"
                      type="number"
                      value={platformSettings.maxAppointmentsPerDay}
                      onChange={(e) => setPlatformSettings({...platformSettings, maxAppointmentsPerDay: parseInt(e.target.value)})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="appointmentDuration" className="text-base font-semibold text-foreground">Appointment Duration (minutes)</Label>
                    <Input
                      id="appointmentDuration"
                      type="number"
                      value={platformSettings.appointmentDuration}
                      onChange={(e) => setPlatformSettings({...platformSettings, appointmentDuration: parseInt(e.target.value)})}
                      className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessStart" className="text-base font-semibold text-foreground">Business Hours Start</Label>
                      <Input
                        id="businessStart"
                        type="time"
                        value={platformSettings.businessHours.start}
                        onChange={(e) => setPlatformSettings({
                          ...platformSettings, 
                          businessHours: {...platformSettings.businessHours, start: e.target.value}
                        })}
                        className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessEnd" className="text-base font-semibold text-foreground">Business Hours End</Label>
                      <Input
                        id="businessEnd"
                        type="time"
                        value={platformSettings.businessHours.end}
                        onChange={(e) => setPlatformSettings({
                          ...platformSettings, 
                          businessHours: {...platformSettings.businessHours, end: e.target.value}
                        })}
                        className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-blue"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Platform Toggles */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-bold text-foreground mb-6">Platform Controls</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div>
                      <Label className="text-base font-semibold text-foreground">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable site access</p>
                    </div>
                    <Switch
                      checked={platformSettings.maintenanceMode}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, maintenanceMode: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div>
                      <Label className="text-base font-semibold text-foreground">User Registration</Label>
                      <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                    </div>
                    <Switch
                      checked={platformSettings.registrationEnabled}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, registrationEnabled: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div>
                      <Label className="text-base font-semibold text-foreground">Appointment Booking</Label>
                      <p className="text-sm text-muted-foreground">Enable appointment scheduling</p>
                    </div>
                    <Switch
                      checked={platformSettings.appointmentBookingEnabled}
                      onCheckedChange={(checked) => setPlatformSettings({...platformSettings, appointmentBookingEnabled: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-8">
                <Button 
                  onClick={() => handleSaveSettings('Platform')}
                  disabled={loading}
                  className="bg-gradient-to-r from-brand-blue to-brand-blue/80 hover:from-brand-blue/90 hover:to-brand-blue/70 text-white px-8 py-3 rounded-2xl font-semibold"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetToDefaults}
                  disabled={loading}
                  className="border-2 border-gray-300 hover:bg-gray-50 px-8 py-3 rounded-2xl font-semibold"
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-8 mt-8">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg flex-shrink-0">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">Configure system notifications and alerts</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-foreground">General Notifications</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-brand-blue" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-brand-green" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5 text-brand-red" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-lg font-bold text-foreground">Event Notifications</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-brand-amber" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">Doctor Approval Alerts</Label>
                        <p className="text-sm text-muted-foreground">New doctor registration alerts</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.doctorApprovalAlerts}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, doctorApprovalAlerts: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-brand-blue" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">Appointment Reminders</Label>
                        <p className="text-sm text-muted-foreground">Automatic appointment reminders</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.appointmentReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, appointmentReminders: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <Banknote className="w-5 h-5 text-brand-green" />
                      <div>
                        <Label className="text-base font-semibold text-foreground">Payment Notifications</Label>
                        <p className="text-sm text-muted-foreground">Payment status updates</p>
                      </div>
                    </div>
                    <Switch
                      checked={notificationSettings.paymentNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, paymentNotifications: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mt-8">
                <Button 
                  onClick={() => handleSaveSettings('Notification')}
                  disabled={loading}
                  className="bg-gradient-to-r from-brand-green to-brand-green/80 hover:from-brand-green/90 hover:to-brand-green/70 text-white px-8 py-3 rounded-2xl font-semibold"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-8 mt-8">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-2xl shadow-lg flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mt-1">Configure security and access controls</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-brand-red/5 to-brand-red/10 rounded-2xl border border-brand-red/20">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="w-6 h-6 text-brand-red" />
                    <div>
                      <h4 className="text-lg font-bold text-foreground">Security Notice</h4>
                      <p className="text-sm text-muted-foreground">These settings affect platform security. Changes require admin verification.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                      <div>
                        <Label className="text-base font-semibold text-foreground">Two-Factor Authentication</Label>
                        <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                      <div>
                        <Label className="text-base font-semibold text-foreground">Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">Log all admin activities</p>
                      </div>
                      <Switch
                        checked={securitySettings.auditLogging}
                        onCheckedChange={(checked) => setSecuritySettings({...securitySettings, auditLogging: checked})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="passwordExpiry" className="text-base font-semibold text-foreground">Password Expiry (days)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: parseInt(e.target.value)})}
                        className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-red"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sessionTimeout" className="text-base font-semibold text-foreground">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                        className="mt-2 h-12 rounded-xl border-2 border-gray-200 focus:border-brand-red"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-8">
                  <Button 
                    onClick={() => handleSaveSettings('Security')}
                    disabled={loading}
                    className="bg-gradient-to-r from-brand-red to-brand-red/80 hover:from-brand-red/90 hover:to-brand-red/70 text-white px-8 py-3 rounded-2xl font-semibold"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-8 mt-8">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-brand-amber to-brand-amber/80 rounded-2xl shadow-lg flex-shrink-0">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-foreground">System Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">Platform status and system details</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Database className="w-5 h-5 text-brand-blue" />
                      <h4 className="text-lg font-bold text-foreground">Database Status</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Connection</span>
                        <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Version</span>
                        <span className="text-sm font-medium">PostgreSQL 15.2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Storage Used</span>
                        <span className="text-sm font-medium">2.4 GB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Key className="w-5 h-5 text-brand-red" />
                      <h4 className="text-lg font-bold text-foreground">API Configuration</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Supabase API Key</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            type={showApiKey ? "text" : "password"}
                            value="sb-dlmyhufck...rnj"
                            readOnly
                            className="h-10 rounded-xl border-2 border-gray-200 font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="h-10 w-10 p-0 rounded-xl border-2"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-3 mb-4">
                      <Server className="w-5 h-5 text-brand-green" />
                      <h4 className="text-lg font-bold text-foreground">Server Status</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Uptime</span>
                        <span className="text-sm font-medium">99.9%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Backup</span>
                        <span className="text-sm font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 rounded-2xl border border-brand-blue/20">
                    <div className="flex items-center space-x-3 mb-4">
                      <Info className="w-5 h-5 text-brand-blue" />
                      <h4 className="text-lg font-bold text-foreground">Platform Info</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Version</span>
                        <span className="text-sm font-medium">HHWH v1.2.0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Environment</span>
                        <Badge className="bg-gradient-to-r from-brand-blue to-brand-blue/80 text-white border-0">
                          Production
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Region</span>
                        <span className="text-sm font-medium">South Africa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}