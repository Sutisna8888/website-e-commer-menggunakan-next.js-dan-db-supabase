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

    const totalFoods = await prisma.foodItem.count();
    const totalToppings = await prisma.topping.count();

    const itemsSoldResult = await prisma.orderItem.aggregate({
      where: {
        order: {
          status: 'DELIVERED'
        }
      },
      _sum: { quantity: true }
    });
    const totalItemsSold = itemsSoldResult._sum.quantity || 0;

    // Menu terpopuler berdasarkan terjual
    const popularFoods = await prisma.foodItem.findMany({
      take: 5,
      orderBy: { soldCount: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        price: true,
        imageUrl: true,
        soldCount: true,
      }
    });

    const recentOrders = await prisma.order.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } }
      }
    });

    // Data pendapatan 7 hari terakhir untuk chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const ordersLast7Days = await prisma.order.findMany({
      where: { 
        status: 'DELIVERED',
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true, totalAmount: true }
    });

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateString = d.toLocaleDateString('id-ID', { weekday: 'short' }); // Contoh: 'Sen', 'Sel'
      
      const dailyOrders = ordersLast7Days.filter(o => 
        o.createdAt.getDate() === d.getDate() && 
        o.createdAt.getMonth() === d.getMonth() &&
        o.createdAt.getFullYear() === d.getFullYear()
      );
      
      return {
        name: dateString,
        revenue: dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      };
    });

    return NextResponse.json({
      totalRevenue,
      activeOrders,
      allOrders,
      totalCustomers,
      totalFoods,
      totalToppings,
      totalItemsSold,
      popularFoods,
      recentOrders,
      chartData
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
