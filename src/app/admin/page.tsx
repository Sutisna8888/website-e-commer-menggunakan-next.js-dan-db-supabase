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
  Utensils
} from 'lucide-react';
import Image from 'next/image';

interface Stats {
  totalRevenue: number;
  activeOrders: number;
  allOrders: number;
  totalCustomers: number;
  popularFoods: {
    id: string;
    name: string;
    category: string;
    price: number;
    imageUrl: string;
    rating: number;
    reviewsCount: number;
  }[];
}

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-brand-orange-500 animate-spin mb-4" />
        <p className="text-brand-gray-500">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl">
        <p className="font-bold">Error memuat data</p>
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
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Pesanan Aktif',
      value: stats.activeOrders.toString(),
      subtitle: `Dari total ${stats.allOrders} pesanan`,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers.toString(),
      subtitle: 'Pengguna terdaftar',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-gray-500 mb-1">{card.title}</p>
                  <h3 className="text-2xl font-black text-brand-dark-900">{card.value}</h3>
                  <p className="text-xs text-brand-gray-400 mt-2">{card.subtitle}</p>
                </div>
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Popular Items */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-brand-dark-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-orange-500" />
              Menu Terpopuler
            </h3>
          </div>
          <div className="space-y-4">
            {stats.popularFoods.map((food, i) => (
              <div key={food.id} className="flex items-center gap-4 p-3 hover:bg-brand-gray-50 rounded-2xl transition-colors">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={food.imageUrl} alt={food.name} fill className="object-cover" />
                  <div className="absolute top-0 left-0 bg-brand-dark-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
                    #{i + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-brand-dark-900 truncate">{food.name}</h4>
                  <p className="text-xs text-brand-gray-500 truncate">{food.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-brand-orange-600">{formatPrice(food.price)}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-semibold text-brand-dark-800">{food.rating}</span>
                    <span className="text-[10px] text-brand-gray-400">({food.reviewsCount})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Placeholder) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-gray-100">
          <h3 className="text-lg font-bold text-brand-dark-900 flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-brand-orange-500" />
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/foods" className="p-4 bg-brand-orange-50 rounded-2xl border border-brand-orange-100 hover:bg-brand-orange-100 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Utensils className="w-5 h-5 text-brand-orange-600" />
              </div>
              <h4 className="font-bold text-brand-dark-900 text-sm">Kelola Menu</h4>
              <p className="text-xs text-brand-gray-500 mt-1">Tambah atau edit menu makanan</p>
            </a>
            <a href="/admin/orders" className="p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-bold text-brand-dark-900 text-sm">Cek Pesanan</h4>
              <p className="text-xs text-brand-gray-500 mt-1">Pantau pesanan yang masuk</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


