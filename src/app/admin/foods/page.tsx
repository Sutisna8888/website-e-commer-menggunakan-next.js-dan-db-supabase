'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  soldCount: number;
  prepTime: string;
  toppings?: { id: string; name: string; price: number }[];
}

interface GlobalTopping {
  id: string;
  name: string;
  price: number;
  categories: string;
}

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');
  const [globalToppings, setGlobalToppings] = useState<GlobalTopping[]>([]);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Makanan',
    imageUrl: '',
    imageFile: null as File | null,
    isAvailable: true,
    toppings: [] as { name: string, price: string }[]
  });
  const [isSaving, setIsSaving] = useState(false);

  const [toppingSearch, setToppingSearch] = useState('');
  const [newToppingName, setNewToppingName] = useState('');
  const [newToppingPrice, setNewToppingPrice] = useState('');
  const [isAddingTopping, setIsAddingTopping] = useState(false);

  const handleAddNewTopping = async () => {
    if (!newToppingName || !newToppingPrice) return;
    try {
      setIsAddingTopping(true);
      const res = await fetch('/api/admin/toppings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newToppingName, price: newToppingPrice, categories: formData.category })
      });
      if (res.ok) {
        await fetchToppings();
        setNewToppingName('');
        setNewToppingPrice('');
      } else {
        alert('Gagal menambahkan topping');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan');
    } finally {
      setIsAddingTopping(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/admin/foods');
      if (res.ok) {
        const data = await res.json();
        setFoods(data);
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchToppings = async () => {
    try {
      const res = await fetch('/api/admin/toppings');
      if (res.ok) {
        const data = await res.json();
        setGlobalToppings(data);
      }
    } catch (error) {
      console.error('Error fetching global toppings:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods();
      fetchToppings();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = (food?: FoodItem) => {
    if (food) {
      setEditingFood(food);
      setFormData({
        name: food.name,
        description: food.description,
        price: food.price.toString(),
        category: food.category,
        imageUrl: food.imageUrl,
        imageFile: null,
        isAvailable: food.isAvailable,
        toppings: food.toppings?.map(t => ({ name: t.name, price: t.price.toString() })) || []
      });
    } else {
      setEditingFood(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Makanan',
        imageUrl: '',
        imageFile: null,
        isAvailable: true,
        toppings: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingFood ? `/api/admin/foods/${editingFood.id}` : '/api/admin/foods';
      const method = editingFood ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('isAvailable', formData.isAvailable.toString());
      if (formData.imageFile) {
        data.append('imageFile', formData.imageFile);
      }
      data.append('toppings', JSON.stringify(formData.toppings));

      const res = await fetch(url, {
        method,
        body: data
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchFoods();
      } else {
        alert('Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;
    
    try {
      const res = await fetch(`/api/admin/foods/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchFoods();
      } else {
        alert('Gagal menghapus menu');
      }
    } catch (error) {
      console.error('Error deleting food:', error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);
  };

  const filteredFoods = foods.filter(food => {
    const matchSearch = food.name.toLowerCase().includes(search.toLowerCase()) || 
                        food.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'Semua' || food.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 dark:text-brand-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari menu makanan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-gray-200 dark:border-brand-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent transition-all bg-white dark:bg-brand-dark-900 text-brand-dark-900 dark:text-white placeholder-brand-gray-400 dark:placeholder-brand-gray-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-brand-gray-200 dark:border-brand-dark-700 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 bg-white dark:bg-brand-dark-900 font-semibold text-brand-dark-900 dark:text-white"
          >
            <option value="Semua">Semua Kategori</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Camilan">Camilan</option>
            <option value="Paket Hemat">Paket Hemat</option>
          </select>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand-orange-600 dark:bg-brand-orange-500 hover:bg-brand-orange-700 dark:hover:bg-brand-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Tambah Menu Baru
        </button>
      </div>

      <div className="bg-white dark:bg-brand-dark-900/50 backdrop-blur-xl rounded-3xl shadow-sm border border-brand-gray-100 dark:border-brand-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray-50 dark:bg-brand-dark-800/50 border-b border-brand-gray-100 dark:border-brand-dark-700 text-brand-gray-500 dark:text-brand-gray-400 text-sm font-semibold">
                <th className="py-4 px-6">Menu</th>
                <th className="py-4 px-6">Kategori</th>
                <th className="py-4 px-6">Harga</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredFoods.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-brand-gray-500 dark:text-brand-gray-400">
                    Tidak ada menu yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredFoods.map((food) => (
                  <tr key={food.id} className="border-b border-brand-gray-50 dark:border-brand-dark-800/50 hover:bg-brand-gray-50/50 dark:hover:bg-brand-dark-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-brand-gray-100 dark:bg-brand-dark-800 shrink-0">
                          {food.imageUrl ? (
                            <Image src={food.imageUrl} alt={food.name} fill className="object-cover" />
                          ) : (
                            <ImageIcon className="w-6 h-6 m-3 text-brand-gray-300 dark:text-brand-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-brand-dark-900 dark:text-white">{food.name}</p>
                          <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 truncate max-w-[200px]">{food.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-gray-100 dark:bg-brand-dark-800 text-brand-gray-600 dark:text-brand-gray-300">
                        {food.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-orange-600 dark:text-brand-orange-500">
                      {formatPrice(food.price)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        {food.isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Tersedia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Habis
                          </span>
                        )}
                        {food.soldCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-orange-500">
                            📈 Terjual: {food.soldCount} porsi
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(food)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Menu"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(food.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Menu"
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
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-brand-gray-100">
              <h2 className="text-xl font-black text-brand-dark-900">
                {editingFood ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-brand-gray-400 hover:bg-brand-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark-900">Nama Menu</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none"
                    placeholder="Contoh: Nasi Goreng Spesial"
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
                    placeholder="Contoh: 25000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-brand-dark-900">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Camilan">Camilan</option>
                    <option value="Paket Hemat">Paket Hemat</option>
                  </select>
                </div>


              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-dark-900">Gambar Menu</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({...formData, imageFile: e.target.files[0]});
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-orange-50 file:text-brand-orange-600 hover:file:bg-brand-orange-100"
                />
                {editingFood && formData.imageUrl && !formData.imageFile && (
                  <p className="text-xs text-brand-gray-500 mt-1">
                    Biarkan kosong jika tidak ingin mengubah gambar yang sudah ada.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-dark-900">Deskripsi</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent outline-none resize-none"
                  placeholder="Deskripsi singkat tentang menu ini..."
                />
              </div>

              {/* Topping Tambahan Section */}
              <div className="space-y-4 pt-4 border-t border-brand-gray-100">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-brand-dark-900">Topping Tambahan (Pilih dari Master Topping)</label>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari topping..."
                      value={toppingSearch}
                      onChange={(e) => setToppingSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>

                {/* Tambah Topping Cepat */}
                <div className="flex flex-col sm:flex-row gap-2 bg-brand-gray-50 p-3 rounded-xl border border-brand-gray-100">
                  <input
                    type="text"
                    placeholder="Nama Topping Baru"
                    value={newToppingName}
                    onChange={(e) => setNewToppingName(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Harga"
                    value={newToppingPrice}
                    onChange={(e) => setNewToppingPrice(e.target.value)}
                    className="w-full sm:w-32 px-3 py-2 rounded-lg border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTopping}
                    disabled={isAddingTopping || !newToppingName || !newToppingPrice}
                    className="bg-brand-orange-600 hover:bg-brand-orange-700 disabled:bg-brand-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 shrink-0"
                  >
                    {isAddingTopping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Tambah
                  </button>
                </div>
                
                {globalToppings.length === 0 ? (
                  <p className="text-xs text-brand-gray-500 italic">Belum ada master data topping.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                    {globalToppings
                      .filter(t => t.name.toLowerCase().includes(toppingSearch.toLowerCase()))
                      .filter(t => !t.categories || t.categories === '' || t.categories.includes(formData.category))
                      .map((globalTopping) => {
                      const isChecked = formData.toppings.some(t => t.name === globalTopping.name);
                      
                      return (
                        <label key={globalTopping.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'border-brand-orange-500 bg-brand-orange-50/50' : 'border-brand-gray-200 hover:bg-brand-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  toppings: [...formData.toppings, { name: globalTopping.name, price: globalTopping.price.toString() }]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  toppings: formData.toppings.filter(t => t.name !== globalTopping.name)
                                });
                              }
                            }}
                            className="w-4.5 h-4.5 rounded border-brand-gray-300 text-brand-orange-600 focus:ring-brand-orange-500"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-brand-dark-900">{globalTopping.name}</span>
                            <span className="text-xs font-semibold text-brand-orange-600">+{formatPrice(globalTopping.price)}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                    className="w-5 h-5 rounded text-brand-orange-600 focus:ring-brand-orange-500 border-brand-gray-300"
                  />
                  <span className="text-sm font-semibold text-brand-dark-900">Menu Tersedia</span>
                </label>
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
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
