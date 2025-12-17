import { NextResponse } from 'next/server'

let orders: any[] = []

// Cargar pedidos al iniciar
if (typeof window !== 'undefined') {
  const storedOrders = localStorage.getItem('tarascosOrders')
  if (storedOrders) {
    orders = JSON.parse(storedOrders)
  }
}

// GET - Obtener pedido específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const order = orders.find(o => o.id === id)

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      order
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error cargando pedido' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar pedido
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const orderIndex = orders.findIndex(o => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones
    if (body.customerName && !body.customerName.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del cliente es requerido' },
        { status: 400 }
      )
    }

    if (body.customerPhone && !body.customerPhone.trim()) {
      return NextResponse.json(
        { success: false, error: 'El teléfono es requerido' },
        { status: 400 }
      )
    }

    if (body.address && !body.address.trim()) {
      return NextResponse.json(
        { success: false, error: 'La dirección es requerida' },
        { status: 400 }
      )
    }

    // Actualizar pedido
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...body,
      // Si se actualizan los items, recalcular el total
      total: body.items 
        ? body.items.reduce((sum: number, item: any) => 
            sum + (item.product.price * item.quantity), 0
          )
        : orders[orderIndex].total
    }

    // Guardar cambios
    if (typeof window !== 'undefined') {
      localStorage.setItem('tarascosOrders', JSON.stringify(orders))
    }

    return NextResponse.json({
      success: true,
      order: orders[orderIndex],
      message: 'Pedido actualizado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error actualizando pedido' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar pedido
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const orderIndex = orders.findIndex(o => o.id === id)

    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar pedido
    orders.splice(orderIndex, 1)

    // Guardar cambios
    if (typeof window !== 'undefined') {
      localStorage.setItem('tarascosOrders', JSON.stringify(orders))
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error eliminando pedido' },
      { status: 500 }
    )
  }
}