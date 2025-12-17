'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { 
  FiUsers, FiDollarSign, FiShoppingBag, FiCalendar, 
  FiSearch, FiMapPin, FiPhone, FiEdit2, FiTrash2, 
  FiPlus, FiEye, FiX 
} from 'react-icons/fi'

type Client = {
  id: string
  name: string
  phone: string
  address: string
  totalGastado: number
  totalPedidos: number
  ultimoPedido: string
  fechaRegistro: string
  status: 'activo' | 'inactivo'
  email?: string
  notas?: string
}

type ClientFormData = {
  name: string
  phone: string
  address: string
  email: string
  notas: string
  status: 'activo' | 'inactivo'
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'totalGastado' | 'ultimoPedido' | 'fechaRegistro'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    phone: '',
    address: '',
    email: '',
    notas: '',
    status: 'activo'
  })

  // Cargar clientes
  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/clientes')
      
      if (!response.ok) throw new Error('Error cargando clientes')
      
      const data = await response.json()
      
      if (data.success) {
        setClients(data.clientes)
      } else {
        throw new Error(data.error || 'Error cargando clientes')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error cargando los clientes')
      // Fallback a localStorage
      const storedClients = localStorage.getItem('tarascosClients')
      if (storedClients) {
        setClients(JSON.parse(storedClients))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterAndSortClients()
  }, [clients, searchTerm, sortBy, sortOrder])

  // CREATE - Crear cliente
  const createClient = async (clientData: ClientFormData) => {
    try {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) throw new Error('Error creando cliente')

      const result = await response.json()

      if (result.success) {
        toast.success('Cliente creado exitosamente')
        loadClients()
        resetForm()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      toast.error('Error creando el cliente')
    }
  }

  // UPDATE - Actualizar cliente
  const updateClient = async (id: string, clientData: ClientFormData) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData),
      })

      if (!response.ok) throw new Error('Error actualizando cliente')

      const result = await response.json()

      if (result.success) {
        toast.success('Cliente actualizado exitosamente')
        loadClients()
        resetForm()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error actualizando cliente:', error)
      toast.error('Error actualizando el cliente')
    }
  }

  // DELETE - Eliminar cliente
  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error eliminando cliente')

      const result = await response.json()

      if (result.success) {
        toast.success('Cliente eliminado exitosamente')
        loadClients()
        setDeleteConfirm(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error eliminando cliente:', error)
      toast.error('Error eliminando el cliente')
    }
  }

  const filterAndSortClients = () => {
    let filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Ordenar clientes
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy]
      let bValue: any = b[sortBy]

      if (sortBy === 'ultimoPedido' || sortBy === 'fechaRegistro') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredClients(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      email: '',
      notas: '',
      status: 'activo'
    })
    setEditingClient(null)
    setShowForm(false)
  }

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      address: client.address,
      email: client.email || '',
      notas: client.notas || '',
      status: client.status
    })
    setEditingClient(client)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingClient) {
      updateClient(editingClient.id, formData)
    } else {
      createClient(formData)
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'activo' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const totalStats = {
    totalClients: clients.length,
    totalRevenue: clients.reduce((sum, client) => sum + client.totalGastado, 0),
    totalOrders: clients.reduce((sum, client) => sum + client.totalPedidos, 0),
    avgOrderValue: clients.length > 0 ? 
      clients.reduce((sum, client) => sum + client.totalGastado, 0) / 
      clients.reduce((sum, client) => sum + client.totalPedidos, 1) : 0,
    activeClients: clients.filter(client => client.status === 'activo').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl">
                <FiUsers className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
                <p className="text-gray-600">Administra la información de tus clientes</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2"
            >
              <FiPlus className="text-lg" />
              Nuevo Cliente
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Clientes', 
              value: totalStats.totalClients, 
              icon: FiUsers, 
              color: 'blue',
              bg: 'bg-blue-100',
              text: 'text-blue-600'
            },
            { 
              label: 'Ingresos Totales', 
              value: formatCurrency(totalStats.totalRevenue), 
              icon: FiDollarSign, 
              color: 'green',
              bg: 'bg-green-100',
              text: 'text-green-600'
            },
            { 
              label: 'Total Pedidos', 
              value: totalStats.totalOrders, 
              icon: FiShoppingBag, 
              color: 'purple',
              bg: 'bg-purple-100',
              text: 'text-purple-600'
            },
            { 
              label: 'Clientes Activos', 
              value: totalStats.activeClients, 
              icon: FiUsers, 
              color: 'orange',
              bg: 'bg-orange-100',
              text: 'text-orange-600'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 ${stat.bg} rounded-xl`}>
                  <stat.icon className={`${stat.text} text-xl`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes por nombre, teléfono, email o dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="totalGastado">Ordenar por gasto total</option>
                <option value="ultimoPedido">Ordenar por último pedido</option>
                <option value="fechaRegistro">Ordenar por fecha de registro</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <button
                onClick={loadClients}
                className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2"
              >
                <FiSearch className="text-lg" />
                Actualizar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Clients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
        >
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <FiUsers className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {clients.length === 0 ? 'No hay clientes registrados' : 'No se encontraron clientes'}
              </h3>
              <p className="text-gray-500 mb-4">
                {clients.length === 0 
                  ? 'Los clientes aparecerán aquí después de realizar pedidos' 
                  : 'Intenta con otros términos de búsqueda'
                }
              </p>
              {clients.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
                >
                  <FiPlus className="text-lg" />
                  Agregar Primer Cliente
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-cyan-900 to-orange-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Cliente</th>
                    <th className="px-6 py-4 text-left font-semibold">Contacto</th>
                    <th className="px-6 py-4 text-left font-semibold">Dirección</th>
                    <th className="px-6 py-4 text-center font-semibold">Pedidos</th>
                    <th className="px-6 py-4 text-right font-semibold">Total Gastado</th>
                    <th className="px-6 py-4 text-left font-semibold">Último Pedido</th>
                    <th className="px-6 py-4 text-center font-semibold">Estado</th>
                    <th className="px-6 py-4 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client, index) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="hover:bg-orange-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{client.name}</p>
                          <p className="text-sm text-gray-500">
                            Registrado: {formatDate(client.fechaRegistro)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FiPhone className="text-orange-500 flex-shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <span>📧</span>
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 max-w-xs">
                          <FiMapPin className="text-red-500 flex-shrink-0" />
                          <span className="truncate">{client.address}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200">
                          {client.totalPedidos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-green-600">
                          {formatCurrency(client.totalGastado)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600">
                          {formatDate(client.ultimoPedido)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(client.status)}`}>
                          {client.status === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setViewingClient(client)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Ver detalles"
                          >
                            <FiEye className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            title="Editar cliente"
                          >
                            <FiEdit2 className="text-sm" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(client.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar cliente"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Summary */}
        {filteredClients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center text-gray-500 text-sm"
          >
            Mostrando {filteredClients.length} de {clients.length} clientes
          </motion.div>
        )}

        {/* Modal de Formulario */}
        <AnimatePresence>
          {(showForm || editingClient) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                      {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <button
                      onClick={resetForm}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nombre del cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Número de teléfono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="correo@ejemplo.com"
                    />
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
                      placeholder="Dirección completa"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={formData.notas}
                      onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Notas adicionales sobre el cliente"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'activo' | 'inactivo' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
                    >
                      {editingClient ? 'Actualizar' : 'Crear'} Cliente
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
          )}
        </AnimatePresence>

        {/* Modal de Confirmación de Eliminación */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2">Confirmar Eliminación</h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => deleteClient(deleteConfirm)}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                  >
                    Sí, Eliminar
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Ver Detalles */}
        <AnimatePresence>
          {viewingClient && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detalles del Cliente</h2>
                    <button
                      onClick={() => setViewingClient(null)}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <FiX className="text-xl" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <strong className="text-gray-700">Nombre:</strong>
                    <p className="text-gray-900">{viewingClient.name}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Teléfono:</strong>
                    <p className="text-gray-900">{viewingClient.phone}</p>
                  </div>
                  
                  {viewingClient.email && (
                    <div>
                      <strong className="text-gray-700">Email:</strong>
                      <p className="text-gray-900">{viewingClient.email}</p>
                    </div>
                  )}
                  
                  <div>
                    <strong className="text-gray-700">Dirección:</strong>
                    <p className="text-gray-900">{viewingClient.address}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Total de Pedidos:</strong>
                    <p className="text-gray-900">{viewingClient.totalPedidos}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Total Gastado:</strong>
                    <p className="text-green-600 font-semibold">{formatCurrency(viewingClient.totalGastado)}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Fecha de Registro:</strong>
                    <p className="text-gray-900">{formatDate(viewingClient.fechaRegistro)}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Último Pedido:</strong>
                    <p className="text-gray-900">{formatDate(viewingClient.ultimoPedido)}</p>
                  </div>
                  
                  <div>
                    <strong className="text-gray-700">Estado:</strong>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewingClient.status)}`}>
                      {viewingClient.status === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  {viewingClient.notas && (
                    <div>
                      <strong className="text-gray-700">Notas:</strong>
                      <p className="text-gray-900">{viewingClient.notas}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}