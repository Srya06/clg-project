'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CinematicIntroProps {
  onComplete: () => void
}

const introImages = [
  'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=1200&auto=format&fit=crop', // Macro Robot Eye
  'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?q=80&w=1200&auto=format&fit=crop', // Robotic Joints
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop'  // High-tech Circuitry/Core
]

// SFX URLs - High-quality professional sci-fi sounds
const SFX = {
  drone: 'https://studionora.ca/Download/s-f-x/MP3/SciFi/SciFi-01.mp3',
  shutter: 'https://studionora.ca/Download/s-f-x/MP3/Input/Input-03.mp3', // Updated to 03 for a sharper click
  whoosh: 'https://studionora.ca/Download/s-f-x/MP3/Woosh/Woosh-Light-01.mp3'
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'power-on' | 'initial' | 'montage' | 'complete'>('power-on')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Audio Refs
  const droneAudio = useRef<HTMLAudioElement | null>(null)
  const shutterAudio = useRef<HTMLAudioElement | null>(null)
  const whooshAudio = useRef<HTMLAudioElement | null>(null)

  // Initialize and check audio files
  useEffect(() => {
    droneAudio.current = new Audio(SFX.drone)
    droneAudio.current.loop = true
    droneAudio.current.volume = 0.4

    shutterAudio.current = new Audio(SFX.shutter)
    shutterAudio.current.volume = 0.6

    whooshAudio.current = new Audio(SFX.whoosh)
    whooshAudio.current.volume = 0.8

    return () => {
      // Cleanup on unmount
      droneAudio.current?.pause()
      droneAudio.current = null
    }
  }, [])

  const handleStart = () => {
    setPhase('initial')
    // Start ambient drone immediately after click
    droneAudio.current?.play().catch(e => console.log("Audio play blocked", e))
    
    // Phase 1: Initial Blackout - System Warmup
    setTimeout(() => {
      setPhase('montage')
    }, 2000)
  }

  // Play shutter sound on frame change
  useEffect(() => {
    if (phase === 'montage') {
      shutterAudio.current?.cloneNode(true).dispatchEvent(new Event('play'))
      // Using cloneNode to allow overlapping shutter sounds if interval is fast
      const s = new Audio(SFX.shutter)
      s.volume = 0.6
      s.play().catch(() => {})

      const montageTimer = setInterval(() => {
        setCurrentImageIndex((prev) => {
          if (prev >= introImages.length - 1) {
            clearInterval(montageTimer)
            
            // Trigger Whoosh slightly before the official completion for anticipation
            setTimeout(() => {
              whooshAudio.current?.play().catch(() => {})
              setPhase('complete')
            }, 800)
            
            return prev
          }
          
          // Play shutter sound for next image
          const nextS = new Audio(SFX.shutter)
          nextS.volume = 0.6
          nextS.play().catch(() => {})
          
          return prev + 1
        })
      }, 1200)

      return () => clearInterval(montageTimer)
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'complete') {
      // Fade out drone
      const fadeInterval = setInterval(() => {
        if (droneAudio.current && droneAudio.current.volume > 0.05) {
          droneAudio.current.volume -= 0.05
        } else {
          droneAudio.current?.pause()
          clearInterval(fadeInterval)
          onComplete()
        }
      }, 100)
    }
  }, [phase, onComplete])

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === 'power-on' && (
          <motion.div
            key="power"
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center transition-colors group relative"
            >
              <div className="absolute inset-0 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" />
              <div className="w-8 h-8 rounded-full bg-white group-hover:shadow-[0_0_20px_white] transition-all" />
            </motion.button>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/30 text-[10px] uppercase tracking-[0.5em] font-light"
            >
              Initialize System Experience
            </motion.p>
          </motion.div>
        )}

        {phase === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="text-white text-[10px] tracking-[1em] uppercase font-light"
          >
            Core Initializing...
          </motion.div>
        )}

        {phase === 'montage' && (
          <motion.div
            key={currentImageIndex}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="absolute inset-0"
          >
            <div 
              className="w-full h-full bg-cover bg-center grayscale brightness-[0.8] contrast-[1.4]"
              style={{ backgroundImage: `url(${introImages[currentImageIndex]})` }}
            />
            {/* Cinematic Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />
            
            {/* Dark Vignette and Letterboxing */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
