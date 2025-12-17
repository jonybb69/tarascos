// components/Toast.tsx
'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  message: string
  type: ToastType
  onClose?: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return <FiCheck className="w-4 h-4" />
      case 'error': return <FiAlertCircle className="w-4 h-4" />
      case 'warning': return <FiAlertTriangle className="w-4 h-4" />
      case 'info': return <FiInfo className="w-4 h-4" />
      default: return <FiInfo className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success': return 'bg-gradient-to-r from-green-500 to-teal-500'
      case 'error': return 'bg-gradient-to-r from-red-500 to-pink-600'
      case 'warning': return 'bg-gradient-to-r from-amber-500 to-orange-500'
      case 'info': return 'bg-gradient-to-r from-blue-500 to-cyan-500'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-700'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`${getColor()} text-white rounded-xl shadow-2xl p-4 max-w-sm backdrop-blur-sm border border-white/20`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm leading-tight">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 -mr-2 -mt-2"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}