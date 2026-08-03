import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
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

    const voucher = await prisma.voucher.update({
      where: { id: params.id },
      data: {
        code: code?.toUpperCase(),
        discountType,
        discountValue: discountValue ? parseInt(discountValue) : undefined,
        minPurchase: minPurchase !== undefined ? parseInt(minPurchase) : undefined,
        maxDiscount: maxDiscount ? parseInt(maxDiscount) : null,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        usageLimit: usageLimit !== undefined ? parseInt(usageLimit) : undefined,
        isActive
      }
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error updating voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await prisma.voucher.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
