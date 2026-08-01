import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, signJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET: Mendapatkan data sesi user aktif
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Sesi tidak ditemukan / belum login' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(sessionCookie.value);

    if (!payload) {
      // Jika token tidak valid / kedaluwarsa, hapus cookie
      cookieStore.delete('session');
      return NextResponse.json(
        { error: 'Sesi tidak valid atau kedaluwarsa' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error('Error saat mengecek sesi me:', error);
    return NextResponse.json(
      { error: 'Gagal memeriksa status sesi' },
      { status: 500 }
    );
  }
}

/**
 * POST: Menghapus cookie sesi (Logout)
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      message: 'Berhasil keluar (logout)!',
    });
  } catch (error) {
    console.error('Error saat logout:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan logout' },
      { status: 500 }
    );
  }
}

/**
 * PUT: Memperbarui nama lengkap profil pengguna
 */
export async function PUT(req: Request) {
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

    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nama tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Perbarui nama di database Supabase
    const updatedUser = await prisma.user.update({
      where: { id: payload.id },
      data: { name: name.trim() }
    });

    // Buat token JWT baru dengan data nama ter-update
    const token = await signJWT({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    });

    // Perbarui cookie sesi aktif
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/'
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Error saat memperbarui nama user me:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil pengguna' },
      { status: 500 }
    );
  }
}
