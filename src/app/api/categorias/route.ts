import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/categorias
export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("GET /api/categorias ERROR:", error);
    return NextResponse.json(
      { error: "Error obteniendo categorías" },
      { status: 500 }
    );
  }
}

// POST /api/categorias
export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, color, icono } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const nueva = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || "",
        color: color || "#FF0000",
        icono: icono || "default-icon"
      }
    });

    return NextResponse.json(
      { success: true, categoria: nueva },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categorias ERROR:", error);
    return NextResponse.json(
      { error: "Error creando categoría" },
      { status: 500 }
    );
  }
}