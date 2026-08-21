'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Loader2, 
  DollarSign, 
  Star,
  ClipboardList,
  Utensils,
  Coffee,
  PieChart
} from 'lucide-react';
import Image from 'next/image';

interface Stats {
  totalRevenue: number;
  activeOrders: number;
  allOrders: number;
  totalCustomers: number;
  totalFoods: number;
  totalToppings: number;
  totalItemsSold: number;
  popularFoods: {
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
    soldCount: number;
  }[];
  recentOrders: {
    id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: { name: string; email: string };
  }[];
  chartData: { name: string; revenue: number; }[];
}

import RevenueChart from '@/components/RevenueChart';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Gagal mengambil data statistik');
        const data = await response.json();
        setStats(data);
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500 text-white';
      case 'PROCESSING': return 'bg-blue-500 text-white';
      case 'DELIVERING': return 'bg-indigo-500 text-white';
      case 'DELIVERED': return 'bg-green-500 text-white';
      case 'CANCELLED': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-12 h-12 text-brand-orange-500 animate-spin mb-4 drop-shadow-md" />
        <p className="text-brand-gray-500 font-medium animate-pulse">Menyiapkan Dashboard Pintar...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-600 p-6 rounded-3xl shadow-sm">
        <p className="font-bold text-lg">Error memuat data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Pendapatan',
      value: formatPrice(stats.totalRevenue),
      subtitle: 'Dari pesanan selesai',
      icon: DollarSign,
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/20',
      bgLight: 'bg-emerald-50'
    },
    {
      title: 'Item Terjual',
      value: `${stats.totalItemsSold} Porsi`,
      subtitle: 'Total makanan dipesan',
      icon: PieChart,
      color: 'bg-orange-500',
      shadow: 'shadow-orange-500/20',
      bgLight: 'bg-orange-50'
    },
    {
      title: 'Pesanan Aktif',
      value: stats.activeOrders.toString(),
      subtitle: `Dari total ${stats.allOrders} pesanan`,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      shadow: 'shadow-blue-500/20',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers.toString(),
      subtitle: 'Pengguna terdaftar',
      icon: Users,
      color: 'bg-purple-500',
      shadow: 'shadow-purple-500/20',
      bgLight: 'bg-purple-50'
    },
    {
      title: 'Total Menu',
      value: stats.totalFoods.toString(),
      subtitle: 'Katalog makanan',
      icon: Utensils,
      color: 'bg-rose-500',
      shadow: 'shadow-rose-500/20',
      bgLight: 'bg-rose-50'
    },
    {
      title: 'Total Topping',
      value: stats.totalToppings.toString(),
      subtitle: 'Opsi pelengkap',
      icon: Coffee,
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/20',
      bgLight: 'bg-amber-50'
    },
  ];

  return (
    <div className="relative space-y-8 -m-4 p-4 sm:-m-8 sm:p-8 min-h-[85vh] rounded-[2rem] overflow-hidden transition-colors duration-300">
      {/* Background Ornaments (Glassmorphism canvas) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-gray-50/50 dark:from-brand-dark-950 to-brand-orange-50/30 dark:to-brand-dark-900/50 -z-10 transition-colors duration-300" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-orange-400/10 dark:bg-brand-orange-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-dark-900 dark:text-white tracking-tight">Ikhtisar Bisnis ✨</h1>
        <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-2 font-medium">Pantau performa Rasa Nusantara hari ini.</p>
      </div>

      {/* Overview Cards (Glassmorphism) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className="group bg-white/70 dark:bg-brand-dark-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-brand-dark-800 hover:shadow-lg dark:hover:shadow-brand-dark-800/50 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-sm font-bold text-brand-gray-500 dark:text-brand-gray-400 mb-2 tracking-wide uppercase">{card.title}</p>
                  <h3 className="text-3xl font-black text-brand-dark-900 dark:text-white tracking-tighter">{card.value}</h3>
                  <p className="text-xs font-semibold text-brand-gray-400 dark:text-brand-gray-500 mt-3 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${card.color}`} />
                    {card.subtitle}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${card.bgLight} dark:bg-white/5 ${card.color.replace('bg-', 'text-')} shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
              </div>
              {/* Subtle gradient splash on hover */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${card.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`} />
            </div>
          );
        })}
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white/70 dark:bg-brand-dark-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-brand-dark-800 hover:shadow-md transition-shadow duration-300 mt-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-black text-brand-dark-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-6 h-6 text-brand-orange-500" />
              Tren Pendapatan Mingguan
            </h3>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 mt-1">Total pendapatan dalam 7 hari terakhir</p>
          </div>
        </div>
        <RevenueChart data={stats.chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">
        {/* Popular Items (Glassmorphism) */}
        <div className="lg:col-span-3 bg-white/70 dark:bg-brand-dark-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-brand-dark-800 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-brand-dark-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-orange-500" />
              Menu Terpopuler
            </h3>
          </div>
          <div className="space-y-3">
            {stats.popularFoods.map((food, i) => (
              <div key={food.id} className="group flex items-center gap-4 p-3 bg-white/40 dark:bg-brand-dark-800/40 hover:bg-white/80 dark:hover:bg-brand-dark-800/80 rounded-2xl border border-transparent hover:border-brand-gray-100 dark:hover:border-brand-dark-700 transition-all duration-300">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                  <Image src={food.imageUrl} alt={food.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-0 left-0 bg-gradient-to-br from-brand-dark-950 to-brand-dark-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-br-xl shadow-sm z-10">
                    #{i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-brand-dark-900 dark:text-white truncate text-base">{food.name}</h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-brand-gray-100 dark:bg-brand-dark-800 text-brand-gray-600 dark:text-brand-gray-300 rounded-full text-[10px] font-bold tracking-wide uppercase">
                    {food.category}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-brand-orange-600 dark:text-brand-orange-500">{formatPrice(food.price)}</p>
                  <div className="mt-1.5 px-2 py-0.5 bg-brand-gray-100 dark:bg-brand-dark-800 rounded-full inline-block">
                    <span className="text-[10px] font-semibold text-brand-gray-600 dark:text-brand-gray-300">Terjual: {food.soldCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders (Glassmorphism Light) */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-brand-dark-900/70 backdrop-blur-xl rounded-3xl p-6 shadow-sm border border-white/60 dark:border-brand-dark-800 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="text-xl font-black text-brand-dark-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-brand-orange-500" />
              Pesanan Terbaru
            </h3>
            <a href="/admin/orders" className="text-xs font-bold text-brand-orange-600 dark:text-brand-orange-500 hover:text-brand-orange-700 dark:hover:text-brand-orange-400 hover:underline">
              Lihat Semua
            </a>
          </div>
          
          <div className="space-y-3 relative z-10">
            {stats.recentOrders?.map(order => (
              <a href={`/admin/orders?search=${order.id}`} key={order.id} className="block p-3.5 bg-white/40 dark:bg-brand-dark-800/40 hover:bg-white/80 dark:hover:bg-brand-dark-800/80 backdrop-blur-md rounded-2xl border border-transparent hover:border-brand-gray-100 dark:hover:border-brand-dark-700 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-brand-dark-900 dark:text-white text-sm truncate">{order.user.name}</h4>
                    <p className="text-[10px] text-brand-gray-500 dark:text-brand-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-1 rounded-full tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-end mt-3 pt-3 border-t border-brand-gray-100 dark:border-brand-dark-700">
                  <span className="text-[10px] font-mono text-brand-gray-500 dark:text-brand-gray-400">ID: {order.id.slice(-6).toUpperCase()}</span>
                  <span className="font-black text-brand-orange-600 dark:text-brand-orange-500">{formatPrice(order.totalAmount)}</span>
                </div>
              </a>
            ))}
            
            {(!stats.recentOrders || stats.recentOrders.length === 0) && (
              <div className="text-center py-8">
                <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">Belum ada pesanan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
