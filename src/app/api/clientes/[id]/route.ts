import { NextResponse } from 'next/server'

let clients: any[] = []

// Cargar clientes al iniciar
if (typeof window !== 'undefined') {
  const storedClients = localStorage.getItem('tarascosClients')
  if (storedClients) {
    clients = JSON.parse(storedClients)
  }
}

// GET - Obtener cliente específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const client = clients.find(c => c.id === id)

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      cliente: client
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error cargando cliente' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar cliente
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, phone, address, email, notas, status } = body

    const clientIndex = clients.findIndex(c => c.id === id)

    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones
    if (!name || !phone || !address) {
      return NextResponse.json(
        { success: false, error: 'Nombre, teléfono y dirección son requeridos' },
        { status: 400 }
      )
    }

    // Verificar duplicados (excluyendo el cliente actual)
    const existingClient = clients.find(client => 
      client.id !== id && (client.phone === phone || (email && client.email === email))
    )

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Ya existe otro cliente con este teléfono o email' },
        { status: 400 }
      )
    }

    // Actualizar cliente
    clients[clientIndex] = {
      ...clients[clientIndex],
      name,
      phone,
      address,
      email: email || '',
      notas: notas || '',
      status: status || 'activo'
    }

    // Guardar cambios
    if (typeof window !== 'undefined') {
      localStorage.setItem('tarascosClients', JSON.stringify(clients))
    }

    return NextResponse.json({
      success: true,
      cliente: clients[clientIndex],
      message: 'Cliente actualizado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error actualizando cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar cliente
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const clientIndex = clients.findIndex(c => c.id === id)

    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar cliente
    clients.splice(clientIndex, 1)

    // Guardar cambios
    if (typeof window !== 'undefined') {
      localStorage.setItem('tarascosClients', JSON.stringify(clients))
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminado exitosamente'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error eliminando cliente' },
      { status: 500 }
    )
  }
}