import { NextResponse } from 'next/server'

// Simulación de base de datos en memoria
let orders: any[] = []

// GET - Obtener todos los pedidos
export async function GET() {
  try {
    // Ordenar por fecha más reciente primero
    const sortedOrders = orders.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )

    return NextResponse.json({
      success: true,
      orders: sortedOrders
    })
  } catch (error) {
    console.error('Error en GET /api/orders:', error)
    return NextResponse.json(
      { success: false, error: 'Error cargando pedidos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo pedido
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      customerName, 
      customerPhone, 
      address, 
      items, 
      total, 
      status, 
      tipoEntrega,
      notas 
    } = body

    // Validaciones básicas
    if (!customerName || !customerPhone || !address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Datos del pedido incompletos' },
        { status: 400 }
      )
    }

    // Generar ID único y número de pedido
    const orderId = `TAR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    const numeroPedido = orders.length + 1

    // Crear nuevo pedido
    const newOrder = {
      id: orderId,
      customerName,
      customerPhone,
      address,
      items,
      total: total || items.reduce((sum: number, item: any) => 
        sum + ((item.product?.price || 0) * (item.quantity || 1)), 0
      ),
      status: status || 'pendiente',
      tipoEntrega: tipoEntrega || 'domicilio',
      notas: notas || '',
      fecha: new Date().toISOString(),
      fechaLegible: new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      numeroPedido
    }

    orders.unshift(newOrder)

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Pedido creado exitosamente'
    })
  } catch (error) {
    console.error('Error en POST /api/orders:', error)
    return NextResponse.json(
      { success: false, error: 'Error creando pedido' },
      { status: 500 }
    )
  }
}
