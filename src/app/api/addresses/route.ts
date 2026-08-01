import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/addresses
 * Mengambil semua alamat milik pengguna yang sedang login
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

    // Ambil daftar alamat diurutkan dari alamat utama, lalu tanggal dibuat
    const addresses = await prisma.address.findMany({
      where: {
        userId: payload.id
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error saat mengambil daftar alamat:', error);
    return NextResponse.json(
      { error: 'Gagal memuat daftar alamat' },
      { status: 550 }
    );
  }
}

/**
 * POST /api/addresses
 * Membuat alamat pengiriman baru
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

    const { label, receiver, phone, detail, isPrimary } = await req.json();

    if (!label || !receiver || !phone || !detail) {
      return NextResponse.json(
        { error: 'Silakan lengkapi semua kolom alamat pengiriman' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Periksa apakah ini alamat pertama user
      const addressCount = await tx.address.count({
        where: { userId: payload.id }
      });

      const setAsPrimary = addressCount === 0 ? true : !!isPrimary;

      // Jika alamat ini diatur sebagai alamat utama, matikan status alamat utama lainnya
      if (setAsPrimary) {
        await tx.address.updateMany({
          where: { userId: payload.id },
          data: { isPrimary: false }
        });
      }

      // Simpan alamat baru ke database
      const newAddress = await tx.address.create({
        data: {
          userId: payload.id,
          label,
          receiver,
          phone,
          detail,
          isPrimary: setAsPrimary
        }
      });

      return newAddress;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error saat membuat alamat baru:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan alamat baru' },
      { status: 550 }
    );
  }
}
