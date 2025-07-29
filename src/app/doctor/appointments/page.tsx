'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Calendar, 
  Search, 
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Video,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  Plus,
  Stethoscope
} from 'lucide-react'
import { AppointmentService } from '@/lib/supabase/appointments'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface AppointmentData {
  id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  consultation_type: string
  payment_status: string
  appointment_status: string
  patient_name?: string
  patient_email?: string
  patient_phone?: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState('')

  // Hardcoded doctor ID for now - will be from auth context later
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9' // Dr. Sarah van der Merwe

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [appointments, searchTerm, statusFilter, selectedDate])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const appointmentService = new AppointmentService()
      
      // Get all appointments for the doctor with patient data
      const data = await appointmentService.getDoctorAppointments(doctorId)
      
      // Sort by date and time (most recent first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
        return dateB.getTime() - dateA.getTime()
      })

      setAppointments(sortedData)
    } catch (error) {
      console.error('Error loading appointments:', error)
      // Show empty state on error
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filter by search term (enhanced search)
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(apt => {
        // Search in patient name
        const patientNameMatch = apt.patient_name?.toLowerCase().includes(searchLower)
        
        // Search in patient email  
        const emailMatch = apt.patient_email?.toLowerCase().includes(searchLower)
        
        // Search in consultation type
        const consultationMatch = apt.consultation_type?.toLowerCase().includes(searchLower)
        
        // Search in symptoms description
        const symptomsMatch = apt.symptoms_description?.toLowerCase().includes(searchLower)
        
        // Search in appointment date (formatted)
        const dateMatch = apt.appointment_date?.includes(searchLower)
        
        // Search in appointment time
        const timeMatch = apt.appointment_time?.includes(searchLower)
        
        // Search in payment status
        const paymentMatch = apt.payment_status?.toLowerCase().includes(searchLower)
        
        // Search in appointment status
        const statusMatch = apt.appointment_status?.toLowerCase().includes(searchLower)

        return patientNameMatch || emailMatch || consultationMatch || 
               symptomsMatch || dateMatch || timeMatch || 
               paymentMatch || statusMatch
      })
    }

    // Filter by status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.appointment_status === statusFilter)
    }

    // Filter by date
    if (selectedDate && selectedDate.trim()) {
      filtered = filtered.filter(apt => apt.appointment_date === selectedDate)
    }

    // Sort filtered results by newest first (date + time)
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.appointment_date} ${a.appointment_time}`)
      const dateTimeB = new Date(`${b.appointment_date} ${b.appointment_time}`)
      return dateTimeB.getTime() - dateTimeA.getTime()
    })

    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">Scheduled</Badge>
      case 'cancelled':
        return <Badge className="bg-brand-red/10 text-brand-red border-brand-red/20">Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">No Show</Badge>
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

  const getConsultationIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />
  }

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentService = new AppointmentService()
      await appointmentService.updateAppointmentStatus(appointmentId, newStatus)
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, appointment_status: newStatus }
            : apt
        )
      )
    } catch (error) {
      console.error('Error updating appointment status:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-brand-blue/10 via-brand-green/5 to-brand-purple/10 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-6 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
        
        {/* Filters Skeleton */}
        <Card className="card-healthcare border-2">
          <CardContent className="p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="flex gap-3">
                <div className="w-32 h-10 bg-gray-200 rounded"></div>
                <div className="w-32 h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Table Skeleton */}
        <Card className="card-healthcare border-2">
          <CardHeader className="pb-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-2xl"></div>
                <div className="h-6 bg-gray-300 rounded w-48"></div>
              </div>
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </CardHeader>
          <CardContent className="animate-pulse">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue/10 via-brand-green/5 to-brand-purple/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-brand-blue" />
              </div>
              Appointments
            </h1>
            <p className="text-muted-foreground mt-2">Manage your appointments and patient consultations with ease</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Appointments</p>
              <p className="text-2xl font-bold text-brand-blue">{appointments.length}</p>
            </div>
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-blue/60 h-4 w-4" />
                <Input
                  placeholder="Search patients, symptoms, dates, status, or consultation type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-brand-blue/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Table */}
      <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-heading">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Activity className="h-5 w-5 text-brand-green" />
              </div>
              <span>Appointments ({filteredAppointments.length}{appointments.length !== filteredAppointments.length ? ` of ${appointments.length}` : ''})</span>
              {(searchTerm || statusFilter !== 'all' || selectedDate) && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-amber rounded-full animate-pulse"></div>
                  <span className="text-xs text-brand-amber font-medium">Filtered</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-all">
              <Filter className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-4">
                          <Calendar className="h-10 w-10 text-brand-blue/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No appointments found</h3>
                        <p className="text-muted-foreground mb-4">
                          {appointments.length === 0 
                            ? "You don't have any appointments yet. Patients can book consultations with you through the platform."
                            : "No appointments match your current filters. Try adjusting your search criteria."
                          }
                        </p>
                        {appointments.length === 0 && (
                          <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Schedule First Appointment
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {appointment.appointment_time}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{appointment.patient_name}</span>
                          <span className="text-sm text-gray-500">{appointment.patient_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getConsultationIcon(appointment.consultation_type)}
                          <span className="capitalize">{appointment.consultation_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.appointment_status)}
                      </TableCell>
                      <TableCell>
                        {getPaymentBadge(appointment.payment_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="hover:bg-brand-blue/10 text-brand-blue">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {appointment.appointment_status === 'scheduled' && (
                            <>
                              <Link href={`/doctor/consultation/${appointment.id}`}>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-brand-purple hover:text-white hover:bg-brand-purple transition-all duration-300"
                                  title="Join consultation room"
                                >
                                  <Stethoscope className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                className="text-brand-green hover:text-brand-green/80 hover:bg-brand-green/10"
                                title="Mark as completed"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="text-brand-red hover:text-brand-red/80 hover:bg-brand-red/10"
                                title="Cancel appointment"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-blue transition-colors">{appointments.length}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All time
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
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-amber transition-colors">
                  {appointments.filter(apt => apt.appointment_status === 'scheduled').length}
                </p>
                <p className="text-xs text-brand-amber mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Upcoming
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
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-green transition-colors">
                  {appointments.filter(apt => apt.appointment_status === 'completed').length}
                </p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Successful
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                <CheckCircle className="h-7 w-7 text-brand-green group-hover:animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-red/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-red transition-colors">
                  {appointments.filter(apt => apt.appointment_status === 'cancelled').length}
                </p>
                <p className="text-xs text-brand-red mt-1 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelled
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-red/20">
                <XCircle className="h-7 w-7 text-brand-red group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}