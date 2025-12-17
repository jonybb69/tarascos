// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface Producto {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoria: string
  destacado?: boolean
}

export interface ApiResponse {
  success: boolean
  message?: string
  error?: string
  producto?: Producto
  productos?: Producto[]
  count?: number
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const productosApi = {
  // Obtener todos los productos
  async obtenerProductos(): Promise<Producto[]> {
    const response = await fetch(`${API_BASE_URL}/products`)
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Error al obtener productos')
    }
    
    const data: ApiResponse = await response.json()
    return data.productos || []
  },

  // Obtener producto por ID
  async obtenerProducto(id: string): Promise<Producto> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    
    if (!response.ok) {
      throw new ApiError(response.status, 'Error al obtener el producto')
    }
    
    const data: Producto = await response.json()
    return data
  },

  // Crear producto
  async crearProducto(data: Omit<Producto, 'id'>): Promise<Producto> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new ApiError(response.status, errorData.error || 'Error al crear el producto')
    }
    
    const result: ApiResponse = await response.json()
    if (!result.producto) throw new Error('Producto no devuelto')
    return result.producto
  },

  // Actualizar producto completo
  async actualizarProducto(id: string, data: Partial<Producto>): Promise<Producto> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new ApiError(response.status, errorData.error || 'Error al actualizar el producto')
    }
    
    const result: ApiResponse = await response.json()
    if (!result.producto) throw new Error('Producto no devuelto')
    return result.producto
  },

  // Actualizar producto parcialmente
  async actualizarProductoParcial(id: string, data: Partial<Producto>): Promise<Producto> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new ApiError(response.status, errorData.error || 'Error al actualizar el producto')
    }
    
    const result: ApiResponse = await response.json()
    if (!result.producto) throw new Error('Producto no devuelto')
    return result.producto
  },

  // Eliminar producto
  async eliminarProducto(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
      throw new ApiError(response.status, errorData.error || 'Error al eliminar el producto')
    }
  }
}