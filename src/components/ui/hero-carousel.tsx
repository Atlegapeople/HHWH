'use client'

import { useState, useEffect, ReactNode } from 'react'
import Image from 'next/image'

interface HeroCarouselProps {
  images: string[]
  children?: ReactNode
  autoplayDelay?: number
}

export function HeroCarousel({ images, children, autoplayDelay = 7000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, autoplayDelay)

    return () => clearInterval(interval)
  }, [images.length, autoplayDelay])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Image slides */}
      {images.map((src, index) => {
        const isActive = index === currentIndex
        const isNext = index === (currentIndex + 1) % images.length
        const isPrev = index === (currentIndex - 1 + images.length) % images.length
        
        return (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={src}
                alt={`Hero image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-[2500ms] ease-in-out"
                priority={index === 0}
                quality={90}
              />
            </div>
          </div>
        )
      })}

      {/* Overlay content */}
      <div className="relative z-30 h-full">
        {children}
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-20">
        <div
          className="h-full bg-brand-green transition-all duration-300 ease-linear"
          style={{
            width: `${((currentIndex + 1) / images.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}