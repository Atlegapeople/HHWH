'use client'

import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()

  // Don't show footer on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  return (
    <footer className="bg-brand-green text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Link href="/">
                <Image 
                  src="/images/Footer Logo.png" 
                  alt="HHWH Online Clinic" 
                  width={200} 
                  height={68}
                  className="h-16 w-auto"
                />
              </Link>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Comprehensive hormone health and wellness care, accessible from the comfort of your home. 
              Expert medical professionals dedicated to your wellbeing.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-brand-green transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-brand-green transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-brand-green transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-brand-green transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/about" className="block text-sm text-slate-300 hover:text-white transition-colors">
                About Us
              </Link>
              <Link href="/services" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Our Services
              </Link>
              <Link href="/patient" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Patient Portal
              </Link>
              <Link href="/patient/book-appointment" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Book Appointment
              </Link>
              <Link href="/patient/assessment" className="block text-sm text-slate-300 hover:text-white transition-colors">
                Health Assessment
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Our Services</h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-300">Hormone Replacement Therapy</p>
              <p className="text-sm text-slate-300">Menopause Management</p>
              <p className="text-sm text-slate-300">Thyroid Health</p>
              <p className="text-sm text-slate-300">Women's Health</p>
              <p className="text-sm text-slate-300">Online Consultations</p>
              <p className="text-sm text-slate-300">Health Assessments</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">
                    <Link href="mailto:info@hhwh.co.za" className="hover:text-white transition-colors">
                      info@hhwh.co.za
                    </Link>
                  </p>
                  <p className="text-sm text-slate-300">
                    <Link href="mailto:appointments@hhwh.co.za" className="hover:text-white transition-colors">
                      appointments@hhwh.co.za
                    </Link>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">
                    <Link href="tel:+27123456789" className="hover:text-white transition-colors">
                      +27 12 345 6789
                    </Link>
                  </p>
                  <p className="text-xs text-slate-400">Mon-Fri: 8AM-5PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-brand-green mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-300">
                    123 Health Street<br />
                    Cape Town, 8001<br />
                    South Africa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-white/70">
              © {new Date().getFullYear()} HHWH Online Clinic. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-white/70 hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/disclaimer" className="text-white/70 hover:text-white transition-colors">
                Medical Disclaimer
              </Link>
            </div>
          </div>

          {/* Professional Registration */}
          <div className="mt-6 p-4 bg-white/10 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-white/70 mb-2">
                Professional Registration & Compliance
              </p>
              <div className="flex flex-wrap justify-center items-center space-x-4 text-xs text-white/60">
                <span>HPCSA Registered Practitioners</span>
                <span>•</span>
                <span>POPIA Compliant</span>
                <span>•</span>
                <span>Medical Aid Approved</span>
                <span>•</span>
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}