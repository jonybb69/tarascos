import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { fechaRegistro: 'desc' }
    })
    return NextResponse.json({ success: true, clientes })
  } catch (error) {
    console.error('Error cargando clientes:', error)
    return NextResponse.json({ success: false, error: 'Error cargando clientes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const nuevoCliente = await prisma.cliente.create({
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        email: body.email || null,
        notas: body.notas || null,
        status: body.status || 'activo',
        totalGastado: 0,
        totalPedidos: 0,
        ultimoPedido: new Date().toISOString(),
        fechaRegistro: new Date().toISOString()
      }
    })
    return NextResponse.json({ success: true, cliente: nuevoCliente })
  } catch (error) {
    console.error('Error creando cliente:', error)
    return NextResponse.json({ success: false, error: 'Error creando cliente' }, { status: 500 })
  }
}
