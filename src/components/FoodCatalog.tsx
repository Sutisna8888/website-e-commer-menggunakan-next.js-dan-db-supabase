'use client';

import React, { useState, useEffect } from 'react';
import FoodCard from './FoodCard';
import { FoodItem, FoodCategory } from '../types';
import { 
  UtensilsCrossed, 
  Loader2, 
  SlidersHorizontal, 
  RotateCcw 
} from 'lucide-react';

interface FoodCatalogProps {
  searchQuery: string;
  onOrderClick: (item: FoodItem) => void;
}

export default function FoodCatalog({ searchQuery, onOrderClick }: FoodCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('Semua');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Sorting States
  const [selectedSort, setSelectedSort] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [pricePreset, setPricePreset] = useState<'all' | 'under_20' | '20_35' | 'above_35'>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const categories: FoodCategory[] = ['Semua', 'Makanan Utama', 'Cemilan', 'Minuman', 'Sehat'];

  useEffect(() => {
    async function fetchFoods() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'Semua') {
          queryParams.append('category', selectedCategory);
        }
        if (searchQuery) {
          queryParams.append('search', searchQuery);
        }

        const response = await fetch(`/api/foods?${queryParams.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setFoodItems(data);
        } else {
          console.error('Gagal mengambil data dari API');
        }
      } catch (error) {
        console.error('Error saat fetch makanan:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Ambil status favorit dari API
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          // Ekstrak list foodItemId
          const favIds = data.map((fav: { foodItemId: string }) => fav.foodItemId);
          setFavoriteIds(favIds);
        }
      } catch (error) {
        console.error('Error saat fetch favorites:', error);
      }
    }

    // Debounce pencarian 300ms agar tidak membebani database Supabase
    const delayDebounceFn = setTimeout(() => {
      fetchFoods();
      fetchFavorites();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategory, searchQuery]);

  // Handle toggle favorite
  const handleToggleFavorite = async (e: React.MouseEvent, item: FoodItem) => {
    e.stopPropagation(); // Mencegah klik menyebar ke card (yang akan memicu onOrderClick)

    // Optimistic UI Update
    const isCurrentlyFavorited = favoriteIds.includes(item.id);
    if (isCurrentlyFavorited) {
      setFavoriteIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      setFavoriteIds((prev) => [...prev, item.id]);
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItemId: item.id })
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Silakan login terlebih dahulu untuk menyimpan makanan favorit Anda.');
        } else {
          console.error('Gagal toggle favorite');
        }
        // Rollback state on error
        if (isCurrentlyFavorited) {
          setFavoriteIds((prev) => [...prev, item.id]);
        } else {
          setFavoriteIds((prev) => prev.filter((id) => id !== item.id));
        }
      }
    } catch (error) {
      console.error('Network error toggle favorite:', error);
      // Rollback
      if (isCurrentlyFavorited) {
        setFavoriteIds((prev) => [...prev, item.id]);
      } else {
        setFavoriteIds((prev) => prev.filter((id) => id !== item.id));
      }
    }
  };

  // Handle preset price changes
  const handlePresetPriceChange = (preset: 'all' | 'under_20' | '20_35' | 'above_35') => {
    setPricePreset(preset);
    if (preset === 'all') {
      setMinPrice('');
      setMaxPrice('');
    } else if (preset === 'under_20') {
      setMinPrice('');
      setMaxPrice('20000');
    } else if (preset === '20_35') {
      setMinPrice('20000');
      setMaxPrice('35000');
    } else if (preset === 'above_35') {
      setMinPrice('35000');
      setMaxPrice('');
    }
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    setPricePreset('all'); // Reset preset ke kustom
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    setPricePreset('all'); // Reset preset ke kustom
  };

  const handleResetFilters = () => {
    setSelectedSort('popular');
    setMinPrice('');
    setMaxPrice('');
    setPricePreset('all');
  };

  // Saring dan urutkan makanan secara instan di sisi klien
  const processedFoods = foodItems
    .filter((food) => {
      // 1. Filter Rentang Harga
      if (minPrice !== '') {
        const minVal = parseInt(minPrice);
        if (!isNaN(minVal) && food.price < minVal) {
          return false;
        }
      }
      if (maxPrice !== '') {
        const maxVal = parseInt(maxPrice);
        if (!isNaN(maxVal) && food.price > maxVal) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === 'price_asc') {
        return a.price - b.price;
      }
      if (selectedSort === 'price_desc') {
        return b.price - a.price;
      }
      // default: popular (soldCount terlebih dahulu, lalu diurutkan berdasarkan jumlah ulasan)
      const soldA = a.soldCount || 0;
      const soldB = b.soldCount || 0;
      if (soldA !== soldB) {
        return soldB - soldA;
      }
      return b.reviewsCount - a.reviewsCount;
    });

  const hasActiveFilters = minPrice !== '' || maxPrice !== '';

  return (
    <section id="menu-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      
      {/* Title Section */}
      <div className="flex flex-col items-center text-center">
        <h2 className="text-3xl font-black tracking-tight text-brand-dark-950 sm:text-4xl">
          Jelajahi Menu Terlezat Kami
        </h2>
        <div className="mt-2 h-1 w-16 rounded-full bg-brand-orange-500"></div>
        <p className="mt-4 max-w-2xl text-sm text-brand-gray-500 sm:text-base">
          Pilih dari berbagai macam hidangan khas Nusantara yang disiapkan oleh koki berpengalaman kami dengan bahan-bahan segar pilihan.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              handleResetFilters(); // Reset filter saat ganti kategori
            }}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-brand-orange-600 text-white shadow-premium'
                : 'bg-brand-gray-100 text-brand-dark-800 hover:bg-brand-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Control Row: Filter Toggle & Sort Select */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-b border-brand-gray-100 py-4.5">
        
        {/* Toggle Filter Button */}
        <button
          onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold border transition-all duration-300 cursor-pointer ${
            isFilterPanelOpen || hasActiveFilters
              ? 'border-brand-orange-500 bg-brand-orange-50/20 text-brand-orange-600'
              : 'border-brand-gray-200 bg-white text-brand-gray-600 hover:bg-brand-gray-55'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter & Rentang Harga
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange-600 text-[10px] font-black text-white ml-1 animate-pulse">
              !
            </span>
          )}
        </button>

        {/* Sort Selector */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs font-bold text-brand-gray-400">Urutkan:</span>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as 'popular' | 'price_asc' | 'price_desc')}
            className="rounded-2xl border border-brand-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-dark-900 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20 cursor-pointer min-w-[200px]"
          >
            <option value="popular">Paling Populer</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>

      </div>

      {/* Collapsible Filter Panel */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isFilterPanelOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="rounded-3xl border border-brand-gray-100 bg-brand-gray-50/35 p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Price Presets */}
          <div>
            <h4 className="text-xs font-black text-brand-dark-900 uppercase tracking-wider">Pilihan Cepat Harga</h4>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {(
                [
                  { label: 'Semua Harga', value: 'all' },
                  { label: '< Rp 20rb', value: 'under_20' },
                  { label: 'Rp 20rb - Rp 35rb', value: '20_35' },
                  { label: '> Rp 35rb', value: 'above_35' }
                ] as const
              ).map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetPriceChange(preset.value)}
                  className={`rounded-full px-4.5 py-2.5 text-xs font-bold border transition-colors cursor-pointer ${
                    pricePreset === preset.value
                      ? 'bg-brand-orange-600 text-white border-brand-orange-600 shadow-sm'
                      : 'bg-white text-brand-gray-500 border-brand-gray-200 hover:bg-brand-gray-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Option (Custom) */}
          <div>
            <h4 className="text-xs font-black text-brand-dark-900 uppercase tracking-wider">Batasi Nominal Harga (Kustom)</h4>
            
            {/* Custom Range Inputs */}
            <div className="mt-3.5 flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                placeholder="Min Harga"
                className="w-full rounded-2xl border border-brand-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-dark-900 placeholder-brand-gray-400 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20"
              />
              <span className="text-brand-gray-300 text-xs shrink-0">s/d</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                placeholder="Max Harga"
                className="w-full rounded-2xl border border-brand-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-dark-900 placeholder-brand-gray-400 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20"
              />
              
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="rounded-2xl border border-brand-gray-200 bg-white p-3 text-brand-gray-400 hover:text-brand-orange-600 transition-colors cursor-pointer shrink-0"
                  title="Atur Ulang Filter"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="mt-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange-500" />
          <p className="text-sm font-semibold text-brand-gray-500">Memuat hidangan lezat...</p>
        </div>
      ) : processedFoods.length > 0 ? (
        /* Food Grid */
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {processedFoods.map((item) => (
            <FoodCard 
              key={item.id} 
              item={item} 
              onOrderClick={onOrderClick} 
              isFavorited={favoriteIds.includes(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange-50 text-brand-orange-600">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-lg font-bold text-brand-dark-900">Menu Tidak Ditemukan</h3>
          <p className="mt-2.5 max-w-sm text-xs text-brand-gray-500 leading-relaxed px-4">
            {searchQuery 
              ? `Maaf, kami tidak dapat menemukan makanan "${searchQuery}" dengan kriteria filter tersebut. Coba ketik menu lain!`
              : 'Tidak ada makanan yang cocok dengan kriteria filter yang Anda pilih. Coba atur ulang filter Anda!'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-6 rounded-2xl bg-brand-dark-900 px-6 py-3.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-600 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Atur Ulang Filter
            </button>
          )}
        </div>
      )}
    </section>
  );
}
