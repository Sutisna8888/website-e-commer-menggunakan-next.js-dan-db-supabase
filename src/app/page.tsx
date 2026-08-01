'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FoodCatalog from '@/components/FoodCatalog';
import AuthModal from '@/components/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import FoodDetailModal from '@/components/FoodDetailModal';
import CheckoutModal from '@/components/CheckoutModal';
import HistoryModal from '@/components/HistoryModal';
import Footer from '@/components/Footer';
import { FoodItem, CartItem } from '@/types';
import { CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartMounted, setIsCartMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  // Food Detail Modal States
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeDetailFood, setActiveDetailFood] = useState<FoodItem | null>(null);

  // Checkout & History Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Custom Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Muat sesi login aktif saat pertama kali halaman dimuat
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserEmail(data.user.email);
          setUserRole(data.user.role);
        }
      } catch (error) {
        console.error('Error saat memeriksa sesi:', error);
      }
    }
    checkSession();
  }, []);

  // Check if redirecting from checkout trigger (from other pages like profile)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('checkout') === 'true') {
      // Clear URL parameter so it doesn't reopen on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => {
        setIsCheckoutOpen(true);
      }, 500);
    }
  }, []);

  // 2. Muat data keranjang belanja dari LocalStorage setelah component di-mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    let parsed: CartItem[] | null = null;
    if (savedCart) {
      try {
        parsed = JSON.parse(savedCart);
      } catch (error) {
        console.error('Error parsing data keranjang dari localStorage:', error);
      }
    }
    
    // Defer state updates to avoid synchronous render cascades inside effect
    setTimeout(() => {
      if (parsed) {
        setCartItems(parsed);
      }
      setIsCartMounted(true);
    }, 0);
  }, []);

  // 3. Simpan data keranjang belanja ke LocalStorage setiap kali ada perubahan
  useEffect(() => {
    if (isCartMounted) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isCartMounted]);

  // Hitung jumlah item total di keranjang belanja
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Saat tombol pesan diklik di kartu makanan, buka modal detail produk
  const handleOrderClick = (item: FoodItem) => {
    if (!userEmail) {
      setAuthMessage(`Silakan masuk terlebih dahulu untuk memesan "${item.name}"`);
      setIsAuthOpen(true);
      return;
    }
    setActiveDetailFood(item);
    setIsDetailOpen(true);
  };

  // Menambahkan item yang sudah dikustomisasi ke keranjang belanja
  const handleAddToCart = (customizedItem: Omit<CartItem, 'id' | 'quantity'> & { quantity: number }) => {
    const { foodItem, quantity, selectedToppings, spiceLevel, notes, customPrice } = customizedItem;

    // Buat unique ID berdasarkan kustomisasi: itemId + levelPedas + sortedToppingNames + catatan
    const toppingsKey = selectedToppings.map((t) => t.name).sort().join('-');
    const uniqueCartId = `${foodItem.id}_${spiceLevel}_${toppingsKey}_${notes}`;

    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.id === uniqueCartId);
      
      if (existingItemIndex > -1) {
        // Jika item kustomisasi yang sama persis sudah ada di keranjang, tambahkan jumlahnya
        const updatedCart = [...prev];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Jika item kustomisasi baru, tambahkan ke keranjang belanja
        return [
          ...prev,
          {
            id: uniqueCartId,
            foodItem,
            quantity,
            selectedToppings,
            spiceLevel,
            notes,
            customPrice
          }
        ];
      }
    });

    showToast(`🛒 "${foodItem.name}" berhasil ditambahkan ke keranjang!`);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => {
      const removedItem = prev.find((item) => item.id === itemId);
      if (removedItem) {
        showToast(`🗑️ "${removedItem.foodItem.name}" dihapus dari keranjang.`);
      }
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getCartTotalAmount = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.customPrice * item.quantity, 0);
    const shippingFee = subtotal > 50000 ? 0 : subtotal > 0 ? 12000 : 0;
    const tax = Math.round(subtotal * 0.1);
    return subtotal + shippingFee + tax;
  };

  const handleLoginSuccess = (email: string, role: string) => {
    setUserEmail(email);
    setUserRole(role);
    showToast(`👋 Selamat datang! Anda berhasil masuk sebagai ${email}`);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/me', { method: 'POST' });
      if (response.ok) {
        setUserEmail(null);
        setUserRole(null);
        setCartItems([]); // Kosongkan keranjang belanja saat user logout
        setIsCartOpen(false);
        showToast('🚪 Anda telah keluar dari akun.');
      } else {
        showToast('❌ Gagal keluar dari akun');
      }
    } catch (error) {
      console.error('Error saat logout:', error);
      showToast('❌ Terjadi kesalahan jaringan');
    }
  };

  const scrollToMenu = () => {
    const element = document.getElementById('menu-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-gray-50/30">
      
      {/* Header */}
      <Header
        onSearch={handleSearch}
        onCartClick={() => {
          if (!userEmail) {
            setAuthMessage('Silakan masuk terlebih dahulu untuk melihat keranjang belanja Anda.');
            setIsAuthOpen(true);
          } else {
            setIsCartOpen(true);
          }
        }}
        onLoginClick={() => {
          if (userEmail) {
            handleLogout();
          } else {
            setAuthMessage('');
            setIsAuthOpen(true);
          }
        }}
        onHistoryClick={() => {
          if (!userEmail) {
            setAuthMessage('Silakan masuk terlebih dahulu untuk melihat riwayat pesanan Anda.');
            setIsAuthOpen(true);
          } else {
            setIsHistoryOpen(true);
          }
        }}
        cartItemsCount={cartItemsCount}
        userEmail={userEmail}
        userRole={userRole}
      />


      {/* Main Content */}
      <main className="flex-1">
        <Hero onActionClick={scrollToMenu} />
        <FoodCatalog searchQuery={searchQuery} onOrderClick={handleOrderClick} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Food Detail Modal */}
      <FoodDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        foodItem={activeDetailFood}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
        customMessage={authMessage}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        totalAmount={getCartTotalAmount()}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce rounded-2xl bg-brand-dark-900 px-6 py-4 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-green-500" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
