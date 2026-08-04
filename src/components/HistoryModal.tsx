'use client';

import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Loader2, Calendar, MapPin, CreditCard, ShoppingBag, Printer, Download } from 'lucide-react';
import Image from 'next/image';
import { generateInvoicePDF, generateAllInvoicesPDF } from '@/lib/invoicePDF';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface OrderHistoryItem {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  address: string;
  paymentMethod: string;
  createdAt: string;
  orderItems: {
    id: string;
    orderId: string;
    foodItemId: string;
    quantity: number;
    price: number;
    spiceLevel: string | null;
    toppings: string | null;
    notes: string | null;
    foodItem: {
      id: string;
      name: string;
      description: string;
      price: number;
      imageUrl: string;
      category: string;
      prepTime: string;
      isAvailable: boolean;
      isPopular: boolean;
      createdAt: string;
    };
  }[];
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        setError(data.error || 'Gagal memuat riwayat pesanan');
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        fetchOrderHistory();
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-gray-100 px-6 py-4">
          <h3 className="text-lg font-black text-brand-dark-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-brand-orange-600" />
            Riwayat Pesanan Saya
          </h3>
          <div className="flex items-center gap-2">
            {orders.length > 0 && (
              <button
                onClick={() => generateAllInvoicesPDF(orders)}
                className="inline-flex items-center gap-1 rounded-full border border-brand-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-brand-dark-800 hover:bg-brand-gray-50 hover:border-brand-orange-300 transition-colors cursor-pointer"
                title="Download Semua Invoice"
              >
                <Download className="h-3 w-3 text-brand-orange-600" />
                Semua Invoice
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-dark-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-brand-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-brand-orange-600" />
              <span className="text-xs font-bold text-brand-gray-500">Memuat riwayat belanjaan Anda...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-red-50 p-4 text-center text-xs font-bold text-red-600 my-10">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16">
              <div className="h-16 w-16 bg-brand-orange-50 text-brand-orange-600 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-brand-dark-900">Belum Ada Pesanan</h4>
              <p className="mt-1 max-w-xs text-xs text-brand-gray-400 leading-relaxed">
                Anda belum pernah memesan makanan apa pun. Mari pilih menu favorit Anda sekarang!
              </p>
              <button
                onClick={onClose}
                className="mt-6 rounded-full bg-brand-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700"
              >
                Pesan Sekarang
              </button>
            </div>
          ) : (
            /* Order List */
            <div className="flex flex-col gap-6">
              {orders.map((order) => (
                <div key={order.id} className="rounded-3xl border border-brand-gray-150 bg-white p-5 shadow-sm flex flex-col gap-4">
                  {/* Card Header: Order ID & Status */}
                  <div className="flex items-start justify-between border-b border-brand-gray-100 pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">ID Pesanan</span>
                      <p className="font-mono text-xs font-black text-brand-dark-900">{order.id}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold shadow-sm ${
                        order.status === 'PENDING' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : order.status === 'DELIVERED' 
                          ? 'bg-brand-green-50 text-brand-green-700 border border-brand-green-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {order.status === 'PENDING' ? '⏳ Diproses Dapur' : order.status === 'DELIVERED' ? '✅ Selesai Diantar' : order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="flex flex-col gap-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-brand-gray-100 shrink-0 bg-brand-gray-50">
                          <Image
                            src={item.foodItem.imageUrl}
                            alt={item.foodItem.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex justify-between text-xs font-bold text-brand-dark-900">
                            <h5>{item.foodItem.name}</h5>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[9px] text-brand-gray-400 mt-0.5">
                            <span>x{item.quantity}</span>
                            {item.spiceLevel && (
                              <span className="border-l border-brand-gray-200 pl-1.5 text-brand-orange-600 font-semibold">
                                {item.foodItem.category === 'Minuman' ? 'Gula' : 'Pedas'}: {item.spiceLevel}
                              </span>
                            )}
                            {item.toppings && (
                              <span className="border-l border-brand-gray-200 pl-1.5 text-brand-dark-700">
                                Topping: {item.toppings}
                              </span>
                            )}
                          </div>
                          
                          {item.notes && (
                            <p className="text-[9px] text-brand-gray-400 italic mt-0.5">
                              Catatan: &ldquo;{item.notes}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Address & Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-brand-gray-100 pt-3 text-[10px] text-brand-gray-500">
                    <div className="flex gap-1.5 items-start">
                      <MapPin className="h-3.5 w-3.5 text-brand-orange-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed line-clamp-2">
                        {order.address}
                      </span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <CreditCard className="h-3.5 w-3.5 text-brand-orange-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Metode: <span className="font-bold text-brand-dark-900">{order.paymentMethod}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer Total */}
                  <div className="border-t border-brand-gray-100 pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-brand-gray-400 font-semibold">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => generateInvoicePDF(order)}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-gray-200 bg-white px-3 py-1.5 text-[10px] font-bold text-brand-dark-800 hover:bg-brand-gray-50 hover:border-brand-orange-300 transition-colors cursor-pointer"
                        title="Cetak Invoice"
                      >
                        <Printer className="h-3 w-3 text-brand-orange-600" />
                        Cetak Invoice
                      </button>
                    </div>
                    <div className="font-black text-brand-dark-950">
                      Total Bayar:{' '}
                      <span className="text-sm text-brand-orange-600 font-black">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
