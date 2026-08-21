'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, ClipboardList, LogOut, ListPlus, Ticket } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Menu Makanan', href: '/admin/foods', icon: Utensils },
    { name: 'Kelola Topping', href: '/admin/toppings', icon: ListPlus },
    { name: 'Pesanan', href: '/admin/orders', icon: ClipboardList },
    { name: 'Voucher Promo', href: '/admin/vouchers', icon: Ticket },
  ];

  return (
    <div className="flex h-screen bg-brand-gray-50 dark:bg-brand-dark-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-brand-dark-900 border-r border-brand-gray-200 dark:border-brand-dark-800 flex flex-col transition-colors duration-300">
        <div className="h-16 flex items-center px-6 border-b border-brand-gray-200 dark:border-brand-dark-800">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl font-black text-brand-orange-600">
              Admin<span className="text-brand-dark-900 dark:text-white">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-brand-orange-50 dark:bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500' 
                    : 'text-brand-gray-500 dark:text-brand-gray-400 hover:bg-brand-gray-50 dark:hover:bg-brand-dark-800 hover:text-brand-dark-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-orange-600 dark:text-brand-orange-500' : 'text-brand-gray-400 dark:text-brand-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-brand-gray-200 dark:border-brand-dark-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-gray-500 dark:text-brand-gray-400 hover:bg-brand-gray-50 dark:hover:bg-brand-dark-800 hover:text-brand-dark-800 dark:hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 text-brand-gray-400 dark:text-brand-gray-500" />
            Kembali ke Toko
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-brand-dark-900 border-b border-brand-gray-200 dark:border-brand-dark-800 flex items-center justify-between px-8 z-10 transition-colors duration-300">
          <h1 className="text-xl font-bold text-brand-dark-900 dark:text-white">
            {navigation.find(n => n.href === pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-sm font-medium text-brand-dark-800 dark:text-brand-gray-200">
              <div className="w-8 h-8 rounded-full bg-brand-orange-100 dark:bg-brand-orange-500/20 flex items-center justify-center text-brand-orange-600 dark:text-brand-orange-400 font-bold">
                A
              </div>
              Administrator
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
