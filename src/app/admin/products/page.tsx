'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiX, 
  FiChevronDown, 
  FiChevronUp,
  FiSearch,
  FiFilter,
  FiStar,
  FiShoppingBag,
  FiFolder,
  FiMenu
} from "react-icons/fi"
import { useRouter } from "next/navigation"
import Toast from "@/components/Toast"
import { useToast } from "@/hooks/useToast"

type Categoria = {
  id: string
  nombre: string
  descripcion: string
  color: string
  icono: string
}

type Producto = {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoryId: string
  categoria: Categoria
  destacado: boolean
}

export default function AdminProductosPage() {
  const router = useRouter()
  const { toasts, showToast, removeToast } = useToast()
  
  // States
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filter, setFilter] = useState<string>("todos")
  const [showForm, setShowForm] = useState(false)
  const [showCategoriaForm, setShowCategoriaForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: 0,
    imagen: "",
    categoriaId: "",
    destacado: false,
  })
  
  const [categoriaFormData, setCategoriaFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#3B82F6",
    icono: "🍽️"
  })
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingCategoriaId, setEditingCategoriaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Cargar datos
  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      // Cargar productos
      const productosRes = await fetch('/api/products')
      if (productosRes.ok) {
        const data = await productosRes.json()
        setProductos(data)
      }

      // Cargar categorías
      const categoriasRes = await fetch('/api/categorias')
      if (categoriasRes.ok) {
        const catData = await categoriasRes.json()
        setCategorias(catData)

        // Si no hay categoría seleccionada, asigna la primera disponible
        setFormData(prev => ({
          ...prev,
          categoryId: prev.categoriaId || catData[0]?.id || ""
        }))
      }
    } catch (error) {
      console.error('Error cargando datos:', error)
      showToast('Error cargando los datos', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Crear o actualizar categoría
  const handleCategoriaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoriaFormData.nombre.trim()) {
      showToast('⚠️ El nombre de la categoría es requerido', 'error')
      return
    }

    try {
      if (editingCategoriaId) {
        // EDITAR
        const res = await fetch(`/api/categorias/${editingCategoriaId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoriaFormData)
        })

        if (!res.ok) {
          const data = await res.json()
          showToast(data.error || 'Error actualizando categoría', 'error')
          return
        }

        showToast('✅ Categoría actualizada')
      } else {
        // CREAR
        const res = await fetch('/api/categorias', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoriaFormData)
        })

        if (!res.ok) {
          const data = await res.json()
          showToast(data.error || 'Error creando categoría', 'error')
          return
        }

        showToast('✨ Categoría creada')
      }

      resetCategoriaForm()
      await cargarDatos()
    } catch (error) {
      console.error('Error en categoría:', error)
      showToast('❌ Error de conexión', 'error')
    }
  }

  // Eliminar categoría
  const handleDeleteCategoria = async (id: string) => {
    try {
      // Verificar productos asociados
      const productosEnCategoria = productos.filter(p => p.categoryId === id)
      if (productosEnCategoria.length > 0) {
        showToast('⚠️ No se puede eliminar: tiene productos asociados', 'error')
        return
      }

      const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        showToast(data.error || 'Error eliminando categoría', 'error')
        return
      }

      showToast('🗑️ Categoría eliminada')
      await cargarDatos()
    } catch (error) {
      console.error('Error eliminando categoría:', error)
      showToast('❌ Error de conexión', 'error')
    }
  }

  // Crear o actualizar producto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.descripcion.trim() || formData.precio <= 0 || !formData.categoriaId) {
      showToast('⚠️ Completa todos los campos requeridos', 'error')
      return
    }

    try {
      const url = editingId ? `/api/products/${editingId}` : '/api/products'
      const method = editingId ? 'PUT' : 'POST'
      
      // Formatear imagen
      let imagenUrl = formData.imagen
      if (imagenUrl && !imagenUrl.startsWith('http') && !imagenUrl.startsWith('/')) {
        imagenUrl = `/images/${imagenUrl.replace(/\.(jpg|jpeg|png)$/i, '')}.jpg`
      }
      
      const dataToSend = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: formData.precio,
        image: imagenUrl,
        categoriaId: formData.categoriaId,
        destacado: formData.destacado
      }
      console.log('Enviando datos:', dataToSend)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        showToast(editingId ? '✅ Producto actualizado' : '🎉 Producto creado')
        resetForm()
        await cargarDatos()
      } else {
        const result = await response.json()
        showToast(`❌ ${result.error || 'Error en la operación'}`, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('❌ Error de conexión', 'error')
    }
  }

  // Eliminar producto
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })

      if (response.ok) {
        showToast('🗑️ Producto eliminado')
        await cargarDatos()
      } else {
        const errorData = await response.json()
        showToast(`❌ ${errorData.error || 'No se pudo eliminar'}`, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      showToast('❌ Error de conexión', 'error')
    }
  }

  // Reset formularios
  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: 0,
      imagen: "",
      categoriaId: categorias[0]?.id || "",
      destacado: false,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const resetCategoriaForm = () => {
    setCategoriaFormData({
      nombre: "",
      descripcion: "",
      color: "#3B82F6",
      icono: "🍽️"
    })
    setEditingCategoriaId(null)
    setShowCategoriaForm(false)
  }

  // Preparar edición
  const prepareEdit = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen.replace('/images/', '').replace('.jpg', ''),
      categoriaId: producto.categoryId,
      destacado: producto.destacado
    })
    setEditingId(producto.id)
    setShowForm(true)
  }

  const prepareEditCategoria = (categoria: Categoria) => {
    setCategoriaFormData({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      color: categoria.color,
      icono: categoria.icono
    })
    setEditingCategoriaId(categoria.id)
    setShowCategoriaForm(true)
  }

  // Productos filtrados
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           producto.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
    const coincideCategoria = filter === "todos" || producto.categoryId === filter
    return coincideBusqueda && coincideCategoria
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black/80 to-amber-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-700">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 to-black flex">
      {/* Toast Container */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Sidebar Simple */}
      <div className={`fixed border-current left-0 top-0 bottom-0 bg-gradient-to-b from-teal-700/60 to-cyan-900/80 text-white shadow-2xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 border-b border-transparent flex flex-col items-start">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiMenu size={24} />
          </button>
          
          {sidebarOpen && (
            <div className="mt-4">
              <div className="flex items-center border-transparent gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold">Tarascos</h1>
                  <p className="text-xs text-white/70">Admin Panel</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <>
            {/* Búsqueda */}
            <div className="p-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Navegación */}
            <nav className="p-4 space-y-2">
              
              <button className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 bg-white/20">
                <FiShoppingBag /> Productos
              </button>
            </nav>

            {/* Filtros */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-sm font-semibold">Categorías</p>
                <FiFilter className="text-white/50" />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setFilter("todos")}
                  className={`w-full text-left px-3 py-2 rounded-lg ${filter === "todos" ? "bg-orange-500" : "hover:bg-white/10"}`}
                >
                  📋 Todos
                </button>
                
                {categorias.map(categoria => (
                  <div key={categoria.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => setFilter(categoria.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg flex items-center gap-2 ${filter === categoria.id ? "bg-white/20" : "hover:bg-white/10"}`}
                    >
                      <span>{categoria.icono}</span>
                      <span className="truncate">{categoria.nombre}</span>
                    </button>
                    <button
                      onClick={() => prepareEditCategoria(categoria)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded"
                    >
                      <FiEdit2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="p-4 space-y-3 mt-4">
              <button
                onClick={() => {
                  if (categorias.length === 0) {
                    showToast('⚠️ Primero crea una categoría', 'error')
                    setShowCategoriaForm(true)
                    return
                  }
                  resetForm()
                  setShowForm(true)
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <FiPlus /> Nuevo Producto
              </button>

              <button
                onClick={() => setShowCategoriaForm(true)}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <FiFolder /> Nueva Categoría
              </button>
            </div>
          </>
        )}
      </div>

      {/* Contenido Principal */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-6`}>
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {filter === "todos" ? "Todos los Productos" : categorias.find(c => c.id === filter)?.nombre || "Productos"}
          </h2>
          <p className="text-gray-600 mt-2">
            {productos.length === 0 ? "No hay productos. ¡Crea el primero!" : `Gestiona tu menú (${productos.length} productos)`}
          </p>
        </div>

        {/* Grid de Productos */}
        {productosFiltrados.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {productos.length === 0 ? "¡Tu menú está vacío!" : "No se encontraron productos"}
            </h3>
            <p className="text-gray-600 mb-6">
              {productos.length === 0 
                ? "Comienza creando categorías y agregando productos" 
                : "Intenta con otros términos de búsqueda"}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  if (categorias.length === 0) {
                    showToast('⚠️ Primero crea una categoría', 'error')
                    setShowCategoriaForm(true)
                    return
                  }
                  resetForm()
                  setShowForm(true)
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Crear Producto
              </button>
              <button
                onClick={() => setShowCategoriaForm(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
              >
                Crear Categoría
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map((producto) => {
              const categoria = producto.categoria
              return (
                <div key={producto.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-orange-100">
                  {/* Imagen */}
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/400x300/FFEDD5/92400E?text=${encodeURIComponent(producto.nombre)}`
                      }}
                    />
                    {producto.destacado && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                        <FiStar size={10} /> Destacado
                      </div>
                    )}
                    {categoria && (
                      <div 
                        className="absolute top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
                        style={{ backgroundColor: categoria.color }}
                      >
                        {categoria.icono} {categoria.nombre}
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">{producto.nombre}</h3>
                        <p className="text-orange-600 font-bold text-xl">${producto.precio.toFixed(2)}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{producto.descripcion}</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => prepareEdit(producto)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                      >
                        <FiEdit2 size={14} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(producto.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                      >
                        <FiTrash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingId ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
                  </h3>
                  <button onClick={resetForm} className="text-gray-400 hover:text-orange-500 transition-colors p-1">
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Tacos al Pastor"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe el producto..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Precio *</label>
                    <input
                      type="number"
                      value={formData.precio}
                      onChange={(e) => setFormData(prev => ({ ...prev, precio: Number(e.target.value) }))}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre de la imagen (opcional)
                    </label>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-500 bg-orange-100 px-3 py-3 rounded-l-xl border border-orange-200">
                        /images/
                      </span>
                      <input
                        type="text"
                        value={formData.imagen}
                        onChange={(e) => {
                          const valor = e.target.value
                          const nombreSinExtension = valor.replace(/\.(jpg|jpeg|png|webp)$/i, '')
                          setFormData(prev => ({ ...prev, imagen: nombreSinExtension }))
                        }} 
                        className="flex-1 px-4 py-3 bg-orange-50 border border-orange-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="nombre-de-la-imagen"
                      />
                      <span className="text-gray-500 bg-orange-100 px-3 py-3 rounded-xl border border-orange-200">
                        .jpg
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                    <select
                      value={formData.categoriaId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">Selecciona categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icono} {cat.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <input
                      type="checkbox"
                      id="destacado"
                      checked={formData.destacado}
                      onChange={(e) => setFormData(prev => ({ ...prev, destacado: e.target.checked }))}
                      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                    />
                    <label htmlFor="destacado" className="ml-3 block text-sm font-semibold text-amber-800">
                      <FiStar className="inline mr-1" /> Producto destacado
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg"
                    >
                      {editingId ? "💾 Guardar Cambios" : "✨ Crear Producto"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Categoría */}
      <AnimatePresence>
        {showCategoriaForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingCategoriaId ? "✏️ Editar Categoría" : "✨ Nueva Categoría"}
                  </h3>
                  <button onClick={resetCategoriaForm} className="text-gray-400 hover:text-orange-500 transition-colors p-1">
                    <FiX size={24} />
                  </button>
                </div>

                <form onSubmit={handleCategoriaSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={categoriaFormData.nombre}
                      onChange={(e) => setCategoriaFormData(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ej: Carnes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                    <textarea
                      value={categoriaFormData.descripcion}
                      onChange={(e) => setCategoriaFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Descripción de la categoría"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                      <input
                        type="color"
                        value={categoriaFormData.color}
                        onChange={(e) => setCategoriaFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full h-10 p-0 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Icono</label>
                      <input
                        type="text"
                        value={categoriaFormData.icono}
                        onChange={(e) => setCategoriaFormData(prev => ({ ...prev, icono: e.target.value }))}
                        className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="🍽️"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg"
                    >
                      {editingCategoriaId ? "💾 Guardar Cambios" : "✨ Crear Categoría"}
                    </button>
                    <button
                      type="button"
                      onClick={resetCategoriaForm}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}