import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function verifyAdmin(request: Request) {
  const token = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  if (!token) return false;
  const session = await verifyJWT(token);
  return session && session.role === 'ADMIN';
}

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const toppings = await prisma.globalTopping.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(toppings);
  } catch (error) {
    console.error('Error fetching global toppings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, categories } = body;

    const newTopping = await prisma.globalTopping.create({
      data: {
        name,
        price: parseInt(price),
        categories: categories || "",
      }
    });

    return NextResponse.json(newTopping, { status: 201 });
  } catch (error) {
    console.error('Error creating global topping:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
