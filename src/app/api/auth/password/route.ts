import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * PUT /api/auth/password
 * Mengubah password akun pengguna yang sedang login
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

    const { currentPassword, newPassword } = await req.json();

    // Validasi input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'Password baru tidak boleh sama dengan password lama' },
        { status: 400 }
      );
    }

    // Ambil data user dari database untuk memverifikasi password lama
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Akun pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verifikasi password lama
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Password lama Anda salah. Silakan coba lagi.' },
        { status: 403 }
      );
    }

    // Hash password baru dan simpan ke database
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: payload.id },
      data: { password: hashedNewPassword }
    });

    return NextResponse.json({
      message: 'Password berhasil diubah! Silakan gunakan password baru Anda saat login berikutnya.'
    });
  } catch (error) {
    console.error('Error saat mengubah password:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password akun' },
      { status: 500 }
    );
  }
}
