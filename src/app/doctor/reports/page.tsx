'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Download,
  Filter,
  Eye,
  FileText,
  PieChart,
  Activity,
  Heart,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'
import { format, subDays, subMonths, parseISO } from 'date-fns'

interface ReportStats {
  totalPatients: number
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  averageSessionFee: number
  patientRetentionRate: number
  newPatientsThisMonth: number
}

interface AppointmentTrend {
  date: string
  appointments: number
  revenue: number
}

interface PatientDemographic {
  ageGroup: string
  count: number
  percentage: number
}

interface TopCondition {
  condition: string
  count: number
  percentage: number
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageSessionFee: 0,
    patientRetentionRate: 0,
    newPatientsThisMonth: 0
  })
  const [appointmentTrends, setAppointmentTrends] = useState<AppointmentTrend[]>([])
  const [demographics, setDemographics] = useState<PatientDemographic[]>([])
  const [topConditions, setTopConditions] = useState<TopCondition[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30') // Days
  const [reportType, setReportType] = useState('overview')

  // Hardcoded doctor ID for now
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9'

  useEffect(() => {
    loadReportData()
  }, [dateRange, reportType])

  const loadReportData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointments and patients data
      const [appointmentsRes, patientsRes] = await Promise.all([
        fetch(`/api/appointments/doctor/${doctorId}`),
        fetch(`/api/patients/doctor/${doctorId}`)
      ])

      if (appointmentsRes.ok && patientsRes.ok) {
        const appointments = await appointmentsRes.json()
        const patients = await patientsRes.json()
        
        // Calculate statistics
        calculateStats(appointments, patients)
        generateTrends(appointments)
        calculateDemographics(patients)
        analyzeConditions(appointments)
      }
    } catch (error) {
      console.error('Error loading report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (appointments: any[], patients: any[]) => {
    const now = new Date()
    const daysAgo = parseInt(dateRange)
    const startDate = subDays(now, daysAgo)
    
    // Filter appointments by date range
    const filteredAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date)
      return aptDate >= startDate
    })

    const completedCount = filteredAppointments.filter(apt => apt.appointment_status === 'completed').length
    const cancelledCount = filteredAppointments.filter(apt => apt.appointment_status === 'cancelled').length
    const totalRevenue = filteredAppointments
      .filter(apt => apt.payment_status === 'completed' || apt.payment_status === 'paid')
      .reduce((sum, apt) => sum + (apt.consultation_fee || 0), 0)

    // Calculate new patients this month
    const oneMonthAgo = subMonths(now, 1)
    const newPatients = patients.filter(patient => {
      if (!patient.firstAppointment) return false
      const firstAptDate = new Date(patient.firstAppointment.date)
      return firstAptDate >= oneMonthAgo
    }).length

    setStats({
      totalPatients: patients.length,
      totalAppointments: filteredAppointments.length,
      completedAppointments: completedCount,
      cancelledAppointments: cancelledCount,
      totalRevenue,
      averageSessionFee: completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0,
      patientRetentionRate: patients.length > 0 ? Math.round((patients.filter(p => p.totalAppointments > 1).length / patients.length) * 100) : 0,
      newPatientsThisMonth: newPatients
    })
  }

  const generateTrends = (appointments: any[]) => {
    const trends: { [key: string]: { appointments: number, revenue: number } } = {}
    const daysAgo = parseInt(dateRange)
    
    // Initialize trends for the last N days
    for (let i = daysAgo; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      trends[date] = { appointments: 0, revenue: 0 }
    }
    
    // Populate with actual data
    appointments.forEach(apt => {
      const aptDate = format(new Date(apt.appointment_date), 'yyyy-MM-dd')
      if (trends[aptDate]) {
        trends[aptDate].appointments += 1
        if (apt.payment_status === 'completed' || apt.payment_status === 'paid') {
          trends[aptDate].revenue += apt.consultation_fee || 0
        }
      }
    })
    
    const trendArray = Object.entries(trends).map(([date, data]) => ({
      date,
      appointments: data.appointments,
      revenue: data.revenue
    }))
    
    setAppointmentTrends(trendArray)
  }

  const calculateDemographics = (patients: any[]) => {
    const ageGroups: { [key: string]: number } = {
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55-64': 0,
      '65+': 0
    }
    
    patients.forEach(patient => {
      const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
      if (age >= 25 && age <= 34) ageGroups['25-34']++
      else if (age >= 35 && age <= 44) ageGroups['35-44']++
      else if (age >= 45 && age <= 54) ageGroups['45-54']++
      else if (age >= 55 && age <= 64) ageGroups['55-64']++
      else if (age >= 65) ageGroups['65+']++
    })
    
    const total = patients.length
    const demographicsArray = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    
    setDemographics(demographicsArray)
  }

  const analyzeConditions = (appointments: any[]) => {
    // Analyze real symptoms data from appointments
    const conditionCounts: { [key: string]: number } = {}
    
    appointments.forEach(apt => {
      if (apt.symptoms_description) {
        // Keyword analysis of real patient symptoms
        const symptoms = apt.symptoms_description.toLowerCase()
        if (symptoms.includes('hot flash') || symptoms.includes('menopause')) {
          conditionCounts['Menopausal Symptoms'] = (conditionCounts['Menopausal Symptoms'] || 0) + 1
        }
        if (symptoms.includes('irregular') || symptoms.includes('period')) {
          conditionCounts['Irregular Periods'] = (conditionCounts['Irregular Periods'] || 0) + 1
        }
        if (symptoms.includes('mood') || symptoms.includes('anxiety')) {
          conditionCounts['Mood Changes'] = (conditionCounts['Mood Changes'] || 0) + 1
        }
        if (symptoms.includes('sleep') || symptoms.includes('insomnia')) {
          conditionCounts['Sleep Issues'] = (conditionCounts['Sleep Issues'] || 0) + 1
        }
        if (symptoms.includes('hormone') || symptoms.includes('hrt')) {
          conditionCounts['Hormone Therapy'] = (conditionCounts['Hormone Therapy'] || 0) + 1
        }
      }
    })
    
    const total = Object.values(conditionCounts).reduce((sum, count) => sum + count, 0)
    const conditionsArray = Object.entries(conditionCounts)
      .map(([condition, count]) => ({
        condition,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    setTopConditions(conditionsArray)
  }

  const exportReport = () => {
    // Generate and download comprehensive report with real data
    const reportData = {
      generated: new Date().toISOString(),
      dateRange: `${dateRange} days`,
      stats,
      trends: appointmentTrends,
      demographics,
      conditions: topConditions
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doctor-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-brand-purple/10 via-brand-blue/5 to-brand-green/10 rounded-2xl p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
              <div>
                <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
        
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
      <div className="bg-gradient-to-r from-brand-purple/10 via-brand-blue/5 to-brand-green/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-brand-purple" />
              </div>
              Reports & Analytics
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights into your practice performance and patient care</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button onClick={exportReport} className="bg-brand-purple hover:bg-brand-purple/90 text-white">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 3 months</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="patients">Patient Analytics</SelectItem>
                  <SelectItem value="clinical">Clinical Insights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={loadReportData}
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-all"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-blue transition-colors">{stats.totalPatients}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newPatientsThisMonth} this month
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
                <p className="text-sm font-medium text-muted-foreground">Completed Sessions</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-green transition-colors">{stats.completedAppointments}</p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {stats.totalAppointments > 0 ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}% completion rate
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                <CheckCircle className="h-7 w-7 text-brand-green group-hover:animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-purple/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-purple transition-colors">R{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-brand-purple mt-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  R{stats.averageSessionFee} avg/session
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-purple/20">
                <DollarSign className="h-7 w-7 text-brand-purple group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-amber/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Retention</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-amber transition-colors">{stats.patientRetentionRate}%</p>
                <p className="text-xs text-brand-amber mt-1 flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Returning patients
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-amber/20">
                <Heart className="h-7 w-7 text-brand-amber group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Trends */}
        <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="w-10 h-10 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-brand-blue" />
              </div>
              Appointment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointmentTrends.slice(-7).map((trend, index) => (
                <div key={trend.date} className="flex items-center justify-between p-3 bg-brand-blue/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-blue/10 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-brand-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{format(parseISO(trend.date), 'MMM dd')}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(trend.date), 'EEEE')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-blue">{trend.appointments}</p>
                    <p className="text-xs text-muted-foreground">appointments</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-green">R{trend.revenue}</p>
                    <p className="text-xs text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Demographics */}
        <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300 hover:shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-heading">
              <div className="w-10 h-10 bg-brand-green/10 rounded-2xl flex items-center justify-center">
                <PieChart className="h-5 w-5 text-brand-green" />
              </div>
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demographics.map((demo) => (
                <div key={demo.ageGroup} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{demo.ageGroup} years</span>
                    <span className="text-muted-foreground">{demo.count} patients ({demo.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-brand-green h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${demo.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Conditions */}
      <Card className="card-healthcare border-2 hover:border-brand-purple/30 transition-all duration-300 hover:shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-heading">
            <div className="w-10 h-10 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
              <Activity className="h-5 w-5 text-brand-purple" />
            </div>
            Top Conditions Treated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Condition</TableHead>
                  <TableHead>Cases</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topConditions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No condition data available for the selected period
                    </TableCell>
                  </TableRow>
                ) : (
                  topConditions.map((condition, index) => (
                    <TableRow key={condition.condition}>
                      <TableCell className="font-medium">{condition.condition}</TableCell>
                      <TableCell>
                        <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20">
                          {condition.count}
                        </Badge>
                      </TableCell>
                      <TableCell>{condition.percentage}%</TableCell>
                      <TableCell>
                        {condition.count > 0 ? (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-brand-green" />
                            <span className="text-sm text-brand-green">{condition.count} cases</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}