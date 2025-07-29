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
import { LoadingScreen } from '@/components/ui/loading'

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
      <LoadingScreen
        title="Loading Admin Dashboard"
        subtitle="Preparing system overview..."
      />
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Overview of HHWH Clinic system administration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-brand-green via-brand-green to-brand-green/90 text-white border-0 px-6 py-3 shadow-lg rounded-2xl text-sm font-semibold">
            <div className="w-2 h-2 bg-white/80 rounded-full mr-2 animate-pulse"></div>
            System Online
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Applications */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-amber/5 hover:to-brand-amber/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Pending Applications</p>
                <p className="text-3xl font-bold text-brand-amber">
                  {stats.pending_doctors}
                </p>
                <p className="text-xs text-muted-foreground">
                  Awaiting review
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-amber to-brand-amber/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            {stats.pending_doctors > 0 && (
              <div className="mt-6">
                <Link href="/admin/doctors">
                  <Button size="sm" className="w-full bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:from-brand-amber/90 hover:to-brand-amber/70 text-white border-0 shadow-md">
                    Review Applications
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Doctors */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-green/5 hover:to-brand-green/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Active Doctors</p>
                <p className="text-3xl font-bold text-brand-green">
                  {stats.approved_doctors}
                </p>
                <p className="text-xs text-muted-foreground">
                  Approved & active
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rejected Applications */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-red/5 hover:to-brand-red/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Rejected</p>
                <p className="text-3xl font-bold text-brand-red">
                  {stats.rejected_doctors}
                </p>
                <p className="text-xs text-muted-foreground">
                  Applications declined
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Doctors */}
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-100/50 hover:to-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.total_doctors}
                </p>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-gray-700 to-gray-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-blue/5 hover:to-brand-blue/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-foreground">Doctor Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/doctors">
              <Button className="w-full justify-start bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 hover:from-brand-blue/20 hover:to-brand-blue/10 text-brand-blue border-brand-blue/20 hover:border-brand-blue/30" variant="outline">
                Review Applications
              </Button>
            </Link>
            <Link href="/admin/doctors/active">
              <Button className="w-full justify-start bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 hover:from-brand-blue/20 hover:to-brand-blue/10 text-brand-blue border-brand-blue/20 hover:border-brand-blue/30" variant="outline">
                Manage Active Doctors
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-green/5 hover:to-brand-green/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-foreground">System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-green/5 to-brand-green/10 rounded-xl">
              <span className="text-sm font-medium text-foreground">Database Status</span>
              <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0 shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-green/5 to-brand-green/10 rounded-xl">
              <span className="text-sm font-medium text-foreground">API Status</span>
              <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0 shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-green/5 to-brand-green/10 rounded-xl">
              <span className="text-sm font-medium text-foreground">Payment Gateway</span>
              <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0 shadow-sm">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse"></div>
                Connected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-brand-red/5 hover:to-brand-red/10">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-heading font-bold text-foreground">Quick Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-red/5 to-brand-red/10 rounded-xl">
              <span className="text-sm font-medium text-foreground">Applications This Week</span>
              <span className="font-bold text-brand-red text-lg">{stats.recent_applications.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-red/5 to-brand-red/10 rounded-xl">
              <span className="text-sm font-medium text-foreground">Approval Rate</span>
              <span className="font-bold text-brand-red text-lg">
                {stats.total_doctors > 0 
                  ? Math.round((stats.approved_doctors / stats.total_doctors) * 100) 
                  : 0}%
              </span>
            </div>
            <Link href="/admin/analytics">
              <Button className="w-full bg-gradient-to-r from-brand-red/10 to-brand-red/5 hover:from-brand-red/20 hover:to-brand-red/10 text-brand-red border-brand-red/20 hover:border-brand-red/30" variant="outline">
                View Full Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      {stats.recent_applications.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-brand-blue to-brand-green rounded-2xl shadow-lg">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <span className="font-heading font-bold text-foreground">Recent Applications</span>
              </div>
              <Link href="/admin/doctors">
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-brand-blue/10 to-brand-blue/5 hover:from-brand-blue/20 hover:to-brand-blue/10 text-brand-blue border-brand-blue/20 hover:border-brand-blue/30">
                  View All
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_applications.map((doctor: any) => (
                <div key={doctor.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/50 hover:from-gray-50 hover:to-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-blue/10 to-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <UserCheck className="h-6 w-6 text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-brand-blue transition-colors duration-300">{doctor.full_name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      className={`border-0 shadow-sm ${
                        doctor.approval_status === 'approved' || doctor.is_active
                          ? 'bg-gradient-to-r from-brand-green to-brand-green/80 text-white'
                          : doctor.approval_status === 'rejected'
                          ? 'bg-gradient-to-r from-brand-red to-brand-red/80 text-white'
                          : 'bg-gradient-to-r from-brand-amber to-brand-amber/80 text-white'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 bg-white/80 rounded-full mr-1.5"></div>
                      {doctor.approval_status === 'approved' || doctor.is_active
                        ? 'Approved'
                        : doctor.approval_status === 'rejected'
                        ? 'Rejected'
                        : 'Pending'
                      }
                    </Badge>
                    <Link href={`/admin/doctors?view=${doctor.id}`}>
                      <Button size="sm" variant="outline" className="bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 border-gray-200 hover:border-gray-300 text-foreground group-hover:text-brand-blue transition-colors duration-300">
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
        <Card className="border-0 bg-gradient-to-r from-brand-amber/10 via-brand-amber/5 to-brand-amber/10 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-brand-amber to-brand-amber/80 rounded-2xl shadow-lg animate-pulse">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-foreground text-lg">
                  Action Required: {stats.pending_doctors} Pending Application{stats.pending_doctors !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Doctor applications are waiting for your review and approval.
                </p>
              </div>
              <Link href="/admin/doctors">
                <Button className="bg-gradient-to-r from-brand-amber to-brand-amber/80 hover:from-brand-amber/90 hover:to-brand-amber/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6">
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