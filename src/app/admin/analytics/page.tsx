'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  Users, 
  UserCheck,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Banknote,
  Activity,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  Heart,
  Mail,
  Phone
} from 'lucide-react'

// Mock data - In a real app, this would come from APIs
const mockAnalytics = {
  overview: {
    totalDoctors: 12,
    activeDoctors: 8,
    totalPatients: 342,
    totalAppointments: 1456,
    monthlyRevenue: 145600,
    averageConsultationFee: 850
  },
  trends: {
    doctorsGrowth: 12.5,
    patientsGrowth: 23.8,
    appointmentsGrowth: 15.2,
    revenueGrowth: 18.7
  },
  doctorStats: [
    { name: 'Dr. Anita Kruger', appointments: 89, revenue: 84550, rating: 4.9 },
    { name: 'Dr. Sarah van der Merwe', appointments: 76, revenue: 64600, rating: 4.8 },
    { name: 'Dr. Michael Thompson', appointments: 65, revenue: 52000, rating: 4.7 },
    { name: 'Dr. Priya Patel', appointments: 58, revenue: 43500, rating: 4.6 },
    { name: 'Dr. James Oosthuizen', appointments: 52, revenue: 47840, rating: 4.8 }
  ],
  appointmentsByMonth: [
    { month: 'Jan', appointments: 98, revenue: 83300 },
    { month: 'Feb', appointments: 112, revenue: 95200 },
    { month: 'Mar', appointments: 128, revenue: 108800 },
    { month: 'Apr', appointments: 145, revenue: 123250 },
    { month: 'May', appointments: 134, revenue: 113900 },
    { month: 'Jun', appointments: 156, revenue: 132600 }
  ]
}

export default function AdminAnalyticsPage() {
  const [currentTab, setCurrentTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0
    return (
      <div className={`flex items-center space-x-1 ${isPositive ? 'text-brand-green' : 'text-brand-red'}`}>
        {isPositive ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span className="font-bold">{Math.abs(value)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Monitor platform performance and business insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-gradient-to-r from-brand-blue via-brand-blue to-brand-blue/90 text-white border-0 px-6 py-3 shadow-lg rounded-2xl text-sm font-semibold">
            <BarChart3 className="w-5 h-5 mr-2" />
            Live Analytics
          </Badge>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Doctors */}
        <Card className="border-0 bg-gradient-to-br from-white via-white to-brand-blue/5 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Total Doctors
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {mockAnalytics.overview.totalDoctors}
                </p>
                <div className="mt-2">
                  {formatPercentage(mockAnalytics.trends.doctorsGrowth)}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-3xl shadow-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Doctors */}
        <Card className="border-0 bg-gradient-to-br from-white via-white to-brand-green/5 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Active Doctors
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {mockAnalytics.overview.activeDoctors}
                </p>
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    {Math.round((mockAnalytics.overview.activeDoctors / mockAnalytics.overview.totalDoctors) * 100)}% active
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-3xl shadow-xl">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Patients */}
        <Card className="border-0 bg-gradient-to-br from-white via-white to-brand-red/5 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {mockAnalytics.overview.totalPatients.toLocaleString()}
                </p>
                <div className="mt-2">
                  {formatPercentage(mockAnalytics.trends.patientsGrowth)}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-3xl shadow-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="border-0 bg-gradient-to-br from-white via-white to-brand-amber/5 shadow-xl rounded-3xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Monthly Revenue
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {formatCurrency(mockAnalytics.overview.monthlyRevenue)}
                </p>
                <div className="mt-2">
                  {formatPercentage(mockAnalytics.trends.revenueGrowth)}
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-brand-amber to-brand-amber/80 rounded-3xl shadow-xl">
                <Banknote className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed analytics */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 p-1 rounded-3xl shadow-xl border border-gray-100 h-auto">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-blue data-[state=active]:via-brand-blue data-[state=active]:to-brand-blue/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Activity className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger 
            value="doctors"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:via-brand-green data-[state=active]:to-brand-green/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <Stethoscope className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="hidden sm:inline">Doctor Performance</span>
            <span className="sm:hidden">Doctors</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trends"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-red data-[state=active]:via-brand-red data-[state=active]:to-brand-red/90 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-2xl transition-all duration-300 font-semibold text-base py-4 px-4 m-1 flex items-center justify-center whitespace-nowrap"
          >
            <TrendingUp className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>Trends</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
                <CardTitle className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-brand-blue to-brand-blue/80 rounded-2xl shadow-lg flex-shrink-0">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-foreground">Appointment Metrics</h3>
                    <p className="text-sm text-muted-foreground mt-1">Monthly appointment statistics</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Total Appointments</span>
                    <span className="text-3xl font-bold text-foreground">
                      {mockAnalytics.overview.totalAppointments.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Average Fee</span>
                    <span className="text-3xl font-bold text-brand-green">
                      {formatCurrency(mockAnalytics.overview.averageConsultationFee)}
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Growth Rate</span>
                    <div className="text-xl">{formatPercentage(mockAnalytics.trends.appointmentsGrowth)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
                <CardTitle className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xl text-foreground">Key Performance</h3>
                    <p className="text-sm text-muted-foreground mt-1">Platform efficiency metrics</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Doctor Utilization</span>
                    <span className="text-3xl font-bold text-brand-green">
                      {Math.round((mockAnalytics.overview.activeDoctors / mockAnalytics.overview.totalDoctors) * 100)}%
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Avg. Appointments/Doctor</span>
                    <span className="text-3xl font-bold text-foreground">
                      {Math.round(mockAnalytics.overview.totalAppointments / mockAnalytics.overview.activeDoctors)}
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-base font-semibold text-muted-foreground">Platform Status</span>
                    <Badge className="bg-gradient-to-r from-brand-green to-brand-green/80 text-white border-0 px-6 py-3 rounded-2xl shadow-lg">
                      <Zap className="w-5 h-5 mr-2" />
                      <span className="font-bold">Excellent</span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-6">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-brand-green to-brand-green/80 rounded-2xl shadow-lg">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-foreground">Top Performing Doctors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                {mockAnalytics.doctorStats.map((doctor, index) => (
                  <div key={doctor.name} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50/50 to-white rounded-2xl border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-green/10 to-brand-blue/10 rounded-2xl flex items-center justify-center">
                        <span className="font-bold text-lg text-foreground">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{doctor.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doctor.appointments} appointments • Rating: {doctor.rating}★
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-brand-green">{formatCurrency(doctor.revenue)}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-0 bg-gradient-to-br from-white via-white to-gray-50/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="pb-6 bg-gradient-to-r from-gray-50/50 to-white border-b border-gray-100/50">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-brand-red to-brand-red/80 rounded-2xl shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="font-heading font-bold text-xl text-foreground">Monthly Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-foreground mb-4">Appointment Volume</h4>
                  {mockAnalytics.appointmentsByMonth.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-xl border border-gray-100">
                      <span className="font-medium text-foreground">{month.month}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-foreground">{month.appointments}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-blue to-brand-green rounded-full"
                            style={{ width: `${(month.appointments / 160) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-lg text-foreground mb-4">Revenue Trends</h4>
                  {mockAnalytics.appointmentsByMonth.map((month) => (
                    <div key={month.month} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-xl border border-gray-100">
                      <span className="font-medium text-foreground">{month.month}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-lg font-bold text-brand-green">{formatCurrency(month.revenue)}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-brand-green to-brand-amber rounded-full"
                            style={{ width: `${(month.revenue / 140000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}