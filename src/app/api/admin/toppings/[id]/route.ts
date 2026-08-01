import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function verifyAdmin(request: Request) {
  const token = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  if (!token) return false;
  const session = await verifyJWT(token);
  return session && session.role === 'ADMIN';
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, price, categories } = body;

    const updatedTopping = await prisma.globalTopping.update({
      where: { id },
      data: {
        name,
        price: parseInt(price),
        categories: categories || "",
      }
    });

    return NextResponse.json(updatedTopping);
  } catch (error) {
    console.error('Error updating global topping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    
    await prisma.globalTopping.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting global topping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
