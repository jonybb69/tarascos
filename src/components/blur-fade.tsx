'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface BlurFadeProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  yOffset?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  inView?: boolean
  className?: string
}

export function BlurFade({
  children,
  delay = 0,
  duration = 0.4,
  yOffset = 8,
  direction = 'down',
  inView = false,
  className = '',
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(!inView)

  useEffect(() => {
    if (!inView) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [inView])

  const getDirection = () => {
    switch (direction) {
      case 'up':
        return { y: yOffset }
      case 'down':
        return { y: -yOffset }
      case 'left':
        return { x: yOffset }
      case 'right':
        return { x: -yOffset }
      default:
        return { y: -yOffset }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        filter: 'blur(10px)',
        ...getDirection(),
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: 'blur(0px)',
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              filter: 'blur(10px)',
              ...getDirection(),
            }
      }
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}