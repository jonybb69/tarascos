import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  // Aquí podrías usar Prisma o datos reales
  if (email === 'admin@tarascos.com' && password === '123456') {
    return NextResponse.json({ token: 'tarascos-admin-token' })
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
