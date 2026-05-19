'use client'

import { Suspense, lazy, useState } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-black flex items-center justify-center">
        <div className="text-white/10 text-xs tracking-widest uppercase">3D Engine Offline • Standard Mode Active</div>
      </div>
    );
  }

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black">
          <span className="loader text-white/20 animate-spin">◌</span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onError={() => setError(true)}
      />
    </Suspense>
  )
}
