'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  pending_doctors: number
  approved_doctors: number
  rejected_doctors: number
  total_doctors: number
  recent_applications: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pending_doctors: 0,
    approved_doctors: 0,
    rejected_doctors: 0,
    total_doctors: 0,
    recent_applications: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all doctors to calculate stats
      const response = await fetch('/api/admin/doctors/approve?status=all')
      const result = await response.json()

      if (result.success) {
        const doctors = result.doctors || []
        
        setStats({
          pending_doctors: doctors.filter((d: any) => !d.approval_status).length,
          approved_doctors: doctors.filter((d: any) => d.is_active).length,
          rejected_doctors: doctors.filter((d: any) => d.approval_status === 'rejected').length,
          total_doctors: doctors.length,
          recent_applications: doctors.slice(0, 5) // Get 5 most recent
        })
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of HHWH Clinic system administration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            System Status: Active
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Pending Applications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-3xl font-bold text-brand-amber">
                  {stats.pending_doctors}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Awaiting review
                </p>
              </div>
              <div className="p-3 bg-brand-amber/10 rounded-full">
                <Clock className="h-6 w-6 text-brand-amber" />
              </div>
            </div>
            {stats.pending_doctors > 0 && (
              <div className="mt-4">
                <Link href="/admin/doctors">
                  <Button size="sm" className="w-full bg-brand-amber hover:bg-brand-amber/90 text-gray-800">
                    Review Applications
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Doctors */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Doctors</p>
                <p className="text-3xl font-bold text-brand-green">
                  {stats.approved_doctors}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Approved & active
                </p>
              </div>
              <div className="p-3 bg-brand-green/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-brand-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Applications */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-brand-red">
                  {stats.rejected_doctors}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Applications declined
                </p>
              </div>
              <div className="p-3 bg-brand-red/10 rounded-full">
                <XCircle className="h-6 w-6 text-brand-red" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Doctors */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total_doctors}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Users className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-brand-blue" />
              <span>Doctor Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/doctors">
              <Button className="w-full justify-start" variant="outline">
                Review Applications
              </Button>
            </Link>
            <Link href="/admin/doctors/active">
              <Button className="w-full justify-start" variant="outline">
                Manage Active Doctors
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-brand-green" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Database Status</span>
              <Badge className="bg-brand-green text-white">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>API Status</span>
              <Badge className="bg-brand-green text-white">Active</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Payment Gateway</span>
              <Badge className="bg-brand-green text-white">Connected</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-brand-purple" />
              <span>Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Applications This Week</span>
              <span className="font-medium">{stats.recent_applications.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Approval Rate</span>
              <span className="font-medium">
                {stats.total_doctors > 0 
                  ? Math.round((stats.approved_doctors / stats.total_doctors) * 100) 
                  : 0}%
              </span>
            </div>
            <Link href="/admin/analytics">
              <Button className="w-full" variant="outline">
                View Full Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {stats.recent_applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Applications</span>
              <Link href="/admin/doctors">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_applications.map((doctor: any) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doctor.full_name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={
                        doctor.approval_status === 'approved' || doctor.is_active
                          ? 'bg-brand-green text-white'
                          : doctor.approval_status === 'rejected'
                          ? 'bg-brand-red text-white'
                          : 'bg-brand-amber text-gray-800'
                      }
                    >
                      {doctor.approval_status === 'approved' || doctor.is_active
                        ? 'Approved'
                        : doctor.approval_status === 'rejected'
                        ? 'Rejected'
                        : 'Pending'
                      }
                    </Badge>
                    <Link href={`/admin/doctors?view=${doctor.id}`}>
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Alerts */}
      {stats.pending_doctors > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <h3 className="font-medium text-amber-800">
                  Action Required: {stats.pending_doctors} Pending Application{stats.pending_doctors !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Doctor applications are waiting for your review and approval.
                </p>
              </div>
              <Link href="/admin/doctors">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white ml-auto">
                  Review Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}