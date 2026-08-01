'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HistoryModal from '@/components/HistoryModal';
import CartDrawer from '@/components/CartDrawer';
import Image from 'next/image';
import { 
  User, 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Mail, 
  Phone, 
  Home, 
  Briefcase, 
  Compass, 
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Camera,
  Trash2 as Trash2Icon
} from 'lucide-react';
import { CartItem } from '@/types';
import Link from 'next/link';

interface Address {
  id: string;
  label: string;
  receiver: string;
  phone: string;
  detail: string;
  isPrimary: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [user, setUser] = useState<{ id: string; email: string; name: string | null; role: string } | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  // Addresses States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  
  // Profile Form State
  const [profileName, setProfileName] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Address Modal/Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressLabel, setAddressLabel] = useState('Rumah');
  const [customLabel, setCustomLabel] = useState('');
  const [addressReceiver, setAddressReceiver] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [addressIsPrimary, setAddressIsPrimary] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string | null>(null);

  // Common UI States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Header, Cart & History States
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSession = async () => {
    setIsSessionLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfileName(data.user.name || '');
        // Juga ambil foto avatar
        fetchAvatar();
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error fetching session:', e);
    } finally {
      setIsSessionLoading(false);
    }
  };

  const fetchAvatar = async () => {
    try {
      const response = await fetch('/api/auth/avatar');
      if (response.ok) {
        const data = await response.json();
        setUserAvatar(data.avatar);
      }
    } catch (e) {
      console.error('Error fetching avatar:', e);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('❌ Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      return;
    }

    // Validasi ukuran (500KB)
    if (file.size > 500 * 1024) {
      showToast('❌ Ukuran file terlalu besar. Maksimum 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsUploadingAvatar(true);
      try {
        const response = await fetch('/api/auth/avatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 })
        });
        const data = await response.json();
        if (response.ok) {
          setUserAvatar(data.avatar);
          showToast('📸 Foto profil berhasil diperbarui!');
        } else {
          showToast(`❌ ${data.error}`);
        }
      } catch {
        showToast('❌ Gagal mengunggah foto profil.');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
    // Reset input value agar bisa memilih file yang sama kembali
    e.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;
    setIsUploadingAvatar(true);
    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: null })
      });
      if (response.ok) {
        setUserAvatar(null);
        showToast('🗑️ Foto profil berhasil dihapus.');
      }
    } catch {
      showToast('❌ Gagal menghapus foto profil.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const fetchAddresses = async () => {
    setIsAddressesLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      } else {
        setErrorMessage('Gagal memuat daftar alamat');
      }
    } catch (e) {
      setErrorMessage('Koneksi terputus. Gagal memuat alamat.');
      console.error('Error loading addresses:', e);
    } finally {
      setIsAddressesLoading(false);
    }
  };

  // Load Session and Local Cart
  useEffect(() => {
    setTimeout(() => {
      fetchSession();
    }, 0);
    
    // Cart from localstorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setTimeout(() => {
          setCartItems(parsed);
        }, 0);
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }, []);

  // Fetch addresses when tab switches to addresses
  useEffect(() => {
    if (user && activeTab === 'addresses') {
      setTimeout(() => {
        fetchAddresses();
      }, 0);
    }
  }, [activeTab, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('❌ Nama tidak boleh kosong!');
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName })
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        showToast('🎉 Profil Anda berhasil diperbarui!');
      } else {
        showToast(`❌ ${data.error || 'Gagal memperbarui profil'}`);
      }
    } catch (err) {
      showToast('❌ Terjadi kesalahan jaringan');
      console.error('Update profile error:', err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open address modal for adding new address
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressLabel('Rumah');
    setCustomLabel('');
    setAddressReceiver(user?.name || '');
    setAddressPhone('');
    setAddressDetail('');
    setAddressIsPrimary(addresses.length === 0); // Jika alamat pertama, otomatis set Utama
    setErrorMessage(null);
    setIsAddressModalOpen(true);
  };

  // Open address modal for editing
  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    const standardLabels = ['Rumah', 'Kantor'];
    if (standardLabels.includes(addr.label)) {
      setAddressLabel(addr.label);
      setCustomLabel('');
    } else {
      setAddressLabel('Lainnya');
      setCustomLabel(addr.label);
    }
    setAddressReceiver(addr.receiver);
    setAddressPhone(addr.phone);
    setAddressDetail(addr.detail);
    setAddressIsPrimary(addr.isPrimary);
    setErrorMessage(null);
    setIsAddressModalOpen(true);
  };

  // Save address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalLabel = addressLabel === 'Lainnya' ? customLabel.trim() : addressLabel;

    if (!finalLabel || !addressReceiver.trim() || !addressPhone.trim() || !addressDetail.trim()) {
      setErrorMessage('Silakan lengkapi seluruh kolom alamat pengiriman.');
      return;
    }

    setIsSavingAddress(true);
    setErrorMessage(null);

    const payload = {
      label: finalLabel,
      receiver: addressReceiver.trim(),
      phone: addressPhone.trim(),
      detail: addressDetail.trim(),
      isPrimary: addressIsPrimary
    };

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : '/api/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showToast(editingAddress ? '🎉 Alamat berhasil diperbarui!' : '🎉 Alamat baru berhasil ditambahkan!');
        setIsAddressModalOpen(false);
        fetchAddresses();
      } else {
        setErrorMessage(data.error || 'Terjadi kesalahan saat menyimpan alamat');
      }
    } catch (err) {
      setErrorMessage('Terjadi kesalahan jaringan.');
      console.error('Save address error:', err);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat pengiriman ini?')) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('🗑️ Alamat berhasil dihapus.');
        fetchAddresses();
      } else {
        const data = await response.json();
        showToast(`❌ ${data.error || 'Gagal menghapus alamat'}`);
      }
    } catch (err) {
      showToast('❌ Terjadi kesalahan jaringan');
      console.error('Delete address error:', err);
    }
  };

  const handleSetPrimaryAddress = async (addr: Address) => {
    try {
      const response = await fetch(`/api/addresses/${addr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: addr.label,
          receiver: addr.receiver,
          phone: addr.phone,
          detail: addr.detail,
          isPrimary: true
        })
      });

      if (response.ok) {
        showToast('⭐ Alamat utama berhasil diubah.');
        fetchAddresses();
      } else {
        const data = await response.json();
        showToast(`❌ ${data.error || 'Gagal mengubah alamat utama'}`);
      }
    } catch {
      showToast('❌ Terjadi kesalahan jaringan');
    }
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

  const getLabelIcon = (label: string) => {
    if (label.toLowerCase() === 'rumah') return <Home className="h-4 w-4" />;
    if (label.toLowerCase() === 'kantor') return <Briefcase className="h-4 w-4" />;
    return <Compass className="h-4 w-4" />;
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordSuccessMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Semua kolom password wajib diisi.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordSuccessMessage(data.message);
        showToast('🔒 Password berhasil diubah!');
      } else {
        setErrorMessage(data.error || 'Gagal mengubah password');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan jaringan.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-brand-gray-50/30">
      {/* Header */}
      <Header
        onSearch={() => {}} // Halaman profil tidak butuh real-time search
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={handleLogout}
        onHistoryClick={() => setIsHistoryOpen(true)}
        cartItemsCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        userEmail={user?.email || null}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Link */}
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
            <span className="text-xs font-bold text-brand-gray-500">Memverifikasi sesi profil Anda...</span>
          </div>
        ) : !user ? (
          /* Warning Not Logged In */
          <div className="rounded-3xl border border-brand-gray-150 bg-white p-8 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 rounded-full bg-brand-orange-50 text-brand-orange-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-brand-dark-900">Akses Terbatas</h3>
            <p className="mt-2 text-xs text-brand-gray-400 leading-relaxed">
              Anda harus masuk ke akun RasaNusantara untuk melihat dan mengubah profil pribadi Anda.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-brand-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors"
            >
              Masuk Sekarang
            </Link>
          </div>
        ) : (
          /* Profile Content Page */
          <div className="flex flex-col gap-6 md:flex-row items-start">
            
            {/* Sidebar Cards / Tab Switches */}
            <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
              <div className="rounded-3xl border border-brand-gray-150 bg-white p-5 shadow-sm text-center">
                {/* Avatar Section */}
                <div className="relative mx-auto mb-3 h-20 w-20">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt="Foto Profil"
                      fill
                      className="rounded-full object-cover ring-2 ring-brand-orange-200"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-brand-orange-100 text-brand-orange-700 font-extrabold text-2xl rounded-full flex items-center justify-center">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Upload Button Overlay */}
                  <label className={`absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-orange-600 text-white shadow-md ring-2 ring-white transition-transform hover:scale-110 ${isUploadingAvatar ? 'animate-pulse pointer-events-none' : ''}`}>
                    <Camera className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                {/* Remove Avatar Button */}
                {userAvatar && (
                  <button
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    className="text-[9px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 mb-2 inline-flex items-center gap-0.5"
                  >
                    <Trash2Icon className="h-3 w-3" />
                    Hapus Foto
                  </button>
                )}
                <h4 className="text-sm font-bold text-brand-dark-900 truncate">{user.name || 'Pelanggan Setia'}</h4>
                <p className="text-[10px] text-brand-gray-400 mt-0.5 truncate">{user.email}</p>
                <div className="mt-2 inline-block rounded-full bg-brand-orange-50 px-3 py-0.5 text-[9px] font-bold text-brand-orange-700 border border-brand-orange-100">
                  Pelanggan
                </div>
              </div>

              {/* Navigation Menu List */}
              <div className="rounded-3xl border border-brand-gray-150 bg-white p-2.5 shadow-sm flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-brand-orange-600 text-white shadow-premium' : 'text-brand-gray-500 hover:bg-brand-gray-50'}`}
                >
                  <User className="h-4.5 w-4.5" />
                  Detail Akun Saya
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${activeTab === 'addresses' ? 'bg-brand-orange-600 text-white shadow-premium' : 'text-brand-gray-500 hover:bg-brand-gray-50'}`}
                >
                  <MapPin className="h-4.5 w-4.5" />
                  Daftar Alamat Pengiriman
                </button>
                <button
                  onClick={() => {
                    setActiveTab('security');
                    setErrorMessage(null);
                    setPasswordSuccessMessage(null);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${activeTab === 'security' ? 'bg-brand-orange-600 text-white shadow-premium' : 'text-brand-gray-500 hover:bg-brand-gray-50'}`}
                >
                  <Lock className="h-4.5 w-4.5" />
                  Keamanan Akun
                </button>
              </div>
            </div>

            {/* Right Pane (Tab Content) */}
            <div className="flex-1 w-full rounded-3xl border border-brand-gray-150 bg-white p-6 shadow-sm min-h-[400px]">
              
              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark-900 flex items-center gap-2 pb-4 border-b border-brand-gray-100 mb-6">
                    <Settings className="h-5 w-5 text-brand-orange-600" />
                    Pengaturan Profil Akun
                  </h3>

                  <form onSubmit={handleUpdateProfile} className="max-w-md flex flex-col gap-5">
                    <div>
                      <label className="text-[11px] font-bold text-brand-gray-500 block mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-400" />
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="Masukkan nama lengkap Anda..."
                          className="w-full text-xs font-semibold rounded-2xl border border-brand-gray-200 py-3 pl-10 pr-4 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-brand-gray-500 block mb-1.5 uppercase tracking-wide">Alamat Email (Akun)</label>
                      <div className="relative opacity-60">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-400" />
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full text-xs font-semibold rounded-2xl border border-brand-gray-200 py-3 pl-10 pr-4 bg-brand-gray-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-brand-orange-600 px-5 py-3 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors disabled:opacity-50 max-w-[180px] cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-brand-gray-100 mb-6">
                    <h3 className="text-base font-extrabold text-brand-dark-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-brand-orange-600" />
                      Kelola Alamat Pengiriman
                    </h3>
                    <button
                      onClick={handleOpenAddAddress}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-orange-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah Baru
                    </button>
                  </div>

                  {isAddressesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-brand-orange-600" />
                      <span className="text-[11px] font-bold text-brand-gray-400">Memuat data alamat Anda...</span>
                    </div>
                  ) : errorMessage ? (
                    <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-bold text-red-600 my-4">
                      {errorMessage}
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-12 flex flex-col items-center">
                      <div className="h-12 w-12 rounded-full bg-brand-gray-50 text-brand-gray-400 flex items-center justify-center mb-3">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-brand-dark-900">Belum Ada Alamat Disimpan</h4>
                      <p className="mt-1 text-[10px] text-brand-gray-400 max-w-xs leading-relaxed">
                        Anda belum menambahkan alamat pengiriman makanan. Tambahkan alamat pertama Anda sekarang!
                      </p>
                    </div>
                  ) : (
                    /* Addresses Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id} 
                          className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all duration-300 relative ${addr.isPrimary ? 'border-brand-orange-500 bg-brand-orange-50/10 shadow-sm' : 'border-brand-gray-200 hover:border-brand-gray-300'}`}
                        >
                          <div>
                            {/* Card Header Label */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-orange-600 uppercase tracking-wider">
                                {getLabelIcon(addr.label)}
                                {addr.label}
                              </span>
                              {addr.isPrimary && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-orange-600 px-2.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                                  Alamat Utama
                                </span>
                              )}
                            </div>
                            
                            {/* Receiver Info */}
                            <div className="text-xs font-bold text-brand-dark-900 mb-1.5">
                              {addr.receiver}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-brand-gray-500 mb-2">
                              <Phone className="h-3 w-3 shrink-0" />
                              {addr.phone}
                            </div>

                            {/* Detailed Address */}
                            <p className="text-[11px] text-brand-gray-500 leading-relaxed line-clamp-3 mb-4">
                              {addr.detail}
                            </p>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="border-t border-brand-gray-100 pt-3 flex items-center justify-between text-[11px]">
                            <div className="flex gap-2.5">
                              <button
                                onClick={() => handleOpenEditAddress(addr)}
                                className="inline-flex items-center gap-0.5 font-bold text-brand-orange-600 hover:text-brand-orange-700 cursor-pointer"
                                title="Edit Alamat"
                              >
                                <Edit2 className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="inline-flex items-center gap-0.5 font-bold text-red-650 hover:text-red-700 cursor-pointer"
                                title="Hapus Alamat"
                              >
                                <Trash2 className="h-3 w-3" />
                                Hapus
                              </button>
                            </div>

                            {!addr.isPrimary && (
                              <button
                                onClick={() => handleSetPrimaryAddress(addr)}
                                className="font-bold text-brand-dark-800 hover:text-brand-orange-600 cursor-pointer"
                              >
                                Jadikan Utama
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-base font-extrabold text-brand-dark-900 flex items-center gap-2 pb-4 border-b border-brand-gray-100 mb-6">
                    <ShieldCheck className="h-5 w-5 text-brand-orange-600" />
                    Keamanan Akun
                  </h3>

                  {passwordSuccessMessage && (
                    <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-start gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-green-700">{passwordSuccessMessage}</p>
                        <p className="text-[10px] text-green-600 mt-0.5">Gunakan password baru Anda saat login berikutnya.</p>
                      </div>
                    </div>
                  )}

                  {errorMessage && activeTab === 'security' && (
                    <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-4 flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold text-red-600">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="max-w-md flex flex-col gap-5">
                    {/* Current Password */}
                    <div>
                      <label className="text-[11px] font-bold text-brand-gray-500 block mb-1.5 uppercase tracking-wide">Password Saat Ini</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-400" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Masukkan password saat ini..."
                          className="w-full text-xs font-semibold rounded-2xl border border-brand-gray-200 py-3 pl-10 pr-11 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-dark-900 transition-colors cursor-pointer"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="text-[11px] font-bold text-brand-gray-500 block mb-1.5 uppercase tracking-wide">Password Baru</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-400" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan password baru (min. 6 karakter)..."
                          className="w-full text-xs font-semibold rounded-2xl border border-brand-gray-200 py-3 pl-10 pr-11 outline-none focus:border-brand-orange-500 focus:ring-2 focus:ring-brand-orange-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-dark-900 transition-colors cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPassword.length > 0 && newPassword.length < 6 && (
                        <p className="mt-1.5 text-[10px] font-bold text-red-500">⚠️ Password minimal 6 karakter</p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label className="text-[11px] font-bold text-brand-gray-500 block mb-1.5 uppercase tracking-wide">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password baru Anda..."
                          className={`w-full text-xs font-semibold rounded-2xl border py-3 pl-10 pr-11 outline-none focus:ring-2 ${
                            confirmPassword.length > 0 && confirmPassword !== newPassword
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-brand-gray-200 focus:border-brand-orange-500 focus:ring-brand-orange-500/20'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-dark-900 transition-colors cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                        <p className="mt-1.5 text-[10px] font-bold text-red-500">⚠️ Password tidak cocok</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-2xl bg-brand-orange-600 px-5 py-3 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors disabled:opacity-50 max-w-[200px] cursor-pointer"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          Ubah Password
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </main>

      {/* Address Form Popup Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm" onClick={() => setIsAddressModalOpen(false)} />
          
          <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all p-6">
            <h3 className="text-base font-black text-brand-dark-900 flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-brand-orange-600" />
              {editingAddress ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Pengiriman Baru'}
            </h3>

            {errorMessage && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
              {/* Label */}
              <div>
                <label className="text-[10px] font-bold text-brand-gray-500 block mb-1 uppercase tracking-wide">Label Alamat</label>
                <div className="flex gap-2 mb-2">
                  {['Rumah', 'Kantor', 'Lainnya'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressLabel(lbl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${addressLabel === lbl ? 'bg-brand-orange-600 text-white border-brand-orange-600' : 'bg-white text-brand-gray-500 border-brand-gray-200 hover:bg-brand-gray-50'}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {addressLabel === 'Lainnya' && (
                  <input
                    type="text"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Contoh: Kosan, Apartemen, dll..."
                    className="w-full text-xs font-semibold rounded-xl border border-brand-gray-200 py-2.5 px-3 outline-none focus:border-brand-orange-500"
                  />
                )}
              </div>

              {/* Receiver Name */}
              <div>
                <label className="text-[10px] font-bold text-brand-gray-500 block mb-1 uppercase tracking-wide">Nama Penerima</label>
                <input
                  type="text"
                  value={addressReceiver}
                  onChange={(e) => setAddressReceiver(e.target.value)}
                  placeholder="Masukkan nama penerima makanan..."
                  className="w-full text-xs font-semibold rounded-xl border border-brand-gray-200 py-2.5 px-3 outline-none focus:border-brand-orange-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] font-bold text-brand-gray-500 block mb-1 uppercase tracking-wide">Nomor Telepon</label>
                <input
                  type="tel"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full text-xs font-semibold rounded-xl border border-brand-gray-200 py-2.5 px-3 outline-none focus:border-brand-orange-500"
                />
              </div>

              {/* Detail Address */}
              <div>
                <label className="text-[10px] font-bold text-brand-gray-500 block mb-1 uppercase tracking-wide">Detail Alamat Lengkap</label>
                <textarea
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  placeholder="Tuliskan nama jalan, blok, nomor rumah, RT/RW, kelurahan/kecamatan secara detail..."
                  className="w-full text-xs font-semibold rounded-xl border border-brand-gray-200 py-2.5 px-3 outline-none focus:border-brand-orange-500 h-20 resize-none"
                />
              </div>

              {/* Set Primary Address Checkbox */}
              {(!editingAddress || !editingAddress.isPrimary) && (
                <label className="flex items-center gap-2 cursor-pointer mt-1 py-1">
                  <input
                    type="checkbox"
                    checked={addressIsPrimary}
                    onChange={(e) => setAddressIsPrimary(e.target.checked)}
                    className="rounded text-brand-orange-600 focus:ring-brand-orange-500/20 h-4 w-4 border-brand-gray-300"
                  />
                  <span className="text-[11px] font-bold text-brand-dark-800">Jadikan alamat pengiriman utama</span>
                </label>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 border-t border-brand-gray-100 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-brand-gray-200 text-xs font-bold text-brand-dark-800 hover:bg-brand-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-4 py-2 rounded-xl bg-brand-orange-600 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingAddress ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Alamat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Cart Drawer */}
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
          // Alihkan ke halaman beranda agar user bisa checkout dari beranda modal
          window.location.href = '/?checkout=true';
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce rounded-2xl bg-brand-dark-900 px-6 py-4 text-sm font-bold text-white shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-brand-green-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
