import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CartItem } from '@/types';

/**
 * POST /api/orders
 * Membuat pesanan baru di database Supabase
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Silakan masuk (login) terlebih dahulu' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      return NextResponse.json(
        { error: 'Sesi Anda tidak valid atau kedaluwarsa' },
        { status: 401 }
      );
    }

    const { address, paymentMethod, items, totalAmount, voucherCode, discountAmount } = await req.json();

    if (!address || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Informasi pesanan tidak lengkap' },
        { status: 400 }
      );
    }

    // Gunakan Prisma Transaction untuk menjamin integritas data pesanan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validasi dan Update Voucher (Jika ada)
      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: voucherCode.toUpperCase() } });
        if (!voucher || !voucher.isActive) {
          throw new Error('Kode promo tidak valid atau sudah tidak aktif');
        }
        if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
          throw new Error('Kuota promo sudah habis');
        }
        await tx.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      // 2. Buat data Order utama
      const order = await tx.order.create({
        data: {
          userId: payload.id,
          totalAmount: Math.round(totalAmount),
          address,
          paymentMethod,
          status: 'PENDING',
          voucherCode: voucherCode ? voucherCode.toUpperCase() : null,
          discountAmount: discountAmount ? Math.round(discountAmount) : 0
        }
      });

      // 2. Buat data OrderItem untuk setiap makanan di keranjang belanja
      const orderItemsData = (items as CartItem[]).map((item) => ({
        orderId: order.id,
        foodItemId: item.foodItem.id,
        quantity: item.quantity,
        price: Math.round(item.customPrice),
        spiceLevel: item.spiceLevel || null,
        toppings: item.selectedToppings && item.selectedToppings.length > 0
          ? item.selectedToppings.map((t) => t.name).join(', ')
          : null,
        notes: item.notes || null
      }));

      await tx.orderItem.createMany({
        data: orderItemsData
      });

      // 3. Update soldCount untuk setiap FoodItem
      for (const item of items as CartItem[]) {
        await tx.foodItem.update({
          where: { id: item.foodItem.id },
          data: {
            soldCount: {
              increment: item.quantity
            }
          }
        });
      }

      return order;
    });

    return NextResponse.json(
      { message: 'Pesanan berhasil dibuat!', orderId: result.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saat membuat pesanan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal membuat pesanan baru';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders
 * Mengambil riwayat pesanan dari pengguna yang masuk
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Silakan masuk (login) terlebih dahulu' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      return NextResponse.json(
        { error: 'Sesi Anda tidak valid atau kedaluwarsa' },
        { status: 401 }
      );
    }

    // Ambil data order milik user tertentu, gabungkan dengan item makanan pendukung
    const orders = await prisma.order.findMany({
      where: {
        userId: payload.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: {
          include: {
            foodItem: true
          }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error saat mengambil riwayat pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal memuat riwayat pesanan' },
      { status: 500 }
    );
  }
}
