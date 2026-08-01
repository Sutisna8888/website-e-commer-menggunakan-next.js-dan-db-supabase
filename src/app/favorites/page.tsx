'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import CartDrawer from '@/components/CartDrawer';
import FoodDetailModal from '@/components/FoodDetailModal';
import HistoryModal from '@/components/HistoryModal';
import { FoodItem, CartItem } from '@/types';
import { Heart, HeartCrack, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FavoriteWithFoodItem {
  id: string;
  userId: string;
  foodItemId: string;
  foodItem: FoodItem;
}

export default function FavoritesPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  
  const [favorites, setFavorites] = useState<FavoriteWithFoodItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  
  // Cart & Modal States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeDetailFood, setActiveDetailFood] = useState<FoodItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function fetchSession() {
      setIsSessionLoading(true);
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user.email);
        } else {
          setUserEmail(null);
        }
      } catch (error) {
        console.error('Error saat memeriksa sesi:', error);
      } finally {
        setIsSessionLoading(false);
      }
    }
    fetchSession();

    // Load Cart from LocalStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setTimeout(() => {
          setCartItems(parsed);
        }, 0);
      } catch (e) {
        console.error('Error parsing cart data', e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchFavorites() {
      if (!userEmail) return;
      setIsLoadingFavorites(true);
      try {
        const response = await fetch('/api/favorites');
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error('Error memuat favorit:', error);
      } finally {
        setIsLoadingFavorites(false);
      }
    }
    
    if (userEmail && !isSessionLoading) {
      fetchFavorites();
    }
  }, [userEmail, isSessionLoading]);

  // Handle Order & Cart
  const handleOrderClick = (item: FoodItem) => {
    setActiveDetailFood(item);
    setIsDetailOpen(true);
  };

  const handleAddToCart = (customizedItem: Omit<CartItem, 'id' | 'quantity'> & { quantity: number }) => {
    const { foodItem, quantity, selectedToppings, spiceLevel, notes, customPrice } = customizedItem;
    const toppingsKey = selectedToppings.map((t) => t.name).sort().join('-');
    const uniqueCartId = `${foodItem.id}_${spiceLevel}_${toppingsKey}_${notes}`;

    const newCart = [...cartItems];
    const existingIndex = newCart.findIndex((item) => item.id === uniqueCartId);
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        id: uniqueCartId,
        foodItem,
        quantity,
        selectedToppings,
        spiceLevel,
        notes,
        customPrice
      });
    }

    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    showToast(`🛒 "${foodItem.name}" berhasil ditambahkan ke keranjang!`);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/me', { method: 'POST' });
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, item: FoodItem) => {
    e.stopPropagation();
    
    // Optimistically remove from UI
    const previousFavorites = [...favorites];
    setFavorites(prev => prev.filter(fav => fav.foodItem.id !== item.id));

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodItemId: item.id })
      });

      if (!response.ok) {
        // Rollback
        setFavorites(previousFavorites);
        showToast('❌ Gagal mengubah daftar favorit');
      }
    } catch {
      setFavorites(previousFavorites);
      showToast('❌ Terjadi kesalahan jaringan');
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-gray-50/30">
      <Header
        onSearch={() => {}}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={handleLogout}
        onHistoryClick={() => setIsHistoryOpen(true)}
        cartItemsCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        userEmail={userEmail}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-gray-500 hover:text-brand-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        {isSessionLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-orange-600" />
            <span className="text-xs font-bold text-brand-gray-500">Memeriksa sesi Anda...</span>
          </div>
        ) : !userEmail ? (
          <div className="rounded-3xl border border-brand-gray-150 bg-white p-8 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-brand-orange-50 text-brand-orange-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-brand-dark-900">Akses Terbatas</h3>
            <p className="mt-2 text-xs text-brand-gray-400 leading-relaxed">
              Anda harus masuk ke akun RasaNusantara untuk melihat daftar makanan favorit Anda.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-brand-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange-100 text-brand-orange-600">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-brand-dark-900 tracking-tight">Favorit Saya</h1>
                <p className="text-sm font-semibold text-brand-gray-500">Daftar hidangan lezat yang Anda sukai.</p>
              </div>
            </div>

            {isLoadingFavorites ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-orange-600" />
                <span className="text-xs font-bold text-brand-gray-500">Memuat daftar makanan favorit...</span>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {favorites.map((fav) => (
                  <FoodCard 
                    key={fav.foodItem.id} 
                    item={fav.foodItem} 
                    onOrderClick={handleOrderClick} 
                    isFavorited={true}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 flex flex-col items-center justify-center text-center rounded-3xl border border-brand-gray-150 bg-white py-24 px-4 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gray-50 text-brand-gray-400">
                  <HeartCrack className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-brand-dark-900">Belum Ada Favorit</h3>
                <p className="mt-2.5 max-w-sm text-xs text-brand-gray-500 leading-relaxed px-4">
                  Anda belum menandai makanan apapun sebagai favorit. Jelajahi menu kami dan tandai makanan yang Anda sukai!
                </p>
                <Link
                  href="/#menu-section"
                  className="mt-6 rounded-2xl bg-brand-dark-900 px-6 py-3.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-600 transition-colors cursor-pointer"
                >
                  Jelajahi Menu
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      <FoodDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        foodItem={activeDetailFood}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={(itemId, newQty) => {
          const updated = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQty } : item).filter(item => item.quantity > 0);
          setCartItems(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }}
        onRemoveItem={(itemId) => {
          const updated = cartItems.filter(item => item.id !== itemId);
          setCartItems(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }}
        onCheckout={() => {
          setIsCartOpen(false);
          window.location.href = '/?checkout=true';
        }}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce rounded-2xl bg-brand-dark-900 px-6 py-4 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-green-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
