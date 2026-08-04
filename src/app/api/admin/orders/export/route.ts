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

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const searchParam = searchParams.get('search') || '';
    const statusParam = searchParams.get('status') || 'ALL';

    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default 30 hari terakhir
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Build the Prisma 'where' clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (statusParam && statusParam !== 'ALL') {
      whereClause.status = statusParam;
    }

    if (searchParam) {
      whereClause.OR = [
        { id: { contains: searchParam, mode: 'insensitive' } },
        { user: { name: { contains: searchParam, mode: 'insensitive' } } }
      ];
    }

    // Ambil data tanpa limit/pagination untuk keperluan export
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: {
            foodItem: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5000 // Batasan keamanan maksimal 5000 data sekali export
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
