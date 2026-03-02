'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CarouselImage {
  src: string
  alt: string
  title?: string
  description?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoPlayInterval?: number
}

export function ImageCarousel({ images, autoPlayInterval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (autoPlayInterval <= 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [images.length, autoPlayInterval])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Main Image */}
      <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              {(image.title || image.description) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  {image.title && (
                    <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                  )}
                  {image.description && (
                    <p className="text-white/80 text-sm">{image.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="secondary"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
        onClick={goToNext}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-pink-500 w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
