'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react'
import { PatientRegistration } from '@/lib/validations/patient'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DocumentUploadStepProps {
  // Add any specific props if needed
}

interface UploadedFile {
  file: File
  url: string
  uploadedUrl?: string
  uploading: boolean
  error?: string
}

export function DocumentUploadStep({}: DocumentUploadStepProps) {
  const { setValue, watch } = useFormContext<PatientRegistration>()
  const { user } = useAuth()
  const [idDocument, setIdDocument] = useState<UploadedFile | null>(null)
  const [medicalAidCard, setMedicalAidCard] = useState<UploadedFile | null>(null)
  
  const supabase = createClient()

  const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated')
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('patient-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(data.path)

    return publicUrl
  }

  const handleFileUpload = async (file: File, type: 'id' | 'medical_aid') => {
    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 5MB'
      if (type === 'id') {
        setIdDocument(prev => prev ? { ...prev, error: errorMsg } : null)
      } else {
        setMedicalAidCard(prev => prev ? { ...prev, error: errorMsg } : null)
      }
      return
    }

    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'Only JPG, PNG, and PDF files are allowed'
      if (type === 'id') {
        setIdDocument(prev => prev ? { ...prev, error: errorMsg } : null)
      } else {
        setMedicalAidCard(prev => prev ? { ...prev, error: errorMsg } : null)
      }
      return
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    
    // Set uploading state
    const uploadingFile: UploadedFile = {
      file,
      url: previewUrl,
      uploading: true
    }

    if (type === 'id') {
      setIdDocument(uploadingFile)
    } else {
      setMedicalAidCard(uploadingFile)
    }

    try {
      // Upload to Supabase
      const uploadedUrl = await uploadToSupabase(file, type === 'id' ? 'id-documents' : 'medical-aid-cards')
      
      // Update state with success
      const successFile: UploadedFile = {
        file,
        url: previewUrl,
        uploadedUrl,
        uploading: false
      }

      if (type === 'id') {
        setIdDocument(successFile)
        setValue('id_document_url', uploadedUrl)
      } else {
        setMedicalAidCard(successFile)
        setValue('medical_aid_card_url', uploadedUrl)
      }

    } catch (error) {
      console.error('Upload error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
      
      if (type === 'id') {
        setIdDocument(prev => prev ? { ...prev, uploading: false, error: errorMsg } : null)
      } else {
        setMedicalAidCard(prev => prev ? { ...prev, uploading: false, error: errorMsg } : null)
      }
    }
  }

  const removeFile = (type: 'id' | 'medical_aid') => {
    if (type === 'id') {
      if (idDocument?.url) URL.revokeObjectURL(idDocument.url)
      setIdDocument(null)
      setValue('id_document_url', '')
    } else {
      if (medicalAidCard?.url) URL.revokeObjectURL(medicalAidCard.url)
      setMedicalAidCard(null)
      setValue('medical_aid_card_url', '')
    }
  }

  const FileUploadArea = ({ 
    type, 
    title, 
    description, 
    uploadedFile, 
    color 
  }: { 
    type: 'id' | 'medical_aid'
    title: string
    description: string
    uploadedFile: UploadedFile | null
    color: string 
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`bg-${color}-50 p-3 rounded-full`}>
            <FileText className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">{title} *</h4>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            
            {uploadedFile ? (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {uploadedFile.uploading ? (
                      <div className="relative">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200"></div>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-transparent border-t-[#217B82] absolute top-0 left-0"></div>
                      </div>
                    ) : uploadedFile.error ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{uploadedFile.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadedFile.error && (
                        <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(type)}
                    disabled={uploadedFile.uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={`border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-${color}-300 transition-colors cursor-pointer`}
                onClick={() => document.getElementById(`${type}-upload`)?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const files = Array.from(e.dataTransfer.files)
                  if (files[0]) handleFileUpload(files[0], type)
                }}
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop your {type === 'id' ? 'ID document' : 'medical aid card'} here, or click to browse
                </p>
                <Button variant="outline" size="sm" type="button">
                  Upload {type === 'id' ? 'ID' : 'Card'}
                </Button>
              </div>
            )}
            
            <input
              id={`${type}-upload`}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, type)
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const medicalAidScheme = watch('medical_aid_scheme')
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
        <p className="text-gray-600 text-sm">
          Please upload clear photos of your required documents
        </p>
      </div>

      <FileUploadArea
        type="id"
        title="South African ID Document"
        description="Upload a clear photo of your South African ID book or card"
        uploadedFile={idDocument}
        color="blue"
      />

      {medicalAidScheme && medicalAidScheme !== 'none' && medicalAidScheme !== '' && (
        <FileUploadArea
          type="medical_aid"
          title="Medical Aid Card"
          description={`Upload a clear photo of your ${medicalAidScheme} membership card`}
          uploadedFile={medicalAidCard}
          color="green"
        />
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="bg-amber-100 p-1 rounded-full">
            <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-amber-800 text-sm">Document Requirements</h4>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Ensure documents are clear and readable</li>
              <li>• Accepted formats: JPG, PNG, PDF (max 5MB each)</li>
              <li>• All personal information must be visible</li>
              <li>• Documents are securely stored and encrypted</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}