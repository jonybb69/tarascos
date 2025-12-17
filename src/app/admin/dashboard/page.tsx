'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'

type Product = {
  id: number
  name: string
  price: number
  image?: string
}

type Sauce = {
  id: number
  name: string
  spice: number
}

type OrderItem = {
  product: Product
  quantity: number
  sauces: Array<{
    sauce: Sauce
    quantity: number
  }>
}

type Order = {
  id: string
  customerName: string
  customerPhone: string
  address: string
  items: OrderItem[]
  total: number
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
  fecha: string
  fechaLegible: string
  numeroPedido: number
  notas?: string
  tipoEntrega?: 'domicilio' | 'recoger'
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado'>('todos')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editForm, setEditForm] = useState<Order | null>(null)

  // Form state para crear/editar pedidos
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    notas: '',
    tipoEntrega: 'domicilio' as 'domicilio' | 'recoger',
    status: 'pendiente' as Order['status'],
    items: [] as OrderItem[]
  })

  // Cargar pedidos desde la API
  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders')
      
      if (!response.ok) throw new Error('Error cargando pedidos')
      
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders)
      } else {
        throw new Error(data.error || 'Error cargando pedidos')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando los pedidos')
      // Fallback a localStorage si la API falla
      const storedOrders = localStorage.getItem('tarascosOrders')
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders))
        toast.success('Datos cargados desde almacenamiento local')
      }
    } finally {
      setLoading(false)
    }
  }

  // CREATE - Crear nuevo pedido
  const createOrder = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error('Error creando pedido')

      const result = await response.json()

      if (result.success) {
        toast.success('Pedido creado exitosamente')
        loadOrders()
        resetForm()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creando pedido:', error)
      toast.error('Error creando el pedido')
    }
  }

  // READ - Obtener pedido específico
  const getOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (!response.ok) throw new Error('Error cargando pedido')
      
      const data = await response.json()
      
      if (data.success) {
        return data.order
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error cargando pedido:', error)
      toast.error('Error cargando el pedido')
    }
  }

  // UPDATE - Actualizar estado del pedido
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Error actualizando pedido')

      const result = await response.json()

      if (result.success) {
        // Actualizar estado local inmediatamente
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        )
        toast.success(`Pedido ${getStatusText(newStatus).toLowerCase()}`)
        
        // Cerrar modal si está abierto
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error)
      toast.error('Error actualizando el pedido')
    } finally {
      setUpdating(null)
    }
  }

  // UPDATE - Editar pedido completo
  const updateOrder = async (orderId: string, orderData: any) => {
    try {
      setUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error('Error actualizando pedido')

      const result = await response.json()

      if (result.success) {
        toast.success('Pedido actualizado exitosamente')
        loadOrders()
        setEditForm(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error)
      toast.error('Error actualizando el pedido')
    } finally {
      setUpdating(null)
    }
  }

  // DELETE - Eliminar pedido
  const deleteOrder = async (orderId: string) => {
    try {
      setUpdating(orderId)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Error en la eliminación')

      const result = await response.json()

      if (result.success) {
        // Actualizar estado local inmediatamente
        setOrders(prev => prev.filter(order => order.id !== orderId))
        toast.success('Pedido eliminado correctamente')
        setSelectedOrder(null)
        setDeleteConfirm(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error eliminando pedido:', error)
      toast.error('Error eliminando el pedido')
    } finally {
      setUpdating(null)
    }
  }

  // DELETE múltiple - Eliminar pedidos completados
  const deleteCompletedOrders = async () => {
    try {
      const completedOrders = orders.filter(order => 
        order.status === 'entregado' || order.status === 'cancelado'
      )

      if (completedOrders.length === 0) {
        toast.error('No hay pedidos completados para eliminar')
        return
      }

      // Eliminar cada pedido individualmente
      const deletePromises = completedOrders.map(order => 
        fetch(`/api/orders/${order.id}`, { method: 'DELETE' })
      )

      const results = await Promise.allSettled(deletePromises)

      // Contar eliminaciones exitosas
      const successfulDeletes = results.filter(result => 
        result.status === 'fulfilled' 
      ).length

      if (successfulDeletes > 0) {
        // Actualizar estado local
        setOrders(prev => 
          prev.filter(order => 
            order.status !== 'entregado' && order.status !== 'cancelado'
          )
        )
        toast.success(`${successfulDeletes} pedidos eliminados`)
      }
    } catch (error) {
      console.error('Error eliminando pedidos completados:', error)
      toast.error('Error eliminando pedidos completados')
    }
  }

  // Función para crear pedido de prueba
  const createTestOrder = async () => {
    const testOrder = {
      customerName: 'Cliente de Prueba',
      customerPhone: '1234567890',
      address: 'Dirección de prueba 123',
      items: [
        {
          product: {
            id: 1,
            name: 'Tacos al Pastor',
            price: 150
          },
          quantity: 2,
          sauces: [
            {
              sauce: {
                id: 1,
                name: 'Salsa Verde',
                spice: 3
              },
              quantity: 1
            }
          ]
        }
      ],
      total: 300,
      status: 'pendiente' as const,
      tipoEntrega: 'domicilio' as const,
      notas: 'Pedido de prueba generado automáticamente'
    }

    await createOrder(testOrder)
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      address: '',
      notas: '',
      tipoEntrega: 'domicilio',
      status: 'pendiente',
      items: []
    })
    setShowCreateForm(false)
    setEditForm(null)
  }

  const handleEdit = (order: Order) => {
    setEditForm(order)
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.address,
      notas: order.notas || '',
      tipoEntrega: order.tipoEntrega || 'domicilio',
      status: order.status,
      items: order.items
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editForm) {
      await updateOrder(editForm.id, formData)
    } else {
      // Calcular total para nuevo pedido
      const total = formData.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      )
      
      await createOrder({
        ...formData,
        total,
        fecha: new Date().toISOString(),
        fechaLegible: new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filteredOrders = filter === 'todos' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pendiente: 'bg-yellow-500',
      preparando: 'bg-blue-500',
      listo: 'bg-green-500',
      entregado: 'bg-gray-500',
      cancelado: 'bg-red-500'
    }
    return colors[status]
  }

  const getStatusText = (status: Order['status']) => {
    const texts = {
      pendiente: 'Pendiente',
      preparando: 'En Preparación',
      listo: 'Listo para Entregar',
      entregado: 'Entregado',
      cancelado: 'Cancelado'
    }
    return texts[status]
  }

  // Estadísticas
  const totalRevenue = orders
    .filter(order => order.status === 'entregado')
    .reduce((sum, order) => sum + order.total, 0)

  const pendingOrdersCount = orders.filter(order => 
    order.status === 'pendiente' || order.status === 'preparando' || order.status === 'listo'
  ).length

  const deliveredOrdersCount = orders.filter(order => order.status === 'entregado').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Toaster />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Tarascos</h1>
            <p className="text-gray-600">Panel de administración de pedidos</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center min-w-32">
              <div className="text-2xl font-bold text-orange-600">{orders.length}</div>
              <div className="text-sm text-orange-800">Total Pedidos</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 text-center min-w-32">
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-green-800">Ingresos Totales</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-center min-w-32">
              <div className="text-2xl font-bold text-blue-600">{pendingOrdersCount}</div>
              <div className="text-sm text-blue-800">Pendientes</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center min-w-32">
              <div className="text-2xl font-bold text-gray-600">{deliveredOrdersCount}</div>
              <div className="text-sm text-gray-800">Entregados</div>
            </div>
          </div>
        </div>

        {/* Botones de Acción Rápida */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold hover:bg-green-200 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Pedido
          </button>

          <button
            onClick={createTestOrder}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-blue-200 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pedido de Prueba
          </button>

          {orders.some(order => order.status === 'entregado' || order.status === 'cancelado') && (
            <button
              onClick={deleteCompletedOrders}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-semibold hover:bg-red-200 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar Completados
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Filtros */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Filtros</h2>
            
            <div className="space-y-2">
              {[
                { key: 'todos' as const, label: 'Todos los Pedidos', count: orders.length },
                { key: 'pendiente' as const, label: 'Pendientes', count: orders.filter(o => o.status === 'pendiente').length },
                { key: 'preparando' as const, label: 'En Preparación', count: orders.filter(o => o.status === 'preparando').length },
                { key: 'listo' as const, label: 'Listos', count: orders.filter(o => o.status === 'listo').length },
                { key: 'entregado' as const, label: 'Entregados', count: orders.filter(o => o.status === 'entregado').length },
                { key: 'cancelado' as const, label: 'Cancelados', count: orders.filter(o => o.status === 'cancelado').length }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    filter === item.key 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.label}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      filter === item.key ? 'bg-white text-orange-500' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista de Pedidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {filter === 'todos' ? 'Todos los Pedidos' : getStatusText(filter)}
              </h2>
              <span className="text-gray-500">{filteredOrders.length} pedidos</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos</h3>
                <p className="text-gray-500">Los pedidos aparecerán aquí cuando los clientes realicen sus órdenes.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                >
                  Crear Primer Pedido
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedOrder?.id === order.id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              #{order.numeroPedido}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            <span className="text-sm text-gray-500">{order.fechaLegible}</span>
                            {order.tipoEntrega && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.tipoEntrega === 'domicilio' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.tipoEntrega === 'domicilio' ? '🚚 Domicilio' : '🏪 Recoger'}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <strong className="text-gray-700">Cliente:</strong>
                              <div className="text-gray-900 font-semibold">{order.customerName}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Teléfono:</strong>
                              <div className="text-gray-900">{order.customerPhone}</div>
                            </div>
                            <div>
                              <strong className="text-gray-700">Total:</strong>
                              <div className="text-green-600 font-bold">${order.total.toFixed(2)}</div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <strong className="text-gray-700">Dirección:</strong>
                            <div className="text-gray-900 text-sm">{order.address}</div>
                          </div>

                          {order.notas && (
                            <div className="mt-2">
                              <strong className="text-gray-700">Notas:</strong>
                              <div className="text-gray-600 text-sm italic">"{order.notas}"</div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {/* Botones de Estado */}
                          <div className="flex gap-2">
                            {order.status === 'pendiente' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'preparando')
                                }}
                                disabled={updating === order.id}
                                className="bg-blue-500 text-white px-3 py-2 rounded-xl hover:bg-blue-600 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : null}
                                Preparar
                              </button>
                            )}
                            
                            {order.status === 'preparando' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'listo')
                                }}
                                disabled={updating === order.id}
                                className="bg-green-500 text-white px-3 py-2 rounded-xl hover:bg-green-600 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : null}
                                Listo
                              </button>
                            )}
                            
                            {order.status === 'listo' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'entregado')
                                }}
                                disabled={updating === order.id}
                                className="bg-gray-500 text-white px-3 py-2 rounded-xl hover:bg-gray-600 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : null}
                                Entregado
                              </button>
                            )}
                            
                            {order.status !== 'entregado' && order.status !== 'cancelado' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  updateOrderStatus(order.id, 'cancelado')
                                }}
                                disabled={updating === order.id}
                                className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : null}
                                Cancelar
                              </button>
                            )}
                          </div>

                          {/* Botones de Acción */}
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(order)
                              }}
                              className="bg-yellow-500 text-white px-3 py-2 rounded-xl hover:bg-yellow-600 transition text-sm font-semibold flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(order.id)
                              }}
                              disabled={updating === order.id}
                              className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition text-sm font-semibold disabled:opacity-50 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Confirmación de Eliminación */}
                      <AnimatePresence>
                        {deleteConfirm === order.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
                          >
                            <p className="text-red-800 font-semibold mb-3">
                              ¿Estás seguro de que quieres eliminar este pedido?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteOrder(order.id)
                                }}
                                disabled={updating === order.id}
                                className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center gap-2"
                              >
                                {updating === order.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : null}
                                Sí, Eliminar
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirm(null)
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition font-semibold"
                              >
                                Cancelar
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Modal de Detalles del Pedido */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Pedido #{selectedOrder.numeroPedido}
                      </h2>
                      <p className="text-gray-600">{selectedOrder.fechaLegible}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className={`px-4 py-2 rounded-full text-white font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      Total: ${selectedOrder.total.toFixed(2)}
                    </div>
                    {selectedOrder.tipoEntrega && (
                      <div className={`px-4 py-2 rounded-full font-semibold ${
                        selectedOrder.tipoEntrega === 'domicilio' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrder.tipoEntrega === 'domicilio' ? '🚚 Domicilio' : '🏪 Recoger en tienda'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Información del Cliente */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Información del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-gray-700">Nombre:</strong>
                        <div className="text-gray-900">{selectedOrder.customerName}</div>
                      </div>
                      <div>
                        <strong className="text-gray-700">Teléfono:</strong>
                        <div className="text-gray-900">{selectedOrder.customerPhone}</div>
                      </div>
                      <div className="md:col-span-2">
                        <strong className="text-gray-700">Dirección:</strong>
                        <div className="text-gray-900">{selectedOrder.address}</div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notas && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-800">Notas del Pedido</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-yellow-800 italic">{selectedOrder.notas}</p>
                      </div>
                    </div>
                  )}

                  {/* Items del Pedido */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Items del Pedido</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800 text-lg">
                              {item.product.name} x{item.quantity}
                            </div>
                            <div className="text-green-600 font-bold text-lg">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          
                          {item.sauces.length > 0 && (
                            <div className="mt-2">
                              <strong className="text-gray-700 text-sm">Salsas:</strong>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {item.sauces.map((sauce, sauceIndex) => (
                                  <span 
                                    key={sauceIndex}
                                    className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium"
                                  >
                                    {sauce.sauce.name} x{sauce.quantity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-2 text-sm text-gray-600">
                            Precio unitario: ${item.product.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(selectedOrder)}
                      className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Pedido
                    </button>
                    
                    <button
                      onClick={() => {
                        deleteOrder(selectedOrder.id)
                      }}
                      disabled={updating === selectedOrder.id}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {updating === selectedOrder.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                      Eliminar Pedido
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal de Crear/Editar Pedido */}
      <AnimatePresence>
        {(showCreateForm || editForm) && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={resetForm}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {editForm ? 'Editar Pedido' : 'Nuevo Pedido'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Número de teléfono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Dirección completa para la entrega"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Entrega
                      </label>
                      <select
                        value={formData.tipoEntrega}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipoEntrega: e.target.value as 'domicilio' | 'recoger' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="domicilio">🚚 Domicilio</option>
                        <option value="recoger">🏪 Recoger en tienda</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado del Pedido
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Order['status'] }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="pendiente">⏳ Pendiente</option>
                        <option value="preparando">👨‍🍳 En Preparación</option>
                        <option value="listo">✅ Listo</option>
                        <option value="entregado">📦 Entregado</option>
                        <option value="cancelado">❌ Cancelado</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas Adicionales
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Instrucciones especiales, alergias, etc."
                      rows={2}
                    />
                  </div>

                  {/* Aquí podrías agregar un selector de productos para los items */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Items del Pedido</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {editForm 
                        ? `Este pedido tiene ${formData.items.length} items. Para modificar los items, edítalos manualmente.`
                        : 'Para agregar items al pedido, usa la interfaz de creación de pedidos del sistema principal.'
                      }
                    </p>
                    {formData.items.length > 0 && (
                      <div className="space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                            <div>
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-gray-600 ml-2">x{item.quantity}</span>
                              {item.sauces.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  Salsas: {item.sauces.map(s => `${s.sauce.name} x${s.quantity}`).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="text-green-600 font-semibold">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center font-bold border-t pt-2">
                          <span>Total:</span>
                          <span className="text-green-600">
                            ${formData.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                    >
                      {editForm ? 'Actualizar' : 'Crear'} Pedido
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}