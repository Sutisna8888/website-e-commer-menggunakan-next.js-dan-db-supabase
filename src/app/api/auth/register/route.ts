import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    // Memeriksa jika user sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Alamat email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hashing password secara aman
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Membuat pengguna baru di database Supabase
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'USER', // Peran default adalah pelanggan
      },
    });

    return NextResponse.json(
      {
        message: 'Registrasi berhasil!',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saat registrasi:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan pendaftaran akun' },
      { status: 500 }
    );
  }
}
