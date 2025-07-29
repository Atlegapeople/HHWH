'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Search, 
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Archive,
  Star,
  Clock,
  CheckCheck,
  Filter,
  Plus,
  Stethoscope,
  AlertCircle,
  Heart,
  Calendar,
  FileText,
  Image as ImageIcon,
  Mic,
  Smile
} from 'lucide-react'
import { format, parseISO, isToday, isYesterday, differenceInMinutes } from 'date-fns'

interface Message {
  id: string
  content: string
  timestamp: string
  sender_type: 'patient' | 'doctor'
  sender_id: string
  message_type: 'text' | 'image' | 'file' | 'appointment_request'
  read_status: boolean
  attachment_url?: string
  attachment_name?: string
}

interface Conversation {
  id: string
  patient_id: string
  patient_name: string
  patient_email: string
  patient_photo?: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_starred: boolean
  is_archived: boolean
  patient_status: 'active' | 'new' | 'follow_up'
  last_appointment?: string
  messages: Message[]
}

export default function DoctorMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'starred' | 'archived'>('all')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Hardcoded doctor ID for now
  const doctorId = 'a5c586a8-4366-4560-884d-7c3b5c379fa9'

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - in production this would fetch from your messages API
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          patient_id: 'patient-1',
          patient_name: 'Sarah Johnson',
          patient_email: 'sarah.johnson@email.com',
          patient_photo: null,
          last_message: 'Thank you for the consultation. When should I schedule my follow-up appointment?',
          last_message_time: new Date().toISOString(),
          unread_count: 2,
          is_starred: true,
          is_archived: false,
          patient_status: 'follow_up',
          last_appointment: '2024-01-15',
          messages: [
            {
              id: 'msg-1',
              content: 'Hello Dr. van der Merwe, I hope you are well. I wanted to follow up on our recent consultation.',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-1',
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-2',
              content: 'Hello Sarah! Thank you for reaching out. I\'m glad to hear from you. How have you been feeling since our last appointment?',
              timestamp: new Date(Date.now() - 3000000).toISOString(),
              sender_type: 'doctor',
              sender_id: doctorId,
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-3',
              content: 'I\'ve been feeling much better with the treatment plan. The hormone therapy seems to be working well.',
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-1',
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-4',
              content: 'Thank you for the consultation. When should I schedule my follow-up appointment?',
              timestamp: new Date().toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-1',
              message_type: 'text',
              read_status: false
            }
          ]
        },
        {
          id: 'conv-2',
          patient_id: 'patient-2',
          patient_name: 'Maria Santos',
          patient_email: 'maria.santos@email.com',
          patient_photo: null,
          last_message: 'I have some questions about the new medication you prescribed.',
          last_message_time: new Date(Date.now() - 7200000).toISOString(),
          unread_count: 1,
          is_starred: false,
          is_archived: false,
          patient_status: 'active',
          last_appointment: '2024-01-12',
          messages: [
            {
              id: 'msg-5',
              content: 'Good morning Doctor, I hope you are having a wonderful day.',
              timestamp: new Date(Date.now() - 10800000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-2',
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-6',
              content: 'Good morning Maria! Thank you for your kind words. How can I help you today?',
              timestamp: new Date(Date.now() - 9000000).toISOString(),
              sender_type: 'doctor',
              sender_id: doctorId,
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-7',
              content: 'I have some questions about the new medication you prescribed.',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-2',
              message_type: 'text',
              read_status: false
            }
          ]
        },
        {
          id: 'conv-3',
          patient_id: 'patient-3',
          patient_name: 'Jennifer Clarke',
          patient_email: 'jennifer.clarke@email.com',
          patient_photo: null,
          last_message: 'Perfect! Thank you so much for your help.',
          last_message_time: new Date(Date.now() - 86400000).toISOString(),
          unread_count: 0,
          is_starred: false,
          is_archived: false,
          patient_status: 'active',
          last_appointment: '2024-01-10',
          messages: [
            {
              id: 'msg-8',
              content: 'Hi Dr. van der Merwe, I wanted to update you on my progress.',
              timestamp: new Date(Date.now() - 90000000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-3',
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-9',
              content: 'That\'s wonderful to hear! Please tell me more about how you\'ve been feeling.',
              timestamp: new Date(Date.now() - 88200000).toISOString(),
              sender_type: 'doctor',
              sender_id: doctorId,
              message_type: 'text',
              read_status: true
            },
            {
              id: 'msg-10',
              content: 'Perfect! Thank you so much for your help.',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              sender_type: 'patient',
              sender_id: 'patient-3',
              message_type: 'text',
              read_status: true
            }
          ]
        }
      ]

      setConversations(mockConversations)
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0].id)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.last_message.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (filterStatus) {
      case 'unread':
        return matchesSearch && conv.unread_count > 0
      case 'starred':
        return matchesSearch && conv.is_starred
      case 'archived':
        return matchesSearch && conv.is_archived
      default:
        return matchesSearch && !conv.is_archived
    }
  })

  const selectedConv = conversations.find(conv => conv.id === selectedConversation)

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sending) return

    try {
      setSending(true)
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        sender_type: 'doctor',
        sender_id: doctorId,
        message_type: 'text',
        read_status: true
      }

      // Update conversations
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation 
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                last_message: newMessage.content,
                last_message_time: newMessage.timestamp
              }
            : conv
        )
      )

      setMessageInput('')
      
      // In production, send to API
      // await fetch('/api/messages', { method: 'POST', body: JSON.stringify(newMessage) })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const toggleStar = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, is_starred: !conv.is_starred }
          : conv
      )
    )
  }

  const markAsRead = (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread_count: 0 }
          : conv
      )
    )
  }

  const formatTime = (timestamp: string) => {
    const date = parseISO(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return format(date, 'MMM dd')
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = parseISO(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const getPatientStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-xs">New Patient</Badge>
      case 'follow_up':
        return <Badge className="bg-brand-amber/10 text-brand-amber border-brand-amber/20 text-xs">Follow-up</Badge>
      case 'active':
        return <Badge className="bg-brand-green/10 text-brand-green border-brand-green/20 text-xs">Active</Badge>
      default:
        return null
    }
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
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="lg:col-span-2 bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-blue/10 via-brand-green/5 to-brand-blue/10 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-brand-blue" />
              </div>
              Messages
            </h1>
            <p className="text-muted-foreground mt-2">Communicate securely with your patients</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Conversations</p>
              <p className="text-2xl font-bold text-brand-blue">{conversations.length}</p>
            </div>
            <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Conversations List */}
        <Card className="card-healthcare border-2 hover:border-brand-blue/30 transition-all duration-300 overflow-hidden">
          <CardHeader className="pb-4 border-b border-brand-blue/10">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-lg font-heading">Conversations</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" title="Filter messages">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-blue/60 h-4 w-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-brand-blue/20 focus:border-brand-blue focus:ring-brand-blue/20"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { key: 'all', label: 'All', count: conversations.filter(c => !c.is_archived).length },
                { key: 'unread', label: 'Unread', count: conversations.filter(c => c.unread_count > 0).length },
                { key: 'starred', label: 'Starred', count: conversations.filter(c => c.is_starred).length }
              ].map(tab => (
                <Button
                  key={tab.key}
                  variant={filterStatus === tab.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilterStatus(tab.key as any)}
                  className={`whitespace-nowrap ${
                    filterStatus === tab.key 
                      ? 'bg-brand-blue text-white' 
                      : 'text-brand-blue hover:bg-brand-blue/10'
                  }`}
                >
                  {tab.label} {tab.count > 0 && `(${tab.count})`}
                </Button>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-brand-blue/50" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No conversations found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Start a conversation with your patients'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-brand-blue/10">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation.id)
                      if (conversation.unread_count > 0) {
                        markAsRead(conversation.id)
                      }
                    }}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:bg-brand-blue/5 ${
                      selectedConversation === conversation.id
                        ? 'bg-brand-blue/10 border-r-4 border-brand-blue'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-brand-blue/20">
                          <AvatarImage src={conversation.patient_photo || undefined} alt={conversation.patient_name} />
                          <AvatarFallback className="bg-brand-blue/10 text-brand-blue">
                            {conversation.patient_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conversation.unread_count}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground truncate">{conversation.patient_name}</h3>
                          <div className="flex items-center gap-1">
                            {conversation.is_starred && (
                              <Star className="h-3 w-3 text-brand-amber fill-current" />
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTime(conversation.last_message_time)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {getPatientStatusBadge(conversation.patient_status)}
                          {conversation.last_appointment && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Last: {format(parseISO(conversation.last_appointment), 'MMM dd')}
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-sm truncate ${
                          conversation.unread_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}>
                          {conversation.last_message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedConv ? (
            <Card className="card-healthcare border-2 hover:border-brand-green/30 transition-all duration-300 flex flex-col h-full">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b border-brand-green/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-brand-green/20">
                      <AvatarImage src={selectedConv.patient_photo || undefined} alt={selectedConv.patient_name} />
                      <AvatarFallback className="bg-brand-green/10 text-brand-green">
                        {selectedConv.patient_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedConv.patient_name}</h3>
                      <div className="flex items-center gap-2">
                        {getPatientStatusBadge(selectedConv.patient_status)}
                        <span className="text-sm text-muted-foreground">{selectedConv.patient_email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStar(selectedConv.id)}
                      className={selectedConv.is_starred ? 'text-brand-amber' : 'text-muted-foreground'}
                    >
                      <Star className={`h-4 w-4 ${selectedConv.is_starred ? 'fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-brand-blue">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-brand-green">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto max-h-[400px]">
                <div className="space-y-4">
                  {selectedConv.messages.map((message, index) => {
                    const isDoctor = message.sender_type === 'doctor'
                    const showTime = index === 0 || 
                      differenceInMinutes(parseISO(message.timestamp), parseISO(selectedConv.messages[index - 1].timestamp)) > 5
                    
                    return (
                      <div key={message.id}>
                        {showTime && (
                          <div className="text-center my-4">
                            <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isDoctor ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl ${
                                isDoctor
                                  ? 'bg-brand-green text-white rounded-br-md'
                                  : 'bg-brand-gray/10 text-foreground rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                              isDoctor ? 'justify-end' : 'justify-start'
                            }`}>
                              <span>{format(parseISO(message.timestamp), 'HH:mm')}</span>
                              {isDoctor && message.read_status && (
                                <CheckCheck className="h-3 w-3 text-brand-green" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-brand-green/10 p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 bg-brand-green/5 rounded-2xl px-4 py-3 border border-brand-green/20 focus-within:border-brand-green focus-within:ring-2 focus-within:ring-brand-green/20">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        placeholder="Type your message..."
                        className="border-0 bg-transparent focus:ring-0 focus:border-0 p-0 text-sm"
                        disabled={sending}
                      />
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Smile className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sending}
                    className="bg-brand-green hover:bg-brand-green/90 text-white h-12 w-12 rounded-2xl p-0"
                  >
                    {sending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="card-healthcare border-2 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-10 w-10 text-brand-green/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a patient conversation from the list to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-blue transition-colors">
                  {conversations.reduce((sum, conv) => sum + conv.messages.length, 0)}
                </p>
                <p className="text-xs text-brand-blue mt-1 flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  All conversations
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-blue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-blue/20">
                <MessageSquare className="h-7 w-7 text-brand-blue group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-red/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-red transition-colors">
                  {conversations.reduce((sum, conv) => sum + conv.unread_count, 0)}
                </p>
                <p className="text-xs text-brand-red mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-red/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-red/20">
                <AlertCircle className="h-7 w-7 text-brand-red group-hover:animate-bounce" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-amber/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Starred Chats</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-amber transition-colors">
                  {conversations.filter(conv => conv.is_starred).length}
                </p>
                <p className="text-xs text-brand-amber mt-1 flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Important conversations
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-amber/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-amber/20">
                <Star className="h-7 w-7 text-brand-amber group-hover:animate-spin fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-healthcare group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-brand-green/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:text-brand-green transition-colors">
                  {conversations.filter(conv => conv.patient_status === 'active').length}
                </p>
                <p className="text-xs text-brand-green mt-1 flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  Ongoing care
                </p>
              </div>
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 group-hover:bg-brand-green/20">
                <Heart className="h-7 w-7 text-brand-green group-hover:animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}