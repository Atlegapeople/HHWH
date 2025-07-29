'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
  Activity,
  FileText,
  Video,
  Heart,
  Award,
  ArrowRight,
  Plus,
  Zap,
  XCircle
} from 'lucide-react'
import { AppointmentService } from '@/lib/supabase/appointments'
import { PaymentService } from '@/lib/supabase/payments'
import { format } from 'date-fns'

interface DashboardStats {
  todayAppointments: number
  pendingAppointments: number
  totalPatients: number
  monthlyRevenue: number
}

interface TodayAppointment {
  id: string
  patient_name: string
  appointment_time: string
  consultation_type: string
  payment_status: string
  appointment_status: string
}

interface ActivityItem {
  id: string
  type: 'appointment_completed' | 'appointment_booked' | 'payment_received' | 'appointment_cancelled'
  title: string
  description: string
  timestamp: string
  icon: string
  color: string
}

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  // Hardcoded doctor ID for now - will be from auth context later
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9' // Dr. Sarah van der Merwe

  useEffect(() => {
    loadDashboardData()
  }, [])

  const generateRecentActivity = (appointments: any[]): ActivityItem[] => {
    const activities: ActivityItem[] = []
    const now = new Date()
    
    // Sort appointments by created_at or updated_at (most recent first)
    const sortedAppointments = [...appointments]
      .sort((a, b) => new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime())
      .slice(0, 10) // Get last 10 activities
    
    sortedAppointments.forEach(apt => {
      const createdAt = new Date(apt.created_at || apt.updated_at)
      const timeAgo = getTimeAgo(createdAt, now)
      
      // Generate activity based on appointment status and payment status
      if (apt.appointment_status === 'completed') {
        activities.push({
          id: `completed-${apt.id}`,
          type: 'appointment_completed',
          title: 'Appointment completed',
          description: `${apt.consultation_type} consultation with ${apt.patient_name || 'Patient'} - ${timeAgo}`,
          timestamp: timeAgo,
          icon: 'CheckCircle',
          color: 'brand-green'
        })
      } else if (apt.appointment_status === 'scheduled' && apt.payment_status === 'completed') {
        activities.push({
          id: `payment-${apt.id}`,
          type: 'payment_received',
          title: 'Payment received',
          description: `R${apt.consultation_fee || 850} consultation fee processed - ${timeAgo}`,
          timestamp: timeAgo,
          icon: 'Award',
          color: 'brand-purple'
        })
      } else if (apt.appointment_status === 'scheduled') {
        const appointmentDate = new Date(`${apt.appointment_date} ${apt.appointment_time}`)
        const isUpcoming = appointmentDate > now
        activities.push({
          id: `booked-${apt.id}`,
          type: 'appointment_booked',
          title: isUpcoming ? 'New appointment booked' : 'Appointment scheduled',
          description: `${apt.consultation_type} consultation with ${apt.patient_name || 'Patient'} - ${timeAgo}`,
          timestamp: timeAgo,
          icon: 'AlertCircle',
          color: 'brand-amber'
        })
      } else if (apt.appointment_status === 'cancelled') {
        activities.push({
          id: `cancelled-${apt.id}`,
          type: 'appointment_cancelled',
          title: 'Appointment cancelled',
          description: `${apt.consultation_type} consultation with ${apt.patient_name || 'Patient'} - ${timeAgo}`,
          timestamp: timeAgo,
          icon: 'XCircle',
          color: 'brand-red'
        })
      }
    })
    
    return activities.slice(0, 4) // Show only 4 most recent activities
  }
  
  const getTimeAgo = (date: Date, now: Date): string => {
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      return diffInMinutes < 1 ? 'just now' : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const appointmentService = new AppointmentService()

      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Get today's appointments
      const appointments = await appointmentService.getDoctorAppointments(doctorId, today)
      
      // Get all appointments to calculate stats and generate activity
      const allAppointments = await appointmentService.getDoctorAppointments(doctorId)
      
      // Calculate stats
      const todayCount = appointments.length
      const pendingCount = allAppointments.filter(apt => apt.appointment_status === 'scheduled').length
      const uniquePatients = new Set(allAppointments.map(apt => apt.patient_id)).size
      
      // Calculate monthly revenue (simplified)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointment_date)
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
      })
      
      // Estimate revenue (consultation fee * completed appointments)
      const monthlyRevenue = monthlyAppointments.filter(apt => 
        apt.payment_status === 'completed' || apt.payment_status === 'paid'
      ).length * 850 // Default consultation fee
      
      setStats({
        todayAppointments: todayCount,
        pendingAppointments: pendingCount,
        totalPatients: uniquePatients,
        monthlyRevenue
      })

      // Format today's appointments for display
      const formattedAppointments: TodayAppointment[] = appointments.map(apt => ({
        id: apt.id,
        patient_name: apt.patient_name || 'Patient',
        appointment_time: apt.appointment_time,
        consultation_type: apt.consultation_type,
        payment_status: apt.payment_status,
        appointment_status: apt.appointment_status
      }))

      setTodayAppointments(formattedAppointments)
      
      // Generate real activity from appointments
      const activity = generateRecentActivity(allAppointments)
      setRecentActivity(activity)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">Scheduled</Badge>
      case 'cancelled':
        return <Badge className="bg-brand-red/10 text-brand-red border-brand-red/20">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">Paid</Badge>
      case 'pending':
        return <Badge className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">Pending</Badge>
      case 'failed':
        return <Badge className="bg-brand-red/10 text-brand-red border-brand-red/20">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green/10 via-brand-blue/5 to-brand-purple/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-brand-green" />
              </div>
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Welcome back, Dr. Sarah. Here's your day at a glance.</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 px-3 py-1">
              <Activity className="h-3 w-3 mr-1" />
              Active
            </Badge>
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-blue transition-colors">{stats.todayAppointments}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2 from yesterday
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-blue/20">
                <Calendar className="h-7 w-7 text-brand-blue group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-amber/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Appointments</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-amber transition-colors">{stats.pendingAppointments}</p>
                <p className="text-xs text-brand-amber mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-amber/20">
                <Clock className="h-7 w-7 text-brand-amber group-hover:animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-green/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-green transition-colors">{stats.totalPatients}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  Active cases
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                <Users className="h-7 w-7 text-brand-green group-hover:animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-purple/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-purple transition-colors">R{stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% this month
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-purple/20">
                <DollarSign className="h-7 w-7 text-brand-purple group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between text-xl font-heading">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-brand-blue" />
                </div>
                <span>Today's Schedule</span>
              </div>
              <Button variant="outline" size="sm" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all" asChild>
                <a href="/doctor/appointments">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-brand-blue/50" />
                </div>
                <p className="text-muted-foreground font-medium">No appointments scheduled for today</p>
                <p className="text-sm text-muted-foreground mt-1">Take some time to catch up on patient notes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment, index) => (
                  <div key={appointment.id} className="group flex items-center justify-between p-4 border border-border rounded-xl hover:bg-brand-blue/5 transition-all duration-300 hover:border-brand-blue/30">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="font-semibold text-foreground text-lg">
                          {appointment.appointment_time}
                        </div>
                        <div className="text-muted-foreground">
                          {appointment.patient_name} · {appointment.consultation_type}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(appointment.appointment_status)}
                        {getPaymentBadge(appointment.payment_status)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-blue/10">
                        <Video className="h-4 w-4 text-brand-blue" />
                      </Button>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-green/10">
                        <Eye className="h-4 w-4 text-brand-green" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Zap className="h-5 w-5 text-brand-green" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-brand-blue hover:bg-brand-blue/90 text-white h-12 group">
              <Calendar className="mr-3 h-5 w-5 group-hover:animate-pulse" />
              <div className="text-left">
                <div className="font-medium">View Today's Appointments</div>
                <div className="text-xs opacity-90">Manage your schedule</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-brand-green text-brand-green hover:bg-brand-green hover:text-white h-12 group transition-all">
              <Users className="mr-3 h-5 w-5 group-hover:animate-bounce" />
              <div className="text-left">
                <div className="font-medium">Manage Patients</div>
                <div className="text-xs opacity-70">View patient records</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white h-12 group transition-all">
              <TrendingUp className="mr-3 h-5 w-5 group-hover:animate-pulse" />
              <div className="text-left">
                <div className="font-medium">View Reports</div>
                <div className="text-xs opacity-70">Analytics & insights</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start border-brand-amber text-brand-amber hover:bg-brand-amber hover:text-white h-12 group transition-all">
              <FileText className="mr-3 h-5 w-5 group-hover:animate-spin" />
              <div className="text-left">
                <div className="font-medium">Patient Notes</div>
                <div className="text-xs opacity-70">Review & update</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-healthcare border-2 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-heading">
            <div className="w-10 h-10 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-brand-purple" />
            </div>
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="h-10 w-10 text-brand-purple/50" />
              </div>
              <p className="text-muted-foreground font-medium">No recent activity</p>
              <p className="text-sm text-muted-foreground mt-1">Activity will appear here as appointments are created and updated</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon === 'CheckCircle' ? CheckCircle :
                                    activity.icon === 'AlertCircle' ? AlertCircle :
                                    activity.icon === 'Award' ? Award :
                                    activity.icon === 'XCircle' ? XCircle : Activity
                
                return (
                  <div key={activity.id} className={`group flex items-center space-x-4 p-4 bg-gradient-to-r from-${activity.color}/5 to-transparent rounded-xl border border-${activity.color}/20 hover:border-${activity.color}/40 transition-all duration-300`}>
                    <div className={`w-12 h-12 bg-${activity.color}/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent className={`h-6 w-6 text-${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold text-foreground group-hover:text-${activity.color} transition-colors`}>
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className={`text-xs text-${activity.color} font-medium px-2 py-1 bg-${activity.color}/10 rounded-full`}>
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}