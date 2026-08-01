import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/favorites
 * Mengambil daftar makanan favorit user yang sedang login
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

    // Ambil data favorit milik user beserta detail makanannya
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: payload.id
      },
      include: {
        foodItem: {
          include: {
            toppings: true,
            variants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error saat mengambil daftar favorit:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar favorit' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Toggle (Tambah/Hapus) makanan dari daftar favorit
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

    const body = await req.json();
    const { foodItemId } = body;

    if (!foodItemId) {
      return NextResponse.json(
        { error: 'ID makanan diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah sudah difavoritkan sebelumnya
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_foodItemId: {
          userId: payload.id,
          foodItemId: foodItemId
        }
      }
    });

    if (existingFavorite) {
      // Jika sudah ada, hapus dari favorit
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id
        }
      });
      return NextResponse.json({ message: 'Dihapus dari favorit', isFavorited: false }, { status: 200 });
    } else {
      // Jika belum ada, tambahkan ke favorit
      const newFavorite = await prisma.favorite.create({
        data: {
          userId: payload.id,
          foodItemId: foodItemId
        }
      });
      return NextResponse.json({ message: 'Ditambahkan ke favorit', isFavorited: true, data: newFavorite }, { status: 201 });
    }
  } catch (error) {
    console.error('Error saat mengubah status favorit:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah status favorit' },
      { status: 500 }
    );
  }
}
