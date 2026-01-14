'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface VideoModalProps {
  videoId: string
  title: string
  onClose: () => void
}

export function VideoModal({ videoId, title, onClose }: VideoModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 bg-black rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 bg-gray-900">
          <h3 className="text-white font-medium truncate pr-4">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
