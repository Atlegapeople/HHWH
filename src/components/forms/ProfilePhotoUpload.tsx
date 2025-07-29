'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Upload, Camera, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/toast'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  onPhotoChange?: (photoUrl: string | null) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoChange,
  disabled = false,
  size = 'md'
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const { showToast, ToastContainer } = useToast()

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error')
      return
    }

    await uploadPhoto(file)
  }

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('You must be logged in to upload a photo', 'error')
        return
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile-photo.${fileExt}`

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        })

      if (error) {
        console.error('Upload error:', error)
        if (error.message.includes('not found')) {
          showToast('Storage bucket not found. Please contact support.', 'error')
        } else if (error.message.includes('permission')) {
          showToast('Permission denied. Please log in and try again.', 'error')
        } else {
          showToast(`Failed to upload photo: ${error.message}`, 'error')
        }
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      setPhotoUrl(publicUrl)
      onPhotoChange?.(publicUrl)
      showToast('Profile photo updated successfully', 'success')

    } catch (error) {
      console.error('Upload error:', error)
      showToast('Failed to upload photo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = async () => {
    try {
      setUploading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete from storage
      const fileName = `${user.id}/profile-photo`
      await supabase.storage
        .from('profile-photos')
        .remove([fileName])

      setPhotoUrl(null)
      onPhotoChange?.(null)
      showToast('Profile photo removed', 'success')

    } catch (error) {
      console.error('Remove error:', error)
      showToast('Failed to remove photo', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={photoUrl || undefined} alt="Profile photo" />
          <AvatarFallback className="bg-brand-blue/10 text-brand-blue">
            <Camera className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>

        {photoUrl && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removePhoto}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Upload a profile photo (max 5MB)
          <br />
          Supported formats: JPG, PNG, GIF
        </p>
      </div>
      </div>
    </>
  )
}