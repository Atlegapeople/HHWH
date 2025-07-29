'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, AlertCircle, CheckCircle, Camera, Shield, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from '@/lib/supabase/client'
import { updatePatientDocuments } from '@/lib/supabase/patients'

interface DocumentUploadModalProps {
  children: React.ReactNode
  onUploadSuccess?: () => void
  patientId?: string
}

type DocumentType = 'id_document' | 'medical_aid_card' | 'profile_photo' | 'additional'

interface UploadState {
  file: File | null
  type: DocumentType
  uploading: boolean
  progress: number
  error: string | null
  success: boolean
}

const DOCUMENT_TYPES = [
  {
    key: 'id_document' as DocumentType,
    label: 'ID Document',
    description: 'South African ID card or passport',
    icon: Camera,
    color: 'brand-green',
    accept: '.jpg,.jpeg,.png,.pdf'
  },
  {
    key: 'medical_aid_card' as DocumentType,
    label: 'Medical Aid Card',
    description: 'Medical insurance card',
    icon: Shield,
    color: 'brand-purple',
    accept: '.jpg,.jpeg,.png,.pdf'
  },
  {
    key: 'profile_photo' as DocumentType,
    label: 'Profile Photo',
    description: 'Your profile picture',
    icon: User,
    color: 'brand-pink',
    accept: '.jpg,.jpeg,.png'
  }
]

export default function DocumentUploadModal({ children, onUploadSuccess, patientId }: DocumentUploadModalProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    type: 'id_document',
    uploading: false,
    progress: 0,
    error: null,
    success: false
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File, type: DocumentType) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadState(prev => ({
        ...prev,
        error: 'File size must be less than 5MB'
      }))
      return
    }

    // Validate file type
    const documentType = DOCUMENT_TYPES.find(dt => dt.key === type)
    const acceptedTypes = documentType?.accept.split(',').map(t => t.trim()) || []
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!acceptedTypes.includes(fileExtension)) {
      setUploadState(prev => ({
        ...prev,
        error: `Please select a valid file type: ${acceptedTypes.join(', ')}`
      }))
      return
    }

    setUploadState({
      file,
      type,
      uploading: false,
      progress: 0,
      error: null,
      success: false
    })
  }

  const uploadDocument = async () => {
    if (!uploadState.file || !user) return

    setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }))

    try {
      const supabase = createClient()
      
      // Determine bucket and folder based on document type
      const bucket = uploadState.type === 'profile_photo' ? 'profile-photos' : 'patient-documents'
      const folder = uploadState.type === 'profile_photo' 
        ? '' 
        : uploadState.type === 'id_document' 
        ? 'id-documents' 
        : 'medical-aid-cards'
      
      // Create file path
      const timestamp = Date.now()
      const fileExtension = uploadState.file.name.split('.').pop()
      const fileName = uploadState.type === 'profile_photo' 
        ? `profile-photo.${fileExtension}`
        : `${timestamp}.${fileExtension}`
      
      const filePath = folder 
        ? `${user.id}/${folder}/${fileName}`
        : `${user.id}/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, uploadState.file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        throw new Error('Failed to get file URL')
      }

      // Update patient record with document URL
      const documentField = `${uploadState.type}_url`
      const updateData = { [documentField]: urlData.publicUrl }
      
      const { error: updateError } = await updatePatientDocuments(user.id, updateData)
      
      if (updateError) {
        throw new Error(`Failed to update patient record: ${updateError.message}`)
      }

      setUploadState(prev => ({ 
        ...prev, 
        uploading: false, 
        progress: 100, 
        success: true 
      }))

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess()
      }

      // Close modal after short delay
      setTimeout(() => {
        setOpen(false)
        resetState()
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }))
    }
  }

  const resetState = () => {
    setUploadState({
      file: null,
      type: 'id_document',
      uploading: false,
      progress: 0,
      error: null,
      success: false
    })
    setSelectedType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileInput = (type: DocumentType) => {
    setSelectedType(type)
    const documentType = DOCUMENT_TYPES.find(dt => dt.key === type)
    if (fileInputRef.current && documentType) {
      fileInputRef.current.accept = documentType.accept
      fileInputRef.current.click()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Medical Documents</DialogTitle>
          <DialogDescription>
            Upload your identification, medical aid card, or profile photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!uploadState.file ? (
            // Document Type Selection
            <div className="space-y-3">
              <h4 className="font-medium">Select document type:</h4>
              <div className="grid gap-3">
                {DOCUMENT_TYPES.map((docType) => {
                  const Icon = docType.icon
                  return (
                    <Card 
                      key={docType.key}
                      className="cursor-pointer hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
                      onClick={() => triggerFileInput(docType.key)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${docType.color}/10`}>
                            <Icon className={`h-5 w-5 text-${docType.color}`} />
                          </div>
                          <div>
                            <h5 className="font-semibold">{docType.label}</h5>
                            <p className="text-sm text-muted-foreground">{docType.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ) : (
            // File Upload Interface
            <div className="space-y-4">
              {/* Selected File Display */}
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-brand-blue" />
                    <div className="flex-1">
                      <p className="font-medium">{uploadState.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetState}
                      disabled={uploadState.uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Upload Progress */}
              {uploadState.uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadState.progress}%</span>
                  </div>
                  <Progress value={uploadState.progress} className="w-full" />
                </div>
              )}

              {/* Success Message */}
              {uploadState.success && (
                <div className="flex items-center gap-2 p-3 bg-brand-green/10 border border-brand-green/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-brand-green" />
                  <span className="text-brand-green font-medium">Document uploaded successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {uploadState.error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 text-sm">{uploadState.error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={resetState}
                  disabled={uploadState.uploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadDocument}
                  disabled={uploadState.uploading || uploadState.success}
                  className="flex-1 bg-brand-blue hover:bg-brand-blue/90 text-white"
                >
                  {uploadState.uploading ? (
                    'Uploading...'
                  ) : uploadState.success ? (
                    'Uploaded!'
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Guidelines */}
          <div className="rounded-lg border border-brand-amber/20 bg-brand-amber/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-brand-amber mt-0.5" />
              <div>
                <p className="text-sm font-medium text-brand-amber">Guidelines:</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>• Max file size: 5MB</li>
                  <li>• Accepted formats: JPG, PNG, PDF</li>
                  <li>• Ensure documents are clear and readable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && selectedType) {
              handleFileSelect(file, selectedType)
            }
          }}
        />
      </DialogContent>
    </Dialog>
  )
}