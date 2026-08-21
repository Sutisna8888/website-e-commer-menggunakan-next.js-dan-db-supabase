'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  item: FoodItem;
  onOrderClick: (item: FoodItem) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, item: FoodItem) => void;
}

export default function FoodCard({ item, onOrderClick, isFavorited = false, onToggleFavorite }: FoodCardProps) {
  // Format price to IDR Currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div 
      onClick={() => onOrderClick(item)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white dark:bg-brand-dark-900 border border-brand-gray-100 dark:border-brand-dark-800 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium-hover"
    >
      
      {/* Food Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-brand-gray-50 dark:bg-brand-dark-800">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Popular Tag */}
        {(item.soldCount ?? 0) > 0 && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-brand-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
            🔥 Terjual {item.soldCount}+
          </span>
        )}
        
        {/* Favorite Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => onToggleFavorite(e, item)}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-transform hover:scale-110 active:scale-95"
            aria-label="Tandai Favorit"
          >
            <Heart 
              className={`h-5 w-5 transition-colors duration-300 ${
                isFavorited ? 'fill-red-500 text-red-500' : 'text-brand-gray-500 hover:text-red-400'
              }`} 
            />
          </button>
        )}
      </div>

      {/* Food Details */}
      <div className="p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-orange-600">
          {item.category}
        </span>
        
        <h3 className="mt-1 line-clamp-1 text-lg font-bold text-brand-dark-900 dark:text-white group-hover:text-brand-orange-600 transition-colors">
          {item.name}
        </h3>
        
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-brand-gray-500 dark:text-brand-gray-400">
          {item.description}
        </p>



        {/* Price & Action */}
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-brand-gray-100 dark:border-brand-dark-800 pt-4">
          <div>
            <p className="text-[10px] text-brand-gray-400">Harga</p>
            <p className="text-lg font-black text-brand-orange-600">
              {formatPrice(item.price)}
            </p>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOrderClick(item);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-dark-900 dark:bg-brand-gray-100 text-white dark:text-brand-dark-900 transition-all hover:bg-brand-orange-600 dark:hover:bg-brand-orange-500 hover:shadow-premium-hover"
            aria-label="Tambah ke keranjang"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
