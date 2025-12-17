"use client"

import { useEffect, useState } from "react"
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCoffee, FiZap, FiTrendingUp } from "react-icons/fi"

type Sauce = {
  id: string
  nombre: string
}

export default function AdminSalsasPage() {
  const [sauces, setSauces] = useState<Sauce[]>([])
  const [nombre, setNombre] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadSauces = async () => {
    const res = await fetch("/api/sauces")
    const data = await res.json()
    setSauces(data)
  }

  useEffect(() => {
    loadSauces()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) return

    if (editingId) {
      await fetch(`/api/sauces/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      })
    } else {
      await fetch("/api/sauces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      })
    }

    setNombre("")
    setEditingId(null)
    setShowForm(false)
    loadSauces()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/sauces/${id}`, { method: "DELETE" })
    loadSauces()
  }

  const startEdit = (sauce: Sauce) => {
    setEditingId(sauce.id)
    setNombre(sauce.nombre)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 p-6 md:p-10">
      {/* Header con fondo degradado */}
      <div className="max-w-6xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-700 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                  <FiCoffee className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Gestión de Salsas</h1>
                  <p className="text-red-100 mt-2">Administra las salsas disponibles en el menú</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                  <FiTrendingUp className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-red-100">Total Salsas</p>
                    <p className="text-xl font-bold">{sauces.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
                  <FiZap className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-red-100">Activas</p>
                    <p className="text-xl font-bold">{sauces.length}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setNombre("")
                setEditingId(null)
                setShowForm(true)
              }}
              className="mt-6 md:mt-0 bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FiPlus className="w-5 h-5" /> 
              <span>Nueva Salsa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de salsas con tarjetas */}
      <div className="max-w-6xl mx-auto">
        {sauces.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCoffee className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No hay salsas registradas</h3>
            <p className="text-gray-500 mb-6">Comienza agregando tu primera salsa</p>
            <button
              onClick={() => {
                setNombre("")
                setEditingId(null)
                setShowForm(true)
              }}
              className="bg-gradient-to-r from-red-600 to-orange-500 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <FiPlus className="w-5 h-5" /> Crear Primera Salsa
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sauces.map((sauce, index) => (
              <div
                key={sauce.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-orange-100 hover:border-orange-200 group"
              >
                <div className="p-6">
                  {/* Número de orden con efecto gradiente */}
                  <div className="mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors">
                        {sauce.nombre}
                      </h3>
                      <p className="text-sm text-gray-500">ID: {sauce.id.substring(0, 8)}...</p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(sauce)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sauce.id)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Estado */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Estado</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        Activa
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Pie de tarjeta */}
                <div className="px-6 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-t border-orange-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Última actualización</span>
                    <button
                      onClick={() => startEdit(sauce)}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del formulario - MEJORADO */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="animate-slideUp">
            <form
              onSubmit={handleSubmit}
              className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-2xl w-full max-w-md border border-orange-200"
            >
              {/* Header del modal */}
              <div className="relative p-6 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <FiCoffee className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">
                        {editingId ? "✏️ Editar Salsa" : "🌶️ Nueva Salsa"}
                      </h2>
                      <p className="text-red-100 text-sm">
                        {editingId ? "Actualiza los datos de la salsa" : "Agrega una nueva salsa al menú"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cuerpo del formulario */}
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="flex items-center gap-2">
                      <span className="text-red-500">*</span> Nombre de la salsa
                    </span>
                  </label>
                  <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Salsa Verde, Salsa Roja, Guacamole..."
                    className="w-full border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-3 text-lg transition-all outline-none"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Nombre que aparecerá en el menú
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!nombre.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingId ? "Actualizar" : "Crear Salsa"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-orange-200">
        <div className="text-center text-gray-500 text-sm">
          <p>🛡️ <strong>Consejo:</strong> Las salsas se mostrarán en el menú para que los clientes puedan personalizar sus pedidos.</p>
          <p className="mt-2">Total de salsas en el sistema: <span className="font-bold text-red-600">{sauces.length}</span></p>
        </div>
      </div>

      {/* Estilos CSS para animaciones */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  )
}