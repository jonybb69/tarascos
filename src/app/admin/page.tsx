'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, memo } from 'react'
import { toast } from 'sonner'
import classNames from 'classnames'
import * as FiIcons from 'react-icons/fi'
import * as FaIcons from 'react-icons/fa'
import React from 'react'
import { useAuthStore } from '@/store/useAuthStore'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const iconSize = 'w-8 h-8'

// Card component
const DashboardCard = memo(function DashboardCard({
  icon,
  title,
  description,
  color,
  onClick
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  onClick: () => void
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -8, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={classNames(
        'rounded-2xl shadow-lg transition-all duration-300 cursor-pointer text-white bg-gradient-to-br',
        color,
        `hover:opacity-95`
      )}
      onClick={onClick}
      role="button"
      aria-label={`Ir a ${title}`}
    >
      <div className="p-6 flex flex-col items-center text-center h-full">
        <div className="mb-6 p-4 bg-white/10 rounded-full backdrop-blur-sm">
          {icon}
        </div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="text-white/80">{description}</p>
      </div>
    </motion.div>
  )
})

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      localStorage.removeItem('admin-token')
      useAuthStore.getState().logout()
      toast.success('Hasta luego, jefe 🌮')
      router.push('/admin/login')
    } catch {
      localStorage.removeItem('admin-token')
      useAuthStore.getState().logout()
      router.push('/admin/login')
    }
  }

  const cards = [
    {
      title: 'Pedidos',
      description: 'Controla las órdenes en tiempo real',
      icon: <FiIcons.FiClipboard className={iconSize} />,
      path: '/admin/dashboard',
      color: 'from-red-800 to-orange-600'
    },
    {
      title: 'Productos',
      description: 'Gestiona tacos, tortas y bebidas',
      icon: <FaIcons.FaHamburger className={iconSize} />,
      path: '/admin/products',
      color: 'from-yellow-700 to-orange-500'
    },
    {
      title: 'Salsas',
      description: 'Edita tus salsas legendarias',
      icon: <FaIcons.FaPepperHot className={iconSize} />,
      path: '/admin/sauces',
      color: 'from-red-700 to-pink-600'
    },
    {
      title: 'Clientes',
      description: 'Historial y preferencias de clientes',
      icon: <FiIcons.FiUsers className={iconSize} />,
      path: '/admin/clientes',
      color: 'from-green-700 to-lime-500'
    },
    {
      title: 'Repartidores',
      description: 'Asignaciones y rutas activas',
      icon: <FiIcons.FiTruck className={iconSize} />,
      path: '/admin/repartidores',
      color: 'from-sky-700 to-cyan-500'
    },
    {
      title: 'Configuración',
      description: 'Ajustes generales del sistema',
      icon: <FiIcons.FiSettings className={iconSize} />,
      path: '/admin/configuracion',
      color: 'from-gray-700 to-gray-500'
    },
    {
      title: 'Menú',
      description: 'Ajustes generales del sistema',
      icon: <FiIcons.FiMenu className={iconSize} />,
      path: '/menu',
      color: 'from-teal-700 to-black'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-red-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-transparent border-red-600 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-100 to-red-100 text-gray-900 p-6 relative">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-700 via-orange-600 to-yellow-500">
          Tarascos Admin Panel
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mt-2">
          Control total del sabor y la logística 🌮🔥
        </p>
      </motion.header>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {cards.map((card, i) => (
          <DashboardCard
            key={i}
            {...card}
            onClick={() => router.push(card.path)}
          />
        ))}

        {/* Logout */}
        <DashboardCard
          icon={<FiIcons.FiLogOut className={iconSize} />}
          title="Cerrar Sesión"
          description="Salir del sistema"
          color="from-gray-800 to-red-600"
          onClick={() => setShowConfirmation(true)}
        />
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Seguro que deseas salir?
              </h3>
              <p className="text-gray-600 mb-6">
                Se cerrará tu sesión de administrador.
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={logout}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 transition"
                >
                  Cerrar Sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 text-center text-gray-600 text-sm"
      >
        <p>Tarascos Admin Panel v1.0</p>
        <p className="mt-1">© {new Date().getFullYear()} Taquería Tarascos</p>
      </motion.footer>
    </div>
  )
}
