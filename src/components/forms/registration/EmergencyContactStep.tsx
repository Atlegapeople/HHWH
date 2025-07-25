'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration } from '@/lib/validations/patient'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Users, Heart } from 'lucide-react'

interface EmergencyContactStepProps {
  form: UseFormReturn<PatientRegistration>
}

const relationships = [
  'Spouse/Partner',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Other Family Member',
  'Other'
]

export function EmergencyContactStep({ form }: EmergencyContactStepProps) {
  const { control } = form

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-red/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-brand-red" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2">Emergency Contact</h3>
        <p className="text-sm text-muted-foreground">
          Please provide details of someone we can contact in case of an emergency during your care.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="emergency_contact.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Full Name *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Emergency contact's full name"
                  {...field}
                  className="h-12"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="emergency_contact.relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {relationships.map((relationship) => (
                      <SelectItem key={relationship} value={relationship}>
                        {relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="emergency_contact.phone"
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
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-brand-red/5 p-4 rounded-lg border border-brand-red/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-red/10 p-2 rounded-full">
            <Heart className="h-5 w-5 text-brand-red" />
          </div>
          <div>
            <h4 className="font-medium text-brand-red mb-1">When We Contact Your Emergency Contact</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We will only contact your emergency contact in specific situations:
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Medical emergency during a consultation</li>
              <li>• If you become unresponsive during a video call</li>
              <li>• If you specifically request we contact them</li>
              <li>• As required by medical emergency protocols</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Your privacy is protected - we won't share medical details without your consent.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-brand-blue/5 p-4 rounded-lg border border-brand-blue/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-blue/10 p-2 rounded-full">
            <Users className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h4 className="font-medium text-brand-blue mb-1">Important Note</h4>
            <p className="text-sm text-muted-foreground">
              Please ensure your emergency contact is aware they have been listed and 
              can be reached at the provided number during your consultation times.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}