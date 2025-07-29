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
  UserCheck,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Stethoscope,
  Banknote,
  Calendar,
  Settings,
  UserMinus,
  UserX,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle
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
  years_experience: number
  consultation_fee: number
  practice_address: string | null
  bio: string | null
  profile_image_url: string | null
  is_active: boolean
  approval_status: string | null
  created_at: string
  updated_at: string
}

// Mobile Doctor Card Component
function MobileDoctorCard({ 
  doctor, 
  currentTab, 
  expandedCard, 
  setExpandedCard, 
  setSelectedDoctor, 
  disableConfirmOpen, 
  setDisableConfirmOpen, 
  enableConfirmOpen, 
  setEnableConfirmOpen, 
  deleteConfirmOpen, 
  setDeleteConfirmOpen, 
  actionLoading,
  handleDisableDoctor,
  handleEnableDoctor,
  handleDeleteDoctor,
  formatCurrency, 
  getStatusBadge 
}: {
  doctor: Doctor
  currentTab: string
  expandedCard: string | null
  setExpandedCard: (id: string | null) => void
  setSelectedDoctor: (doctor: Doctor) => void
  disableConfirmOpen: string | null
  setDisableConfirmOpen: (id: string | null) => void
  enableConfirmOpen: string | null
  setEnableConfirmOpen: (id: string | null) => void
  deleteConfirmOpen: string | null
  setDeleteConfirmOpen: (id: string | null) => void
  actionLoading: string | null
  handleDisableDoctor: (id: string) => void
  handleEnableDoctor: (id: string) => void
  handleDeleteDoctor: (id: string) => void
  formatCurrency: (amount: number) => string
  getStatusBadge: (doctor: Doctor) => JSX.Element
}) {
  return (
    <div className="bg-gradient-to-r from-white via-white to-gray-50/30 rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Main Card Content */}
      <div 
        className="p-6 cursor-pointer" 
        onClick={() => setExpandedCard(expandedCard === doctor.id ? null : doctor.id)}
      >
        <div className="flex items-center space-x-4">
          {/* Profile Photo */}
          <div className="relative w-16 h-16 rounded-3xl overflow-hidden shadow-lg ring-2 ring-white flex-shrink-0">
            {doctor.profile_image_url ? (
              <Image
                src={doctor.profile_image_url}
                alt={`${doctor.full_name} profile`}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-green/20 via-brand-green/10 to-brand-blue/10 flex items-center justify-center">
                <Stethoscope className="h-8 w-8 text-brand-green" />
              </div>
            )}
          </div>
          
          {/* Doctor Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground truncate">{doctor.full_name}</h3>
              <div className="flex-shrink-0 ml-2">
                {expandedCard === doctor.id ? (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-medium truncate">{doctor.specialization}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Banknote className="h-4 w-4 text-brand-green" />
                <span className="text-sm font-bold text-brand-green">{formatCurrency(doctor.consultation_fee)}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(doctor.created_at), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Details */}
      {expandedCard === doctor.id && (
        <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
          <div className="p-6 space-y-6">
            {/* Detailed Information */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doctor.email || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doctor.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doctor.qualification || 'Not provided'}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">HPCSA Registration</span>
                </div>
                <code className="text-sm bg-gradient-to-r from-gray-50 via-white to-gray-50 px-4 py-2 rounded-2xl font-mono border border-gray-200 shadow-sm font-bold text-gray-700 block w-fit">
                  {doctor.hpcsa_number}
                </code>
              </div>
              
              {doctor.bio && (
                <div className="pt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Professional Bio</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{doctor.bio}</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-3">
                {/* View Details */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDoctor(doctor)}
                      className="flex-1 min-w-0 border-brand-blue/20 text-brand-blue hover:bg-brand-blue/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Stethoscope className="h-5 w-5 text-brand-green" />
                        <span>{doctor.full_name}</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* Profile Photo */}
                      <div className="flex items-center space-x-4 pb-4 border-b">
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                          {doctor.profile_image_url ? (
                            <Image
                              src={doctor.profile_image_url}
                              alt={`${doctor.full_name} profile`}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-blue/10 flex items-center justify-center">
                              <Stethoscope className="h-8 w-8 text-brand-green" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">{doctor.full_name}</h2>
                          <p className="text-muted-foreground">{doctor.specialization}</p>
                          <div className="mt-2">
                            {getStatusBadge(doctor)}
                          </div>
                        </div>
                      </div>

                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doctor.email || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doctor.phone || 'Not provided'}</span>
                            </div>
                            {doctor.practice_address && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{doctor.practice_address}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{doctor.qualification}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Banknote className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatCurrency(doctor.consultation_fee)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">HPCSA Registration:</span>
                            <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                              {doctor.hpcsa_number}
                            </code>
                          </div>
                          <div>
                            <span className="font-medium">Specialization:</span>
                            <span className="ml-2 text-sm">{doctor.specialization}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {doctor.bio && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Professional Bio</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {doctor.bio}
                          </p>
                        </div>
                      )}

                      {/* Management Actions - Only show for mobile modal */}
                      <div className="flex justify-end space-x-3 pt-4 border-t">
                        {currentTab === 'active' ? (
                          <Dialog open={disableConfirmOpen === doctor.id} onOpenChange={(open) => setDisableConfirmOpen(open ? doctor.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="text-brand-amber border-brand-amber/20 hover:bg-brand-amber/10"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Disable Doctor
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        ) : (
                          <Dialog open={enableConfirmOpen === doctor.id} onOpenChange={(open) => setEnableConfirmOpen(open ? doctor.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="text-brand-green border-brand-green/20 hover:bg-brand-green/10"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Enable Doctor
                              </Button>
                            </DialogTrigger>
                          </Dialog>
                        )}

                        <Dialog open={deleteConfirmOpen === doctor.id} onOpenChange={(open) => setDeleteConfirmOpen(open ? doctor.id : null)}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="text-brand-red border-brand-red/20 hover:bg-brand-red/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Doctor
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Status Actions */}
                {currentTab === 'active' ? (
                  <Dialog open={disableConfirmOpen === doctor.id} onOpenChange={(open) => setDisableConfirmOpen(open ? doctor.id : null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0 border-brand-amber/20 text-brand-amber hover:bg-brand-amber/10"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Disable
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-brand-amber" />
                          <span>Disable Doctor</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to disable <strong>{doctor.full_name}</strong>? 
                          This will prevent them from accepting new appointments but preserve their account and data.
                        </p>
                        <div className="bg-gradient-to-r from-brand-amber/10 to-brand-amber/5 p-4 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-brand-amber flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-foreground">This action will:</p>
                              <ul className="mt-2 space-y-1 text-muted-foreground">
                                <li>• Prevent new appointments from being booked</li>
                                <li>• Keep existing appointments and patient data</li>
                                <li>• Allow reactivation later if needed</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setDisableConfirmOpen(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleDisableDoctor(doctor.id)}
                            disabled={actionLoading === doctor.id}
                            className="bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:from-brand-amber/90 hover:to-brand-amber/70 text-white"
                          >
                            {actionLoading === doctor.id ? 'Disabling...' : 'Disable Doctor'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog open={enableConfirmOpen === doctor.id} onOpenChange={(open) => setEnableConfirmOpen(open ? doctor.id : null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0 border-brand-green/20 text-brand-green hover:bg-brand-green/10"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Enable
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-brand-green" />
                          <span>Enable Doctor</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to enable <strong>{doctor.full_name}</strong>? 
                          This will allow them to accept new appointments again.
                        </p>
                        <div className="bg-gradient-to-r from-brand-green/10 to-brand-green/5 p-4 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <CheckCircle className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-foreground">This action will:</p>
                              <ul className="mt-2 space-y-1 text-muted-foreground">
                                <li>• Allow new appointments to be booked</li>
                                <li>• Restore full doctor portal access</li>
                                <li>• Make the doctor visible to patients</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setEnableConfirmOpen(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleEnableDoctor(doctor.id)}
                            disabled={actionLoading === doctor.id}
                            className="bg-gradient-to-r from-brand-green to-brand-green/80 hover:from-brand-green/90 hover:to-brand-green/70 text-white"
                          >
                            {actionLoading === doctor.id ? 'Enabling...' : 'Enable Doctor'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                
                {/* Delete */}
                <Dialog open={deleteConfirmOpen === doctor.id} onOpenChange={(open) => setDeleteConfirmOpen(open ? doctor.id : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-brand-red/20 text-brand-red hover:bg-brand-red/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-brand-red" />
                        <span>Delete Doctor</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to permanently delete <strong>{doctor.full_name}</strong>? 
                        This action cannot be undone and will remove all associated data.
                      </p>
                      <div className="bg-gradient-to-r from-brand-red/10 to-brand-red/5 p-4 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-brand-red flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-medium text-foreground">This action will permanently:</p>
                            <ul className="mt-2 space-y-1 text-muted-foreground">
                              <li>• Remove the doctor's profile and account</li>
                              <li>• Delete all professional information</li>
                              <li>• Cancel any pending appointments</li>
                              <li>• Remove access to the platform</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setDeleteConfirmOpen(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleDeleteDoctor(doctor.id)}
                          disabled={actionLoading === doctor.id}
                          className="bg-gradient-to-r from-brand-red to-brand-red/80 hover:from-brand-red/90 hover:to-brand-red/70 text-white"
                        >
                          {actionLoading === doctor.id ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActiveDoctorsPage() {
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([])
  const [displayedDoctors, setDisplayedDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(null)
  const [disableConfirmOpen, setDisableConfirmOpen] = useState<string | null>(null)
  const [enableConfirmOpen, setEnableConfirmOpen] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState('active')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    loadAllDoctors()
  }, [])

  useEffect(() => {
    filterByTab()
  }, [currentTab, allDoctors])

  useEffect(() => {
    // Filter doctors based on search term
    const filtered = displayedDoctors.filter(doctor =>
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.hpcsa_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDoctors(filtered)
  }, [displayedDoctors, searchTerm])

  const loadAllDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/doctors/approve?status=all`)
      const result = await response.json()

      if (result.success) {
        // Store all doctors and let filterByTab handle the display
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
    
    if (currentTab === 'active') {
      // Show only active doctors
      filtered = allDoctors.filter((doctor: Doctor) => 
        doctor.is_active && (doctor.approval_status === 'approved' || doctor.approval_status === null)
      )
    } else if (currentTab === 'disabled') {
      // Show only disabled doctors (was previously active but now disabled)
      filtered = allDoctors.filter((doctor: Doctor) => 
        !doctor.is_active && (doctor.approval_status === 'approved' || doctor.approval_status === null)
      )
    }
    
    setDisplayedDoctors(filtered)
  }

  const handleDisableDoctor = async (doctorId: string) => {
    try {
      setActionLoading(doctorId)
      const response = await fetch('/api/admin/doctors/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          action: 'disable'
        })
      })

      const result = await response.json()
      console.log('Disable API response:', result)
      console.log('Response status:', response.status)
      
      if (result.success) {
        await loadAllDoctors() // Reload the list
        setDisableConfirmOpen(null)
        toast('Doctor disabled successfully', {
          description: `${result.doctor?.full_name || 'Doctor'} has been disabled and can no longer accept new appointments.`,
          duration: 4000,
          style: {
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            color: '#92400e'
          }
        })
      } else {
        console.error('Failed to disable doctor:', result.error)
        console.error('Full error details:', result)
        toast.error('Failed to disable doctor', {
          description: result.error || 'An unexpected error occurred while disabling the doctor.',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error disabling doctor:', error)
      toast.error('Network error', {
        description: error instanceof Error ? error.message : 'Unable to connect to the server. Please try again.',
        duration: 5000
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEnableDoctor = async (doctorId: string) => {
    try {
      setActionLoading(doctorId)
      const response = await fetch('/api/admin/doctors/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId,
          action: 'approve' // This will set is_active to true
        })
      })

      const result = await response.json()
      console.log('Enable API response:', result)
      
      if (result.success) {
        await loadAllDoctors() // Reload the list
        setEnableConfirmOpen(null)
        toast.success('Doctor enabled successfully', {
          description: `${result.doctor?.full_name || 'Doctor'} has been re-enabled and can now accept new appointments.`,
          duration: 4000
        })
      } else {
        console.error('Failed to enable doctor:', result.error)
        toast.error('Failed to enable doctor', {
          description: result.error || 'An unexpected error occurred while enabling the doctor.',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error enabling doctor:', error)
      toast.error('Network error', {
        description: error instanceof Error ? error.message : 'Unable to connect to the server. Please try again.',
        duration: 5000
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteDoctor = async (doctorId: string) => {
    try {
      setActionLoading(doctorId)
      const response = await fetch('/api/admin/doctors/approve', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId
        })
      })

      const result = await response.json()
      if (result.success) {
        await loadAllDoctors() // Reload the list
        setDeleteConfirmOpen(null)
        toast.error('Doctor deleted permanently', {
          description: 'The doctor profile and all associated data have been permanently removed.',
          duration: 4000
        })
      } else {
        console.error('Failed to delete doctor:', result.error)
        toast.error('Failed to delete doctor', {
          description: result.error || 'An unexpected error occurred while deleting the doctor.',
          duration: 5000
        })
      }
    } catch (error) {
      console.error('Error deleting doctor:', error)
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
          Active
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
        title="Loading Doctor Data"
        subtitle="Retrieving all doctor profiles and information..."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Doctor Management
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Manage active and disabled doctors on the HHWH platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-brand-green via-brand-green to-brand-green/90 text-white border-0 px-6 py-3 shadow-lg rounded-2xl text-sm font-semibold">
            <Users className="w-5 h-5 mr-2" />
            {filteredDoctors.length} {currentTab === 'active' ? 'Active' : 'Disabled'} Doctors
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
              className="pl-12 h-12 bg-white/80 border-gray-200 focus:border-brand-green focus:ring-brand-green/20 rounded-xl shadow-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 rounded-3xl shadow-xl border border-gray-100 h-auto">
          <TabsTrigger 
            value="active" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:via-brand-green data-[state=active]:to-brand-green/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Active Doctors
          </TabsTrigger>
          <TabsTrigger 
            value="disabled"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red data-[state=active]:via-brand-red data-[state=active]:to-brand-red/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Disabled Doctors
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="space-y-6">
          {/* Doctors Table */}
      <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-foreground">Active Doctors</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-brand-green/10 to-brand-green/5 rounded-xl">
                <UserCheck className="h-4 w-4 text-brand-green" />
                <span className="text-sm font-medium text-foreground">Active Status</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>HPCSA</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-foreground">No active doctors found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id} className="hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white/50 transition-all duration-300 border-b border-gray-50 group">
                      <TableCell className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-2xl overflow-hidden">
                            {doctor.profile_image_url ? (
                              <Image
                                src={doctor.profile_image_url}
                                alt={`${doctor.full_name} profile`}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-blue/10 flex items-center justify-center">
                                <Stethoscope className="h-6 w-6 text-brand-green" />
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
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 rounded-xl">
                            <GraduationCap className="h-5 w-5 text-brand-blue" />
                          </div>
                          <span className="font-semibold text-base text-foreground">{doctor.specialization}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <code className="text-sm bg-gradient-to-r from-gray-50 via-white to-gray-50 px-4 py-3 rounded-2xl font-mono border-2 border-gray-100 shadow-md font-bold text-gray-700">
                          {doctor.hpcsa_number}
                        </code>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-brand-green/10 to-brand-green/5 rounded-xl">
                            <Banknote className="h-5 w-5 text-brand-green" />
                          </div>
                          <span className="font-bold text-lg text-brand-green">{formatCurrency(doctor.consultation_fee)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-bold text-foreground">
                            {format(parseISO(doctor.created_at), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {format(parseISO(doctor.created_at), 'HH:mm')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center space-x-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedDoctor(doctor)}
                                className="h-11 w-11 p-0 hover:bg-brand-blue/10 hover:text-brand-blue transition-all duration-200 rounded-2xl hover:shadow-lg hover:scale-105"
                              >
                                <Eye className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <Stethoscope className="h-5 w-5 text-brand-green" />
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
                                        <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-blue/10 flex items-center justify-center">
                                          <Stethoscope className="h-8 w-8 text-brand-green" />
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
                                          <Mail className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{selectedDoctor.email || 'Not provided'}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Phone className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{selectedDoctor.phone || 'Not provided'}</span>
                                        </div>
                                        {selectedDoctor.practice_address && (
                                          <div className="flex items-center space-x-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">{selectedDoctor.practice_address}</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{selectedDoctor.qualification}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Calendar className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{selectedDoctor.years_experience} years experience</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Banknote className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm">{formatCurrency(selectedDoctor.consultation_fee)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Professional Details */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-3">Professional Details</h3>
                                    <div className="space-y-2">
                                      <div>
                                        <span className="font-medium">HPCSA Registration:</span>
                                        <code className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                                          {selectedDoctor.hpcsa_number}
                                        </code>
                                      </div>
                                      <div>
                                        <span className="font-medium">Specialization:</span>
                                        <span className="ml-2 text-sm">{selectedDoctor.specialization}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bio */}
                                  {selectedDoctor.bio && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-3">Professional Bio</h3>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {selectedDoctor.bio}
                                      </p>
                                    </div>
                                  )}

                                  {/* Management Actions */}
                                  <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Dialog open={disableConfirmOpen === selectedDoctor.id} onOpenChange={(open) => setDisableConfirmOpen(open ? selectedDoctor.id : null)}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="text-brand-amber border-brand-amber/20 hover:bg-brand-amber/10"
                                        >
                                          <UserX className="mr-2 h-4 w-4" />
                                          Disable Doctor
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle className="flex items-center space-x-2">
                                            <AlertTriangle className="h-5 w-5 text-brand-amber" />
                                            <span>Disable Doctor</span>
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <p className="text-sm text-muted-foreground">
                                            Are you sure you want to disable <strong>{selectedDoctor.full_name}</strong>? 
                                            This will prevent them from accepting new appointments but preserve their account and data.
                                          </p>
                                          <div className="bg-gradient-to-r from-brand-amber/10 to-brand-amber/5 p-4 rounded-xl">
                                            <div className="flex items-start space-x-3">
                                              <AlertTriangle className="h-5 w-5 text-brand-amber flex-shrink-0 mt-0.5" />
                                              <div className="text-sm">
                                                <p className="font-medium text-foreground">This action will:</p>
                                                <ul className="mt-2 space-y-1 text-muted-foreground">
                                                  <li>• Prevent new appointments from being booked</li>
                                                  <li>• Keep existing appointments and patient data</li>
                                                  <li>• Allow reactivation later if needed</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex space-x-3 justify-end">
                                            <Button
                                              variant="outline"
                                              onClick={() => setDisableConfirmOpen(null)}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() => handleDisableDoctor(selectedDoctor.id)}
                                              disabled={actionLoading === selectedDoctor.id}
                                              className="bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:from-brand-amber/90 hover:to-brand-amber/70 text-white"
                                            >
                                              {actionLoading === selectedDoctor.id ? 'Disabling...' : 'Disable Doctor'}
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>

                                    <Dialog open={deleteConfirmOpen === selectedDoctor.id} onOpenChange={(open) => setDeleteConfirmOpen(open ? selectedDoctor.id : null)}>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="text-brand-red border-brand-red/20 hover:bg-brand-red/10"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete Doctor
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle className="flex items-center space-x-2">
                                            <AlertTriangle className="h-5 w-5 text-brand-red" />
                                            <span>Delete Doctor</span>
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <p className="text-sm text-muted-foreground">
                                            Are you sure you want to permanently delete <strong>{selectedDoctor.full_name}</strong>? 
                                            This action cannot be undone and will remove all associated data.
                                          </p>
                                          <div className="bg-gradient-to-r from-brand-red/10 to-brand-red/5 p-4 rounded-xl">
                                            <div className="flex items-start space-x-3">
                                              <AlertTriangle className="h-5 w-5 text-brand-red flex-shrink-0 mt-0.5" />
                                              <div className="text-sm">
                                                <p className="font-medium text-foreground">This action will permanently:</p>
                                                <ul className="mt-2 space-y-1 text-muted-foreground">
                                                  <li>• Remove the doctor's profile and account</li>
                                                  <li>• Delete all professional information</li>
                                                  <li>• Cancel any pending appointments</li>
                                                  <li>• Remove access to the platform</li>
                                                </ul>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex space-x-3 justify-end">
                                            <Button
                                              variant="outline"
                                              onClick={() => setDeleteConfirmOpen(null)}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={() => handleDeleteDoctor(selectedDoctor.id)}
                                              disabled={actionLoading === selectedDoctor.id}
                                              className="bg-gradient-to-r from-brand-red to-brand-red/80 hover:from-brand-red/90 hover:to-brand-red/70 text-white"
                                            >
                                              {actionLoading === selectedDoctor.id ? 'Deleting...' : 'Delete Permanently'}
                                            </Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {/* Show different buttons based on doctor status and current tab */}
                          {currentTab === 'active' ? (
                            <Dialog open={disableConfirmOpen === doctor.id} onOpenChange={(open) => setDisableConfirmOpen(open ? doctor.id : null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-11 w-11 p-0 hover:bg-brand-amber/10 hover:text-brand-amber transition-all duration-200 rounded-2xl hover:shadow-lg hover:scale-105"
                                >
                                  <UserX className="h-5 w-5" />
                                </Button>
                              </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <AlertTriangle className="h-5 w-5 text-brand-amber" />
                                  <span>Disable Doctor</span>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Are you sure you want to disable <strong>{doctor.full_name}</strong>? 
                                  This will prevent them from accepting new appointments but preserve their account and data.
                                </p>
                                <div className="bg-gradient-to-r from-brand-amber/10 to-brand-amber/5 p-4 rounded-xl">
                                  <div className="flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-brand-amber flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                      <p className="font-medium text-foreground">This action will:</p>
                                      <ul className="mt-2 space-y-1 text-muted-foreground">
                                        <li>• Prevent new appointments from being booked</li>
                                        <li>• Keep existing appointments and patient data</li>
                                        <li>• Allow reactivation later if needed</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-3 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDisableConfirmOpen(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleDisableDoctor(doctor.id)}
                                    disabled={actionLoading === doctor.id}
                                    className="bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:from-brand-amber/90 hover:to-brand-amber/70 text-white"
                                  >
                                    {actionLoading === doctor.id ? 'Disabling...' : 'Disable Doctor'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          ) : (
                            <Dialog open={enableConfirmOpen === doctor.id} onOpenChange={(open) => setEnableConfirmOpen(open ? doctor.id : null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-11 w-11 p-0 hover:bg-brand-green/10 hover:text-brand-green transition-all duration-200 rounded-2xl hover:shadow-lg hover:scale-105"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <CheckCircle className="h-5 w-5 text-brand-green" />
                                    <span>Enable Doctor</span>
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-muted-foreground">
                                    Are you sure you want to enable <strong>{doctor.full_name}</strong>? 
                                    This will allow them to accept new appointments again.
                                  </p>
                                  <div className="bg-gradient-to-r from-brand-green/10 to-brand-green/5 p-4 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                      <CheckCircle className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                                      <div className="text-sm">
                                        <p className="font-medium text-foreground">This action will:</p>
                                        <ul className="mt-2 space-y-1 text-muted-foreground">
                                          <li>• Allow new appointments to be booked</li>
                                          <li>• Restore full doctor portal access</li>
                                          <li>• Make the doctor visible to patients</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-3 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEnableConfirmOpen(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleEnableDoctor(doctor.id)}
                                      disabled={actionLoading === doctor.id}
                                      className="bg-gradient-to-r from-brand-green to-brand-green/80 hover:from-brand-green/90 hover:to-brand-green/70 text-white"
                                    >
                                      {actionLoading === doctor.id ? 'Enabling...' : 'Enable Doctor'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}

                          <Dialog open={deleteConfirmOpen === doctor.id} onOpenChange={(open) => setDeleteConfirmOpen(open ? doctor.id : null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-11 w-11 p-0 hover:bg-brand-red/10 hover:text-brand-red transition-all duration-200 rounded-2xl hover:shadow-lg hover:scale-105"
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <AlertTriangle className="h-5 w-5 text-brand-red" />
                                  <span>Delete Doctor</span>
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  Are you sure you want to permanently delete <strong>{doctor.full_name}</strong>? 
                                  This action cannot be undone and will remove all associated data.
                                </p>
                                <div className="bg-gradient-to-r from-brand-red/10 to-brand-red/5 p-4 rounded-xl">
                                  <div className="flex items-start space-x-3">
                                    <AlertTriangle className="h-5 w-5 text-brand-red flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                      <p className="font-medium text-foreground">This action will permanently:</p>
                                      <ul className="mt-2 space-y-1 text-muted-foreground">
                                        <li>• Remove the doctor's profile and account</li>
                                        <li>• Delete all professional information</li>
                                        <li>• Cancel any pending appointments</li>
                                        <li>• Remove access to the platform</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-3 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirmOpen(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteDoctor(doctor.id)}
                                    disabled={actionLoading === doctor.id}
                                    className="bg-gradient-to-r from-brand-red to-brand-red/80 hover:from-brand-red/90 hover:to-brand-red/70 text-white"
                                  >
                                    {actionLoading === doctor.id ? 'Deleting...' : 'Delete Permanently'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-20">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 rounded-3xl flex items-center justify-center shadow-lg">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-foreground">
                      No {currentTab === 'active' ? 'active' : 'disabled'} doctors found
                    </p>
                    <p className="text-base text-muted-foreground">
                      {searchTerm ? 'Try adjusting your search criteria' : `No ${currentTab} doctors available`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <MobileDoctorCard 
                  key={doctor.id} 
                  doctor={doctor} 
                  currentTab={currentTab}
                  expandedCard={expandedCard}
                  setExpandedCard={setExpandedCard}
                  setSelectedDoctor={setSelectedDoctor}
                  disableConfirmOpen={disableConfirmOpen}
                  setDisableConfirmOpen={setDisableConfirmOpen}
                  enableConfirmOpen={enableConfirmOpen}
                  setEnableConfirmOpen={setEnableConfirmOpen}
                  deleteConfirmOpen={deleteConfirmOpen}
                  setDeleteConfirmOpen={setDeleteConfirmOpen}
                  actionLoading={actionLoading}
                  handleDisableDoctor={handleDisableDoctor}
                  handleEnableDoctor={handleEnableDoctor}
                  handleDeleteDoctor={handleDeleteDoctor}
                  formatCurrency={formatCurrency}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}