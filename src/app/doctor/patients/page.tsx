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
  Save
} from 'lucide-react'
import { AppointmentService } from '@/lib/supabase/appointments'
import { format, parseISO } from 'date-fns'

interface PatientData {
  id: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  medical_aid_scheme: string | null
  appointments: AppointmentData[]
  lastAppointment?: string
  totalAppointments: number
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
      const appointmentService = new AppointmentService()
      
      // Get all appointments for the doctor
      const appointments = await appointmentService.getDoctorAppointments(doctorId)
      
      // Group appointments by patient
      const patientMap = new Map<string, PatientData>()
      
      appointments.forEach(apt => {
        const patientId = apt.patient_id
        
        if (!patientMap.has(patientId)) {
          // Mock patient data - in real app, this would come from joined query
          patientMap.set(patientId, {
            id: patientId,
            full_name: `Patient ${patientId.slice(0, 8)}`,
            email: 'patient@example.com',
            phone: '+27 12 345 6789',
            date_of_birth: '1980-01-01',
            gender: 'female',
            medical_aid_scheme: 'Discovery Health',
            appointments: [],
            totalAppointments: 0
          })
        }
        
        const patient = patientMap.get(patientId)!
        patient.appointments.push({
          id: apt.id,
          appointment_date: apt.appointment_date,
          appointment_time: apt.appointment_time,
          consultation_type: apt.consultation_type,
          appointment_status: apt.appointment_status,
          payment_status: apt.payment_status,
          symptoms_description: apt.symptoms_description || '',
          current_medications: apt.current_medications || '',
          allergies: apt.allergies || ''
        })
      })

      // Convert map to array and calculate stats
      const patientsArray = Array.from(patientMap.values()).map(patient => {
        const sortedAppointments = patient.appointments.sort((a, b) => 
          new Date(`${b.appointment_date} ${b.appointment_time}`).getTime() - 
          new Date(`${a.appointment_date} ${a.appointment_time}`).getTime()
        )
        
        return {
          ...patient,
          appointments: sortedAppointments,
          totalAppointments: sortedAppointments.length,
          lastAppointment: sortedAppointments.length > 0 ? 
            `${sortedAppointments[0].appointment_date} ${sortedAppointments[0].appointment_time}` : 
            undefined
        }
      })

      setPatients(patientsArray)
    } catch (error) {
      console.error('Error loading patients:', error)
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
    // Mock consultation notes - in real app, this would come from database
    const mockNotes: ConsultationNote[] = [
      {
        id: '1',
        appointment_id: 'apt-1',
        notes: 'Patient reports improved energy levels since starting HRT. Hot flashes reduced from 8-10 per day to 2-3. Sleep quality has improved significantly.',
        diagnosis: 'Perimenopausal symptoms - responding well to treatment',
        treatment_plan: 'Continue current HRT dosage. Consider adding magnesium supplement for sleep support. Follow-up in 6 weeks.',
        follow_up_date: '2025-03-10',
        created_at: '2025-01-15T10:30:00Z'
      },
      {
        id: '2',
        appointment_id: 'apt-2',
        notes: 'Initial consultation. Patient experiencing irregular periods, hot flashes, mood swings, and difficulty sleeping. No significant medical history.',
        diagnosis: 'Perimenopause - early stage',
        treatment_plan: 'Start low-dose estradiol patch. Lifestyle modifications including regular exercise and stress management. Calcium and Vitamin D supplementation.',
        follow_up_date: '2025-01-15',
        created_at: '2024-12-01T14:15:00Z'
      }
    ]
    
    setConsultationNotes(mockNotes)
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
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">Manage your patients and view their medical history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredPatients.length} Patients
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patient List</span>
            <Users className="h-5 w-5 text-gray-400" />
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
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No patients found
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
                          <Badge variant="outline">{patient.medical_aid_scheme}</Badge>
                        ) : (
                          <span className="text-gray-400">Cash</span>
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
                        <Badge variant="outline">
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
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Heart className="h-5 w-5 text-vivid-red" />
                                <span>{selectedPatient?.full_name}</span>
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedPatient && (
                              <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                  <TabsTrigger value="notes">Notes</TabsTrigger>
                                  <TabsTrigger value="assessment">Assessment</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-4 mt-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                      <CardContent className="p-4">
                                        <h4 className="font-semibold mb-2">Personal Information</h4>
                                        <div className="space-y-2 text-sm">
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
                                        </div>
                                      </CardContent>
                                    </Card>
                                    
                                    <Card>
                                      <CardContent className="p-4">
                                        <h4 className="font-semibold mb-2">Medical Information</h4>
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
                                            <span>{selectedPatient.medical_aid_scheme || 'None'}</span>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="appointments" className="space-y-4 mt-6">
                                  <div className="space-y-2">
                                    {selectedPatient.appointments.map((apt) => (
                                      <Card key={apt.id}>
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <div className="flex items-center space-x-4">
                                                <div>
                                                  <div className="font-medium">
                                                    {format(parseISO(apt.appointment_date), 'MMM dd, yyyy')}
                                                  </div>
                                                  <div className="text-sm text-gray-500">
                                                    {apt.appointment_time} • {apt.consultation_type}
                                                  </div>
                                                </div>
                                                {getStatusBadge(apt.appointment_status)}
                                              </div>
                                              {apt.symptoms_description && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                  <strong>Symptoms:</strong> {apt.symptoms_description}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="notes" className="space-y-4 mt-6">
                                  {/* Add New Note */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-base">Add Consultation Note</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div>
                                        <label className="text-sm font-medium">Clinical Notes</label>
                                        <Textarea
                                          placeholder="Patient observations, symptoms, discussion points..."
                                          value={newNote.notes}
                                          onChange={(e) => setNewNote(prev => ({ ...prev, notes: e.target.value }))}
                                          className="mt-1"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Diagnosis</label>
                                          <Input
                                            placeholder="Primary diagnosis..."
                                            value={newNote.diagnosis}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, diagnosis: e.target.value }))}
                                            className="mt-1"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Follow-up Date</label>
                                          <Input
                                            type="date"
                                            value={newNote.follow_up_date}
                                            onChange={(e) => setNewNote(prev => ({ ...prev, follow_up_date: e.target.value }))}
                                            className="mt-1"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Treatment Plan</label>
                                        <Textarea
                                          placeholder="Medications, lifestyle recommendations, next steps..."
                                          value={newNote.treatment_plan}
                                          onChange={(e) => setNewNote(prev => ({ ...prev, treatment_plan: e.target.value }))}
                                          className="mt-1"
                                        />
                                      </div>
                                      <Button onClick={handleSaveNote} className="bg-vivid-cyan-blue hover:bg-vivid-cyan-blue/90">
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Note
                                      </Button>
                                    </CardContent>
                                  </Card>

                                  {/* Existing Notes */}
                                  <div className="space-y-4">
                                    {consultationNotes.map((note) => (
                                      <Card key={note.id}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                              <FileText className="h-4 w-4 text-vivid-cyan-blue" />
                                              <span className="font-medium">Consultation Note</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                              <Clock className="h-3 w-3" />
                                              <span>{format(parseISO(note.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-3">
                                            <div>
                                              <h5 className="text-sm font-medium text-gray-700">Notes</h5>
                                              <p className="text-sm mt-1">{note.notes}</p>
                                            </div>
                                            
                                            {note.diagnosis && (
                                              <div>
                                                <h5 className="text-sm font-medium text-gray-700">Diagnosis</h5>
                                                <p className="text-sm mt-1">{note.diagnosis}</p>
                                              </div>
                                            )}
                                            
                                            {note.treatment_plan && (
                                              <div>
                                                <h5 className="text-sm font-medium text-gray-700">Treatment Plan</h5>
                                                <p className="text-sm mt-1">{note.treatment_plan}</p>
                                              </div>
                                            )}
                                            
                                            {note.follow_up_date && (
                                              <div className="bg-pale-cyan-blue p-2 rounded">
                                                <div className="flex items-center space-x-2">
                                                  <Calendar className="h-4 w-4 text-vivid-cyan-blue" />
                                                  <span className="text-sm font-medium">Follow-up scheduled:</span>
                                                  <span className="text-sm">{format(parseISO(note.follow_up_date), 'MMM dd, yyyy')}</span>
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </TabsContent>
                                
                                <TabsContent value="assessment" className="space-y-4 mt-6">
                                  <Card>
                                    <CardContent className="p-6">
                                      <div className="text-center py-8 text-gray-500">
                                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>Symptom assessment data will be displayed here</p>
                                        <p className="text-sm">65+ risk factors and health indicators</p>
                                      </div>
                                    </CardContent>
                                  </Card>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="h-8 w-8 text-vivid-cyan-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Patients</p>
                <p className="text-2xl font-bold text-vivid-green-cyan">
                  {patients.filter(p => p.totalAppointments > 0).length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-vivid-green-cyan" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold text-vivid-purple">
                  {patients.reduce((total, p) => total + p.totalAppointments, 0)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-vivid-purple" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}