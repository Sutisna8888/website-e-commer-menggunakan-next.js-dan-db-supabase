"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minPurchase: number;
  maxDiscount: number | null;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minPurchase: '0',
    maxDiscount: '',
    validUntil: '',
    usageLimit: '0',
    isActive: true
  });

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/vouchers');
      if (res.ok) {
        const data = await res.json();
        setVouchers(data);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVouchers();
  }, []);

  const openModal = (voucher: Voucher | null = null) => {
    setEditingVoucher(voucher);
    if (voucher) {
      setFormData({
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue.toString(),
        minPurchase: voucher.minPurchase.toString(),
        maxDiscount: voucher.maxDiscount ? voucher.maxDiscount.toString() : '',
        validUntil: voucher.validUntil.split('T')[0],
        usageLimit: voucher.usageLimit.toString(),
        isActive: voucher.isActive
      });
    } else {
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minPurchase: '0',
        maxDiscount: '',
        validUntil: '',
        usageLimit: '0',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingVoucher 
        ? `/api/admin/vouchers/${editingVoucher.id}` 
        : '/api/admin/vouchers';
      
      const res = await fetch(url, {
        method: editingVoucher ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchVouchers();
      } else {
        const err = await res.json();
        alert(err.error || 'Terjadi kesalahan');
      }
    } catch (error) {
      console.error('Failed to save voucher', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) return;
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchVouchers();
      }
    } catch (error) {
      console.error('Failed to delete voucher', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-brand-gray-100">
        <div>
          <h1 className="text-2xl font-black text-brand-dark-900 flex items-center gap-2">
            <Ticket className="w-8 h-8 text-brand-orange-500" />
            Kelola Voucher & Promo
          </h1>
          <p className="text-brand-gray-500 mt-1">Buat kode diskon untuk pelanggan setia Anda.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-orange-600 transition-colors shadow-lg shadow-brand-orange-500/20"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Voucher Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray-50 text-brand-gray-500 text-sm font-semibold border-b border-brand-gray-100">
                <th className="px-6 py-4">KODE VOUCHER</th>
                <th className="px-6 py-4">DISKON</th>
                <th className="px-6 py-4">MIN. BELANJA</th>
                <th className="px-6 py-4">KADALUWARSA</th>
                <th className="px-6 py-4">KUOTA</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-gray-500">Memuat data...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-gray-500">Belum ada voucher.</td>
                </tr>
              ) : (
                vouchers.map(voucher => (
                  <tr key={voucher.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-dark-900">
                      <span className="bg-brand-gray-100 px-3 py-1 rounded-lg border border-brand-gray-200">
                        {voucher.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-gray-600 font-medium">
                      {voucher.discountType === 'PERCENTAGE' 
                        ? `${voucher.discountValue}% (Max ${voucher.maxDiscount ? formatPrice(voucher.maxDiscount) : '-'})` 
                        : formatPrice(voucher.discountValue)}
                    </td>
                    <td className="px-6 py-4 text-brand-gray-600 font-medium">{formatPrice(voucher.minPurchase)}</td>
                    <td className="px-6 py-4 text-brand-gray-600 font-medium">{new Date(voucher.validUntil).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-brand-gray-600 font-medium">
                      {voucher.usedCount} / {voucher.usageLimit === 0 ? 'Tak Terbatas' : voucher.usageLimit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${voucher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {voucher.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(voucher)} className="p-2 bg-brand-gray-50 text-brand-gray-600 rounded-lg hover:bg-brand-gray-100 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(voucher.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-brand-gray-100 z-10">
              <h2 className="text-2xl font-black text-brand-dark-900">
                {editingVoucher ? 'Edit Voucher' : 'Buat Voucher Baru'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-brand-gray-600 mb-2">Kode Voucher</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="Contoh: HEMAT20"
                    className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500 font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-gray-600 mb-2">Tipe Diskon</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED'})}
                      className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500 font-semibold"
                    >
                      <option value="PERCENTAGE">Persentase (%)</option>
                      <option value="FIXED">Nominal Tetap (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-gray-600 mb-2">
                      {formData.discountType === 'PERCENTAGE' ? 'Besar Diskon (%)' : 'Besar Potongan (Rp)'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-gray-600 mb-2">Minimal Belanja (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minPurchase}
                      onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                  {formData.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-sm font-bold text-brand-gray-600 mb-2">Maks. Diskon (Rp)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                        placeholder="Opsional"
                        className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-brand-gray-600 mb-2">Kadaluwarsa</label>
                    <input
                      type="date"
                      required
                      value={formData.validUntil}
                      onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-gray-600 mb-2">Batas Penggunaan</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                      placeholder="0 = Tak terbatas"
                      className="w-full px-4 py-3 rounded-xl border border-brand-gray-200 focus:outline-none focus:border-brand-orange-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 p-4 bg-brand-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-brand-gray-300 text-brand-orange-500 focus:ring-brand-orange-500"
                  />
                  <span className="font-bold text-brand-dark-900">Voucher Aktif & Bisa Digunakan</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-brand-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-brand-gray-500 bg-brand-gray-100 hover:bg-brand-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-brand-orange-500 hover:bg-brand-orange-600 transition-colors"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
