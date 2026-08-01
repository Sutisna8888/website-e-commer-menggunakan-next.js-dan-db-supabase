'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, X } from 'lucide-react';

interface Topping {
  id: string;
  name: string;
  price: number;
  categories: string;
}

const CATEGORY_OPTIONS = ['Makanan', 'Minuman', 'Cemilan'];

export default function AdminToppingsPage() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categories: [] as string[]
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchToppings = async () => {
    try {
      const res = await fetch('/api/admin/toppings');
      if (res.ok) {
        const data = await res.json();
        setToppings(data);
      }
    } catch (error) {
      console.error('Error fetching toppings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchToppings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = (topping?: Topping) => {
    if (topping) {
      setEditingTopping(topping);
      setFormData({
        name: topping.name,
        price: topping.price.toString(),
        categories: topping.categories ? topping.categories.split(',').filter(Boolean) : []
      });
    } else {
      setEditingTopping(null);
      setFormData({
        name: '',
        price: '',
        categories: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingTopping ? `/api/admin/toppings/${editingTopping.id}` : '/api/admin/toppings';
      const method = editingTopping ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        categories: formData.categories.join(',')
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchToppings();
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving topping:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus topping ini?')) return;
    
    try {
      const res = await fetch(`/api/admin/toppings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchToppings();
      } else {
        alert('Gagal menghapus topping');
      }
    } catch (error) {
      console.error('Error deleting topping:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);
  };

  const filteredToppings = toppings.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'Semua' || (t.categories && t.categories.includes(filterCategory));
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari master topping..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 bg-white font-semibold text-brand-dark-900"
          >
            <option value="Semua">Semua Kategori</option>
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand-orange-600 hover:bg-brand-orange-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Tambah Topping
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray-50 border-b border-brand-gray-100 text-brand-gray-500 text-sm font-semibold">
                <th className="py-4 px-6">Nama Topping</th>
                <th className="py-4 px-6">Harga</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredToppings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-brand-gray-500">
                    Tidak ada topping yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredToppings.map((topping) => (
                  <tr key={topping.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-dark-900">
                      {topping.name}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-orange-600">
                      {formatPrice(topping.price)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {topping.categories ? topping.categories.split(',').map((cat, i) => (
                          <span key={i} className="px-2 py-1 bg-brand-gray-100 text-brand-gray-600 text-xs font-semibold rounded-md">
                            {cat}
                          </span>
                        )) : (
                          <span className="text-brand-gray-400 text-xs italic">Semua</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(topping)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Topping"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(topping.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Topping"
                        >
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-brand-gray-100">
              <h2 className="text-xl font-black text-brand-dark-900">
                {editingTopping ? 'Edit Topping' : 'Tambah Topping Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-brand-gray-400 hover:bg-brand-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark-900">Nama Topping</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none"
                    placeholder="Contoh: Ekstra Keju"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark-900">Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none"
                    placeholder="Contoh: 5000"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark-900">Berlaku untuk Kategori</label>
                  <div className="flex flex-wrap gap-3">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, categories: [...formData.categories, cat] });
                            } else {
                              setFormData({ ...formData, categories: formData.categories.filter(c => c !== cat) });
                            }
                          }}
                          className="w-4.5 h-4.5 rounded border-brand-gray-300 text-brand-orange-600 focus:ring-brand-orange-500"
                        />
                        <span className="text-sm text-brand-dark-900">{cat}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-brand-gray-500">Kosongkan jika berlaku untuk semua menu makanan.</p>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-brand-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-brand-gray-600 hover:bg-brand-gray-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-brand-orange-600 hover:bg-brand-orange-700 disabled:bg-brand-orange-400 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Simpan Topping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
