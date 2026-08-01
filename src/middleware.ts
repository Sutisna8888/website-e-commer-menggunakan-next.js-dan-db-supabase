import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Secret key yang sama dengan auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'RasaNusantaraSuperSecretKey123!@#';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  // Hanya jalankan middleware ini untuk path yang dimulai dengan /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      // Tidak ada token, redirect ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verifikasi token
      const { payload } = await jwtVerify(token, secretKey);
      
      // Cek apakah rolenya ADMIN
      if (payload.role !== 'ADMIN') {
        // Bukan admin, redirect ke beranda
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // Jika role ADMIN, izinkan akses
      return NextResponse.next();
    } catch (error) {
      // Token tidak valid atau kedaluwarsa
      console.error('Middleware JWT Error:', error);
      // Hapus cookie yang tidak valid dan redirect ke login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// Tentukan path mana saja yang akan diproses oleh middleware ini
export const config = {
  matcher: ['/admin/:path*'],
};
