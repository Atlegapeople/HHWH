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
  UserCheck, 
  UserX,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Stethoscope,
  Banknote
} from 'lucide-react'
import { LoadingScreen } from '@/components/ui/loading'
import { format, parseISO } from 'date-fns'
import Image from 'next/image'
import { toast } from 'sonner'

interface Doctor {
  id: string
  user_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  specialization: string
  qualification: string
  hpcsa_number: string
  consultation_fee: number
  bio: string
  practice_address: string | null
  profile_image_url: string | null
  is_active: boolean
  approval_status: string | null
  approval_date: string | null
  rejection_reason: string | null
  created_at: string
}

export default function AdminDoctorsPage() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [displayedDoctors, setDisplayedDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [currentTab, setCurrentTab] = useState('pending')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadAllDoctors()
  }, [])

  useEffect(() => {
    filterByTab()
  }, [currentTab, allDoctors])

  useEffect(() => {
    filterBySearch()
  }, [displayedDoctors, searchTerm])

  const loadAllDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/doctors/approve?status=all')
      const result = await response.json()

      if (result.success) {
        // Profile photos will display when doctors upload them through their profile page
        setAllDoctors(result.doctors)
      } else {
        console.error('Failed to load doctors:', result.error)
        toast.error('Failed to load doctors', {
          description: result.error || 'Unable to fetch doctor data.',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
      toast.error('Network error', {
        description: 'Unable to connect to the server. Please try again.',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  const filterByTab = () => {
    let filtered: Doctor[] = []
    
    if (currentTab === 'pending') {
      // Show doctors with no approval status (pending)
      filtered = allDoctors.filter((doctor: Doctor) => 
        !doctor.approval_status || doctor.approval_status === null
      )
    } else if (currentTab === 'approved') {
      // Show approved doctors
      filtered = allDoctors.filter((doctor: Doctor) => 
        doctor.is_active && (doctor.approval_status === 'approved' || doctor.approval_status === null)
      )
    } else if (currentTab === 'rejected') {
      // Show rejected doctors
      filtered = allDoctors.filter((doctor: Doctor) => 
        doctor.approval_status === 'rejected'
      )
    }
    
    setDisplayedDoctors(filtered)
  }

  const filterBySearch = () => {
    let filtered = [...displayedDoctors]

    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.hpcsa_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }

  const handleApproval = async (doctorId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(doctorId)
      
      const response = await fetch('/api/admin/doctors/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          action,
          reason: action === 'reject' ? rejectionReason : undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh the doctors list
        await loadAllDoctors()
        setRejectionReason('')
        
        // Show success toast
        if (action === 'approve') {
          toast.success('Doctor approved successfully', {
            description: `${result.doctor?.full_name || 'Doctor'} has been approved and can now accept appointments.`,
            duration: 4000
          })
        } else if (action === 'reject') {
          toast('Doctor application rejected', {
            description: `${result.doctor?.full_name || 'Doctor'}'s application has been rejected.`,
            duration: 4000,
            style: {
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              color: '#92400e'
            }
          })
        }
      } else {
        console.error(`Failed to ${action} doctor:`, result.error)
        toast.error(`Failed to ${action} doctor`, {
          description: result.error || `An unexpected error occurred while ${action}ing the doctor.`,
          duration: 5000
        })
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error)
      toast.error('Network error', {
        description: error instanceof Error ? error.message : 'Unable to connect to the server. Please try again.',
        duration: 5000
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (doctor: Doctor) => {
    if (doctor.approval_status === 'approved' || doctor.is_active) {
      return (
        <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0 shadow-sm">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-1.5"></div>
          Approved
        </Badge>
      )
    } else if (doctor.approval_status === 'rejected') {
      return (
        <Badge className="bg-gradient-to-r from-brand-red to-brand-red/80 text-white border-0 shadow-sm">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-1.5"></div>
          Rejected
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gradient-to-r from-brand-amber to-brand-amber/80 text-white border-0 shadow-sm">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-1.5"></div>
          Pending
        </Badge>
      )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount)
  }

  if (loading) {
    return (
      <LoadingScreen
        title="Loading Doctor Applications"
        subtitle="Retrieving application data and status information..."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Doctor Applications
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Review and approve doctor applications for the HHWH platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-brand-blue via-brand-blue to-brand-blue/90 text-white border-0 px-6 py-3 shadow-lg rounded-2xl text-sm font-semibold">
            <UserCheck className="w-5 h-5 mr-2" />
            {filteredDoctors.length} Applications
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <Input
              placeholder="Search by name, email, specialization, or HPCSA number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/80 border-gray-200 focus:border-brand-blue focus:ring-brand-blue/20 rounded-xl shadow-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 rounded-3xl shadow-xl border border-gray-100 h-auto">
          <TabsTrigger 
            value="pending" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-amber data-[state=active]:via-brand-amber data-[state=active]:to-brand-amber/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({allDoctors.filter(d => !d.approval_status).length})
          </TabsTrigger>
          <TabsTrigger 
            value="approved"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:via-brand-green data-[state=active]:to-brand-green/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approved ({allDoctors.filter(d => d.is_active).length})
          </TabsTrigger>
          <TabsTrigger 
            value="rejected"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red data-[state=active]:via-brand-red data-[state=active]:to-brand-red/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Rejected ({allDoctors.filter(d => d.approval_status === 'rejected').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-6">
          {/* Applications Table */}
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl shadow-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-heading font-bold text-foreground">Doctor Applications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground capitalize">{currentTab}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>HPCSA</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                              <UserCheck className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-foreground">No applications found</p>
                              <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white transition-all duration-200 border-b border-gray-100">
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-10 h-10 rounded-2xl overflow-hidden">
                                {doctor.profile_image_url ? (
                                  <Image
                                    src={doctor.profile_image_url}
                                    alt={`${doctor.full_name} profile`}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-brand-green/10 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-brand-blue" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">{doctor.full_name}</span>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  {doctor.email && (
                                    <div className="flex items-center space-x-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{doctor.email}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4 text-brand-green" />
                              <span className="font-medium text-foreground">{doctor.specialization}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <code className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 rounded-xl font-mono border shadow-sm">
                              {doctor.hpcsa_number}
                            </code>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-2">
                              <Banknote className="h-4 w-4 text-brand-green" />
                              <span className="font-bold text-brand-green">{formatCurrency(doctor.consultation_fee)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(doctor)}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-muted-foreground font-medium">
                              {format(parseISO(doctor.created_at), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedDoctor(doctor)}
                                    className="h-9 w-9 p-0 hover:bg-brand-blue/10 hover:text-brand-blue transition-colors duration-200"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center space-x-2">
                                      <Stethoscope className="h-5 w-5 text-brand-blue" />
                                      <span>{selectedDoctor?.full_name}</span>
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  {selectedDoctor && (
                                    <div className="space-y-6">
                                      {/* Profile Photo */}
                                      <div className="flex items-center space-x-4 pb-4 border-b">
                                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                                          {selectedDoctor.profile_image_url ? (
                                            <Image
                                              src={selectedDoctor.profile_image_url}
                                              alt={`${selectedDoctor.full_name} profile`}
                                              fill
                                              className="object-cover"
                                              sizes="80px"
                                            />
                                          ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-brand-blue/10 to-brand-green/10 flex items-center justify-center">
                                              <UserCheck className="h-8 w-8 text-brand-blue" />
                                            </div>
                                          )}
                                        </div>
                                        <div>
                                          <h2 className="text-xl font-bold text-foreground">{selectedDoctor.full_name}</h2>
                                          <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                                          <div className="mt-2">
                                            {getStatusBadge(selectedDoctor)}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Personal Information */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                              <Mail className="h-4 w-4 text-gray-400" />
                                              <span className="text-sm">{selectedDoctor.email || 'Not provided'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Phone className="h-4 w-4 text-gray-400" />
                                              <span className="text-sm">{selectedDoctor.phone || 'Not provided'}</span>
                                            </div>
                                            {selectedDoctor.practice_address && (
                                              <div className="flex items-center space-x-2">
                                                <MapPin className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm">{selectedDoctor.practice_address}</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="text-sm text-gray-600">HPCSA Number:</span>
                                              <p className="font-medium">{selectedDoctor.hpcsa_number}</p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <Banknote className="h-4 w-4 text-muted-foreground" />
                                              <div>
                                                <span className="text-sm text-gray-600">Consultation Fee:</span>
                                                <p className="font-medium">{formatCurrency(selectedDoctor.consultation_fee)}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Professional Information */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <span className="text-sm text-gray-600">Specialization:</span>
                                            <p className="font-medium">{selectedDoctor.specialization}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm text-gray-600">Qualifications:</span>
                                            <p className="font-medium">{selectedDoctor.qualification}</p>
                                          </div>
                                          <div>
                                            <span className="text-sm text-gray-600">Professional Bio:</span>
                                            <p className="text-sm mt-1 text-gray-700">{selectedDoctor.bio}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Application Status */}
                                      <div>
                                        <h3 className="text-lg font-semibold mb-3">Application Status</h3>
                                        <div className="flex items-center space-x-4">
                                          {getStatusBadge(selectedDoctor)}
                                          <span className="text-sm text-gray-600">
                                            Applied: {format(parseISO(selectedDoctor.created_at), 'MMM dd, yyyy HH:mm')}
                                          </span>
                                        </div>
                                        {selectedDoctor.rejection_reason && (
                                          <div className="mt-3 p-3 bg-red-50 rounded-lg">
                                            <p className="text-sm text-red-800">
                                              <strong>Rejection Reason:</strong> {selectedDoctor.rejection_reason}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Actions */}
                                      {!selectedDoctor.approval_status && (
                                        <div className="border-t pt-4">
                                          <h3 className="text-lg font-semibold mb-3">Actions</h3>
                                          <div className="space-y-4">
                                            <div className="flex space-x-3">
                                              <Button
                                                onClick={() => handleApproval(selectedDoctor.id, 'approve')}
                                                disabled={actionLoading === selectedDoctor.id}
                                                className="bg-brand-green hover:bg-brand-green/90 text-white"
                                              >
                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                Approve Application
                                              </Button>
                                              
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button variant="destructive">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject Application
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                  <DialogHeader>
                                                    <DialogTitle>Reject Application</DialogTitle>
                                                  </DialogHeader>
                                                  <div className="space-y-4">
                                                    <p className="text-sm text-gray-600">
                                                      Please provide a reason for rejecting this application:
                                                    </p>
                                                    <Textarea
                                                      placeholder="Enter rejection reason..."
                                                      value={rejectionReason}
                                                      onChange={(e) => setRejectionReason(e.target.value)}
                                                    />
                                                    <div className="flex space-x-2">
                                                      <Button
                                                        variant="destructive"
                                                        onClick={() => handleApproval(selectedDoctor.id, 'reject')}
                                                        disabled={!rejectionReason.trim() || actionLoading === selectedDoctor.id}
                                                      >
                                                        Confirm Rejection
                                                      </Button>
                                                      <DialogTrigger asChild>
                                                        <Button variant="outline">Cancel</Button>
                                                      </DialogTrigger>
                                                    </div>
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              {/* Quick actions for pending applications */}
                              {!doctor.approval_status && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApproval(doctor.id, 'approve')}
                                    disabled={actionLoading === doctor.id}
                                    className="h-9 w-9 p-0 hover:bg-brand-green/10 text-brand-green hover:text-brand-green transition-colors duration-200"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApproval(doctor.id, 'reject')}
                                    disabled={actionLoading === doctor.id}
                                    className="h-9 w-9 p-0 hover:bg-brand-red/10 text-brand-red hover:text-brand-red transition-colors duration-200"
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
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-amber/5 hover:to-brand-amber/10 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Pending Applications</p>
                <p className="text-3xl font-bold text-brand-amber">
                  {allDoctors.filter(d => !d.approval_status).length}
                </p>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-amber to-brand-amber/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-green/5 hover:to-brand-green/10 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Approved Doctors</p>
                <p className="text-3xl font-bold text-brand-green">
                  {allDoctors.filter(d => d.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Active on platform</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-red/5 hover:to-brand-red/10 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Rejected Applications</p>
                <p className="text-3xl font-bold text-brand-red">
                  {allDoctors.filter(d => d.approval_status === 'rejected').length}
                </p>
                <p className="text-xs text-muted-foreground">Not approved</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-500/5 hover:to-gray-500/10 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">{allDoctors.length}</p>
                <p className="text-xs text-muted-foreground">All time</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-600 to-gray-600/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}