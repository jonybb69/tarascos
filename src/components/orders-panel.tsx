// components/orders-panel.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPackage, FiClock, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi'

type Order = {
  id: string
  clientName: string
  clientPhone: string
  clientAddress: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    sauces?: Array<{
      sauceName: string
      quantity: number
    }>
  }>
  total: number
  status: string
  fecha: string
  fechaLegible: string
  itemsCount: number
}

export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    try {
      const storedOrders = localStorage.getItem('tarascosOrders')
      if (storedOrders) {
        const ordersData = JSON.parse(storedOrders)
        setOrders(ordersData)
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
    localStorage.setItem('tarascosOrders', JSON.stringify(updatedOrders))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      completado: 'bg-green-100 text-green-800 border-green-200',
      preparando: 'bg-blue-100 text-blue-800 border-blue-200',
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      completado: FiCheckCircle,
      preparando: FiClock,
      pendiente: FiPackage,
      cancelado: FiXCircle
    }
    return icons[status as keyof typeof icons] || FiPackage
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pendiente').length,
    completed: orders.filter(o => o.status === 'completado').length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0)
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FiClock className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-purple-600">
                ${stats.revenue.toFixed(2)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiDollarSign className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100">
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Todos', count: orders.length },
            { value: 'pending', label: 'Pendientes', count: stats.pending },
            { value: 'completed', label: 'Completados', count: stats.completed }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as any)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === filterOption.value
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FiPackage className="mx-auto text-4xl text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay pedidos</h3>
            <p className="text-gray-500">Los pedidos aparecerán aquí cuando los clientes realicen compras</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-cyan-900 to-orange-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Pedido</th>
                  <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                  <th className="px-6 py-4 text-left font-semibold">Productos</th>
                  <th className="px-6 py-4 text-right font-semibold">Total</th>
                  <th className="px-6 py-4 text-left font-semibold">Fecha</th>
                  <th className="px-6 py-4 text-center font-semibold">Estado</th>
                  <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order, index) => {
                  const StatusIcon = getStatusIcon(order.status)
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-orange-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">#{order.id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">{order.itemsCount} items</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{order.clientName}</p>
                          <p className="text-sm text-gray-500">{order.clientPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-600 truncate">
                              {item.productName} x{item.quantity}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-sm text-gray-500">
                              +{order.items.length - 2} más...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-green-600">
                          ${order.total.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {order.fechaLegible}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          <StatusIcon size={14} />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          {order.status !== 'completado' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateOrderStatus(order.id, 'completado')
                              }}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              Completar
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updateOrderStatus(order.id, 'cancelado')
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">
                Detalles del Pedido #{selectedOrder.id.slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Client Info */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Información del Cliente</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p><strong>Nombre:</strong> {selectedOrder.clientName}</p>
                  <p><strong>Teléfono:</strong> {selectedOrder.clientPhone}</p>
                  <p><strong>Dirección:</strong> {selectedOrder.clientAddress}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Productos del Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="bg-orange-50 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{item.productName}</p>
                          <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-green-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      {item.sauces && item.sauces.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Salsas:</p>
                          <div className="space-y-1">
                            {item.sauces.map((sauce, idx) => (
                              <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                <span>{sauce.sauceName}</span>
                                <span>x{sauce.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-cyan-900 to-orange-900 rounded-xl p-4 text-white">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total del Pedido:</span>
                  <span className="text-2xl font-bold">${selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="text-sm opacity-80 mt-1">
                  {selectedOrder.itemsCount} productos • {selectedOrder.fechaLegible}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}