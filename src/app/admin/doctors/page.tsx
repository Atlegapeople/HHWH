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
  Stethoscope
} from 'lucide-react'
import { format, parseISO } from 'date-fns'

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
  is_active: boolean
  approval_status: string | null
  approval_date: string | null
  rejection_reason: string | null
  created_at: string
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [currentTab, setCurrentTab] = useState('pending')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadDoctors()
  }, [currentTab])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchTerm])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/doctors/approve?status=${currentTab}`)
      const result = await response.json()

      if (result.success) {
        setDoctors(result.doctors)
      } else {
        console.error('Failed to load doctors:', result.error)
      }
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = [...doctors]

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
        await loadDoctors()
        setRejectionReason('')
        
        // Show success message (you could add a toast here)
        console.log(`Doctor ${action}ed successfully`)
      } else {
        console.error(`Failed to ${action} doctor:`, result.error)
      }
    } catch (error) {
      console.error(`Error ${action}ing doctor:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (doctor: Doctor) => {
    if (doctor.approval_status === 'approved' || doctor.is_active) {
      return <Badge className="bg-brand-green text-white">Approved</Badge>
    } else if (doctor.approval_status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>
    } else {
      return <Badge className="bg-brand-amber text-gray-800">Pending</Badge>
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor Applications</h1>
          <p className="text-gray-600">Review and approve doctor applications</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            {filteredDoctors.length} Applications
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, specialization, or HPCSA number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({doctors.filter(d => !d.approval_status).length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({doctors.filter(d => d.is_active).length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({doctors.filter(d => d.approval_status === 'rejected').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-4">
          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Doctor Applications</span>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{currentTab}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDoctors.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{doctor.full_name}</span>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                {doctor.email && (
                                  <div className="flex items-center space-x-1">
                                    <Mail className="h-3 w-3" />
                                    <span>{doctor.email}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{doctor.specialization}</span>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {doctor.hpcsa_number}
                            </code>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{formatCurrency(doctor.consultation_fee)}</span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(doctor)}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {format(parseISO(doctor.created_at), 'MMM dd, yyyy')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setSelectedDoctor(doctor)}
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
                                            <div>
                                              <span className="text-sm text-gray-600">Consultation Fee:</span>
                                              <p className="font-medium">{formatCurrency(selectedDoctor.consultation_fee)}</p>
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
                                    className="text-brand-green hover:text-brand-green/80"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApproval(doctor.id, 'reject')}
                                    disabled={actionLoading === doctor.id}
                                    className="text-brand-red hover:text-brand-red/80"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-brand-amber">
                  {doctors.filter(d => !d.approval_status).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-brand-amber" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-brand-green">
                  {doctors.filter(d => d.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-brand-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-brand-red">
                  {doctors.filter(d => d.approval_status === 'rejected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-brand-red" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}