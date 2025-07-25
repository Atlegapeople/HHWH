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
  Video
} from 'lucide-react'
import { AppointmentService } from '@/lib/supabase/appointments'
import { format, parseISO } from 'date-fns'

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
      
      // Get all appointments for the doctor
      const data = await appointmentService.getDoctorAppointments(doctorId)
      
      // Sort by date and time (most recent first)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`)
        const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`)
        return dateB.getTime() - dateA.getTime()
      })

      // Add mock patient data - in real app, this would come from a join query
      const appointmentsWithPatients = sortedData.map(apt => ({
        ...apt,
        patient_name: 'Patient Name', // Will be populated from patients table
        patient_email: 'patient@example.com',
        patient_phone: '+27 12 345 6789'
      }))

      setAppointments(appointmentsWithPatients)
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.consultation_type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.appointment_status === statusFilter)
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(apt => apt.appointment_date === selectedDate)
    }

    setFilteredAppointments(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-light-green-cyan text-gray-800">Completed</Badge>
      case 'scheduled':
        return <Badge className="bg-pale-cyan-blue text-gray-800">Scheduled</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'no-show':
        return <Badge className="bg-luminous-vivid-amber text-gray-800">No Show</Badge>
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your appointments and patient consultations</p>
        </div>
        <Button className="bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search patients or consultation type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-vivid-cyan-blue"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Appointments ({filteredAppointments.length})</span>
            <Button variant="outline" size="sm">
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No appointments found
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
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {appointment.appointment_status === 'scheduled' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                className="text-vivid-green-cyan hover:text-vivid-green-cyan/80"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="text-vivid-red hover:text-vivid-red/80"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-xl font-bold text-pale-cyan-blue">
                  {appointments.filter(apt => apt.appointment_status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-pale-cyan-blue" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xl font-bold text-vivid-green-cyan">
                  {appointments.filter(apt => apt.appointment_status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-vivid-green-cyan" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-xl font-bold text-vivid-red">
                  {appointments.filter(apt => apt.appointment_status === 'cancelled').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-vivid-red" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}