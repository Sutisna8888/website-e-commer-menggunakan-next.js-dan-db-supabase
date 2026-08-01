import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')?.split('session=')[1]?.split(';')[0];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifyJWT(token);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Hitung total pendapatan (hanya pesanan yang sudah DELIVERED)
    const revenueResult = await prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { totalAmount: true }
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Jumlah pesanan yang belum selesai (pending, processing, dll)
    const activeOrders = await prisma.order.count({
      where: {
        status: {
          notIn: ['DELIVERED', 'CANCELLED']
        }
      }
    });
    
    const allOrders = await prisma.order.count();

    // Jumlah total pelanggan (User dengan role USER)
    const totalCustomers = await prisma.user.count({
      where: { role: 'USER' }
    });

    // Menu terpopuler (berdasarkan reviewsCount atau quantity order item di masa depan)
    // Sementara kita ambil top 5 berdasarkan reviewsCount dan rating
    const popularFoods = await prisma.foodItem.findMany({
      take: 5,
      orderBy: [
        { reviewsCount: 'desc' },
        { rating: 'desc' }
      ],
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        imageUrl: true,
        rating: true,
        reviewsCount: true,
      }
    });

    return NextResponse.json({
      totalRevenue,
      activeOrders,
      allOrders,
      totalCustomers,
      popularFoods
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
