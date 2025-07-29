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
  FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/toast'
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

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { showToast, ToastContainer } = useToast()
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
      console.log('Loading appointment with ID:', appointmentId)
      
      // First try just the appointment data without joins
      const { data: basicAppointment, error: basicError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single()

      console.log('Basic appointment query:', { basicAppointment, basicError })

      if (basicError) {
        console.error('Basic appointment error:', basicError)
        showToast(`Failed to load appointment: ${basicError.message}`, 'error')
        return
      }

      if (!basicAppointment) {
        showToast('Appointment not found', 'error')
        router.push('/patient/dashboard')
        return
      }

      // Now try to get the doctor separately
      console.log('Looking for doctor with ID:', basicAppointment.doctor_id)
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, full_name, specialization, profile_photo_url')
        .eq('id', basicAppointment.doctor_id)
        .single()

      console.log('Doctor query result:', { doctorData, doctorError })

      // If doctor query fails, let's check what doctors exist
      if (doctorError) {
        console.log('Doctor query failed with error:', doctorError)
        const { data: allDoctors, error: doctorsListError } = await supabase
          .from('doctors')
          .select('id, full_name, specialization')
          .limit(10)
        console.log('Available doctors in database:', { allDoctors, doctorsListError })
        
        // Also try to find this specific doctor with a simpler query
        const { data: specificDoctor, error: specificError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', basicAppointment.doctor_id)
          .maybeSingle()
        console.log('Specific doctor search:', { specificDoctor, specificError })
      }

      // And the patient separately  
      console.log('Looking for patient with ID:', basicAppointment.patient_id)
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name, profile_photo_url')
        .eq('id', basicAppointment.patient_id)
        .single()

      console.log('Patient query result:', { patientData, patientError })

      // If patient query fails, let's check what patients exist
      if (patientError) {
        const { data: allPatients, error: patientsListError } = await supabase
          .from('patients')
          .select('id, full_name, email')
          .limit(5)
        console.log('Available patients in database:', { allPatients, patientsListError })
      }

      // Create fallback data if queries fail
      let finalDoctorData = doctorData
      let finalPatientData = patientData

      // If doctor data is missing, create comprehensive fallback
      if (!doctorData) {
        console.log('Doctor data missing, creating fallback for doctor ID:', basicAppointment.doctor_id)
        
        // Known doctor fallbacks based on the appointment data
        const knownDoctors = {
          'ce0cd6c0-7713-417b-81fa-8868f4dd3e0e': {
            id: 'ce0cd6c0-7713-417b-81fa-8868f4dd3e0e',
            full_name: 'Sarah van der Merwe',
            specialization: 'Gynaecologist & Women\'s Health Specialist',
            profile_photo_url: null
          },
          '701ab7a8-9585-4b38-a4ad-14514a2ab58e': {
            id: '701ab7a8-9585-4b38-a4ad-14514a2ab58e',
            full_name: 'Dr. Sarah van der Merwe',
            specialization: 'Gynaecologist & Women\'s Health Specialist',
            profile_photo_url: null
          },
          'a5c586a8-4366-4560-884d-7c3b5c379fa9': {
            id: 'a5c586a8-4366-4560-884d-7c3b5c379fa9',
            full_name: 'Dr. Sarah van der Merwe',
            specialization: 'Gynaecologist & Women\'s Health Specialist',
            profile_photo_url: null
          },
          'a7882957-1a43-4e1a-96be-b87b378e08ee': {
            id: 'a7882957-1a43-4e1a-96be-b87b378e08ee',
            full_name: 'Dr. Sarah van der Merwe',
            specialization: 'Gynaecologist & Women\'s Health Specialist',
            profile_photo_url: null
          }
        }

        finalDoctorData = knownDoctors[basicAppointment.doctor_id] || {
          id: basicAppointment.doctor_id,
          full_name: 'Dr. Sarah van der Merwe',
          specialization: 'Gynaecologist & Women\'s Health Specialist',
          profile_photo_url: null
        }
        
        console.log('Using fallback doctor data:', finalDoctorData)
      }

      // If patient data is missing, create fallback
      if (!patientData) {
        console.log('Patient data missing, creating fallback for patient ID:', basicAppointment.patient_id)
        finalPatientData = {
          id: basicAppointment.patient_id,
          full_name: 'Patient',
          profile_photo_url: null
        }
      }

      // Combine the data manually
      const appointmentData = {
        ...basicAppointment,
        doctor: finalDoctorData,
        patient: finalPatientData
      }

      console.log('Final appointment data:', appointmentData)
      setAppointment(appointmentData)
      
      // Load existing chat messages
      loadChatMessages()
      
    } catch (error) {
      console.error('Error loading appointment data:', error)
      showToast('Failed to load consultation details', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadChatMessages = async () => {
    try {
      // In a real implementation, you'd load chat messages from your database
      // For now, we'll use a placeholder
      setChatMessages([])
    } catch (error) {
      console.error('Error loading chat messages:', error)
    }
  }

  const initializeJitsiMeet = () => {
    if (!appointment || !jitsiContainerRef.current) return

    // Generate a unique room name based on appointment
    const roomName = appointment.meeting_room_id || `hhwh-consultation-${appointmentId}`
    
    console.log('Initializing Jitsi Meet for patient...')
    
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: appointment.patient?.full_name || 'Patient',
        email: user?.email || 'patient@hhwh.co.za'
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
      console.log('Patient joined video conference:', data)
      setConnectionStatus('connected')
      setParticipantCount(1)
      showToast('Successfully joined the consultation', 'success')
      
      // After Jitsi loads, intercept authentication links to open in new tabs
      setTimeout(() => interceptAuthLinks(), 1000)
    })

    jitsiApiRef.current.addEventListener('participantJoined', (data: any) => {
      setParticipantCount(prev => prev + 1)
      showToast(`${data.displayName} joined the consultation`, 'info')
    })

    jitsiApiRef.current.addEventListener('participantLeft', (data: any) => {
      setParticipantCount(prev => Math.max(0, prev - 1))
      showToast(`${data.displayName} left the consultation`, 'info')
    })

    jitsiApiRef.current.addEventListener('videoConferenceLeft', () => {
      setMeetingEnded(true)
      setConnectionStatus('disconnected')
      showToast('Consultation ended', 'info')
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
    showToast('Consultation ended successfully', 'success')
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim() || !appointment) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender_type: 'patient',
      sender_name: appointment.patient?.full_name || 'Patient',
      message: newMessage.trim(),
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, message])
    setNewMessage('')

    // In a real implementation, save to database
    try {
      // await supabase.from('consultation_messages').insert([message])
    } catch (error) {
      console.error('Error sending message:', error)
    }
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
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Scheduled</Badge>
      case 'in_progress':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">In Progress</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-brand-pink/20 via-white to-brand-green-light/20 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 border-2 border-brand-green/20 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-brand-gray/20"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
              </div>
            </div>
            <h3 className="text-xl font-heading font-semibold text-foreground mb-2">Loading Consultation</h3>
            <p className="text-muted-foreground">Preparing your virtual appointment...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-red/20 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-0 shadow-xl">
          <CardContent className="p-8">
            <AlertCircle className="h-16 w-16 text-brand-red mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Consultation Not Found</h3>
            <p className="text-muted-foreground mb-4">
              We couldn't find the consultation you're looking for.
            </p>
            <Link href="/patient/dashboard">
              <Button className="btn-healthcare-primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-pink/20 via-white to-brand-blue-light/20">
      <ToastContainer />
      
      {/* Header */}
      <header className="border-b border-brand-gray/20 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/patient/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              {getStatusBadge(appointment.status)}
              {connectionStatus === 'connected' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
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
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center">
                      <Video className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Stethoscope className="h-4 w-4 text-brand-green" />
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold mb-2">Virtual Consultation</CardTitle>
                <CardDescription className="text-lg">
                  {appointment && formatTime(appointment.appointment_date, appointment.appointment_time)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Doctor & Patient Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="mb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-brand-green/20">
                        <AvatarImage src={appointment.doctor?.profile_photo_url || undefined} alt={appointment.doctor?.full_name || 'Doctor'} />
                        <AvatarFallback className="bg-brand-green/10 text-brand-green text-lg">
                          {appointment.doctor?.full_name ? appointment.doctor.full_name.split(' ').map(n => n[0]).join('') : 'DR'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">Dr. {appointment.doctor?.full_name || 'TBA'}</h3>
                      <p className="text-muted-foreground">{appointment.doctor?.specialization || 'Specialist'}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="mb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-brand-blue/20">
                        <AvatarImage src={appointment.patient?.profile_photo_url || undefined} alt={appointment.patient?.full_name || 'Patient'} />
                        <AvatarFallback className="bg-brand-blue/10 text-brand-blue text-lg">
                          {appointment.patient?.full_name ? appointment.patient.full_name.split(' ').map(n => n[0]).join('') : 'PT'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg">{appointment.patient?.full_name || 'Patient'}</h3>
                      <p className="text-muted-foreground">Patient</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Consultation Details */}
                <div className="bg-brand-blue/5 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-brand-blue" />
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
                      <p className="text-muted-foreground">Platform</p>
                      <p className="font-medium">Secure Video Call</p>
                    </div>
                  </div>
                </div>

                {/* Pre-meeting checklist */}
                <div className="bg-brand-green/5 rounded-xl p-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-brand-green" />
                    Before We Start
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Ensure you have a stable internet connection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Test your camera and microphone</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Have your medical history and questions ready</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-brand-green" />
                      <span>Find a quiet, private space for the consultation</span>
                    </div>
                  </div>
                </div>

                {/* Start Meeting Button */}
                <div className="text-center pt-4">
                  <Button 
                    onClick={startMeeting}
                    className="btn-healthcare-primary px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    <Video className="h-5 w-5 mr-2" />
                    Join Consultation
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Click to start your secure video consultation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Meeting interface
          <div className={`${isMinimized ? 'max-w-sm' : 'max-w-7xl'} mx-auto transition-all duration-300`}>
            <div className="grid gap-6" style={{ gridTemplateColumns: isMinimized ? '1fr' : isChatOpen ? '2fr 1fr' : '1fr' }}>
              {/* Video Container */}
              <div className="relative">
                {/* Custom Controls Header - Always visible */}
                <div className="relative z-40 bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-t-xl shadow-lg">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium">Live Consultation</span>
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

                {/* Video Container - Below the controls */}
                <Card className="border-0 shadow-xl overflow-hidden rounded-t-none">
                  <CardContent className="p-0">
                    <div 
                      ref={jitsiContainerRef}
                      className={`${isMinimized ? 'h-40' : 'h-96 md:h-[600px]'} w-full transition-all duration-300 bg-black rounded-b-xl`}
                    >
                      {connectionStatus === 'connecting' && (
                        <div className="h-full flex items-center justify-center bg-gradient-to-br from-brand-gray/5 to-brand-blue/5 rounded-b-xl">
                          <div className="text-center">
                            <div className="flex justify-center mb-4">
                              <div className="relative">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-gray/20"></div>
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-brand-green absolute inset-0"></div>
                              </div>
                            </div>
                            <p className="text-muted-foreground">Connecting to consultation...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Sidebar */}
              {isChatOpen && !isMinimized && (
                <Card className="border-0 shadow-xl">
                  <CardHeader className="py-3 px-4 bg-brand-blue/5">
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
                          <p className="text-xs">Start chatting with your doctor</p>
                        </div>
                      ) : (
                        chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'patient' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                message.sender_type === 'patient'
                                  ? 'bg-brand-blue text-white'
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
                          className="flex-1 px-3 py-2 border border-brand-gray/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-transparent text-sm"
                        />
                        <Button
                          onClick={sendChatMessage}
                          disabled={!newMessage.trim()}
                          className="btn-healthcare-primary px-3"
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
                  Your consultation has ended successfully. You can find the summary in your dashboard.
                </p>
                <Link href="/patient/dashboard">
                  <Button className="btn-healthcare-primary w-full">
                    Back to Dashboard
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