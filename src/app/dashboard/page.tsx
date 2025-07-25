'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  ArrowRight,
  Plus,
  Heart,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6">
            <p>Please sign in to access your dashboard.</p>
            <Link href="/auth/login">
              <Button className="btn-healthcare-primary mt-4">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/30 via-white to-brand-blue-light/20">
      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-brand-blue/10 p-3 rounded-full">
              <User className="h-8 w-8 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">
                Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground">
                Manage your hormone health journey and appointments
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-brand-green/20 bg-brand-green/5 hover:bg-brand-green/10 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand-green" />
                    <h3 className="font-semibold">Book Appointment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Schedule with your preferred specialist
                  </p>
                </div>
                <Link href="/patient/book-appointment">
                  <Button size="sm" className="btn-healthcare-primary">
                    <Plus className="h-4 w-4 mr-1" />
                    Book
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-purple/20 bg-brand-purple/5 hover:bg-brand-purple/10 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-brand-purple" />
                    <h3 className="font-semibold">Health Assessment</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Complete your hormone health assessment
                  </p>
                </div>
                <Link href="/patient/assessment">
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-brand-blue/20 bg-brand-blue/5 hover:bg-brand-blue/10 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-blue" />
                    <h3 className="font-semibold">Patient Records</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View your detailed health records
                  </p>
                </div>
                <Link href="/patient/dashboard">
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-brand-orange" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest appointments and assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Recent Activity</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Start by booking your first appointment or completing a health assessment
                </p>
                <div className="flex gap-2 justify-center">
                  <Link href="/patient/book-appointment">
                    <Button size="sm" className="btn-healthcare-primary">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/patient/assessment">
                    <Button size="sm" variant="outline">
                      Take Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-brand-green" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your profile details and account status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant="outline" className="bg-brand-green/10 text-brand-green border-brand-green/20">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-4">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}