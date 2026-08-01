'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  if (!isOpen) return null;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.customPrice * item.quantity, 0);
  const shippingFee = subtotal > 50000 ? 0 : subtotal > 0 ? 12000 : 0;
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + shippingFee + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white shadow-2xl flex flex-col h-full transition-all duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-gray-100 px-6 py-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-brand-orange-600" />
              <h2 className="text-xl font-black text-brand-dark-900">Keranjang Belanja</h2>
              <span className="rounded-full bg-brand-orange-50 px-2.5 py-0.5 text-xs font-bold text-brand-orange-700">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-dark-900 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Cart items list (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length > 0 ? (
              <div className="divide-y divide-brand-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex py-5 gap-4">
                    
                    {/* Item Image */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-brand-gray-100 bg-brand-gray-50">
                      <Image
                        src={item.foodItem.imageUrl}
                        alt={item.foodItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-sm font-bold text-brand-dark-900">
                          <h3 className="line-clamp-1">{item.foodItem.name}</h3>
                          <p className="ml-4 text-brand-orange-600">
                            {formatPrice(item.customPrice * item.quantity)}
                          </p>
                        </div>
                        
                        {/* Customization Badges */}
                        <div className="mt-1 flex flex-col gap-0.5 text-[10px] font-bold text-brand-gray-500">
                          {item.spiceLevel && (
                            <span className="text-brand-orange-600">
                              {item.foodItem.category === 'Minuman' ? 'Gula' : 'Pedas'}: {item.spiceLevel}
                            </span>
                          )}
                          {item.selectedToppings.length > 0 && (
                            <span className="text-brand-dark-900">
                              Topping: {item.selectedToppings.map((t) => t.name).join(', ')}
                            </span>
                          )}
                          {item.notes && (
                            <span className="italic text-brand-gray-400">
                              Catatan: &ldquo;{item.notes}&rdquo;
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center rounded-full bg-brand-gray-100 p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-brand-dark-800 hover:bg-white transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-brand-dark-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-brand-dark-800 hover:bg-white transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-brand-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Hapus item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange-50 text-brand-orange-600">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-dark-900">Keranjang Kosong</h3>
                <p className="mt-2 max-w-xs text-xs text-brand-gray-400">
                  Anda belum menambahkan makanan apa pun. Mari jelajahi menu lezat kami!
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 rounded-full bg-brand-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-premium hover:bg-brand-orange-700"
                >
                  Mulai Belanja
                </button>
              </div>
            )}
          </div>

          {/* Pricing summary & Checkout (Sticky Footer) */}
          {cartItems.length > 0 && (
            <div className="border-t border-brand-gray-100 bg-brand-gray-50 px-6 py-6 flex flex-col gap-4">
              <div className="flex flex-col gap-2 text-sm text-brand-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-dark-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Ongkos Kirim</span>
                  <div className="text-right">
                    {shippingFee === 0 ? (
                      <span className="font-bold text-brand-green-600 uppercase text-xs">Gratis Ongkir</span>
                    ) : (
                      <span className="font-bold text-brand-dark-900">{formatPrice(shippingFee)}</span>
                    )}
                    {subtotal < 50000 && (
                      <p className="text-[10px] text-brand-gray-400">Gratis ongkir jika belanja &gt; Rp50rb</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Pajak (10%)</span>
                  <span className="font-bold text-brand-dark-900">{formatPrice(tax)}</span>
                </div>
                <div className="mt-2 border-t border-brand-gray-200 pt-3 flex justify-between text-base font-black text-brand-dark-950">
                  <span>Total Pembayaran</span>
                  <span className="text-lg text-brand-orange-600">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full rounded-2xl bg-brand-orange-600 py-4 text-center text-base font-bold text-white shadow-premium hover:bg-brand-orange-700 hover:shadow-premium-hover transition-all"
              >
                Lanjut ke Pembayaran (Checkout)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
