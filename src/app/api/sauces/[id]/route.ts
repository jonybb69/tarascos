import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  if (!body.nombre || !body.nombre.trim()) {
    return NextResponse.json(
      { error: "El nombre es obligatorio" },
      { status: 400 }
    )
  }

  const sauce = await prisma.sauce.update({
    where: { id: params.id },
    data: { nombre: body.nombre.trim() },
  })

  return NextResponse.json(sauce)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()

  const sauce = await prisma.sauce.update({
    where: { id: params.id },
    data: {
      nombre: body.nombre?.trim(),
    },
  })

  return NextResponse.json(sauce)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.sauce.delete({
    where: { id: params.id },
  })

  return NextResponse.json({ ok: true })
}
