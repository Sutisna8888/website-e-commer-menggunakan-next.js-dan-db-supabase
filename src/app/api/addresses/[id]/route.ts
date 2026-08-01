import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/addresses/[id]
 * Mengedit detail alamat pengiriman tertentu
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Periksa apakah alamat tersebut ada dan milik pengguna yang sedang login
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== payload.id) {
      return NextResponse.json(
        { error: 'Alamat tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      let setAsPrimary = !!isPrimary;

      // Jika alamat ini sebelumnya adalah alamat utama dan user mencoba menonaktifkannya,
      // periksa apakah user memiliki alamat lain. Jika tidak, tetap paksa alamat ini sebagai utama.
      if (existingAddress.isPrimary && !isPrimary) {
        const addressCount = await tx.address.count({
          where: { userId: payload.id }
        });
        if (addressCount <= 1) {
          setAsPrimary = true;
        }
      }

      // Jika diset sebagai alamat utama, nonaktifkan status utama pada alamat lain
      if (setAsPrimary) {
        await tx.address.updateMany({
          where: {
            userId: payload.id,
            id: { not: id }
          },
          data: { isPrimary: false }
        });
      }

      // Perbarui data alamat
      const updatedAddress = await tx.address.update({
        where: { id },
        data: {
          label,
          receiver,
          phone,
          detail,
          isPrimary: setAsPrimary
        }
      });

      return updatedAddress;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saat memperbarui alamat:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui alamat pengiriman' },
      { status: 550 }
    );
  }
}

/**
 * DELETE /api/addresses/[id]
 * Menghapus alamat pengiriman tertentu
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    // Periksa apakah alamat tersebut ada dan milik pengguna yang sedang login
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    });

    if (!existingAddress || existingAddress.userId !== payload.id) {
      return NextResponse.json(
        { error: 'Alamat tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Hapus alamat target
      await tx.address.delete({
        where: { id }
      });

      // Jika alamat yang dihapus adalah alamat utama, jadikan salah satu alamat tersisa sebagai utama
      if (existingAddress.isPrimary) {
        const remainingAddress = await tx.address.findFirst({
          where: { userId: payload.id },
          orderBy: { createdAt: 'desc' }
        });

        if (remainingAddress) {
          await tx.address.update({
            where: { id: remainingAddress.id },
            data: { isPrimary: true }
          });
        }
      }
    });

    return NextResponse.json({
      message: 'Alamat pengiriman berhasil dihapus'
    });
  } catch (error) {
    console.error('Error saat menghapus alamat:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus alamat pengiriman' },
      { status: 550 }
    );
  }
}
