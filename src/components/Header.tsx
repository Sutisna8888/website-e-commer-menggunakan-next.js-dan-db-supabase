'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, User, Menu, X, ClipboardList, Heart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';

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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-brand-dark-950/80 backdrop-blur-md shadow-sm border-brand-gray-100 dark:border-brand-dark-800' : 'bg-white dark:bg-brand-dark-950 border-transparent'} `}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4 sm:gap-8">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 text-white shadow-lg shadow-brand-orange-500/30">
                <span className="text-xl sm:text-2xl font-black italic tracking-tighter">RN</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight text-brand-dark-900 dark:text-white">Rasa Nusantara</h1>
                <p className="text-[10px] font-bold text-brand-gray-500 dark:text-brand-gray-400 tracking-widest uppercase">Citra Rasa Asli</p>
              </div>
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
                className="w-full rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-brand-gray-50 dark:bg-brand-dark-800 py-2 pl-10 pr-4 text-sm text-brand-dark-900 dark:text-white placeholder-brand-gray-400 dark:placeholder-brand-gray-500 outline-none transition-all focus:border-brand-orange-500 focus:bg-white dark:focus:bg-brand-dark-900 focus:ring-2 focus:ring-brand-orange-500/20"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Toggle for Mobile */}
            <button className="rounded-full p-2 text-brand-dark-800 dark:text-brand-gray-300 hover:bg-brand-gray-100 dark:hover:bg-brand-dark-800 md:hidden transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Favorite Button */}
            {userEmail && (
              <Link
                href="/favorites"
                className="relative rounded-full p-2 text-brand-dark-800 dark:text-brand-gray-300 transition-colors hover:bg-brand-gray-100 dark:hover:bg-brand-dark-800"
                title="Favorit Saya"
              >
                <Heart className="h-6 w-6" />
              </Link>
            )}

            {/* History Button */}
            {userEmail && (
              <button
                onClick={onHistoryClick}
                className="relative rounded-full p-2 text-brand-dark-800 dark:text-brand-gray-300 transition-colors hover:bg-brand-gray-100 dark:hover:bg-brand-dark-800"
                title="Riwayat Pesanan"
              >
                <ClipboardList className="h-6 w-6" />
              </button>
            )}
            
            <ThemeToggle />

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative rounded-full p-2 text-brand-dark-800 dark:text-brand-gray-300 transition-colors hover:bg-brand-gray-100 dark:hover:bg-brand-dark-800"
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
                  className="flex items-center gap-1.5 rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 p-1 pr-3 hover:bg-brand-gray-50 dark:hover:bg-brand-dark-700 transition-colors cursor-pointer"
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
                  <span className="text-xs font-bold text-brand-dark-900 dark:text-white truncate max-w-[80px]">
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
                    <div className="absolute right-0 top-11 z-20 w-44 rounded-2xl border border-brand-gray-150 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 p-2 shadow-xl animate-fade-in flex flex-col gap-0.5">
                      <a
                        href="/profile"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 dark:text-white hover:bg-brand-gray-50 dark:hover:bg-brand-dark-700 transition-colors"
                      >
                        👤 Profil Saya
                      </a>
                      <Link
                        href="/favorites"
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 dark:text-white hover:bg-brand-gray-50 dark:hover:bg-brand-dark-700 transition-colors"
                      >
                        ❤️ Favorit Saya
                      </Link>
                      {userRole === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-orange-600 dark:text-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-500/10 hover:bg-brand-orange-100 dark:hover:bg-brand-orange-500/20 transition-colors"
                        >
                          ⚙️ Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onHistoryClick();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-brand-dark-900 dark:text-white hover:bg-brand-gray-50 dark:hover:bg-brand-dark-700 transition-colors cursor-pointer"
                      >
                        ⏳ Riwayat Pesanan
                      </button>
                      <hr className="my-1 border-brand-gray-100 dark:border-brand-dark-700" />
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLoginClick();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
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
              className="rounded-full p-2 text-brand-dark-800 dark:text-brand-gray-300 hover:bg-brand-gray-100 dark:hover:bg-brand-dark-800 sm:hidden transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-brand-gray-100 dark:border-brand-dark-800 bg-white dark:bg-brand-dark-950 px-4 py-4 shadow-lg sm:hidden">
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
                className="w-full rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-brand-gray-50 dark:bg-brand-dark-800 py-2 pl-10 pr-4 text-sm text-brand-dark-900 dark:text-white outline-none"
              />
            </div>
            
            {/* Login Button Mobile */}
            {userEmail ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold text-brand-dark-900 dark:text-white">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange-100 dark:bg-brand-orange-500/20 font-bold text-brand-orange-700 dark:text-brand-orange-500">
                      {userEmail.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate">{userEmail}</span>
                </div>
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 py-2 text-sm font-semibold text-brand-dark-800 dark:text-brand-gray-300"
                >
                  <Heart className="h-4 w-4 text-brand-orange-600" />
                  Favorit Saya
                </Link>
                <button
                  onClick={() => {
                    onHistoryClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 py-2 text-sm font-semibold text-brand-dark-800 dark:text-brand-gray-300"
                >
                  <ClipboardList className="h-4 w-4 text-brand-orange-600" />
                  Riwayat Pesanan
                </button>
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 py-2 text-sm font-semibold text-brand-dark-800 dark:text-brand-gray-300"
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
