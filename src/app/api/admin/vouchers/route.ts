import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minPurchase, 
      maxDiscount, 
      validUntil, 
      usageLimit, 
      isActive 
    } = body;

    if (!code || !discountType || !discountValue || !validUntil) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (existing) {
      return NextResponse.json({ error: 'Kode voucher sudah digunakan' }, { status: 400 });
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseInt(discountValue),
        minPurchase: parseInt(minPurchase) || 0,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        validUntil: new Date(validUntil),
        usageLimit: parseInt(usageLimit) || 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json(voucher, { status: 201 });
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
