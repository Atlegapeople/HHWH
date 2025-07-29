'use client'

interface PatientLayoutProps {
  children: React.ReactNode
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  return (
    <>
      {children}
    </>
  )
}