import React, { useState, useEffect, useRef } from 'react'

export default function LoadingAnimation({ onComplete }) {
  const [phase, setPhase] = useState('init')
  // We use refs for ultra-smooth direct DOM manipulation instead of React state
  const numberRef = useRef(null)
  const line1Ref = useRef(null)
  const line2Ref = useRef(null)
  const line3Ref = useRef(null)
  const line4Ref = useRef(null)
  const hasRun = useRef(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasRun.current) return
    hasRun.current = true

    const sequence = async () => {
      // Phase A: Give it a tiny delay to ensure homepage is rendered behind
      await new Promise(r => setTimeout(r, 100))
      
      // Phase B: Dim homepage -> black background
      setPhase('dim')
      await new Promise(r => setTimeout(r, 800))
      
      // Phase C: Show loader
      setPhase('loading')
      
      // Wait a tiny bit for React to render the refs
      await new Promise(r => setTimeout(r, 50))
      
      // Animate progress smoothly using requestAnimationFrame for zero lag
      await new Promise(resolve => {
        const duration = 3000 // 3 seconds loading time (slowed down for cinematic feel)
        const startTime = performance.now()
        
        const updateFrame = (currentTime) => {
          const elapsed = currentTime - startTime
          const rawProgress = Math.min(100, (elapsed / duration) * 100)
          
          // Use cubic ease-out for a smooth finish
          const t = rawProgress / 100
          const easeOut = 1 - Math.pow(1 - t, 3)
          const currentProgress = easeOut * 100
          
          const displayNum = Math.floor(currentProgress)
          
          // Direct DOM updates bypass React's render cycle completely, fixing all lag!
          if (numberRef.current) numberRef.current.innerText = displayNum
          
          const offset = 100 - currentProgress
          if (line1Ref.current) line1Ref.current.style.strokeDashoffset = offset
          if (line2Ref.current) line2Ref.current.style.strokeDashoffset = offset
          if (line3Ref.current) line3Ref.current.style.strokeDashoffset = offset
          if (line4Ref.current) line4Ref.current.style.strokeDashoffset = offset
          
          if (elapsed < duration) {
            requestAnimationFrame(updateFrame)
          } else {
            // Ensure we finish exactly at 100
            if (numberRef.current) numberRef.current.innerText = 100
            if (line1Ref.current) line1Ref.current.style.strokeDashoffset = 0
            if (line2Ref.current) line2Ref.current.style.strokeDashoffset = 0
            if (line3Ref.current) line3Ref.current.style.strokeDashoffset = 0
            if (line4Ref.current) line4Ref.current.style.strokeDashoffset = 0
            resolve()
          }
        }
        requestAnimationFrame(updateFrame)
      })
      
      // Phase D: Circular transition
      setPhase('expand')
      await new Promise(r => setTimeout(r, 1000))
      
      // Phase E: Done
      setPhase('done')
      setTimeout(() => {
        onComplete()
      }, 100)
    }
    
    sequence()
  }, [onComplete])

  if (phase === 'done') return null
  
  const isDimmed = phase !== 'init'
  const isExpand = phase === 'expand'
  const fadeOutElements = phase === 'expand'

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: isDimmed ? (isExpand ? 'transparent' : '#050505') : 'transparent',
        transition: 'background-color 800ms ease-in-out'
      }}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        
        {/* Full Screen Loading Border - 4 Parallel Lines matching the Font */}
        {isDimmed && !isExpand && (
          // REMOVED drop-shadow as it causes massive GPU lag on animated SVGs
          <div className="absolute inset-0 pointer-events-none z-20">
            <svg className="absolute inset-0 w-full h-full overflow-visible">
              <rect ref={line1Ref} x="0" y="0" width="100%" height="100%" fill="none" stroke="#f97316" strokeWidth="8" pathLength="100" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
            <svg className="absolute inset-[16px] w-[calc(100%-32px)] h-[calc(100%-32px)]">
              <rect ref={line2Ref} x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffffff" strokeWidth="8" pathLength="100" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
            <svg className="absolute inset-[32px] w-[calc(100%-64px)] h-[calc(100%-64px)]">
              <rect ref={line3Ref} x="0" y="0" width="100%" height="100%" fill="none" stroke="#f97316" strokeWidth="8" pathLength="100" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
            <svg className="absolute inset-[48px] w-[calc(100%-96px)] h-[calc(100%-96px)]">
              <rect ref={line4Ref} x="0" y="0" width="100%" height="100%" fill="none" stroke="#ffffff" strokeWidth="8" pathLength="100" strokeDasharray="100" strokeDashoffset="100" />
            </svg>
          </div>
        )}

        {/* Circular Wipe using Box Shadow Trick */}
        {isDimmed && (
          <div 
            className="absolute z-0 pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              width: isExpand ? '300vw' : '0px',
              height: isExpand ? '300vw' : '0px',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              backgroundColor: 'transparent',
              boxShadow: '0 0 0 4000px #050505', // The black background
              transition: isExpand ? 'width 1000ms cubic-bezier(0.7, 0, 0.3, 1), height 1000ms cubic-bezier(0.7, 0, 0.3, 1)' : 'none',
            }}
          />
        )}

        {/* Loading Progress Text Only */}
        <div 
          className="z-20 flex flex-col items-center justify-center"
          style={{
            opacity: fadeOutElements ? 0 : (phase === 'loading' ? 1 : 0),
            transition: 'opacity 300ms ease',
          }}
        >
          {/* Progress Number with Highly Unique Font */}
          <div 
            ref={numberRef}
            className="text-7xl md:text-9xl font-monoton text-white"
            style={{ 
              fontFeatureSettings: '"tnum" 1',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.4)'
            }}
          >
            0
          </div>
        </div>

      </div>
    </div>
  )
}
