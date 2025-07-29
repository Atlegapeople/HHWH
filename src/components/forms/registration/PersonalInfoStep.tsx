'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration } from '@/lib/validations/patient'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { User, Mail, Phone, Calendar } from 'lucide-react'
import { ProfilePhotoUpload } from '@/components/forms/ProfilePhotoUpload'

interface PersonalInfoStepProps {
  form: UseFormReturn<PatientRegistration>
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const { control } = form

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-heading font-semibold mb-2">Tell us about yourself</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Please provide your basic information to help us create your patient profile.
        </p>
        
        <FormField
          control={control}
          name="profile_photo_url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <ProfilePhotoUpload
                  currentPhotoUrl={field.value}
                  onPhotoChange={field.onChange}
                  size="lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="0812345678 or +27812345678"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a valid South African mobile number
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Birth *
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className="h-12"
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                You must be at least 18 years old to register
              </p>
            </FormItem>
          )}
        />
      </div>

      <div className="bg-brand-blue/5 p-4 rounded-lg border border-brand-blue/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-blue/10 p-2 rounded-full">
            <User className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h4 className="font-medium text-brand-blue mb-1">Privacy & Security</h4>
            <p className="text-sm text-muted-foreground">
              Your personal information is encrypted and protected according to POPIA compliance standards. 
              We never share your data with third parties without your explicit consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}