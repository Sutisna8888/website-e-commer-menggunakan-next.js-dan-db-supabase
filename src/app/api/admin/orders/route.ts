import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

async function verifyAdmin(request: Request) {
  const token = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
  if (!token) return false;
  const session = await verifyJWT(token);
  return session && session.role === 'ADMIN';
}

// Get semua pesanan
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
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '10');

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

    const skip = (pageParam - 1) * limitParam;

    const [totalOrders, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: skip,
        take: limitParam,
        include: {
          user: { select: { name: true, email: true } },
          orderItems: {
            include: {
              foodItem: { select: { name: true, category: true } }
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        total: totalOrders,
        totalPages: Math.ceil(totalOrders / limitParam),
        page: pageParam,
        limit: limitParam
      }
    });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Update status pesanan
export async function PUT(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
