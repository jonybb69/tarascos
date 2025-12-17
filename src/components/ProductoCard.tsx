import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FiSearch, FiHeart, FiShoppingCart, FiX, FiStar, FiCoffee, FiPlus, FiMinus, FiChevronUp, FiChevronDown, FiTag, FiChevronRight, FiCheck } from 'react-icons/fi'
// Componente de Tarjeta de Producto - CON SALSAS (CORREGIDO)
function ProductoCard({ 
  producto, 
  esFavorito, 
  onToggleFavorito, 
  onAddToCart, 
  isExpanded, 
  onExpand,
  index,
  salsasDisponibles = [], // Valor por defecto
  showToast
}: any) {
  const [notas, setNotas] = useState('')
  const [salsasSeleccionadas, setSalsasSeleccionadas] = useState<string[]>([])

  // DEBUG: Ver qué salsas están disponibles
  console.log(`Producto: ${producto.nombre}, Salsas disponibles:`, salsasDisponibles)

  const handleAgregarCarrito = () => {
    const salsas = salsasDisponibles.filter((salsa: any) => 
      salsasSeleccionadas.includes(salsa.id)
    )
    
    // Si hay salsas disponibles pero no se seleccionó ninguna, preguntar
    if (salsasDisponibles.length > 0 && salsas.length === 0) {
      const confirmar = window.confirm(
        `¿Deseas agregar ${producto.nombre} sin salsa seleccionada?\n\n` +
        `Salsas disponibles: ${salsasDisponibles.map((s: { nombre: any }) => s.nombre).join(', ')}`
      )
      if (!confirmar) return
    }
    
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
          <h3 className="text-lg font-bold text-red-900 flex-1">{producto.nombre}</h3>
          <div className="text-right">
            <span className="text-red-600 font-bold text-xl">
              ${(producto.precio + precioTotalSalsas).toFixed(2)}
            </span>
            {precioTotalSalsas > 0 && (
              <p className="text-xs text-gray-500">
                Base: ${producto.precio.toFixed(2)}
              </p>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 text-sm mb-3 leading-relaxed line-clamp-2">
          {producto.descripcion}
        </p>

        {/* Selector de salsas - MODIFICADO: Siempre mostrar el botón */}
        <div className="mb-3">
          <button
            onClick={onExpand}
            className="flex items-center gap-1 text-teal-600 hover:text-teal-700 transition-colors text-sm mb-2 w-full justify-between"
          >
            <span className="flex items-center gap-1">
              <FiChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpanded ? 'Ocultar opciones' : 'Personalizar'}
            </span>
            {salsasDisponibles.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {salsasDisponibles.length} salsa{salsasDisponibles.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Salsas disponibles - MODIFICADO: Mostrar mensaje si no hay */}
                {salsasDisponibles.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selecciona salsa(s):</p>
                    {salsasDisponibles.map((salsa: any) => (
                      <div key={salsa.id} className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleSalsa(salsa.id)}
                          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                            salsasSeleccionadas.includes(salsa.id)
                              ? 'bg-red-100 border border-red-300'
                              : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              salsasSeleccionadas.includes(salsa.id)
                                ? 'bg-red-500 border-red-500'
                                : 'bg-white border-gray-400'
                            }`}>
                              {salsasSeleccionadas.includes(salsa.id) && (
                                <div className="w-2 h-2 bg-white rounded-sm m-1"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-800">
                              {salsa.nombre}
                            </span>
                            <div className="flex" title={`Picor: ${salsa.picor || 0}/5`}>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-xs ${i < (salsa.picor || 0) ? 'text-red-500' : 'text-gray-300'}`}
                                >
                                  🌶️
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className={`text-sm font-semibold ${
                            (salsa.precioExtra || 0) > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {(salsa.precioExtra || 0) > 0 ? `+$${(salsa.precioExtra || 0).toFixed(2)}` : 'Gratis'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      No hay salsas disponibles para este producto.
                    </p>
                  </div>
                )}

                {/* Notas personalizadas - SIEMPRE mostrar */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones especiales:
                  </label>
                  <textarea
                    placeholder="💬 Ej: Sin cebolla, bien cocido, extra salsa, etc."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                    rows={2}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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