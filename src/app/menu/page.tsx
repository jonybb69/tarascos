'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiHeart, FiShoppingCart, FiX, FiStar, FiCoffee, FiPlus, FiMinus, FiChevronUp, FiChevronDown, FiTag, FiChevronRight } from 'react-icons/fi'
import { nanoid } from 'nanoid'

import Toast from '@/components/Toast'
import { ToastType, useToast } from '@/hooks/useToast'

type Categoria = {
  id: string
  nombre: string
  color: string
  icono: string
}

type Salsa = {
  precioExtra: number
  id: string
  nombre: string
  descripcion?: string
  precio: number  // En tu base de datos, las salsas tienen precio, no precioExtra
  imagen?: string
  picor: number
  categoria?: string  // Cambiado de 'categoryId' a 'categoria'
  destacado?: boolean
  activo?: boolean  // Cambiado de 'disponible' a 'activo'
  created_at?: Date
  updated_at?: Date
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

type CartItem = {
  product: Producto
  quantity: number
  notas?: string
  salsas?: Salsa[] // Array de salsas seleccionadas
}

type Pedido = {
  id?: string
  items: CartItem[]
  total: number
  subtotal: number
  propina: number
  fecha: Date
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado'
  clienteId?: string
  mesa?: string
  notasGeneral?: string
}

export default function MenuTarascos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [salsas, setSalsas] = useState<Salsa[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todos') // Cambiado a 'todos' por defecto
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [productoExpandido, setProductoExpandido] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [showPedidos, setShowPedidos] = useState(false)
  const [notasGeneral, setNotasGeneral] = useState('')
  
  const { toasts, showToast, removeToast } = useToast()
  const carritoRef = useRef<HTMLDivElement>(null)

  // Cargar productos, categorías y salsas
  useEffect(() => {
    cargarDatos()
    
    // Cargar pedidos del localStorage (temporal)
    const pedidosGuardados = localStorage.getItem('tarascos_pedidos')
    if (pedidosGuardados) {
      try {
        const parsed = JSON.parse(pedidosGuardados)
        const pedidosConFechas = parsed.map((pedido: any) => ({
          ...pedido,
          fecha: new Date(pedido.fecha)
        }))
        setPedidos(pedidosConFechas)
      } catch (error) {
        console.error('Error parsing pedidos:', error)
      }
    }
  }, [])

  const cargarDatos = async () => {
  try {
    setLoading(true)
    
    // Cargar productos desde tu API
    const productosRes = await fetch('/api/products')
    if (!productosRes.ok) throw new Error('Error al cargar productos')
    const productosData = await productosRes.json()
    console.log('Productos cargados:', productosData.length, productosData)
    setProductos(productosData)
    
    // Cargar categorías desde tu API
    const categoriasRes = await fetch('/api/categorias')
    if (!categoriasRes.ok) throw new Error('Error al cargar categorías')
    const categoriasData = await categoriasRes.json()
    console.log('Categorías cargadas:', categoriasData.length, categoriasData)
    setCategorias(categoriasData)
    
    // Cargar salsas desde tu API
    const salsasRes = await fetch('/api/sauces')
    if (!salsasRes.ok) throw new Error('Error al cargar salsas')
    const salsasData = await salsasRes.json()
    console.log('Salsas cargadas RAW:', salsasData.length, salsasData)
    
    // Filtrar salsas activas y formatear
    const salsasFormateadas = salsasData
      .filter((salsa: any) => salsa.activo !== false) // Filtrar por activo
      .map((salsa: any) => ({
        id: salsa.id,
        nombre: salsa.nombre,
        descripcion: salsa.descripcion || '',
        precioExtra: salsa.precio || 0, // Mapear precio a precioExtra
        picor: salsa.picor || 0,
        categoria: salsa.categoria || null,
        disponible: salsa.activo !== false,
        imagen: salsa.imagen || null
      }))
    
    console.log('Salsas formateadas:', salsasFormateadas)
    setSalsas(salsasFormateadas)
    
  } catch (error) {
    console.error('Error:', error)
    showToast('Error cargando el menú', 'error' as ToastType)
  } finally {
    setLoading(false)
  }
}

  // CORRECCIÓN: Filtro de productos arreglado
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    
    if (categoriaActiva === 'destacados') {
      return producto.destacado && coincideBusqueda
    } else if (categoriaActiva === 'todos') {
      return coincideBusqueda // Muestra todos los productos que coinciden con la búsqueda
    } else {
      return producto.categoryId === categoriaActiva && coincideBusqueda
    }
  })

  const productosDestacados = productos.filter(p => p.destacado)
  
  // Calcular total del carrito incluyendo salsas
  const totalCarrito = cart.reduce((sum, item) => {
    const precioBase = item.product.precio * item.quantity
    const precioSalsas = (item.salsas?.reduce((salsaSum, salsa) => 
      salsaSum + salsa.precioExtra, 0) || 0) * item.quantity
    return sum + precioBase + precioSalsas
  }, 0)
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Funciones del carrito - actualizadas para incluir salsas
  const agregarAlCarrito = (producto: Producto, notas: string = '', salsasSeleccionadas: Salsa[] = []) => {
    setCart(prev => {
      // Buscar si ya existe el mismo producto con las mismas salsas y notas
      const existingItemIndex = prev.findIndex(item => 
        item.product.id === producto.id && 
        JSON.stringify(item.salsas?.map(s => s.id).sort()) === JSON.stringify(salsasSeleccionadas.map(s => s.id).sort()) &&
        item.notas === notas
      )
      
      if (existingItemIndex >= 0) {
        // Actualizar cantidad si es el mismo producto con mismas salsas y notas
        const newCart = [...prev]
        newCart[existingItemIndex].quantity += 1
        return newCart
      } else {
        // Agregar nuevo item
        return [...prev, { 
          product: producto, 
          quantity: 1, 
          notas,
          salsas: salsasSeleccionadas
        }]
      }
    })
    
    const mensajeSalsas = salsasSeleccionadas.length > 0 
      ? ` con ${salsasSeleccionadas.map(s => s.nombre).join(', ')}`
      : ''
    showToast(`🎉 ¡${producto.nombre} agregado al carrito!${mensajeSalsas}`, 'success')
  }

  const updateQuantity = (itemIndex: number, quantity: number) => {
    if (quantity < 1) {
      setCart(prev => prev.filter((_, idx) => idx !== itemIndex))
      return
    }
    setCart(prev => prev.map((item, idx) =>
      idx === itemIndex ? { ...item, quantity } : item
    ))
  }

  const removeFromCart = (itemIndex: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== itemIndex))
    showToast('Producto eliminado del carrito', 'warning')
  }

  const clearCart = () => {
    setCart([])
    setNotasGeneral('')
    showToast('🗑️ Carrito vaciado', 'info')
  }

  const toggleFavorito = (id: string) => {
    const nuevaLista = favoritos.includes(id) 
      ? favoritos.filter(i => i !== id)
      : [...favoritos, id]
    setFavoritos(nuevaLista)
    
    if (nuevaLista.includes(id)) {
      showToast('❤️ Agregado a favoritos', 'success')
    } else {
      showToast('💔 Eliminado de favoritos', 'info')
    }
  }

  // Función para realizar pedido - ENVIAR A TU BACKEND
  const realizarPedido = async () => {
    if (cart.length === 0) {
      showToast('⚠️ El carrito está vacío', 'error')
      return
    }

    try {
      const propina = totalCarrito * 0.10
      const totalConPropina = totalCarrito + propina
      
      // Crear nuevo pedido para enviar a tu backend
      const nuevoPedido: Pedido = {
        items: cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          notas: item.notas,
          salsas: item.salsas
        })),
        subtotal: totalCarrito,
        propina: propina,
        total: totalConPropina,
        fecha: new Date(),
        estado: 'pendiente',
        notasGeneral: notasGeneral
        // Puedes agregar: clienteId, mesa, etc.
      }

      // ENVIAR PEDIDO A TU API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoPedido)
      })

      if (!response.ok) {
        throw new Error('Error al enviar pedido')
      }

      const pedidoCreado = await response.json()
      
      // Guardar temporalmente en localStorage para mostrar en "Mis Pedidos"
      const nuevosPedidos = [{ ...nuevoPedido, id: pedidoCreado.id || nanoid() }, ...pedidos]
      setPedidos(nuevosPedidos)
      localStorage.setItem('tarascos_pedidos', JSON.stringify(nuevosPedidos))

      showToast(`✅ ¡Pedido realizado! Total: $${totalConPropina.toFixed(2)}`, 'success')
      
      // Limpiar carrito
      clearCart()
      setShowCart(false)

    } catch (error) {
      console.error('Error:', error)
      showToast('❌ Error al realizar el pedido', 'error')
    }
  }

  // Cerrar carrito al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (carritoRef.current && !carritoRef.current.contains(e.target as Node)) {
        setShowCart(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Colores
  const colores = {
    rojo: '#EF4444',
    anaranjado: '#F97316',
    negro: '#1F2937',
    teal: '#14B8A6',
    amarillo: '#F59E0B'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black to-orange-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-xl text-white">Cargando menú...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-500 to-red-600">
      {/* Toast Container - CORREGIDO con AnimatePresence */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Header Fijo con Logo */}
      <motion.header 
        className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-orange-500 to-black/80 text-white shadow-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 via-orange-500 to-black rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                <span className="text-white font-bold text-3xl">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white/90 to-orange-950 bg-clip-text text-transparent">
                  Los Tarascos
                </h1>
                <p className="text-white/80 text-sm">Sabores Auténticos de México</p>
              </div>
            </div>

            {/* Botón Ver Pedidos */}
            <button
              onClick={() => setShowPedidos(!showPedidos)}
              className="bg-gradient-to-r from-teal-950 to-teal-800 text-white px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FiTag className="w-4 h-4" />
              Mis Pedidos
            </button>
          </div>

          {/* Buscador */}
          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70" />
              <input
                type="text"
                placeholder="Buscar platillos..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/70 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-current focus:border-transparent transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Filtros de Categoría */}
      <div className="sticky top-[86px] z-30 bg-gradient-to-r from-black/80 to-red-800 backdrop-blur-sm border-b border-orange-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {/* Todos - AHORA FUNCIONA CORRECTAMENTE */}
            <button
              onClick={() => setCategoriaActiva('todos')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                categoriaActiva === 'todos'
                  ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg'
                  : 'bg-white/10 text-white shadow-sm hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <FiCoffee className="inline mr-2 w-4 h-4" /> Todos
            </button>

            {/* Destacados */}
            <button
              onClick={() => setCategoriaActiva('destacados')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                categoriaActiva === 'destacados'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-lg font-bold text-black shadow-lg'
                  : 'bg-white/10 text-lg text-white shadow-sm hover:bg-white/20 backdrop-blur-sm'
              }`}
            >
              <FiStar className="inline mr-2 w-4 h-4" /> Destacados
            </button>

            {/* Categorías de la base de datos */}
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  categoriaActiva === categoria.id
                    ? 'text-white shadow-lg'
                    : 'bg-white/10 text-white shadow-sm hover:bg-white/20 backdrop-blur-sm'
                }`}
                style={{
                  backgroundColor: categoriaActiva === categoria.id ? categoria.color : undefined,
                  border: categoriaActiva === categoria.id ? `2px solid ${categoria.color}` : 'none'
                }}
              >
                <span className="mr-2">{categoria.icono}</span> {categoria.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Pedidos */}
      <AnimatePresence>
        {showPedidos && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowPedidos(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-br from-black to-red-900 text-white rounded-3xl shadow-2xl z-50 overflow-hidden border-2 border-teal-500/30"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-orange-300 bg-clip-text text-transparent">
                    Mis Pedidos
                  </h2>
                  <button
                    onClick={() => setShowPedidos(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {pedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiShoppingCart className="w-10 h-10 text-teal-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No tienes pedidos</h3>
                    <p className="text-red-200">Realiza tu primer pedido delicioso</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {pedidos.map(pedido => (
                      <div key={pedido.id} className="bg-gradient-to-r from-red-900/50 to-black/50 p-4 rounded-xl border border-orange-500/30">
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <p className="text-sm text-teal-300">
                              Pedido #{pedido.id?.substring(0, 8) || 'Nuevo'}
                            </p>
                            <p className="text-xs text-red-200">
                              {new Date(pedido.fecha).toLocaleDateString()} - {new Date(pedido.fecha).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pedido.estado === 'pendiente' ? 'bg-red-500' :
                            pedido.estado === 'preparando' ? 'bg-orange-500' :
                            pedido.estado === 'listo' ? 'bg-teal-500' :
                            pedido.estado === 'entregado' ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {pedido.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <div className="flex justify-between">
                                <span className="text-white/90">
                                  {item.quantity}x {item.product.nombre}
                                </span>
                                <span className="text-orange-300">
                                  ${(item.product.precio * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              {item.salsas && item.salsas.length > 0 && (
                                <div className="text-xs text-teal-300 ml-4 mt-1">
                                  Salsas: {item.salsas.map(s => s.nombre).join(', ')}
                                </div>
                              )}
                              {item.notas && (
                                <div className="text-xs text-gray-400 ml-4 mt-1">
                                  Notas: {item.notas}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-orange-800 pt-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold text-white">Total</span>
                              <p className="text-xs text-gray-400">
                                Subtotal: ${pedido.subtotal?.toFixed(2) || '0.00'} • 
                                Propina: ${pedido.propina?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <span className="text-xl font-bold text-teal-300">
                              ${pedido.total?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Grid de Productos - AHORA MUESTRA TODOS EN "TODOS" */}
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4" style={{ color: colores.teal }}>🍽️</div>
            <h3 className="text-3xl font-bold text-red-700 mb-2">
              {categoriaActiva === 'destacados' ? 'No hay productos destacados' : 'No encontramos platillos'}
            </h3>
            <p className="text-white/60">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {productosFiltrados.map((producto, index) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                esFavorito={favoritos.includes(producto.id)}
                onToggleFavorito={() => toggleFavorito(producto.id)}
                onAddToCart={agregarAlCarrito}
                isExpanded={productoExpandido === producto.id}
                onExpand={() => setProductoExpandido(productoExpandido === producto.id ? null : producto.id)}
                index={index}
                salsasDisponibles={salsas}
                showToast={showToast}
              />
            ))}
          </motion.div>
        )}
      </main>

      {/* Carrito Flotante - MEJORADO */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              ref={carritoRef}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-6 right-6 w-full max-w-md bg-gradient-to-b from-black to-red-900 text-white rounded-3xl shadow-2xl z-50 overflow-hidden border-2 border-orange-500/30"
            >
              {/* Header del carrito */}
              <div className="relative p-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-700">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-orange-400"></div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FiShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Tu Pedido</h2>
                      <p className="text-orange-100 text-sm">Los Tarascos • Envío: 30 min</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCart(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-black text-xs font-bold">
                      {totalItems}
                    </div>
                    <span className="text-sm">{totalItems} {totalItems === 1 ? 'ítem' : 'ítems'}</span>
                  </div>
                  <span className="text-xl font-bold">${totalCarrito.toFixed(2)}</span>
                </div>
              </div>

              {/* Lista de productos */}
              <div className="max-h-80 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiShoppingCart className="w-10 h-10 text-orange-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Tu carrito está vacío</h3>
                    <p className="text-red-200">Agrega productos deliciosos del menú</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => {
                      const precioSalsas = (item.salsas?.reduce((sum, salsa) => sum + salsa.precioExtra, 0) || 0)
                      const precioUnitario = item.product.precio + precioSalsas
                      const precioTotal = precioUnitario * item.quantity
                      
                      return (
                        <motion.div
                          key={`${item.product.id}-${index}-${item.notas || 'no-notas'}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex gap-3 p-4 bg-gradient-to-r from-red-900/50 to-black/50 rounded-2xl border border-orange-500/30 hover:shadow-md transition-shadow"
                        >
                          {/* Imagen mini */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                            <img
                              src={item.product.imagen}
                              alt={item.product.nombre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = `https://via.placeholder.com/100x100/DC2626/FFFFFF?text=${encodeURIComponent(item.product.nombre.substring(0, 10))}`
                              }}
                            />
                          </div>
                          
                          {/* Info del producto */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-white">{item.product.nombre}</h4>
                                {item.salsas && item.salsas.length > 0 && (
                                  <p className="text-teal-300 text-sm">
                                    {item.salsas.map(s => s.nombre).join(', ')}
                                  </p>
                                )}
                                <p className="text-orange-300 font-bold">${precioTotal.toFixed(2)}</p>
                              </div>
                              <button
                                onClick={() => removeFromCart(index)}
                                className="text-red-300 hover:text-red-100 transition-colors p-1"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {/* Contador de cantidad */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 bg-black/50 rounded-lg p-1 shadow-sm">
                                <button
                                  onClick={() => updateQuantity(index, item.quantity - 1)}
                                  className="w-7 h-7 bg-red-700 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <FiMinus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(index, item.quantity + 1)}
                                  className="w-7 h-7 bg-teal-700 text-white rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors"
                                >
                                  <FiPlus className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-sm text-orange-200">${precioUnitario.toFixed(2)} c/u</p>
                            </div>
                            
                            {item.notas && (
                              <p className="text-xs text-teal-200 mt-2 bg-black/30 p-2 rounded-lg border border-teal-500/30">
                                💬 {item.notas}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer del carrito */}
              {cart.length > 0 && (
                <div className="border-t border-red-800 p-6">
                  {/* Notas generales del pedido */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-orange-200 mb-2">
                      Notas generales para el pedido:
                    </label>
                    <textarea
                      value={notasGeneral}
                      onChange={(e) => setNotasGeneral(e.target.value)}
                      placeholder="Ej: Para llevar, sin cubiertos, entrega en puerta..."
                      className="w-full px-3 py-2 bg-black/50 border border-orange-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none text-white placeholder-white/50"
                      rows={2}
                    />
                  </div>
                  
                  {/* Resumen */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-orange-200">
                      <span>Subtotal</span>
                      <span>${totalCarrito.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-200">
                      <span>Envío</span>
                      <span className="text-teal-400 font-semibold">Gratis</span>
                    </div>
                    <div className="flex justify-between text-orange-200">
                      <span>Propina sugerida (10%)</span>
                      <span>${(totalCarrito * 0.10).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-red-800 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-2xl font-bold text-teal-300">
                          ${(totalCarrito * 1.10).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-3 bg-red-800 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FiX className="w-4 h-4" /> Vaciar
                    </button>
                    <button
                      onClick={realizarPedido}
                      className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <FiShoppingCart className="w-5 h-5" />
                      Pagar ${(totalCarrito * 1.10).toFixed(2)}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Botón flotante del carrito */}
      {!showCart && totalItems > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCart(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white p-4 rounded-2xl shadow-2xl z-40 flex items-center gap-3 hover:shadow-3xl transition-all group animate-bounce-slow border-2 border-orange-400/50"
        >
          <div className="relative">
            <FiShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-teal-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Ver pedido</p>
            <p className="text-xs opacity-90">${totalCarrito.toFixed(2)}</p>
          </div>
        </motion.button>
      )}
      
      {/* CSS para animación personalizada */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .bg-gradient-to-br {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  )
}

// Componente de Tarjeta de Producto - CON SALSAS
function ProductoCard({ 
  producto, 
  esFavorito, 
  onToggleFavorito, 
  onAddToCart, 
  isExpanded, 
  onExpand,
  index,
  salsasDisponibles,
  showToast
}: any) {
  const [notas, setNotas] = useState('')
  const [salsasSeleccionadas, setSalsasSeleccionadas] = useState<string[]>([])

  const handleAgregarCarrito = () => {
    const salsas = salsasDisponibles.filter((salsa: any) => 
      salsasSeleccionadas.includes(salsa.id)
    )
    onAddToCart(producto, notas, salsas)
    setNotas('')
    setSalsasSeleccionadas([])
  }

  const toggleSalsa = (salsaId: string) => {
    setSalsasSeleccionadas(prev => 
      prev.includes(salsaId)
        ? prev.filter(id => id !== salsaId)
        : [...prev, salsaId]
    )
  }

  const precioTotalSalsas = salsasSeleccionadas.reduce((sum, salsaId) => {
    const salsa = salsasDisponibles.find((s: any) => s.id === salsaId)
    return sum + (salsa?.precioExtra || 0)
  }, 0)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-black/10 to-black/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-orange-500/20"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={producto.imagen} 
          alt={producto.nombre}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = `https://via.placeholder.com/400x300/DC2626/FFFFFF?text=${encodeURIComponent(producto.nombre)}`
          }}
        />
        <button
          onClick={onToggleFavorito}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all ${
            esFavorito
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-black/80 text-gray-400 hover:text-red-400'
          }`}
        >
          <FiHeart className={`w-4 h-4 ${esFavorito ? 'fill-current' : ''}`} />
        </button>
        {producto.destacado && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <FiStar className="w-3 h-3" /> Destacado
          </div>
        )}
        {producto.categoria && (
          <div 
            className="absolute bottom-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
            style={{ backgroundColor: producto.categoria.color }}
          >
            {producto.categoria.icono} {producto.categoria.nombre}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white flex-1">{producto.nombre}</h3>
          <div className="text-right">
            <span className="text-white font-bold text-xl">
              ${(producto.precio + precioTotalSalsas).toFixed(2)}
            </span>
            {precioTotalSalsas > 0 && (
              <p className="text-xs text-white">
                Base: ${producto.precio.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-white/70 text-sm mb-3 leading-relaxed line-clamp-2">
          {producto.descripcion}
        </p>

        {/* Selector de salsas */}
        {salsasDisponibles.length > 0 && (
          <div className="mb-3">
            <button
              onClick={onExpand}
              className="flex items-center gap-1 text-teal-500 hover:text-teal-600 transition-colors text-sm mb-2"
            >
              <FiChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? 'Ocultar salsas' : 'Agregar salsas'}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 mb-3">
                    {salsasDisponibles.map((salsa: any) => (
                      <div key={salsa.id} className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleSalsa(salsa.id)}
                          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                            salsasSeleccionadas.includes(salsa.id)
                              ? 'bg-white/20 border border-transparent'
                              : 'bg-black/30 hover:bg-black/50 border border-transparent '
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${
                              salsasSeleccionadas.includes(salsa.id)
                                ? 'bg-lime-600 border-black'
                                : 'bg-black/20 border-gray-900'
                            }`}>
                              {salsasSeleccionadas.includes(salsa.id) && (
                                <div className="w-2 h-2 bg-red-600 rounded-sm m-1"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-white">
                              {salsa.nombre}
                            </span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-xs ${i < salsa.picor ? 'text-red-500' : 'text-gray-300'}`}
                                >
                                  🌶️
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            salsa.precioExtra > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {salsa.precioExtra > 0 ? `+$${salsa.precioExtra}` : 'Incluir'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Notas personalizadas */}
                  <textarea
                    placeholder="💬 Instrucciones especiales (sin cebolla, bien cocido, etc.)"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-transparent focus:border-transparent text-sm text-white resize-none mb-3"
                    rows={2}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Botón de acción */}
        <motion.button
          onClick={handleAgregarCarrito}
          className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <FiShoppingCart className="w-4 h-4" />
          Agregar al Carrito
          {precioTotalSalsas > 0 && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              +${precioTotalSalsas.toFixed(2)}
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}