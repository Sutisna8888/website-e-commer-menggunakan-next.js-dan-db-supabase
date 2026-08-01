'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, role: string) => void;
  customMessage?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  customMessage
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem');
      }

      if (isLogin) {
        // Jika login berhasil
        onSuccess(data.user.email, data.user.role);
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
      } else {
        // Jika registrasi berhasil, otomatis arahkan ke tampilan login
        setIsLogin(true);
        setPassword('');
        setErrorMessage(null);
        // Tampilkan notifikasi kecil bahwa pendaftaran berhasil
        alert('Registrasi berhasil! Silakan masuk menggunakan akun baru Anda.');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal terhubung ke server';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-300 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-dark-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <span className="text-3xl font-extrabold tracking-tight text-brand-orange-600">
            Rasa<span className="text-brand-dark-900">Nusantara</span>
          </span>
          <h3 className="mt-4 text-xl font-black text-brand-dark-900">
            {isLogin ? 'Selamat Datang Kembali!' : 'Buat Akun Baru'}
          </h3>
          <p className="mt-2 text-xs text-brand-gray-500">
            {isLogin 
              ? 'Silakan masuk untuk menikmati layanan pemesanan makanan kami' 
              : 'Daftar sekarang dan mulailah berbelanja kuliner lezat'}
          </p>
          
          {/* Custom Message (e.g. from triggering a restricted action) */}
          {customMessage && !errorMessage && (
            <div className="mt-3 rounded-2xl bg-brand-orange-50 p-3 text-xs font-semibold text-brand-orange-700">
              {customMessage}
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 flex items-center gap-2 justify-center">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          
          {/* Name field (Sign Up only) */}
          {!isLogin && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-brand-gray-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap"
                className="w-full rounded-2xl border border-brand-gray-200 bg-brand-gray-50 py-3 pl-10 pr-4 text-sm text-brand-dark-900 placeholder-brand-gray-400 outline-none transition-all focus:border-brand-orange-500 focus:bg-white focus:ring-2 focus:ring-brand-orange-500/20"
              />
            </div>
          )}

          {/* Email field */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-brand-gray-400" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat Email"
              className="w-full rounded-2xl border border-brand-gray-200 bg-brand-gray-50 py-3 pl-10 pr-4 text-sm text-brand-dark-900 placeholder-brand-gray-400 outline-none transition-all focus:border-brand-orange-500 focus:bg-white focus:ring-2 focus:ring-brand-orange-500/20"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-brand-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata Sandi"
              className="w-full rounded-2xl border border-brand-gray-200 bg-brand-gray-50 py-3 pl-10 pr-4 text-sm text-brand-dark-900 placeholder-brand-gray-400 outline-none transition-all focus:border-brand-orange-500 focus:bg-white focus:ring-2 focus:ring-brand-orange-500/20"
            />
          </div>

          {/* Forgot Password link (Login only) */}
          {isLogin && (
            <div className="text-right">
              <a href="#" className="text-xs font-bold text-brand-orange-600 hover:text-brand-orange-700">
                Lupa Kata Sandi?
              </a>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange-600 py-3.5 text-sm font-bold text-white shadow-premium transition-all hover:bg-brand-orange-700 hover:shadow-premium-hover disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                {isLogin ? 'Masuk' : 'Daftar'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Auth Toggle */}
        <div className="mt-6 border-t border-brand-gray-100 pt-4 text-center">
          <p className="text-xs text-brand-gray-500">
            {isLogin ? 'Belum punya akun? ' : 'Sudah memiliki akun? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setName('');
                setErrorMessage(null);
              }}
              className="font-bold text-brand-orange-600 hover:text-brand-orange-700 transition-colors"
            >
              {isLogin ? 'Daftar Sekarang' : 'Masuk di Sini'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
