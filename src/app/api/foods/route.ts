import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Prisma.FoodItemWhereInput = {};

    if (category && category !== 'Semua') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const foods = await prisma.foodItem.findMany({
      where,
      include: {
        toppings: true,
        variants: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data makanan' },
      { status: 500 }
    );
  }
}
