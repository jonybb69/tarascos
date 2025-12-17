import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        categoria: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products ERROR:", error);
    return NextResponse.json(
      { error: "Error obteniendo productos" },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const { nombre, precio, image, categoriaId, destacado, descripcion } = await request.json();

    if (!nombre || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }
    
    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json(
        { error: "La descripción es obligatoria" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: Number(precio) || 0,
        imagen: image || null,
        destacado: destacado || false,
        categoria: {
          connect: { id: categoriaId }
        }
      },
      include: {
        categoria: true
      }
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products ERROR:", error);
    return NextResponse.json(
      { error: "Error creando producto" },
      { status: 500 }
    );
  }
}