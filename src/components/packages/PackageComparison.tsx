'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  CreditCard, 
  Clock,
  Stethoscope,
  Heart,
  Users,
  Package,
  Star,
  Zap,
  Target,
  Gift
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PackageOption {
  id: string
  name: string
  type: 'medical_aid' | 'cash'
  totalPrice: number
  savings?: number
  badge?: string
  popular?: boolean
  consultations: {
    name: string
    duration: number
    practitioner: string
    price: number
    procedureCodes?: string[]
  }[]
  addons: {
    name: string
    description: string
    discount: number
    consultationCount?: number
  }[]
  features: string[]
  reimbursementEstimate?: {
    min: number
    max: number
  }
}

const packages: PackageOption[] = [
  {
    id: 'medical-aid-package-1',
    name: 'Package 1 - Medical Aid',
    type: 'medical_aid',
    totalPrice: 2660,
    popular: true,
    badge: 'Most Popular',
    consultations: [
      {
        name: 'Initial GP Consultation',
        duration: 45,
        practitioner: 'Hormone Specialist',
        price: 1000,
        procedureCodes: ['0129', '0192']
      },
      {
        name: 'Follow-up GP Consultation', 
        duration: 30,
        practitioner: 'Hormone Specialist',
        price: 1000,
        procedureCodes: ['0130']
      },
      {
        name: 'Auxiliary Practitioner Consultation',
        duration: 30,
        practitioner: 'Specialist Practitioner',
        price: 660,
        procedureCodes: ['0130']
      }
    ],
    addons: [
      {
        name: 'Dietitian Package + CGM Discount',
        description: '3 dietitian consultations + 10% CGM discount',
        discount: 10,
        consultationCount: 3
      },
      {
        name: 'Counsellor Package + DNAlysis Discount',
        description: '3 counsellor consultations + 15% DNAlysis discount',
        discount: 15,
        consultationCount: 3
      }
    ],
    features: [
      'Medical aid billing with procedure codes',
      'Invoice for medical aid submission',
      'Reimbursement estimate provided',
      'Priority booking access',
      '9-month package validity',
      'Comprehensive care coordination'
    ],
    reimbursementEstimate: {
      min: 1800,
      max: 2400
    }
  },
  {
    id: 'cash-package-1',
    name: 'Package 1 - Cash Payment',
    type: 'cash',
    totalPrice: 2400,
    savings: 260,
    badge: 'Best Value',
    consultations: [
      {
        name: 'Initial GP Consultation',
        duration: 45,
        practitioner: 'Hormone Specialist',
        price: 950
      },
      {
        name: 'Follow-up GP Consultation',
        duration: 30,
        practitioner: 'Hormone Specialist', 
        price: 800
      },
      {
        name: 'Auxiliary Practitioner Consultation',
        duration: 30,
        practitioner: 'Specialist Practitioner',
        price: 650
      }
    ],
    addons: [
      {
        name: 'Dietitian Package + CGM Discount',
        description: '3 dietitian consultations + 10% CGM discount',
        discount: 10,
        consultationCount: 3
      },
      {
        name: 'Counsellor Package + DNAlysis Discount', 
        description: '3 counsellor consultations + 15% DNAlysis discount',
        discount: 15,
        consultationCount: 3
      }
    ],
    features: [
      'Direct cash pricing - no medical aid needed',
      'Immediate booking confirmation',
      'No waiting for medical aid approval',
      'Digital receipts for tax/reimbursement',
      '9-month package validity', 
      'Same expert care and coordination'
    ]
  }
]

interface PackageComparisonProps {
  onPackageSelect?: (packageId: string) => void
  selectedPackageId?: string
}

export default function PackageComparison({ onPackageSelect, selectedPackageId }: PackageComparisonProps) {
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null)

  const handlePackageSelect = (packageId: string) => {
    if (onPackageSelect) {
      onPackageSelect(packageId)
    }
  }

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4 bg-brand-purple/10 text-brand-purple border-brand-purple/30">
          Package Options
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold mb-6">Choose Your Care Package</h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive hormone health packages designed for your journey. Select medical aid or cash payment based on your preference.
        </p>
      </div>

      {/* Package Comparison Cards */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {packages.map((pkg) => (
          <Card 
            key={pkg.id}
            className={`relative border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden group ${
              pkg.popular 
                ? 'border-brand-green/30 shadow-lg' 
                : 'border-brand-blue/20 shadow-md'
            } ${
              selectedPackageId === pkg.id 
                ? 'ring-4 ring-brand-green/20 border-brand-green' 
                : ''
            }`}
            onMouseEnter={() => setHoveredPackage(pkg.id)}
            onMouseLeave={() => setHoveredPackage(null)}
            onClick={() => handlePackageSelect(pkg.id)}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              pkg.type === 'medical_aid' 
                ? 'from-brand-blue/5 to-brand-green/5' 
                : 'from-brand-green/5 to-brand-purple/5'
            }`}></div>

            {/* Popular badge */}
            {pkg.popular && (
              <div className="absolute -top-1 -right-1 z-10">
                <div className="bg-gradient-to-r from-brand-green to-brand-blue text-white px-4 py-1 text-sm font-bold transform rotate-12 shadow-lg">
                  <Star className="h-3 w-3 inline mr-1" />
                  {pkg.badge}
                </div>
              </div>
            )}

            {/* Savings badge */}
            {pkg.savings && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-brand-green text-white shadow-lg">
                  <Gift className="h-3 w-3 mr-1" />
                  Save R{pkg.savings}
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-6 relative z-10">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:-translate-y-2 ${
                pkg.type === 'medical_aid' 
                  ? 'bg-gradient-to-br from-brand-blue to-brand-green' 
                  : 'bg-gradient-to-br from-brand-green to-brand-purple'
              }`}>
                {pkg.type === 'medical_aid' ? (
                  <Shield className="h-8 w-8 text-white group-hover:animate-pulse" />
                ) : (
                  <CreditCard className="h-8 w-8 text-white group-hover:animate-spin" />
                )}
              </div>
              
              <CardTitle className={`text-xl font-bold group-hover:transition-colors duration-300 ${
                pkg.type === 'medical_aid' ? 'group-hover:text-brand-blue' : 'group-hover:text-brand-green'
              }`}>
                {pkg.name}
              </CardTitle>
              
              <div className={`w-12 h-0.5 mx-auto mt-2 group-hover:w-20 transition-all duration-300 ${
                pkg.type === 'medical_aid' ? 'bg-brand-blue/30' : 'bg-brand-green/30'
              }`}></div>

              {/* Pricing */}
              <div className="mt-4">
                <div className="text-4xl font-bold text-foreground mb-2">
                  R{pkg.totalPrice.toLocaleString()}
                </div>
                {pkg.reimbursementEstimate && (
                  <div className="text-sm text-muted-foreground">
                    Est. Medical Aid: R{pkg.reimbursementEstimate.min}-{pkg.reimbursementEstimate.max}
                  </div>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  Valid for 9 months
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* Consultations Included */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Consultations Included
                </h4>
                <div className="space-y-3">
                  {pkg.consultations.map((consultation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg group-hover:bg-white/80 transition-colors duration-300">
                      <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-brand-green">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{consultation.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {consultation.duration} minutes • {consultation.practitioner}
                        </div>
                        <div className="text-xs font-medium text-brand-green">
                          R{consultation.price}
                          {consultation.procedureCodes && (
                            <span className="ml-2 text-brand-blue">
                              Codes: {consultation.procedureCodes.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on Services */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Optional Add-on Services
                </h4>
                <div className="space-y-2">
                  {pkg.addons.map((addon, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300">
                      <CheckCircle className="h-4 w-4 text-brand-green group-hover:animate-bounce" />
                      <div>
                        <div className="font-medium">{addon.name}</div>
                        <div className="text-xs text-muted-foreground">{addon.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Package Features */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Package Benefits
                </h4>
                <ul className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${index * 75}ms` }}>
                      <CheckCircle className="h-4 w-4 text-brand-green group-hover:animate-bounce" />
                      <span className="group-hover:text-foreground transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  className={`w-full text-lg py-3 group-hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    pkg.type === 'medical_aid'
                      ? 'bg-brand-blue hover:bg-brand-blue/90 text-white'
                      : 'bg-brand-green hover:bg-brand-green/90 text-white'
                  } ${
                    selectedPackageId === pkg.id 
                      ? 'ring-2 ring-offset-2 ring-brand-green' 
                      : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePackageSelect(pkg.id)
                  }}
                >
                  {pkg.type === 'medical_aid' ? (
                    <Shield className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                  ) : (
                    <CreditCard className="h-5 w-5 mr-2 group-hover:animate-spin" />
                  )}
                  {selectedPackageId === pkg.id ? 'Selected' : 'Select Package'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Card className="border-brand-green/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-brand-green">Package Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-brand-blue" />
                  Medical Aid Packages
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Invoice provided for medical aid submission</li>
                  <li>• Procedure codes included for reimbursement</li>
                  <li>• Estimated coverage provided upfront</li>
                  <li>• Pay shortfall if not fully covered</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand-green" />
                  Cash Payment Packages
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Direct payment - no medical aid needed</li>
                  <li>• Immediate booking confirmation</li>
                  <li>• Competitive pricing with savings</li>
                  <li>• Digital receipts for personal records</li>
                </ul>
              </div>
            </div>
            <div className="bg-brand-green/5 rounded-lg p-4 mt-6">
              <p className="text-sm text-center">
                <strong className="text-brand-green">Questions about packages?</strong> Contact us at{' '}
                <strong className="text-brand-green">hello@hhwh.co.za</strong> or{' '}
                <strong className="text-brand-green">+27 (0)11 685 5021</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}