'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

// Esquemas de validación
const registerSchema = z.object({
  customerName: z.string().min(1, 'Nombre requerido'),
  customerPhone: z.string().regex(/^\d{10}$/, 'Número inválido, 10 dígitos'),
  address: z.string().min(1, 'Dirección requerida'),
})

const loginSchema = z.object({
  customerPhone: z.string().regex(/^\d{10}$/, 'Número inválido, 10 dígitos'),
})

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Nombre requerido'),
  customerPhone: z.string().regex(/^\d{10}$/, 'Número inválido, 10 dígitos'),
  address: z.string().min(1, 'Dirección requerida'),
})

type RegisterFormData = z.infer<typeof registerSchema>
type LoginFormData = z.infer<typeof loginSchema>
type CheckoutFormData = z.infer<typeof checkoutSchema>

type User = {
  customerName: string
  customerPhone: string
  address: string
}

export default function CheckoutPage() {
  const { cart, clearCart, removeItem } = useCartStore()
  const router = useRouter()
  const cartRef = useRef<HTMLDivElement>(null)
  const [flyingItems, setFlyingItems] = useState(cart.map(item => ({ item, coords: null as DOMRect | null })))
  const [userType, setUserType] = useState<'nuevo' | 'registrado'>('nuevo')
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Formularios
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const checkoutForm = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      setUserType('registrado')
      // Prellenar formulario de checkout
      checkoutForm.reset(user)
    }
  }, [checkoutForm])

  // Función para guardar datos del cliente
  const saveClientData = (userData: User, orderTotal: number) => {
    try {
      // Obtener clientes existentes o inicializar array vacío
      const clients = JSON.parse(localStorage.getItem('tarascosClients') || '[]')
      
      // Buscar si el cliente ya existe
      const existingClientIndex = clients.findIndex((client: any) => 
        client.phone === userData.customerPhone
      )
      
      const clientData = {
        id: Date.now().toString(),
        name: userData.customerName,
        phone: userData.customerPhone,
        address: userData.address,
        totalGastado: orderTotal,
        totalPedidos: 1,
        ultimoPedido: new Date().toISOString(),
        fechaRegistro: new Date().toISOString(),
        status: 'activo'
      }
      
      if (existingClientIndex !== -1) {
        // Actualizar cliente existente
        const existingClient = clients[existingClientIndex]
        clients[existingClientIndex] = {
          ...existingClient,
          totalGastado: existingClient.totalGastado + orderTotal,
          totalPedidos: existingClient.totalPedidos + 1,
          ultimoPedido: new Date().toISOString()
        }
      } else {
        // Agregar nuevo cliente
        clients.push(clientData)
      }
      
      // Guardar en localStorage
      localStorage.setItem('tarascosClients', JSON.stringify(clients))
      
      // También guardar en una lista separada de pedidos para historial
      const orders = JSON.parse(localStorage.getItem('tarascosOrders') || '[]')
      const orderData = {
        id: Date.now().toString(),
        clientId: clientData.id,
        clientName: userData.customerName,
        clientPhone: userData.customerPhone,
        items: cart.map(item => ({
          product: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        total: orderTotal,
        date: new Date().toISOString(),
        status: 'completado'
      }
      orders.push(orderData)
      localStorage.setItem('tarascosOrders', JSON.stringify(orders))
      
    } catch (error) {
      console.error('Error guardando datos del cliente:', error)
    }
  }

  // Manejar registro de nuevo usuario
  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Simular guardado en "base de datos" (localStorage)
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      
      // Verificar si el usuario ya existe
      const existingUser = users.find((user: User) => user.customerPhone === data.customerPhone)
      if (existingUser) {
        toast.error('Este número ya está registrado')
        return
      }

      // Guardar nuevo usuario
      const newUser = { ...data }
      users.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      
      setCurrentUser(newUser)
      setUserType('registrado')
      checkoutForm.reset(newUser)
      toast.success('¡Registro exitoso!')
    } catch (err) {
      console.error(err)
      toast.error('Error en el registro')
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar login de usuario registrado
  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const user = users.find((user: User) => user.customerPhone === data.customerPhone)
      
      if (!user) {
        toast.error('Número no registrado')
        return
      }

      setCurrentUser(user)
      localStorage.setItem('currentUser', JSON.stringify(user))
      checkoutForm.reset(user)
      toast.success(`¡Bienvenido de nuevo, ${user.customerName}!`)
    } catch (err) {
      console.error(err)
      toast.error('Error en el login')
    } finally {
      setIsLoading(false)
    }
  }

  // En tu CheckoutPage, modifica la función onCheckout:

const onCheckout = async (data: CheckoutFormData) => {
  if (cart.length === 0) {
    toast.error('El carrito está vacío')
    return
  }

  try {
    const orderTotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
    
    const orderPayload = {
      ...data,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        sauces: item.sauces.map(s => ({ 
          sauceId: s.sauce.id, 
          sauceName: s.sauce.name, 
          quantity: s.quantity 
        })),
      })),
      total: orderTotal,
    }

    // Guardar datos del cliente
    saveClientData(data, orderTotal)
    
    // Guardar pedido pendiente para la página de éxito
    localStorage.setItem('pendingOrder', JSON.stringify({
      ...orderPayload,
      clientName: data.customerName,
      clientPhone: data.customerPhone,
      clientAddress: data.address,
      itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    }))
    
    await axios.post('/api/orders', orderPayload)
    toast.success('Pedido enviado correctamente')
    clearCart()
    router.push('/success')
  } catch (err) {
    console.error(err)
    toast.error('Error enviando pedido')
  }
}

  const handleFlyAnimation = (e: React.MouseEvent<HTMLButtonElement>, itemIdx: number) => {
    const cartBox = cartRef.current?.getBoundingClientRect()
    if (!cartBox) return
    const btnBox = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const newFlying = { item: cart[itemIdx], coords: btnBox }
    setFlyingItems(prev => [...prev, newFlying])
    setTimeout(() => setFlyingItems(prev => prev.filter(f => f !== newFlying)), 800)
  }

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setUserType('nuevo')
    registerForm.reset()
    loginForm.reset()
    checkoutForm.reset()
    toast.success('Sesión cerrada')
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-gradient-to-b from-yellow-100 to-red-100 p-6 relative">
      <Toaster />
      
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
          {currentUser && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">
                Hola, <strong>{currentUser.customerName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Selector de tipo de usuario */}
        {!currentUser && (
          <div className="flex gap-4 bg-gray-50 p-2 rounded-xl">
            <button
              type="button"
              onClick={() => setUserType('nuevo')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === 'nuevo'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nuevo Cliente
            </button>
            <button
              type="button"
              onClick={() => setUserType('registrado')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                userType === 'registrado'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cliente Registrado
            </button>
          </div>
        )}

        {/* Formulario de Registro */}
        {userType === 'nuevo' && !currentUser && (
          <motion.form
            key="register-form"
            onSubmit={registerForm.handleSubmit(onRegister)}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Registro de Nuevo Cliente</h3>
            
            <input 
              {...registerForm.register('customerName')} 
              placeholder="Nombre completo" 
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
            {registerForm.formState.errors.customerName && (
              <p className="text-red-600 text-sm">{registerForm.formState.errors.customerName.message}</p>
            )}

            <input 
              {...registerForm.register('customerPhone')} 
              placeholder="Teléfono (10 dígitos)" 
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
            {registerForm.formState.errors.customerPhone && (
              <p className="text-red-600 text-sm">{registerForm.formState.errors.customerPhone.message}</p>
            )}

            <input 
              {...registerForm.register('address')} 
              placeholder="Dirección completa" 
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
            {registerForm.formState.errors.address && (
              <p className="text-red-600 text-sm">{registerForm.formState.errors.address.message}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold"
            >
              {isLoading ? 'Registrando...' : 'Registrarse y Continuar'}
            </button>
          </motion.form>
        )}

        {/* Formulario de Login */}
        {userType === 'registrado' && !currentUser && (
          <motion.form
            key="login-form"
            onSubmit={loginForm.handleSubmit(onLogin)}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Ingresar con Celular</h3>
            
            <input 
              {...loginForm.register('customerPhone')} 
              placeholder="Ingresa tu número registrado" 
              className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
            {loginForm.formState.errors.customerPhone && (
              <p className="text-red-600 text-sm">{loginForm.formState.errors.customerPhone.message}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold"
            >
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </button>
          </motion.form>
        )}

        {/* Formulario de Checkout (solo cuando hay usuario) */}
        {currentUser && (
          <motion.form
            key="checkout-form"
            onSubmit={checkoutForm.handleSubmit(onCheckout)}
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-gray-800">Información de Envío</h3>
            
            <div className="space-y-4">
              <div>
                <input 
                  {...checkoutForm.register('customerName')} 
                  placeholder="Nombre completo" 
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full" 
                />
                {checkoutForm.formState.errors.customerName && (
                  <p className="text-red-600 text-sm">{checkoutForm.formState.errors.customerName.message}</p>
                )}
              </div>

              <div>
                <input 
                  {...checkoutForm.register('customerPhone')} 
                  placeholder="Teléfono" 
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full" 
                />
                {checkoutForm.formState.errors.customerPhone && (
                  <p className="text-red-600 text-sm">{checkoutForm.formState.errors.customerPhone.message}</p>
                )}
              </div>

              <div>
                <input 
                  {...checkoutForm.register('address')} 
                  placeholder="Dirección" 
                  className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full" 
                />
                {checkoutForm.formState.errors.address && (
                  <p className="text-red-600 text-sm">{checkoutForm.formState.errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Carrito animado */}
            <div ref={cartRef} className="bg-gray-50 p-4 rounded-xl shadow-inner flex flex-col gap-3 relative mt-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-2 5h13M17 13l2 5M6 18a1 1 0 100 2 1 1 0 000-2zm12 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                Carrito ({cart.length})
              </h3>

              <AnimatePresence>
                {cart.map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="border-b pb-2 flex flex-col" 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.product.name} x{item.quantity}</span>
                      <button 
                        type="button" 
                        className="text-red-600 hover:text-red-800 transition" 
                        onClick={e => { removeItem(idx); handleFlyAnimation(e, idx) }}
                      >
                        Eliminar
                      </button>
                    </div>
                    {item.sauces.length > 0 && (
                      <ul className="text-sm text-gray-600 mt-1">
                        {item.sauces.map((s, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                            {s.sauce.name} x{s.quantity}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="text-sm text-green-600 font-semibold mt-1">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Flying animation */}
              <AnimatePresence>
                {flyingItems.map((f, i) => {
                  if (!f.coords) return null
                  const cartBox = cartRef.current?.getBoundingClientRect()
                  if (!cartBox) return null
                  const startX = f.coords.left
                  const startY = f.coords.top
                  const endX = cartBox.left + cartBox.width / 2 - 40
                  const endY = cartBox.top + 20
                  return (
                    <motion.img
                      key={i}
                      src={f.item.product.image}
                      className="w-20 h-20 rounded-full fixed z-50 border-2 border-white shadow-lg"
                      style={{ left: startX, top: startY }}
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x: endX - startX, y: endY - startY, opacity: 0.5, scale: 0.3 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                    />
                  )
                })}
              </AnimatePresence>

              {cart.length > 0 && (
                <div className="border-t pt-3 mt-2">
                  <p className="font-bold text-lg text-gray-800">
                    Total: ${cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={checkoutForm.formState.isSubmitting || cart.length === 0} 
              className="mt-4 w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition disabled:opacity-50 font-semibold text-lg"
            >
              {checkoutForm.formState.isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  )
}