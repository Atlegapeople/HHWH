'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration } from '@/lib/validations/patient'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Home } from 'lucide-react'

interface AddressStepProps {
  form: UseFormReturn<PatientRegistration>
}

const southAfricanProvinces = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
]

export function AddressStep({ form }: AddressStepProps) {
  const { control } = form

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-blue/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-brand-blue" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2">Address Information</h3>
        <p className="text-sm text-muted-foreground">
          We need your address for medical records and to ensure we can provide services in your area.
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="address.street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Street Address *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main Street, Suburb"
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
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Johannesburg"
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
            name="address.postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="2000"
                    {...field}
                    className="h-12"
                    maxLength={4}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  4-digit South African postal code
                </p>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="address.province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Province *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {southAfricanProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-brand-blue/5 p-4 rounded-lg border border-brand-blue/20">
        <div className="flex items-start gap-3">
          <div className="bg-brand-blue/10 p-2 rounded-full">
            <MapPin className="h-5 w-5 text-brand-blue" />
          </div>
          <div>
            <h4 className="font-medium text-brand-blue mb-1">Service Areas</h4>
            <p className="text-sm text-muted-foreground mb-2">
              We provide virtual consultations nationwide across South Africa.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Virtual consultations available in all provinces</li>
              <li>• No travel required - consult from home</li>
              <li>• Prescription delivery available in major cities</li>
              <li>• Local lab partnerships for testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}