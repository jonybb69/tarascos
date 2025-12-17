'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'

export default function HomePage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigateToMenu = () => {
    router.push('/menu')
  }

  const menuItems = [
    { 
      name: 'Acerca de', 
      icon: '🏮',
      description: 'Nuestra historia y tradición' 
    },
    { 
      name: 'Contacto', 
      icon: '📞',
      description: 'Hablemos, estamos para servirte' 
    },
    { 
      name: 'Ubicación', 
      icon: '📍',
      description: 'Visítanos en nuestro restaurante' 
    },
    { 
      name: 'Horarios', 
      icon: '🕒',
      description: 'Lun-Dom: 8:00 AM - 10:00 PM' 
    },
    { 
      name: 'Especialidades', 
      icon: '🍽️',
      description: 'Descubre nuestros platillos estrella' 
    },
    { 
      name: 'Eventos', 
      icon: '🎉',
      description: 'Celebra tus momentos especiales' 
    }
  ]

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay con gradiente para mejor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      
      <Toaster />

      {/* Botón Menú Hamburguesa */}
      <motion.button
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-6 left-6 z-50 bg-orange-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-orange-600 transition-all backdrop-blur-sm border border-white/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>

      {/* Botón Admin (NUEVO - agregar esto justo después del botón hamburguesa) */}
<motion.button
  onClick={() => router.push('/admin/login')}
  className="fixed top-6 right-6 z-50 bg-gray-500 bg-opacity-50 text-white p-3 rounded-2xl hover:bg-gray-600 transition-all backdrop-blur-sm border border-white/20 text-sm"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.7 }}
  title="Acceso administrador"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
</motion.button>

      {/* Contenido Principal Centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 text-center">
        
        {/* Logo Principal con Efecto Glow */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -100, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, type: "spring", stiffness: 80 }}
        >
          <motion.h1 
            className="text-8xl md:text-9xl font-bold text-white mb-6 drop-shadow-2xl"
            style={{
              textShadow: '0 0 30px rgba(255, 165, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.6)'
            }}
            animate={{ 
              textShadow: [
                '0 0 30px rgba(255, 165, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.6)',
                '0 0 40px rgba(255, 165, 0, 1), 0 0 80px rgba(255, 165, 0, 0.8)',
                '0 0 30px rgba(255, 165, 0, 0.8), 0 0 60px rgba(255, 165, 0, 0.6)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          >
            TARASCOS
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <div className="bg-gradient-to-r from-cyan-800/90 to-orange-600/90 rounded-full px-12 py-4 backdrop-blur-sm border border-white/20 shadow-2xl">
              <p className="text-3xl md:text-4xl text-white font-light italic tracking-wider">
                Sabores que Enamoran el Alma
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Slogan Secundario */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <p className="text-2xl md:text-3xl text-white font-light mb-4 drop-shadow-lg">
            Tradición y Sabor en Cada Bocado
          </p>
          <div className="w-32 h-1 bg-orange-500 mx-auto rounded-full shadow-lg"></div>
        </motion.div>

        {/* Botón Principal de Acción */}
        <motion.button
          onClick={navigateToMenu}
          className="group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 px-16 rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {/* Efecto de brillo al hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          
          <span className="relative z-10 flex items-center gap-4">
            <motion.span
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              📖
            </motion.span>
            VER MENÚ COMPLETO
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              →
            </motion.span>
          </span>
        </motion.button>

        {/* Tarjetas Informativas */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
        >
          {[
            { icon: '🌮', title: 'Auténtico Sabor', desc: 'Recetas tradicionales pasadas por generaciones' },
            { icon: '👨‍🍳', title: 'Chef Experto', desc: 'Cocina con pasión y maestría culinaria' },
            { icon: '⭐', title: '5 Estrellas', desc: 'Calidad y servicio excepcionales garantizados' }
          ].map((card, index) => (
            <motion.div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group"
              whileHover={{ y: -10, scale: 1.02 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8 + index * 0.2 }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-white/80 text-sm">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer 
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1 }}
        >
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-12 py-6 border border-white/10">
            <p className="text-white text-lg font-light mb-2">
              © 2024 Restaurante Tarascos
            </p>
            <p className="text-orange-300 text-sm">
              Donde cada comida es una celebración
            </p>
          </div>
        </motion.footer>
      </div>

      {/* Panel Lateral Deslizante */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Panel Lateral */}
            <motion.div
              className="fixed left-0 top-0 h-full w-80 max-w-full bg-gradient-to-b from-cyan-900/95 to-orange-900/95 z-50 backdrop-blur-xl shadow-2xl border-r border-white/20"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* Header del Panel */}
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Menú</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-orange-300 transition-colors p-2 rounded-lg hover:bg-white/10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-white/70 text-sm">Explora todo lo que ofrecemos</p>
              </div>

              {/* Items del Menú */}
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    className="w-full text-left p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                    whileHover={{ x: 10 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      // Aquí puedes agregar la funcionalidad para cada item
                      setIsMenuOpen(false)
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                        <p className="text-white/60 text-sm">{item.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Botón Menú Principal en el Panel */}
              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={navigateToMenu}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <span>📖</span>
                  Ver Menú de Platos
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Elementos Decorativos Flotantes */}
      <motion.div
        className="absolute top-1/4 left-1/4 text-6xl opacity-20"
        animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        🌮
      </motion.div>
      
      <motion.div
        className="absolute bottom-1/3 right-1/4 text-5xl opacity-20"
        animate={{ y: [0, 25, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        🍗
      </motion.div>
      
      <motion.div
        className="absolute top-1/2 right-1/3 text-4xl opacity-15"
        animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        🌶️
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 left-1/3 text-5xl opacity-15"
        animate={{ y: [0, 15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >
        🍚
      </motion.div>
    </div>
  )
}