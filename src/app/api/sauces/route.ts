import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const sauces = await prisma.sauce.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(sauces)
}

export async function POST(req: Request) {
  const body = await req.json()

  if (!body.nombre || !body.nombre.trim()) {
    return NextResponse.json(
      { error: "El nombre es obligatorio" },
      { status: 400 }
    )
  }

  const sauce = await prisma.sauce.create({
    data: {
      nombre: body.nombre.trim(),
    },
  })

  return NextResponse.json(sauce, { status: 201 })
}
