import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, totalAmount } = body;

    if (!code || typeof totalAmount !== 'number') {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!voucher) {
      return NextResponse.json({ error: 'Kode promo tidak ditemukan' }, { status: 404 });
    }

    if (!voucher.isActive) {
      return NextResponse.json({ error: 'Kode promo sudah tidak aktif' }, { status: 400 });
    }

    if (new Date() > voucher.validUntil) {
      return NextResponse.json({ error: 'Kode promo sudah kedaluwarsa' }, { status: 400 });
    }

    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
      return NextResponse.json({ error: 'Kuota promo sudah habis' }, { status: 400 });
    }

    if (totalAmount < voucher.minPurchase) {
      return NextResponse.json({ 
        error: `Minimal belanja untuk promo ini adalah Rp ${voucher.minPurchase.toLocaleString('id-ID')}` 
      }, { status: 400 });
    }

    // Hitung diskon
    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((totalAmount * voucher.discountValue) / 100);
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else if (voucher.discountType === 'FIXED') {
      discountAmount = voucher.discountValue;
    }

    // Jangan biarkan diskon melebihi total belanja 
    if (discountAmount > totalAmount) {
      discountAmount = totalAmount;
    }

    return NextResponse.json({
      success: true,
      voucherCode: voucher.code,
      discountAmount,
      discountType: voucher.discountType
    });

  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
