'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare,
  Users,
  Settings,
  ArrowLeft,
  Clock,
  User,
  Stethoscope,
  Shield,
  AlertCircle,
  CheckCircle,
  Minimize2,
  Maximize2,
  Heart,
  FileText,
  Calendar,
  UserCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

// Jitsi Meet API declaration
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface AppointmentData {
  id: string
  appointment_date: string
  appointment_time: string
  consultation_type: 'initial' | 'follow_up' | 'emergency'
  status: string
  patient_id: string
  doctor_id: string
  symptoms_description?: string
  current_medications?: string
  allergies?: string
  doctor: {
    id: string
    full_name: string
    specialization: string
    profile_photo_url?: string
  }
  patient: {
    id: string
    full_name: string
    profile_photo_url?: string
    email?: string
    phone?: string
  }
  meeting_room_id?: string
}

interface ChatMessage {
  id: string
  sender_type: 'patient' | 'doctor'
  sender_name: string
  message: string
  timestamp: string
}

export default function DoctorConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  
  const appointmentId = params.appointmentId as string
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const jitsiApiRef = useRef<any>(null)
  
  const [appointment, setAppointment] = useState<AppointmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [meetingEnded, setMeetingEnded] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  
  // Meeting controls
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [participantCount, setParticipantCount] = useState(0)

  // Load appointment data
  useEffect(() => {
    loadAppointmentData()
  }, [appointmentId])

  // Initialize Jitsi Meet
  useEffect(() => {
    if (appointment && meetingStarted) {
      initializeJitsiMeet()
    }
    
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
      }
    }
  }, [appointment, meetingStarted])

  const loadAppointmentData = async () => {
    try {
      setLoading(true)
      
      // Fetch appointment with patient data using the API
      const response = await fetch(`/api/appointments/doctor/consultation/${appointmentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointment data')
      }
      
      const appointmentData = await response.json()
      setAppointment(appointmentData)
      
      // Load existing chat messages
      loadChatMessages()
      
    } catch (error) {
      console.error('Error loading appointment data:', error)
      
      // Try fallback approach with basic appointment data
      try {
        const { data: basicAppointment, error: basicError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single()

        if (basicError) throw basicError

        // Get patient data separately
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('id, full_name, email, phone, profile_photo_url')
          .eq('id', basicAppointment.patient_id)
          .single()

        // Create appointment data with fallback doctor info
        const fallbackAppointment = {
          ...basicAppointment,
          doctor: {
            id: basicAppointment.doctor_id,
            full_name: 'Dr. Sarah van der Merwe',
            specialization: 'Women\'s Health Specialist',
            profile_photo_url: null
          },
          patient: patientData || {
            id: basicAppointment.patient_id,
            full_name: 'Patient',
            email: '',
            phone: '',
            profile_photo_url: null
          }
        }

        setAppointment(fallbackAppointment)
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      // In a real implementation, you'd load chat messages from your database
      setChatMessages([])
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const initializeJitsiMeet = () => {
    if (!appointment || !jitsiContainerRef.current) return

    // Use the SAME room name as the patient - this is crucial for room alignment
    const roomName = appointment.meeting_room_id || `hhwh-consultation-${appointmentId}`
    
    console.log('Initializing Jitsi Meet for doctor...')
    
    // For public Jitsi Meet, let's simplify and not use JWT initially
    // JWT requires server-side configuration that we don't have access to

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: appointment.doctor?.full_name || 'Doctor',
        email: user?.email || 'doctor@hhwh.co.za'
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        enableClosePage: false,
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
        doNotStoreRoom: true,
        enableNoAudioDetection: true,
        enableNoisyMicDetection: true,
        resolution: 720,
        // Simple guest configuration for public Jitsi
        requireDisplayName: false,
        enableInsecureRoomNameWarning: false,
        disableAddingBackgroundImages: true,
        disableVirtualBackground: false,
        enableLobby: false,
        enableLobbyChat: false,
        // Allow guests to join immediately
        enableGuests: true,
        guestsAllowed: true,
        constraints: {
          video: {
            aspectRatio: 16 / 9,
            height: {
              ideal: 720,
              max: 720,
              min: 180
            }
          }
        }
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'fodeviceselection', 'settings', 'videoquality', 'filmstrip'
        ],
        TOOLBAR_ALWAYS_VISIBLE: false,
        HIDE_INVITE_MORE_HEADER: true,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
        MOBILE_APP_PROMO: false,
        SHOW_CHROME_EXTENSION_BANNER: false,
        // Enable authentication UI but handle clicks to open in new tabs
        AUTHENTICATION_ENABLE: true,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        DISABLE_PRESENCE_STATUS: true,
        DISABLE_RINGING: true,
        HIDE_DEEP_LINKING_LOGO: true,
        JITSI_WATERMARK_LINK: '',
        LANG_DETECTION: false,
        LIVE_STREAMING_HELP_LINK: '',
        LOCAL_THUMBNAIL_RATIO: 16 / 9,
        MAXIMUM_ZOOMING_COEFFICIENT: 1.3,
        RECENT_LIST_ENABLED: false,
        REMOTE_THUMBNAIL_RATIO: 1,
        SETTINGS_SECTIONS: ['devices', 'language'],
        SUPPORT_URL: '',
        // Completely disable lobby and waiting screens
        DISABLE_LOBBY: true,
        ENABLE_LOBBY_CHAT: false,
        LOBBY_TITLE: '',
        DEFAULT_BACKGROUND: '#000000',
        DISABLE_VIDEO_BACKGROUND: false,
        ENABLE_CALENDAR_INTEGRATION: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        APP_NAME: 'HHWH Online Consultation',
        NATIVE_APP_NAME: 'HHWH Clinic',
        PROVIDER_NAME: 'Hormone Health with Heart'
      }
    }

    // Load Jitsi Meet External API
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script')
      script.src = 'https://meet.jit.si/external_api.js'
      script.onload = () => {
        createJitsiMeeting(options)
      }
      document.body.appendChild(script)
    } else {
      createJitsiMeeting(options)
    }
  }

  const createJitsiMeeting = (options: any) => {
    console.log('Creating Jitsi meeting with options:', options)
    jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', options)
    
    // Set up event listeners
    jitsiApiRef.current.addEventListener('videoConferenceJoined', (data: any) => {
      console.log('Doctor joined video conference:', data)
      setConnectionStatus('connected')
      setParticipantCount(1)
      
      // After Jitsi loads, intercept authentication links to open in new tabs
      setTimeout(() => interceptAuthLinks(), 1000)
    })

    jitsiApiRef.current.addEventListener('participantJoined', (data: any) => {
      setParticipantCount(prev => prev + 1)
    })

    jitsiApiRef.current.addEventListener('participantLeft', (data: any) => {
      setParticipantCount(prev => Math.max(0, prev - 1))
    })

    jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
      setMeetingEnded(true)
      setConnectionStatus('disconnected')
    })

    jitsiApiRef.current.addEventListener('audioMuteStatusChanged', (data: any) => {
      setIsAudioOn(!data.muted)
    })

    jitsiApiRef.current.addEventListener('videoMuteStatusChanged', (data: any) => {
      setIsVideoOn(!data.muted)
    })

    // Handle authentication events to prevent session ending
    jitsiApiRef.current.addEventListener('authStatusChanged', (data: any) => {
      console.log('Auth status changed:', data)
      // Don't end the session, just log the auth change
    })

    jitsiApiRef.current.addEventListener('readyToClose', () => {
      console.log('Jitsi ready to close - preventing default behavior')
      // Prevent automatic closing during auth flow
      return false
    })

    // Function to intercept authentication links and open them in new tabs
    const interceptAuthLinks = () => {
      const jitsiContainer = jitsiContainerRef.current
      if (!jitsiContainer) return

      // Find the Jitsi iframe
      const jitsiIframe = jitsiContainer.querySelector('iframe')
      if (!jitsiIframe) return

      try {
        // Add event listener to intercept clicks within the iframe
        const iframeDoc = jitsiIframe.contentDocument || jitsiIframe.contentWindow?.document
        if (iframeDoc) {
          // Override link clicks to open auth links in new tabs
          iframeDoc.addEventListener('click', (e: any) => {
            const target = e.target.closest('a, button')
            if (target) {
              const href = target.href || target.getAttribute('data-href')
              const text = target.textContent || target.innerText || ''
              
              // Check if this is an authentication-related link
              if (text.toLowerCase().includes('login') || 
                  text.toLowerCase().includes('sign in') ||
                  text.toLowerCase().includes('authenticate') ||
                  href?.includes('auth') ||
                  href?.includes('login')) {
                
                console.log('Intercepting auth link:', href || text)
                e.preventDefault()
                e.stopPropagation()
                
                // Open in new tab instead of current window
                if (href) {
                  window.open(href, '_blank', 'noopener,noreferrer')
                } else {
                  // If no direct href, construct auth URL
                  window.open('https://accounts.google.com/oauth/authorize?client_id=jitsi&redirect_uri=' + encodeURIComponent(window.location.href), '_blank', 'noopener,noreferrer')
                }
                
                return false
              }
            }
          }, true) // Use capture phase
        }
      } catch (error) {
        console.log('Could not access iframe content (CORS), using alternative method')
        
        // Alternative: Monitor for navigation attempts and open in new tab
        const originalOpen = window.open
        window.open = function(url: any, target: any, features: any) {
          if (typeof url === 'string' && (
            url.includes('auth') || 
            url.includes('login') || 
            url.includes('oauth') ||
            url.includes('accounts.google.com')
          )) {
            // Force authentication URLs to open in new tab
            return originalOpen.call(window, url, '_blank', 'noopener,noreferrer')
          }
          return originalOpen.call(window, url, target, features)
        }
      }
    }

    // Call the interceptor function
    interceptAuthLinks()
    
    // Also set up a periodic check in case the UI updates
    const authInterceptInterval = setInterval(interceptAuthLinks, 2000)
    
    // Cleanup interval when component unmounts
    return () => {
      clearInterval(authInterceptInterval)
    }
  }

  const startMeeting = () => {
    setMeetingStarted(true)
    setConnectionStatus('connecting')
  }

  const endMeeting = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose()
    }
    setMeetingEnded(true)
    setMeetingStarted(false)
    setConnectionStatus('disconnected')
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !appointment) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_type: 'doctor',
      sender_name: appointment.doctor?.full_name || 'Doctor',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const formatTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}`)
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20">Scheduled</Badge>
      case 'in_progress':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-brand-gray/10 text-brand-gray border-brand-gray/20">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 border-2 border-brand-green/20 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gray/20"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
              </div>
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Loading Consultation</h3>
            <p className="text-muted-foreground">Preparing your consultation room...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-green/10 via-white to-brand-red/10 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-2 border-brand-red/20 shadow-xl">
          <CardContent className="p-8">
            <AlertCircle className="h-16 w-16 text-brand-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Consultation Not Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find the consultation you're looking for.
            </p>
            <Link href="/doctor/appointments">
              <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Appointments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10">
      
      {/* Header */}
      <header className="border-b border-brand-green/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/doctor/appointments" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Appointments
            </Link>
            <div className="flex items-center gap-3">
              {getStatusBadge(appointment.status)}
              {connectionStatus === 'connected' && (
                <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20">
                  <div className="w-2 h-2 bg-brand-green rounded-full mr-2 animate-pulse"></div>
                  Live
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {!meetingStarted ? (
          // Pre-meeting lobby
          <div className="max-w-4xl mx-auto">
            <Card className="card-healthcare border-2 border-brand-green/20 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center">
                      <Stethoscope className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Video className="h-4 w-4 text-brand-green" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-heading font-bold mb-2">Doctor Consultation</CardTitle>
                <CardDescription className="text-lg">
                  {appointment && formatTime(appointment.appointment_date, appointment.appointment_time)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Doctor & Patient Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-brand-green/20">
                        <AvatarImage src={appointment.doctor?.profile_photo_url || undefined} alt={appointment.doctor?.full_name || 'Doctor'} />
                        <AvatarFallback className="bg-brand-green/10 text-brand-green text-xl">
                          {appointment.doctor?.full_name ? appointment.doctor.full_name.split(' ').map(n => n[0]).join('') : 'DR'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-heading font-semibold text-xl text-brand-green">You</h3>
                      <p className="text-lg font-medium">{appointment.doctor?.full_name || 'Doctor'}</p>
                      <p className="text-muted-foreground">{appointment.doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-4">
                      <Avatar className="h-24 w-24 mx-auto mb-3 ring-4 ring-brand-blue/20">
                        <AvatarImage src={appointment.patient?.profile_photo_url || undefined} alt={appointment.patient?.full_name || 'Patient'} />
                        <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-xl">
                          {appointment.patient?.full_name ? appointment.patient.full_name.split(' ').map(n => n[0]).join('') : 'PT'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-heading font-semibold text-xl text-brand-blue">Patient</h3>
                      <p className="text-lg font-medium">{appointment.patient?.full_name || 'Patient'}</p>
                      {appointment.patient?.email && (
                        <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Patient Information */}
                {(appointment.symptoms_description || appointment.current_medications || appointment.allergies) && (
                  <>
                    <div className="bg-brand-blue/5 rounded-xl p-6">
                      <h4 className="font-heading font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-brand-blue" />
                        Patient Information
                      </h4>
                      <div className="space-y-4 text-sm">
                        {appointment.symptoms_description && (
                          <div>
                            <p className="font-medium text-brand-blue mb-1">Symptoms:</p>
                            <p className="text-muted-foreground">{appointment.symptoms_description}</p>
                          </div>
                        )}
                        {appointment.current_medications && (
                          <div>
                            <p className="font-medium text-brand-purple mb-1">Current Medications:</p>
                            <p className="text-muted-foreground">{appointment.current_medications}</p>
                          </div>
                        )}
                        {appointment.allergies && (
                          <div>
                            <p className="font-medium text-brand-amber mb-1">Allergies:</p>
                            <p className="text-muted-foreground">{appointment.allergies}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Consultation Details */}
                <div className="bg-brand-green/5 rounded-xl p-6">
                  <h4 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-green" />
                    Consultation Details
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{appointment.consultation_type?.replace('_', ' ') || 'Consultation'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">45 minutes</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room ID</p>
                      <p className="font-medium text-xs">{appointment.meeting_room_id || `consultation-${appointmentId.slice(-8)}`}</p>
                    </div>
                  </div>
                </div>

                {/* Doctor checklist */}
                <div className="bg-brand-purple/5 rounded-xl p-6">
                  <h4 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-brand-purple" />
                    Before Starting
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Review patient information and medical history</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Ensure stable internet and test camera/microphone</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Have patient notes and treatment plans ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Find a quiet, professional environment</span>
                    </div>
                  </div>
                </div>

                {/* Start Meeting Button */}
                <div className="text-center pt-4">
                  <Button 
                    onClick={startMeeting}
                    className="bg-brand-green hover:bg-brand-green/90 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Join Consultation Room
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Connect to the same room as your patient
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Meeting interface (same as patient but with doctor branding)
          <div className={`${isMinimized ? 'max-w-sm' : 'max-w-7xl'} mx-auto transition-all duration-300`}>
            <div className="grid gap-6" style={{ gridTemplateColumns: isMinimized ? '1fr' : isChatOpen ? '2fr 1fr' : '1fr' }}>
              {/* Video Container */}
              <div className="relative">
                {/* Custom Controls Header */}
                <div className="relative z-40 bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-t-xl shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Doctor Consultation</span>
                      </div>
                      {participantCount > 0 && (
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          <Users className="h-3 w-3 mr-1" />
                          {participantCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className="text-white hover:bg-white/20 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="text-white hover:bg-white/20 transition-colors"
                      >
                        {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={endMeeting}
                        className="text-white hover:bg-red-500/20 transition-colors"
                      >
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Video Container */}
                <Card className="border-0 shadow-xl overflow-hidden rounded-t-none">
                  <CardContent className="p-0">
                    <div 
                      ref={jitsiContainerRef}
                      className={`${isMinimized ? 'h-40' : 'h-96 md:h-[600px]'} w-full transition-all duration-300 bg-black rounded-b-xl`}
                    >
                      {connectionStatus === 'connecting' && (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-brand-green/5 to-brand-blue/5 rounded-b-xl">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-gray/20"></div>
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
                              </div>
                            </div>
                            <p className="text-muted-foreground">Connecting to consultation room...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Sidebar - Same as patient version */}
              {isChatOpen && !isMinimized && (
                <Card className="border-0 shadow-xl">
                  <CardHeader className="py-3 px-4 bg-brand-green/5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Chat</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0 flex flex-col h-96">
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No messages yet</p>
                          <p className="text-xs">Start chatting with your patient</p>
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'doctor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                message.sender_type === 'doctor'
                                  ? 'bg-brand-green text-white'
                                  : 'bg-brand-gray/10 text-foreground'
                              }`}
                            >
                              <p className="font-medium text-xs mb-1 opacity-75">
                                {message.sender_name}
                              </p>
                              <p>{message.message}</p>
                              <p className="text-xs opacity-60 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t border-brand-gray/20">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder="Type a message..."
                          className="flex-1 px-3 py-2 border border-brand-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-transparent text-sm"
                        />
                        <Button
                          onClick={sendChatMessage}
                          disabled={!newMessage.trim()}
                          className="bg-brand-green hover:bg-brand-green/90 text-white px-3"
                          size="sm"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Meeting ended state */}
        {meetingEnded && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md text-center border-0 shadow-xl">
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 text-brand-green mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Consultation Completed</h3>
                <p className="text-muted-foreground mb-6">
                  The consultation has ended successfully. You can add notes in your appointments dashboard.
                </p>
                <Link href="/doctor/appointments">
                  <Button className="bg-brand-green hover:bg-brand-green/90 text-white w-full">
                    Back to Appointments
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}