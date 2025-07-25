'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration } from '@/lib/validations/patient'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Check, X, Camera, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DocumentUploadStepProps {
  form: UseFormReturn<PatientRegistration>
}

interface UploadedDocument {
  id: string
  name: string
  type: 'id_document' | 'medical_aid_card'
  size: number
  status: 'uploading' | 'uploaded' | 'error'
  url?: string
}

export function DocumentUploadStep({ form }: DocumentUploadStepProps) {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const { watch } = form
  const medicalAidScheme = watch('medical_aid_scheme')

  const handleFileUpload = async (file: File, type: 'id_document' | 'medical_aid_card') => {
    const documentId = Math.random().toString(36).substr(2, 9)
    
    // Add document with uploading status
    const newDocument: UploadedDocument = {
      id: documentId,
      name: file.name,
      type,
      size: file.size,
      status: 'uploading'
    }
    
    setDocuments(prev => [...prev, newDocument])

    try {
      // Simulate file upload (replace with actual Supabase storage upload)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update status to uploaded
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'uploaded', url: `https://example.com/${file.name}` }
            : doc
        )
      )
    } catch (error) {
      // Update status to error
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'error' }
            : doc
        )
      )
    }
  }

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const idDocuments = documents.filter(doc => doc.type === 'id_document')
  const medicalAidDocuments = documents.filter(doc => doc.type === 'medical_aid_card')

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-purple/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-brand-purple" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2">Document Upload</h3>
        <p className="text-sm text-muted-foreground">
          Please upload clear photos or scans of your identification and medical aid documents.
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          All documents are encrypted and stored securely. We use bank-level security to protect your personal information.
        </AlertDescription>
      </Alert>

      {/* ID Document Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              South African ID Document *
            </h4>
            <p className="text-sm text-muted-foreground">
              Upload a clear photo of your South African ID book or card
            </p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'id_document')
              }}
            />
            <Button type="button" variant="outline" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload ID
            </Button>
          </label>
        </div>

        {/* ID Document List */}
        {idDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                doc.status === 'uploaded' ? 'bg-brand-green/10' :
                doc.status === 'error' ? 'bg-brand-red/10' : 'bg-brand-orange/10'
              }`}>
                {doc.status === 'uploaded' ? (
                  <Check className="h-4 w-4 text-brand-green" />
                ) : doc.status === 'error' ? (
                  <X className="h-4 w-4 text-brand-red" />
                ) : (
                  <Upload className="h-4 w-4 text-brand-orange animate-pulse" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.size)} • {doc.status === 'uploading' ? 'Uploading...' : 
                   doc.status === 'uploaded' ? 'Uploaded successfully' : 'Upload failed'}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeDocument(doc.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Medical Aid Card Section */}
      {medicalAidScheme && medicalAidScheme !== '' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Medical Aid Card *
              </h4>
              <p className="text-sm text-muted-foreground">
                Upload a clear photo of your {medicalAidScheme} membership card
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'medical_aid_card')
                }}
              />
              <Button type="button" variant="outline" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Upload Card
              </Button>
            </label>
          </div>

          {/* Medical Aid Document List */}
          {medicalAidDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  doc.status === 'uploaded' ? 'bg-brand-green/10' :
                  doc.status === 'error' ? 'bg-brand-red/10' : 'bg-brand-orange/10'
                }`}>
                  {doc.status === 'uploaded' ? (
                    <Check className="h-4 w-4 text-brand-green" />
                  ) : doc.status === 'error' ? (
                    <X className="h-4 w-4 text-brand-red" />
                  ) : (
                    <Upload className="h-4 w-4 text-brand-orange animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.size)} • {doc.status === 'uploading' ? 'Uploading...' : 
                     doc.status === 'uploaded' ? 'Uploaded successfully' : 'Upload failed'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDocument(doc.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-brand-blue/5 p-4 rounded-lg border border-brand-blue/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-blue/10 p-2 rounded-full">
            <Camera className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h4 className="font-medium text-brand-blue mb-1">Photo Guidelines</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure good lighting and clear image quality</li>
              <li>• All text should be clearly readable</li>
              <li>• Avoid shadows, glare, or blurred areas</li>
              <li>• Accepted formats: JPG, PNG, PDF (max 10MB)</li>
              <li>• Both sides of ID document if applicable</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Optional Documents Notice */}
      <div className="bg-brand-amber/5 p-4 rounded-lg border border-brand-amber/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-amber/10 p-2 rounded-full">
            <FileText className="h-5 w-5 text-brand-amber" />
          </div>
          <div>
            <h4 className="font-medium text-brand-amber mb-1">Document Verification</h4>
            <p className="text-sm text-muted-foreground">
              Documents will be verified by our admin team within 24 hours. 
              You can still book consultations while verification is pending, 
              but payment may be required upfront until verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}