import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Helper function untuk verifikasi admin
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

    const foods = await prisma.foodItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        toppings: true,
        variants: true,
      }
    });

    return NextResponse.json(foods);
  } catch (error) {
    console.error('Error fetching foods (admin):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const category = formData.get('category') as string;
    const isAvailable = formData.get('isAvailable') === 'true';
    const toppingsStr = formData.get('toppings') as string;
    const prepTime = '15-20 mnt'; // Default value since it's hidden from UI

    let toppings: { name: string, price: string }[] = [];
    try {
      if (toppingsStr) {
        toppings = JSON.parse(toppingsStr);
      }
    } catch (err) {
      console.error('Error parsing toppings:', err);
    }

    let imageUrl = ''; // Default image if none is uploaded

    const imageFile = formData.get('imageFile') as File | null;
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + '-' + imageFile.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // ignore if exists
      }
      
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    const newFood = await prisma.foodItem.create({
      data: {
        name,
        description,
        price: parseInt(price || '0'),
        category,
        imageUrl,
        prepTime,
        isAvailable,
        rating: 0, // Default for new item
        reviewsCount: 0, // Default
        toppings: {
          create: toppings.map((t) => ({
            name: t.name,
            price: parseInt(t.price || '0'),
          })),
        }
      },
      include: {
        toppings: true,
      }
    });

    return NextResponse.json(newFood, { status: 201 });
  } catch (error) {
    console.error('Error creating food:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
