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
  Eye
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

export default function DoctorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalPatients: 0,
    monthlyRevenue: 0
  })
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [loading, setLoading] = useState(true)

  // Hardcoded doctor ID for now - will be from auth context later
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9' // Dr. Sarah van der Merwe

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const appointmentService = new AppointmentService()
      const paymentService = new PaymentService()

      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Get today's appointments
      const appointments = await appointmentService.getDoctorAppointments(doctorId, today)
      
      // Get all appointments to calculate stats
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
        apt.payment_status === 'completed'
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
        patient_name: 'Patient', // Will be populated from patient table join
        appointment_time: apt.appointment_time,
        consultation_type: apt.consultation_type,
        payment_status: apt.payment_status,
        appointment_status: apt.appointment_status
      }))

      setTodayAppointments(formattedAppointments)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-light-green-cyan text-gray-800">Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-pale-cyan-blue text-gray-800">Scheduled</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-vivid-green-cyan text-white">Paid</Badge>
      case 'pending':
        return <Badge className="bg-luminous-vivid-amber text-gray-800">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. Sarah. Here's your day at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-bluish-gray">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-pale-cyan-blue rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-vivid-cyan-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-bluish-gray">Pending Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="w-12 h-12 bg-luminous-vivid-amber/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-luminous-vivid-amber" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-bluish-gray">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <div className="w-12 h-12 bg-light-green-cyan/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-vivid-green-cyan" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-bluish-gray">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">R{stats.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-vivid-purple/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-vivid-purple" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Schedule</span>
              <Button variant="outline" size="sm" asChild>
                <a href="/doctor/appointments">View All</a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="font-medium text-gray-900">
                          {appointment.appointment_time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.patient_name} - {appointment.consultation_type}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {getStatusBadge(appointment.appointment_status)}
                        {getPaymentBadge(appointment.payment_status)}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90">
              <Calendar className="mr-2 h-4 w-4" />
              View Today's Appointments
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Manage Patients
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-vivid-green-cyan" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Appointment completed</p>
                <p className="text-sm text-gray-600">Follow-up consultation with Patient A - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-luminous-vivid-amber" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">New appointment booked</p>
                <p className="text-sm text-gray-600">Initial consultation scheduled for tomorrow - 3 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}