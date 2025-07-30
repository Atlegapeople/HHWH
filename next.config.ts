import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Security Headers for Corporate Network Compliance
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self https://meet.jit.si https://*.jitsi.net), microphone=(self https://meet.jit.si https://*.jitsi.net), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel.app https://*.supabase.co https://*.paystack.co https://*.googleapis.com https://*.gstatic.com https://js.paystack.co https://meet.jit.si https://*.jitsi.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://meet.jit.si https://*.jitsi.net",
              "font-src 'self' https://fonts.gstatic.com https://meet.jit.si https://*.jitsi.net",
              "img-src 'self' data: blob: https://*.supabase.co https://*.vercel.app https://*.paystack.co https://meet.jit.si https://*.jitsi.net",
              "connect-src 'self' https://*.supabase.co https://*.vercel.app https://*.paystack.co wss://*.supabase.co https://meet.jit.si https://*.jitsi.net wss://meet.jit.si wss://*.jitsi.net",
              "media-src 'self' https://*.supabase.co https://meet.jit.si https://*.jitsi.net",
              "frame-src 'self' https://meet.jit.si https://*.jitsi.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.paystack.co"
            ].join('; ')
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none'
          }
        ],
      },
    ];
  },

  // Image optimization for corporate networks
  images: {
    domains: [
      'dlmyhufckyxqfmhnyrnj.supabase.co',
      'hhwh.vercel.app',
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Compression for faster loading on restricted networks
  compress: true,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },

  // Environment-specific redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/patient/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
