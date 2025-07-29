'use client'

import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowUpRight, Globe, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Footer() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Helper function to get the correct URL based on user authentication
  const getAuthRedirectUrl = (targetUrl: string) => {
    return user ? targetUrl : '/auth/signup'
  }

  // Don't show footer on auth pages or doctor portals that have their own layouts
  if (pathname.startsWith('/auth/') || 
      pathname.startsWith('/doctor/')) {
    return null
  }

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(33,123,130,0.1)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-center">
              <Link href="/" className="group">
                <Image 
                  src="/images/Footer Logo.png" 
                  alt="HHWH Online Clinic" 
                  width={200} 
                  height={68}
                  className="h-16 w-auto transition-transform group-hover:scale-105"
                />
              </Link>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-md">
              Comprehensive hormone health and wellness care, accessible from the comfort of your home. 
              Expert medical professionals dedicated to your wellbeing.
            </p>
            
            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#217B82]" />
                <span className="text-sm text-slate-300">POPIA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#217B82]" />
                <span className="text-sm text-slate-300">Expert Care</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#217B82]" />
                <span className="text-sm text-slate-300">Online Access</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#217B82]" />
                <span className="text-sm text-slate-300">24/7 Support</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <Link href="#" className="group p-2 bg-white/5 rounded-lg hover:bg-[#217B82]/20 transition-all duration-300">
                <Facebook className="h-5 w-5 text-slate-400 group-hover:text-[#217B82] transition-colors" />
              </Link>
              <Link href="#" className="group p-2 bg-white/5 rounded-lg hover:bg-[#217B82]/20 transition-all duration-300">
                <Twitter className="h-5 w-5 text-slate-400 group-hover:text-[#217B82] transition-colors" />
              </Link>
              <Link href="#" className="group p-2 bg-white/5 rounded-lg hover:bg-[#217B82]/20 transition-all duration-300">
                <Instagram className="h-5 w-5 text-slate-400 group-hover:text-[#217B82] transition-colors" />
              </Link>
              <Link href="#" className="group p-2 bg-white/5 rounded-lg hover:bg-[#217B82]/20 transition-all duration-300">
                <Linkedin className="h-5 w-5 text-slate-400 group-hover:text-[#217B82] transition-colors" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-white relative">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#217B82] to-transparent"></div>
            </h3>
            <div className="space-y-3">
              <Link href="/" className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>Home</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/about" className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>About Us</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/services" className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>Our Services</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href={getAuthRedirectUrl("/patient")} className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>Patient Portal</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href={getAuthRedirectUrl("/patient/book-appointment")} className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>Book Appointment</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href={getAuthRedirectUrl("/patient/assessment")} className="group flex items-center justify-between text-sm text-slate-300 hover:text-[#217B82] transition-all duration-300">
                <span>Health Assessment</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-white relative">
              Contact Us
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-[#217B82] to-transparent"></div>
            </h3>
            <div className="space-y-4">
              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-[#217B82]/10 transition-all duration-300">
                <Mail className="h-5 w-5 text-[#217B82] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    <Link href="mailto:hello@hhwh.co.za" className="hover:text-[#217B82] transition-colors">
                      hello@hhwh.co.za
                    </Link>
                  </p>
                  <p className="text-xs text-slate-400">General Inquiries</p>
                </div>
              </div>
              
              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-[#217B82]/10 transition-all duration-300">
                <Phone className="h-5 w-5 text-[#217B82] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      <Link href="tel:+27116855021" className="hover:text-[#217B82] transition-colors">
                        +27 (0)11 685 5021
                      </Link>
                    </p>
                    <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                      <Link href="tel:+27792628749" className="hover:text-[#217B82] transition-colors">
                        +27 (0)79 262 8749
                      </Link>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Mon-Fri: 8AM-5PM</p>
                </div>
              </div>

              <div className="group flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-[#217B82]/10 transition-all duration-300">
                <MapPin className="h-5 w-5 text-[#217B82] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    Ground floor, 8 Merchant Place<br />
                    1 Fredman Drive, Sandton 2196<br />
                    South Africa
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-[#217B82]" />
              <span className="text-sm text-slate-400">
                © {new Date().getFullYear()} HHWH Online Clinic. Made with care for your health.
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-6">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-[#217B82] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-[#217B82] transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-sm text-slate-400 hover:text-[#217B82] transition-colors">
                Cookie Policy
              </Link>
              <Link href="/disclaimer" className="text-sm text-slate-400 hover:text-[#217B82] transition-colors">
                Medical Disclaimer
              </Link>
            </div>
          </div>

          {/* Professional Registration */}
          <div className="mt-8 p-6 bg-gradient-to-r from-[#217B82]/10 to-transparent rounded-xl border border-[#217B82]/20">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Shield className="h-5 w-5 text-[#217B82]" />
                <h4 className="text-sm font-semibold text-white">
                  Professional Registration & Compliance
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-[#217B82]/20 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#217B82]" />
                  </div>
                  <span className="text-slate-300">HPCSA Registered</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-[#217B82]/20 rounded-full flex items-center justify-center">
                    <Globe className="h-4 w-4 text-[#217B82]" />
                  </div>
                  <span className="text-slate-300">POPIA Compliant</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-[#217B82]/20 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-[#217B82]" />
                  </div>
                  <span className="text-slate-300">Medical Aid Approved</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-8 h-8 bg-[#217B82]/20 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-[#217B82]" />
                  </div>
                  <span className="text-slate-300">SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gradient Border at Top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#217B82] to-transparent"></div>
    </footer>
  )
}