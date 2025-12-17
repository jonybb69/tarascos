import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/categorias/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { nombre, descripcion, color, icono } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion || "",
        color: color || "#FF0000",
        icono: icono || "default-icon"
      }
    });

    return NextResponse.json({ success: true, categoria });
  } catch (error) {
    console.error("PUT /api/categorias/[id] ERROR:", error);
    return NextResponse.json(
      { error: "Error actualizando categoría" },
      { status: 500 }
    );
  }
}

// PATCH /api/categorias/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const categoria = await prisma.categoria.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, categoria });
  } catch (error) {
    console.error("PATCH /api/categorias/[id] ERROR:", error);
    return NextResponse.json(
      { error: "Error actualizando categoría parcialmente" },
      { status: 500 }
    );
  }
}

// DELETE /api/categorias/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.categoria.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Categoría eliminada" });
  } catch (error) {
    console.error("DELETE /api/categorias/[id] ERROR:", error);
    return NextResponse.json(
      { error: "Error eliminando categoría" },
      { status: 500 }
    );
  }
}