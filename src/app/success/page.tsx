'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Recuperar datos del pedido recién completado
    const orderData = localStorage.getItem('pendingOrder')
    if (orderData) {
      const order = JSON.parse(orderData)
      
      // Guardar en la lista de pedidos completados
      const completedOrders = JSON.parse(localStorage.getItem('tarascosOrders') || '[]')
      const orderWithTimestamp = {
        ...order,
        id: Date.now().toString(),
        status: 'completado',
        fecha: new Date().toISOString(),
        fechaLegible: new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      completedOrders.push(orderWithTimestamp)
      localStorage.setItem('tarascosOrders', JSON.stringify(completedOrders))
      
      // Limpiar pedido pendiente
      localStorage.removeItem('pendingOrder')
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-yellow-50 p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md border border-green-200"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-6xl mb-4"
        >
          ✅
        </motion.div>
        
        <h1 className="text-3xl font-bold mb-4 text-green-600">¡Pedido Confirmado!</h1>
        <p className="text-gray-700 mb-2">
          Tu pedido ha sido recibido exitosamente.
        </p>
        <p className="text-gray-600 mb-6 text-sm">
          Estamos preparando tu comida con los ingredientes más frescos.
        </p>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg"
        >
          Volver al Inicio
        </motion.button>
      </motion.div>
    </div>
  )
}