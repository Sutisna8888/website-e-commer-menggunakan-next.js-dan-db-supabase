'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, ClipboardList, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onHistoryClick: () => void;
  cartItemsCount: number;
  userEmail: string | null;
  userRole?: string | null;
}

export default function Header({
  onSearch,
  onCartClick,
  onLoginClick,
  onHistoryClick,
  cartItemsCount,
  userEmail,
  userRole
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch avatar saat user sudah login
  useEffect(() => {
    if (userEmail) {
      fetch('/api/auth/avatar')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.avatar) setAvatarUrl(data.avatar);
          else setAvatarUrl(null);
        })
        .catch(() => {});
    } else {
      setTimeout(() => setAvatarUrl(null), 0);
    }
  }, [userEmail]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-gray-100 bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-brand-orange-600 sm:text-3xl">
                Rasa<span className="text-brand-dark-900">Nusantara</span>
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden max-w-md flex-1 md:block">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-brand-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari makanan favoritmu..."
                className="w-full rounded-full border border-brand-gray-200 bg-brand-gray-50 py-2 pl-10 pr-4 text-sm text-brand-dark-900 placeholder-brand-gray-400 outline-none transition-all focus:border-brand-orange-500 focus:bg-white focus:ring-2 focus:ring-brand-orange-500/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle for Mobile */}
            <button className="rounded-full p-2 text-brand-dark-800 hover:bg-brand-gray-100 md:hidden">
              <Search className="h-5 w-5" />
            </button>

            {/* Favorite Button */}
            {userEmail && (
              <Link
                href="/favorites"
                className="relative rounded-full p-2 text-brand-dark-800 transition-colors hover:bg-brand-gray-100"
                title="Favorit Saya"
              >
                <Heart className="h-6 w-6" />
              </Link>
            )}

            {/* History Button */}
            {userEmail && (
              <button
                onClick={onHistoryClick}
                className="relative rounded-full p-2 text-brand-dark-800 transition-colors hover:bg-brand-gray-100"
                title="Riwayat Pesanan"
              >
                <ClipboardList className="h-6 w-6" />
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative rounded-full p-2 text-brand-dark-800 transition-colors hover:bg-brand-gray-100"
            >
              <ShoppingBag className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange-600 text-xs font-bold text-white ring-2 ring-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Login / User Profile Dropdown Button */}
            {userEmail ? (
              <div className="relative hidden items-center gap-3 sm:flex">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full border border-brand-gray-200 bg-white p-1 pr-3 hover:bg-brand-gray-50 transition-colors cursor-pointer"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange-600 font-bold text-white shadow-sm text-xs">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-bold text-brand-dark-900 truncate max-w-[80px]">
                    {userEmail.split('@')[0]}
                  </span>
                </button>

                {isDropdownOpen && (
                  <>
                    {/* Click backdrop to close */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-brand-gray-150 bg-white p-2 shadow-xl animate-fade-in flex flex-col gap-0.5">
                      <a
                        href="/profile"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 hover:bg-brand-gray-50 transition-colors"
                      >
                        👤 Profil Saya
                      </a>
                      <Link
                        href="/favorites"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 hover:bg-brand-gray-50 transition-colors"
                      >
                        ❤️ Favorit Saya
                      </Link>
                      {userRole === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-orange-600 bg-brand-orange-50 hover:bg-brand-orange-100 transition-colors"
                        >
                          ⚙️ Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onHistoryClick();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 hover:bg-brand-gray-50 transition-colors cursor-pointer"
                      >
                        ⏳ Riwayat Pesanan
                      </button>
                      <hr className="my-1 border-brand-gray-100" />
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLoginClick();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        🚪 Keluar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="hidden items-center gap-2 rounded-full bg-brand-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-premium transition-all hover:bg-brand-orange-700 hover:shadow-premium-hover sm:flex"
              >
                <User className="h-4 w-4" />
                Masuk
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full p-2 text-brand-dark-800 hover:bg-brand-gray-100 sm:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-brand-gray-100 bg-white px-4 py-4 shadow-lg sm:hidden">
          <div className="flex flex-col gap-4">
            {/* Search Input for Mobile */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-brand-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari makanan..."
                className="w-full rounded-full border border-brand-gray-200 bg-brand-gray-50 py-2 pl-10 pr-4 text-sm text-brand-dark-900 outline-none"
              />
            </div>
            
            {/* Login Button Mobile */}
            {userEmail ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-brand-dark-900">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange-100 font-bold text-brand-orange-700">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate">{userEmail}</span>
                </div>
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 bg-white py-2 text-sm font-semibold text-brand-dark-800"
                >
                  <Heart className="h-4 w-4 text-brand-orange-600" />
                  Favorit Saya
                </Link>
                <button
                  onClick={() => {
                    onHistoryClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 bg-white py-2 text-sm font-semibold text-brand-dark-800"
                >
                  <ClipboardList className="h-4 w-4 text-brand-orange-600" />
                  Riwayat Pesanan
                </button>
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 bg-white py-2 text-sm font-semibold text-brand-dark-800"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setIsMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange-600 py-2.5 text-sm font-semibold text-white"
              >
                <User className="h-4 w-4" />
                Masuk
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
