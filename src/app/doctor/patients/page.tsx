'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Search, 
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  Clock,
  Plus,
  Save,
  TrendingUp,
  Activity
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface PatientData {
  id: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  medical_aid_scheme: string | null
  medical_aid_number?: string | null
  address?: {
    street_address?: string | null
    city?: string | null
    province?: string | null
    postal_code?: string | null
    country?: string | null
  }
  emergency_contact?: {
    name?: string | null
    phone?: string | null
    relationship?: string | null
  }
  profile_photo_url?: string | null
  appointments: AppointmentData[]
  lastAppointment?: string
  firstAppointment?: {
    date: string
    time: string
  } | null
  totalAppointments: number
  completedAppointments?: number
  scheduledAppointments?: number
  totalRevenue?: number
  assessmentData?: any
}

interface AppointmentData {
  id: string
  appointment_date: string
  appointment_time: string
  consultation_type: string
  appointment_status: string
  payment_status: string
  symptoms_description?: string
  current_medications?: string
  allergies?: string
}

interface ConsultationNote {
  id: string
  appointment_id: string
  notes: string
  diagnosis: string
  treatment_plan: string
  follow_up_date: string | null
  created_at: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientData[]>([])
  const [filteredPatients, setFilteredPatients] = useState<PatientData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null)
  const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([])
  const [newNote, setNewNote] = useState({
    notes: '',
    diagnosis: '',
    treatment_plan: '',
    follow_up_date: ''
  })

  // Hardcoded doctor ID for now
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9'

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [patients, searchTerm])

  const loadPatients = async () => {
    try {
      setLoading(true)
      
      // Use the new API route to fetch real patient data
      const response = await fetch(`/api/patients/doctor/${doctorId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch patient data')
      }
      
      const patientsData = await response.json()
      
      // Transform data to match component expectations
      const transformedPatients = patientsData.map((patient: any) => ({
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        medical_aid_scheme: patient.medical_aid_scheme,
        medical_aid_number: patient.medical_aid_number,
        address: patient.address,
        emergency_contact: patient.emergency_contact,
        profile_photo_url: patient.profile_photo_url,
        appointments: patient.appointments,
        totalAppointments: patient.totalAppointments,
        completedAppointments: patient.completedAppointments,
        scheduledAppointments: patient.scheduledAppointments,
        totalRevenue: patient.totalRevenue,
        firstAppointment: patient.firstAppointment,
        lastAppointment: patient.lastAppointment ? 
          `${patient.lastAppointment.date} ${patient.lastAppointment.time}` : 
          undefined,
        assessmentData: patient.assessmentData // Real assessment data if available
      }))

      setPatients(transformedPatients)
    } catch (error) {
      console.error('Error loading patients:', error)
      // Set empty array on error to show proper empty state
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered = [...patients]

    if (searchTerm) {
      filtered = filtered.filter(patient => 
        patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPatients(filtered)
  }

  const loadConsultationNotes = async (patientId: string) => {
    try {
      // In a real app, this would fetch consultation notes from the database
      // For now, we'll start with an empty array until the notes API is implemented
      const response = await fetch(`/api/consultation-notes/${patientId}`)
      
      if (response.ok) {
        const notes = await response.json()
        setConsultationNotes(notes)
      } else {
        // If API doesn't exist yet, show empty state
        setConsultationNotes([])
      }
    } catch (error) {
      console.log('Consultation notes API not yet implemented')
      setConsultationNotes([])
    }
  }

  const handlePatientSelect = (patient: PatientData) => {
    setSelectedPatient(patient)
    loadConsultationNotes(patient.id)
  }

  const handleSaveNote = async () => {
    if (!selectedPatient || !newNote.notes.trim()) return

    // In real app, this would save to database
    const note: ConsultationNote = {
      id: Date.now().toString(),
      appointment_id: selectedPatient.appointments[0]?.id || '',
      notes: newNote.notes,
      diagnosis: newNote.diagnosis,
      treatment_plan: newNote.treatment_plan,
      follow_up_date: newNote.follow_up_date || null,
      created_at: new Date().toISOString()
    }

    setConsultationNotes(prev => [note, ...prev])
    setNewNote({
      notes: '',
      diagnosis: '',
      treatment_plan: '',
      follow_up_date: ''
    })
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

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-brand-green/10 via-brand-blue/5 to-brand-purple/10 rounded-2xl p-6 animate-pulse">
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
              <div className="h-8 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
        </div>
        
        {/* Search Skeleton */}
        <Card className="card-healthcare border-2">
          <CardContent className="p-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded"></div>
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
              <div className="h-8 bg-gray-300 rounded w-32"></div>
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
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-healthcare border-2">
              <CardContent className="p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="w-14 h-14 bg-gray-300 rounded-2xl"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <Users className="h-6 w-6 text-brand-green" />
              </div>
              Patients
            </h1>
            <p className="text-muted-foreground mt-2">Manage your patients and view their comprehensive medical records</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Patients</p>
              <p className="text-2xl font-bold text-brand-green">{patients.length}</p>
            </div>
            <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/30 px-3 py-1">
              <Activity className="h-3 w-3 mr-1" />
              {filteredPatients.length} Active
            </Badge>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-blue/60 h-4 w-4" />
            <Input
              placeholder="Search patients by name, email, or medical aid..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-xl font-heading">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-brand-green" />
              </div>
              <span>Patient Records ({filteredPatients.length}{patients.length !== filteredPatients.length ? ` of ${patients.length}` : ''})</span>
              {searchTerm && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-brand-amber rounded-full animate-pulse"></div>
                  <span className="text-xs text-brand-amber font-medium">Filtered</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="border-brand-green text-brand-green hover:bg-brand-green hover:text-white transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Medical Aid</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Total Appointments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4">
                          <Users className="h-10 w-10 text-brand-green/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
                        <p className="text-muted-foreground mb-4">
                          {patients.length === 0 
                            ? "You don't have any patients yet. Patients will appear here once they book consultations."
                            : "No patients match your current search. Try adjusting your search terms."
                          }
                        </p>
                        {patients.length === 0 && (
                          <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                            <Plus className="mr-2 h-4 w-4" />
                            Invite First Patient
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{patient.full_name}</span>
                          <span className="text-sm text-gray-500">
                            {patient.gender} • {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} years old
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span>{patient.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{patient.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.medical_aid_scheme ? (
                          <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">{patient.medical_aid_scheme}</Badge>
                        ) : (
                          <Badge className="bg-brand-amber/10 text-brand-amber border-brand-amber/20">Cash Patient</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {patient.lastAppointment ? (
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(parseISO(patient.lastAppointment.split(' ')[0]), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {patient.lastAppointment.split(' ')[1]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No visits</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">
                          {patient.totalAppointments}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handlePatientSelect(patient)}
                              className="hover:bg-brand-blue/10 text-brand-blue"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto bg-white border-2 border-brand-blue/20 shadow-2xl">
                            <DialogHeader className="border-b border-brand-blue/10 pb-4 mb-6">
                              <DialogTitle className="flex items-center gap-3 text-2xl font-heading">
                                <div className="w-12 h-12 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                                  <Heart className="h-6 w-6 text-brand-green" />
                                </div>
                                <div>
                                  <span className="text-foreground">{selectedPatient?.full_name}</span>
                                  <p className="text-sm text-muted-foreground font-normal mt-1">Patient Medical Record</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedPatient && (
                              <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 bg-brand-blue/5 border border-brand-blue/20 p-1 rounded-xl">
                                  <TabsTrigger 
                                    value="overview"
                                    className="data-[state=active]:bg-brand-blue data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg font-medium"
                                  >
                                    Overview
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="appointments"
                                    className="data-[state=active]:bg-brand-green data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg font-medium"
                                  >
                                    Appointments
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="notes"
                                    className="data-[state=active]:bg-brand-purple data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg font-medium"
                                  >
                                    Notes
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="assessment"
                                    className="data-[state=active]:bg-brand-amber data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg font-medium"
                                  >
                                    Assessment
                                  </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-6 mt-8">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Card className="card-healthcare border-2 border-brand-blue/20 hover:border-brand-blue/40 transition-all duration-300 hover:shadow-lg">
                                      <CardContent className="p-6">
                                        <h4 className="font-heading font-semibold mb-4 text-lg flex items-center gap-2">
                                          <div className="w-8 h-8 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                                            <Users className="h-4 w-4 text-brand-blue" />
                                          </div>
                                          Personal Information
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                          <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{selectedPatient.email}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{selectedPatient.phone}</span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>{format(parseISO(selectedPatient.date_of_birth), 'MMM dd, yyyy')}</span>
                                          </div>
                                          {selectedPatient.address && (selectedPatient.address.city || selectedPatient.address.province) && (
                                            <div className="flex items-start space-x-2">
                                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                              <div>
                                                {selectedPatient.address.street_address && (
                                                  <div>{selectedPatient.address.street_address}</div>
                                                )}
                                                <div>
                                                  {selectedPatient.address.city}
                                                  {selectedPatient.address.city && selectedPatient.address.province && ', '}
                                                  {selectedPatient.address.province}
                                                </div>
                                                {selectedPatient.address.postal_code && (
                                                  <div>{selectedPatient.address.postal_code}</div>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card className="card-healthcare border-2 border-brand-green/20 hover:border-brand-green/40 transition-all duration-300 hover:shadow-lg">
                                      <CardContent className="p-6">
                                        <h4 className="font-heading font-semibold mb-4 text-lg flex items-center gap-2">
                                          <div className="w-8 h-8 bg-brand-green/10 rounded-xl flex items-center justify-center">
                                            <Heart className="h-4 w-4 text-brand-green" />
                                          </div>
                                          Medical Information
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                          <div>
                                            <span className="text-gray-600">Gender: </span>
                                            <span className="capitalize">{selectedPatient.gender}</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Age: </span>
                                            <span>{new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear()} years</span>
                                          </div>
                                          <div>
                                            <span className="text-gray-600">Medical Aid: </span>
                                            <span>{selectedPatient.medical_aid_scheme || 'Cash Patient'}</span>
                                          </div>
                                          {selectedPatient.medical_aid_number && (
                                            <div>
                                              <span className="text-gray-600">Medical Aid No: </span>
                                              <span>{selectedPatient.medical_aid_number}</span>
                                            </div>
                                          )}
                                          {selectedPatient.emergency_contact?.name && (
                                            <>
                                              <div className="pt-2 border-t">
                                                <span className="text-gray-600 font-medium">Emergency Contact:</span>
                                              </div>
                                              <div>
                                                <span className="text-gray-600">Name: </span>
                                                <span>{selectedPatient.emergency_contact.name}</span>
                                              </div>
                                              {selectedPatient.emergency_contact.phone && (
                                                <div>
                                                  <span className="text-gray-600">Phone: </span>
                                                  <span>{selectedPatient.emergency_contact.phone}</span>
                                                </div>
                                              )}
                                              {selectedPatient.emergency_contact.relationship && (
                                                <div>
                                                  <span className="text-gray-600">Relationship: </span>
                                                  <span className="capitalize">{selectedPatient.emergency_contact.relationship}</span>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                  
                                  {/* Patient Statistics */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                    <Card className="card-healthcare border-2 border-brand-blue/20 hover:border-brand-blue/40 transition-all duration-300 hover:shadow-lg group min-h-[180px]">
                                      <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                          <Calendar className="h-8 w-8 text-brand-blue" />
                                        </div>
                                        <div className="text-4xl font-bold text-brand-blue group-hover:text-brand-blue transition-colors mb-3">{selectedPatient.totalAppointments}</div>
                                        <div className="text-base text-muted-foreground font-medium">Total Appointments</div>
                                      </CardContent>
                                    </Card>
                                    <Card className="card-healthcare border-2 border-brand-green/20 hover:border-brand-green/40 transition-all duration-300 hover:shadow-lg group min-h-[180px]">
                                      <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                          <Heart className="h-8 w-8 text-brand-green" />
                                        </div>
                                        <div className="text-4xl font-bold text-brand-green group-hover:text-brand-green transition-colors mb-3">{selectedPatient.completedAppointments || 0}</div>
                                        <div className="text-base text-muted-foreground font-medium">Completed</div>
                                      </CardContent>
                                    </Card>
                                    <Card className="card-healthcare border-2 border-brand-amber/20 hover:border-brand-amber/40 transition-all duration-300 hover:shadow-lg group min-h-[180px]">
                                      <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-brand-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                          <Clock className="h-8 w-8 text-brand-amber" />
                                        </div>
                                        <div className="text-4xl font-bold text-brand-amber group-hover:text-brand-amber transition-colors mb-3">{selectedPatient.scheduledAppointments || 0}</div>
                                        <div className="text-base text-muted-foreground font-medium">Scheduled</div>
                                      </CardContent>
                                    </Card>
                                    <Card className="card-healthcare border-2 border-brand-purple/20 hover:border-brand-purple/40 transition-all duration-300 hover:shadow-lg group min-h-[180px]">
                                      <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                                        <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                          <TrendingUp className="h-8 w-8 text-brand-purple" />
                                        </div>
                                        <div className="text-4xl font-bold text-brand-purple group-hover:text-brand-purple transition-colors mb-3">R{(selectedPatient.totalRevenue || 0).toLocaleString()}</div>
                                        <div className="text-base text-muted-foreground font-medium">Total Revenue</div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="appointments" className="space-y-6 mt-8">
                                  <div className="space-y-4">
                                    {selectedPatient.appointments.map((apt, index) => (
                                      <Card key={apt.id} className="card-healthcare border-2 border-brand-green/20 hover:border-brand-green/40 transition-all duration-300 hover:shadow-lg">
                                        <CardContent className="p-6">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-4 mb-3">
                                                <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                                                  <Calendar className="h-5 w-5 text-brand-green" />
                                                </div>
                                                <div>
                                                  <div className="font-semibold text-lg text-foreground">
                                                    {format(parseISO(apt.appointment_date), 'MMM dd, yyyy')}
                                                  </div>
                                                  <div className="text-sm text-muted-foreground">
                                                    {apt.appointment_time} • {apt.consultation_type}
                                                  </div>
                                                </div>
                                                <div className="ml-auto">
                                                  {getStatusBadge(apt.appointment_status)}
                                                </div>
                                              </div>
                                              {apt.symptoms_description && (
                                                <div className="mt-3 p-3 bg-brand-blue/5 rounded-lg border border-brand-blue/10">
                                                  <div className="text-sm">
                                                    <span className="font-medium text-brand-blue">Symptoms:</span>
                                                    <span className="ml-2 text-muted-foreground">{apt.symptoms_description}</span>
                                                  </div>
                                                </div>
                                              )}
                                              {apt.current_medications && (
                                                <div className="mt-2 p-3 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                                  <div className="text-sm">
                                                    <span className="font-medium text-brand-purple">Current Medications:</span>
                                                    <span className="ml-2 text-muted-foreground">{apt.current_medications}</span>
                                                  </div>
                                                </div>
                                              )}
                                              {apt.allergies && (
                                                <div className="mt-2 p-3 bg-brand-amber/5 rounded-lg border border-brand-amber/10">
                                                  <div className="text-sm">
                                                    <span className="font-medium text-brand-amber">Allergies:</span>
                                                    <span className="ml-2 text-muted-foreground">{apt.allergies}</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="notes" className="space-y-6 mt-8">
                                  {/* Add New Note */}
                                  <Card className="card-healthcare border-2 border-brand-purple/20 hover:border-brand-purple/40 transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="pb-4">
                                      <CardTitle className="text-xl font-heading flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                                          <FileText className="h-5 w-5 text-brand-purple" />
                                        </div>
                                        Add Consultation Note
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Clinical Notes</label>
                                        <Textarea
                                          placeholder="Patient observations, symptoms, discussion points..."
                                          value={newNote.notes}
                                          onChange={(e) => setNewNote(prev => ({ ...prev, notes: e.target.value }))}
                                          className="border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/20 min-h-[100px]"
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-foreground mb-2 block">Diagnosis</label>
                                          <Input
                                            placeholder="Primary diagnosis..."
                                            value={newNote.diagnosis}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            className="border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/20"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-foreground mb-2 block">Follow-up Date</label>
                                          <Input
                                            type="date"
                                            value={newNote.follow_up_date}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, follow_up_date: e.target.value }))}
                                            className="border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/20"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-foreground mb-2 block">Treatment Plan</label>
                                        <Textarea
                                          placeholder="Medications, lifestyle recommendations, next steps..."
                                          value={newNote.treatment_plan}
                                          onChange={(e) => setNewNote(prev => ({ ...prev, treatment_plan: e.target.value }))}
                                          className="border-brand-purple/20 focus:border-brand-purple focus:ring-brand-purple/20 min-h-[100px]"
                                        />
                                      </div>
                                      <Button onClick={handleSaveNote} className="bg-brand-purple hover:bg-brand-purple/90 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Note
                                      </Button>
                                    </CardContent>
                                  </Card>

                                  {/* Existing Notes - Only show if there are real notes */}
                                  {consultationNotes.length > 0 && (
                                    <div className="space-y-4">
                                      <h3 className="text-lg font-heading font-semibold text-foreground">Previous Consultation Notes</h3>
                                      {consultationNotes.map((note) => (
                                      <Card key={note.id} className="card-healthcare border-2 border-brand-blue/20 hover:border-brand-blue/40 transition-all duration-300 hover:shadow-lg">
                                        <CardContent className="p-6">
                                          <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-brand-blue" />
                                              </div>
                                              <div>
                                                <span className="font-semibold text-lg text-foreground">Consultation Note</span>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                  <Clock className="h-3 w-3" />
                                                  <span>{format(parseISO(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-4">
                                            <div className="p-4 bg-brand-blue/5 rounded-lg border border-brand-blue/10">
                                              <h5 className="text-sm font-semibold text-brand-blue mb-2">Clinical Notes</h5>
                                              <p className="text-sm text-muted-foreground leading-relaxed">{note.notes}</p>
                                            </div>
                                            
                                            {note.diagnosis && (
                                              <div className="p-4 bg-brand-green/5 rounded-lg border border-brand-green/10">
                                                <h5 className="text-sm font-semibold text-brand-green mb-2">Diagnosis</h5>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{note.diagnosis}</p>
                                              </div>
                                            )}
                                            
                                            {note.treatment_plan && (
                                              <div className="p-4 bg-brand-purple/5 rounded-lg border border-brand-purple/10">
                                                <h5 className="text-sm font-semibold text-brand-purple mb-2">Treatment Plan</h5>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{note.treatment_plan}</p>
                                              </div>
                                            )}
                                            
                                            {note.follow_up_date && (
                                              <div className="p-4 bg-brand-amber/5 rounded-lg border border-brand-amber/10">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 bg-brand-amber/10 rounded-xl flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-brand-amber" />
                                                  </div>
                                                  <div>
                                                    <span className="text-sm font-semibold text-brand-amber">Follow-up Scheduled</span>
                                                    <p className="text-sm text-muted-foreground">{format(parseISO(note.follow_up_date), 'MMM dd, yyyy')}</p>
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                      ))}
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="assessment" className="space-y-6 mt-8">
                                  {selectedPatient.assessmentData ? (
                                    <Card className="card-healthcare border-2 border-brand-amber/20 hover:border-brand-amber/40 transition-all duration-300 hover:shadow-lg">
                                      <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-heading flex items-center gap-3">
                                          <div className="w-10 h-10 bg-brand-amber/10 rounded-2xl flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-brand-amber" />
                                          </div>
                                          Latest Assessment Results
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="p-4 bg-brand-amber/5 rounded-lg border border-brand-amber/10">
                                            <h4 className="font-semibold text-brand-amber mb-3">Risk Assessment</h4>
                                            <div className="space-y-2 text-sm">
                                              <div className="flex justify-between">
                                                <span>Overall Risk Score:</span>
                                                <span className="font-medium">{selectedPatient.assessmentData.riskScore || 'N/A'}</span>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>Assessment Date:</span>
                                                <span className="font-medium">{selectedPatient.assessmentData.assessmentDate ? format(parseISO(selectedPatient.assessmentData.assessmentDate), 'MMM dd, yyyy') : 'N/A'}</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="p-4 bg-brand-green/5 rounded-lg border border-brand-green/10">
                                            <h4 className="font-semibold text-brand-green mb-3">Key Findings</h4>
                                            <div className="space-y-1 text-sm">
                                              {selectedPatient.assessmentData.keyFindings ? 
                                                selectedPatient.assessmentData.keyFindings.map((finding: string, index: number) => (
                                                  <div key={index} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 bg-brand-green rounded-full mt-2 flex-shrink-0"></span>
                                                    <span>{finding}</span>
                                                  </div>
                                                )) : 
                                                <p className="text-muted-foreground">No specific findings recorded</p>
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {selectedPatient.assessmentData.recommendations && (
                                          <div className="p-4 bg-brand-blue/5 rounded-lg border border-brand-blue/10">
                                            <h4 className="font-semibold text-brand-blue mb-3">Recommendations</h4>
                                            <div className="space-y-1 text-sm">
                                              {selectedPatient.assessmentData.recommendations.map((rec: string, index: number) => (
                                                <div key={index} className="flex items-start gap-2">
                                                  <span className="w-1.5 h-1.5 bg-brand-blue rounded-full mt-2 flex-shrink-0"></span>
                                                  <span>{rec}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ) : (
                                    <Card className="card-healthcare border-2 border-brand-amber/20 hover:border-brand-amber/40 transition-all duration-300 hover:shadow-lg">
                                      <CardContent className="p-8">
                                        <div className="text-center py-12">
                                          <div className="w-20 h-20 bg-brand-amber/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                            <FileText className="h-10 w-10 text-brand-amber" />
                                          </div>
                                          <h3 className="text-xl font-heading font-semibold text-foreground mb-3">No Assessment Data</h3>
                                          <p className="text-muted-foreground mb-2">This patient hasn't completed a symptom assessment yet</p>
                                          <p className="text-sm text-brand-amber font-medium">Assessment includes 65+ risk factors and health indicators</p>
                                          <div className="mt-6">
                                            <Button variant="outline" className="border-brand-amber text-brand-amber hover:bg-brand-amber hover:text-white transition-all">
                                              <Plus className="mr-2 h-4 w-4" />
                                              Schedule Assessment
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-blue transition-colors">{patients.length}</p>
                <p className="text-xs text-brand-blue mt-1 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  All registered
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-blue/20">
                <Users className="h-7 w-7 text-brand-blue group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-green/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-green transition-colors">
                  {patients.filter(p => p.totalAppointments > 0).length}
                </p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  With appointments
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                <Heart className="h-7 w-7 text-brand-green group-hover:animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-purple/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consultations</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-purple transition-colors">
                  {patients.reduce((total, p) => total + p.totalAppointments, 0)}
                </p>
                <p className="text-xs text-brand-purple mt-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  All appointments
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-purple/20">
                <Calendar className="h-7 w-7 text-brand-purple group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-amber/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-amber transition-colors">
                  R{patients.reduce((total, p) => total + (p.totalRevenue || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-brand-amber mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Paid consultations
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-amber/20">
                <TrendingUp className="h-7 w-7 text-brand-amber group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}