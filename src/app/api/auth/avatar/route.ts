import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Batas ukuran file avatar: 500KB (setelah di-encode base64, sekitar ~667KB)
const MAX_AVATAR_SIZE = 500 * 1024;

/**
 * PUT /api/auth/avatar
 * Upload atau update foto profil (disimpan sebagai base64 di database)
 */
export async function PUT(req: NextRequest) {
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

    const { avatar } = await req.json();

    // Validasi: Jika avatar adalah null, berarti user ingin menghapus foto profil
    if (avatar === null) {
      await prisma.user.update({
        where: { id: payload.id },
        data: { avatar: null }
      });
      return NextResponse.json({ message: 'Foto profil berhasil dihapus', avatar: null });
    }

    // Validasi format base64 (harus diawali data:image/)
    if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Format gambar tidak valid. Gunakan format JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // Validasi ukuran file
    const base64Data = avatar.split(',')[1] || '';
    const fileSizeBytes = Math.ceil((base64Data.length * 3) / 4);
    if (fileSizeBytes > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file terlalu besar. Maksimum ${MAX_AVATAR_SIZE / 1024}KB.` },
        { status: 400 }
      );
    }

    // Simpan avatar ke database
    await prisma.user.update({
      where: { id: payload.id },
      data: { avatar }
    });

    return NextResponse.json({
      message: 'Foto profil berhasil diperbarui!',
      avatar
    });
  } catch (error) {
    console.error('Error saat mengubah avatar:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui foto profil' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/avatar
 * Mengambil foto profil user yang sedang login
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Belum login' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(sessionCookie.value);
    if (!payload) {
      return NextResponse.json(
        { error: 'Sesi tidak valid' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { avatar: true }
    });

    return NextResponse.json({ avatar: user?.avatar || null });
  } catch (error) {
    console.error('Error saat mengambil avatar:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil foto profil' },
      { status: 500 }
    );
  }
}
