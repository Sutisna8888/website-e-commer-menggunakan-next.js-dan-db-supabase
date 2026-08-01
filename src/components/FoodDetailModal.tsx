'use client';

import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Flame, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { FoodItem, CartItem } from '../types';

interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  foodItem: FoodItem | null;
  onAddToCart: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity: number }) => void;
}

interface ToppingOption {
  name: string;
  price: number;
}

export default function FoodDetailModal({
  isOpen,
  onClose,
  foodItem,
  onAddToCart
}: FoodDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
  const [spiceLevel, setSpiceLevel] = useState('Sedang');
  const [notes, setNotes] = useState('');

  // Reset inputs when modal opens/changes food item
  useEffect(() => {
    if (isOpen && foodItem) {
      setTimeout(() => {
        setQuantity(1);
        setSelectedToppings([]);
        setNotes('');
        
        // Atur default level berdasarkan database jika ada, atau kategori
        const dbVariant = foodItem.variants && foodItem.variants.length > 0 ? foodItem.variants[0] : null;
        if (dbVariant) {
          setSpiceLevel(dbVariant.defaultValue);
        } else if (foodItem.category === 'Minuman') {
          setSpiceLevel('Manis Normal');
        } else if (foodItem.category === 'Cemilan') {
          setSpiceLevel('');
        } else {
          setSpiceLevel('Sedang');
        }
      }, 0);
    }
  }, [isOpen, foodItem]);

  if (!isOpen || !foodItem) return null;

  // Menentukan opsi kustomisasi secara dinamis dari database (atau fallback berbasis kategori)
  const dbVariant = foodItem.variants && foodItem.variants.length > 0 ? foodItem.variants[0] : null;
  const isDrink = foodItem.category === 'Minuman';
  const isSnack = foodItem.category === 'Cemilan';

  const variantTitle = dbVariant 
    ? dbVariant.name 
    : isDrink 
    ? 'Pilih Tingkat Kemanisan' 
    : isSnack 
    ? '' 
    : 'Pilih Tingkat Kepedasan';

  const variantOptions = dbVariant
    ? dbVariant.options.split(',')
    : isDrink 
    ? ['Tanpa Gula', 'Sedikit Gula', 'Manis Normal'] 
    : isSnack 
    ? [] 
    : ['Tidak Pedas', 'Sedang', 'Pedas', 'Sangat Pedas'];

  const toppingOptions: ToppingOption[] = foodItem.toppings && foodItem.toppings.length > 0
    ? foodItem.toppings.map((t) => ({ name: t.name, price: t.price }))
    : [];

  const handleToppingChange = (topping: ToppingOption) => {
    setSelectedToppings((prev) => {
      const exists = prev.find((t) => t.name === topping.name);
      if (exists) {
        return prev.filter((t) => t.name !== topping.name);
      } else {
        return [...prev, topping];
      }
    });
  };

  // Calculate dynamic price based on selected toppings
  const toppingsPrice = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const customPrice = foodItem.price + toppingsPrice;
  const totalPrice = customPrice * quantity;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToCart({
      foodItem,
      quantity,
      selectedToppings,
      spiceLevel,
      notes,
      customPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-[800px] transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 flex flex-col md:flex-row md:h-[580px] max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full p-2 bg-white/80 backdrop-blur-sm text-brand-dark-900 shadow-md hover:bg-brand-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Product Image & Quick Info */}
        <div className="relative w-full md:w-1/2 h-[220px] md:h-full bg-brand-gray-50 flex-shrink-0">
          <Image
            src={foodItem.imageUrl}
            alt={foodItem.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
          
          {/* Tag Category (Mobile only overlay) */}
          <span className="absolute top-4 left-4 rounded-full bg-brand-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg">
            {foodItem.category}
          </span>
        </div>

        {/* Right Side: Options Form (Scrollable) */}
        <div className="w-full md:w-1/2 flex flex-col h-[400px] md:h-full overflow-hidden p-5 md:p-7">
          <div className="flex-1 overflow-y-auto pr-1">
            
            {/* Title & Info */}
            <span className="hidden md:inline-block rounded-full bg-brand-orange-50 px-3 py-1 text-xs font-bold text-brand-orange-700">
              {foodItem.category}
            </span>
            <h2 className="mt-1 text-xl font-black text-brand-dark-900 leading-tight">
              {foodItem.name}
            </h2>
            


            <p className="mt-3 text-[11px] leading-relaxed text-brand-gray-500">
              {foodItem.description}
            </p>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
              {/* Spice/Sweetness Level Selector */}
              {variantOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-brand-dark-900 flex items-center gap-1.5">
                    {isDrink ? (
                      <Sparkles className="h-4.5 w-4.5 text-brand-orange-600 fill-brand-orange-50" />
                    ) : (
                      <Flame className="h-4.5 w-4.5 text-brand-orange-600 fill-brand-orange-50" />
                    )}
                    {variantTitle}
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {variantOptions.map((level) => (
                      <label
                        key={level}
                        className={`flex items-center justify-center cursor-pointer rounded-full px-5 py-2 text-xs font-bold border transition-all duration-300 ${
                          spiceLevel === level
                            ? 'border-brand-orange-500 bg-brand-orange-50 text-brand-orange-700 shadow-sm'
                            : 'border-brand-gray-200 bg-white text-brand-gray-500 hover:bg-brand-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="spiceLevel"
                          value={level}
                          checked={spiceLevel === level}
                          onChange={() => setSpiceLevel(level)}
                          className="sr-only"
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings Selector */}
              {toppingOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-brand-dark-900">Topping Tambahan (Opsional)</h4>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {toppingOptions.map((topping) => {
                      const isSelected = selectedToppings.some((t) => t.name === topping.name);
                      return (
                        <label
                          key={topping.name}
                          className={`flex items-center justify-between cursor-pointer rounded-2xl p-3.5 border transition-all duration-300 ${
                            isSelected
                              ? 'border-brand-orange-500 bg-brand-orange-50/30'
                              : 'border-brand-gray-100 bg-white hover:bg-brand-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToppingChange(topping)}
                              className="h-4.5 w-4.5 rounded border-brand-gray-300 text-brand-orange-600 focus:ring-brand-orange-500/20"
                            />
                            <span className="text-xs font-bold text-brand-dark-900">{topping.name}</span>
                          </div>
                          <span className="text-xs font-black text-brand-orange-600">
                            +{formatPrice(topping.price)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cook Notes */}
              <div>
                <h4 className="text-sm font-bold text-brand-dark-900">Catatan Khusus Koki</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: daun bawang dipisah, sambal sedikit, kuah dibanyakin, dll."
                  className="mt-2.5 w-full rounded-2xl border border-brand-gray-200 p-3 text-xs text-brand-dark-900 placeholder-brand-gray-400 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20 resize-none h-20"
                />
              </div>
            </form>

          </div>

          {/* Sticky Footer: Quantity Selector & Add To Cart Button */}
          <div className="border-t border-brand-gray-100 pt-5 mt-4 flex items-center justify-between gap-4">
            
            {/* Quantity Selector */}
            <div className="flex items-center rounded-full bg-brand-gray-100 p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-dark-800 hover:bg-white transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-black text-brand-dark-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-dark-800 hover:bg-white transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleSubmit}
              className="flex-1 group flex items-center justify-center gap-2 rounded-2xl bg-brand-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 hover:shadow-premium-hover transition-all whitespace-nowrap"
            >
              <ShoppingCart className="h-4 w-4" />
              Tambah — {formatPrice(totalPrice)}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
