'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientRegistration, medicalAidSchemes } from '@/lib/validations/patient'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shield, CreditCard, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MedicalAidStepProps {
  form: UseFormReturn<PatientRegistration>
}

export function MedicalAidStep({ form }: MedicalAidStepProps) {
  const { control, watch } = form
  const selectedScheme = watch('medical_aid_scheme')

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto bg-brand-green/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <Shield className="h-8 w-8 text-brand-green" />
        </div>
        <h3 className="text-lg font-heading font-semibold mb-2">Medical Aid Information</h3>
        <p className="text-sm text-muted-foreground">
          Help us optimize your benefits by providing your medical aid details. This is optional but recommended.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Medical aid information is optional. If you prefer to pay privately, you can skip this section.
          We support all major South African medical aid schemes.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormField
          control={control}
          name="medical_aid_scheme"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Medical Aid Scheme
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your medical aid scheme" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No medical aid (Private pay)</SelectItem>
                  {medicalAidSchemes.map((scheme) => (
                    <SelectItem key={scheme} value={scheme}>
                      {scheme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedScheme && selectedScheme !== 'none' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="medical_aid_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Medical Aid Number *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your member number"
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
                name="medical_aid_dependent_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dependent Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00 (if main member)"
                        {...field}
                        className="h-12"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Usually "00" for main member, or your specific dependent code
                    </p>
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-brand-green/5 p-4 rounded-lg border border-brand-green/20">
              <div className="flex items-start gap-3">
                <div className="bg-brand-green/10 p-2 rounded-full">
                  <Shield className="h-5 w-5 text-brand-green" />
                </div>
                <div>
                  <h4 className="font-medium text-brand-green mb-1">Medical Aid Benefits</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    We'll validate your benefits and help you understand your coverage for hormone health consultations.
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Coverage verification before each consultation</li>
                    <li>• Direct billing where possible</li>
                    <li>• Clear breakdown of covered vs. patient portions</li>
                    <li>• Support with pre-authorization if required</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {(!selectedScheme || selectedScheme === 'none') && (
          <div className="bg-brand-orange/5 p-4 rounded-lg border border-brand-orange/20">
            <div className="flex items-start gap-3">
              <div className="bg-brand-orange/10 p-2 rounded-full">
                <CreditCard className="h-5 w-5 text-brand-orange" />
              </div>
              <div>
                <h4 className="font-medium text-brand-orange mb-1">Private Payment</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  No problem! You can pay privately for all consultations and services.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Transparent pricing for all services</li>
                  <li>• Secure online payment options</li>
                  <li>• Detailed invoices for tax/insurance claims</li>
                  <li>• No waiting for medical aid approvals</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}