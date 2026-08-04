'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle, Clock, Truck, XCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  foodItem: { name: string; category: string };
  spiceLevel?: string;
  toppings?: string;
  notes?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  address: string;
  paymentMethod: string;
  createdAt: string;
  user: { name: string; email: string };
  orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30_DAYS');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  // Debounced Search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Removed problematic useEffect resetting page, handled in onChange directly instead

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      const now = new Date();
      let start: Date | null = null;
      let end: Date = new Date();
      
      if (dateRange === 'TODAY') {
        start = new Date(now.setHours(0,0,0,0));
      } else if (dateRange === '7_DAYS') {
        start = new Date();
        start.setDate(now.getDate() - 7);
      } else if (dateRange === '30_DAYS') {
        start = new Date();
        start.setDate(now.getDate() - 30);
      } else if (dateRange === 'CUSTOM' && customStartDate && customEndDate) {
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        end.setHours(23,59,59,999);
      } else if (dateRange === 'ALL') {
        start = new Date('2000-01-01'); // Masa lalu yang jauh
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: debouncedSearch,
        status: statusFilter
      });

      if (start) {
        params.append('startDate', start.toISOString());
        params.append('endDate', end.toISOString());
      }

      const url = `/api/admin/orders?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        setOrders(result.data || []);
        setTotalPages(result.pagination?.totalPages || 1);
        setTotalOrders(result.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'excel' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const now = new Date();
      let start: Date | null = null;
      let end: Date = new Date();
      
      if (dateRange === 'TODAY') {
        start = new Date(now.setHours(0,0,0,0));
      } else if (dateRange === '7_DAYS') {
        start = new Date();
        start.setDate(now.getDate() - 7);
      } else if (dateRange === '30_DAYS') {
        start = new Date();
        start.setDate(now.getDate() - 30);
      } else if (dateRange === 'CUSTOM' && customStartDate && customEndDate) {
        start = new Date(customStartDate);
        end = new Date(customEndDate);
        end.setHours(23,59,59,999);
      } else if (dateRange === 'ALL') {
        start = new Date('2000-01-01');
      }

      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter
      });
      if (start) {
        params.append('startDate', start.toISOString());
        params.append('endDate', end.toISOString());
      }

      const res = await fetch(`/api/admin/orders/export?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal mengambil data laporan');
      const result = await res.json();
      const dataToExport = result.data as Order[];

      if (dataToExport.length === 0) {
        alert('Tidak ada data pesanan untuk diexport.');
        return;
      }

      // Format data
      const rows = dataToExport.map(order => ({
        'ID Pesanan': order.id.slice(-6).toUpperCase(),
        'Tanggal': formatDate(order.createdAt),
        'Nama Pelanggan': order.user?.name || 'Anonim',
        'Email': order.user?.email || '-',
        'Pesanan': order.orderItems.map(item => `${item.foodItem.name} (x${item.quantity})`).join(', '),
        'Total Harga': order.totalAmount,
        'Status': order.status,
        'Pembayaran': order.paymentMethod
      }));

      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Pesanan");
        XLSX.writeFile(workbook, `Laporan_Pesanan_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else if (format === 'pdf') {
        const doc = new jsPDF('landscape');
        doc.text('Laporan Pesanan Rasa Nusantara', 14, 15);
        
        autoTable(doc, {
          startY: 20,
          head: [['ID', 'Tanggal', 'Pelanggan', 'Pesanan', 'Total', 'Status']],
          body: dataToExport.map(order => [
            order.id.slice(-6).toUpperCase(),
            formatDate(order.createdAt),
            order.user?.name || 'Anonim',
            order.orderItems.map(item => `${item.foodItem.name} (x${item.quantity})`).join(', '),
            formatPrice(order.totalAmount),
            order.status
          ]),
          styles: { fontSize: 8 }
        });

        doc.save(`Laporan_Pesanan_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal mengekspor laporan.');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (dateRange === 'CUSTOM' && (!customStartDate || !customEndDate)) return;
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(timer);
  }, [dateRange, customStartDate, customEndDate, page, debouncedSearch, statusFilter]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (res.ok) {
        fetchOrders();
      } else {
        alert('Gagal mengupdate status pesanan');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Terjadi kesalahan');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold"><Clock className="w-3 h-3" /> PENDING</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><Loader2 className="w-3 h-3 animate-spin" /> PROSES</span>;
      case 'DELIVERING':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold"><Truck className="w-3 h-3" /> DIKIRIM</span>;
      case 'DELIVERED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><CheckCircle className="w-3 h-3" /> SELESAI</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><XCircle className="w-3 h-3" /> BATAL</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  // filteredOrders is no longer needed since filtering happens on the server
  // We use `orders` directly.

  const statusOptions = ['PENDING', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari ID Pesanan atau Nama Pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-brand-gray-600 hidden sm:block">Waktu:</label>
            <select 
              value={dateRange}
              onChange={(e) => {
              setDateRange(e.target.value);
              setPage(1);
            }}
              className="px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 bg-white font-semibold text-brand-dark-900"
            >
              <option value="TODAY">Hari Ini</option>
              <option value="7_DAYS">7 Hari Terakhir</option>
              <option value="30_DAYS">30 Hari Terakhir</option>
              <option value="ALL">Semua Waktu</option>
              <option value="CUSTOM">Kustom...</option>
            </select>
          </div>
          
          {dateRange === 'CUSTOM' && (
            <div className="flex items-center gap-2 bg-brand-gray-50 p-1.5 rounded-xl border border-brand-gray-200">
              <input 
                type="date" 
                value={customStartDate}
                onChange={e => {
                  setCustomStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1 bg-transparent text-sm focus:outline-none"
              />
              <span className="text-brand-gray-400 font-bold">-</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={e => {
                  setCustomEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2 py-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 border-l border-brand-gray-200 pl-4">
            <label className="text-sm font-semibold text-brand-gray-600 hidden lg:block">Status:</label>
            <select 
              value={statusFilter}
              onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
              className="px-4 py-2.5 rounded-xl border border-brand-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange-500 bg-white font-semibold text-brand-dark-900"
            >
              <option value="ALL">Semua Status</option>
              {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-brand-gray-500 font-medium px-1">
        <span>Menampilkan {orders.length} pesanan pada halaman ini</span>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleDownload('excel')} 
            disabled={isExporting}
            className="text-green-600 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Excel
          </button>
          <button 
            onClick={() => handleDownload('pdf')} 
            disabled={isExporting}
            className="text-red-600 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
          </button>
          <span className="hidden sm:inline">Total: <strong className="text-brand-dark-900">{totalOrders} pesanan</strong> (Sesuai Filter)</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-gray-50 border-b border-brand-gray-100 text-brand-gray-500 text-sm font-semibold">
                <th className="py-4 px-6">ID & Waktu</th>
                <th className="py-4 px-6">Pelanggan</th>
                <th className="py-4 px-6">Detail Pesanan</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-brand-orange-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-gray-500">
                    Tidak ada pesanan yang ditemukan
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-gray-50 hover:bg-brand-gray-50/50 transition-colors">
                    <td className="py-4 px-6 align-top">
                      <p className="font-bold text-brand-dark-900 uppercase text-xs">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-brand-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <p className="font-bold text-brand-dark-900">{order.user.name || 'User'}</p>
                      <p className="text-xs text-brand-gray-500">{order.user.email}</p>
                      <p className="text-[10px] text-brand-gray-400 mt-2 truncate max-w-[200px]">{order.address}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <ul className="space-y-1">
                        {order.orderItems.map((item, i) => (
                          <li key={i} className="text-xs">
                            <span className="font-semibold text-brand-dark-900">{item.quantity}x {item.foodItem.name}</span>
                            <div className="text-[10px] text-brand-gray-500 ml-4">
                              {item.spiceLevel && <span>Pedas/Gula: {item.spiceLevel} </span>}
                              {item.toppings && <span>• Topping: {item.toppings} </span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-6 align-top font-bold text-brand-orange-600">
                      {formatPrice(order.totalAmount)}
                      <p className="text-[10px] text-brand-gray-500 font-normal mt-1">{order.paymentMethod}</p>
                    </td>
                    <td className="py-4 px-6 align-top">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 align-top text-right">
                      {updatingId === order.id ? (
                        <Loader2 className="w-5 h-5 text-brand-orange-500 animate-spin ml-auto" />
                      ) : (
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="px-2 py-1.5 rounded-lg border border-brand-gray-200 text-xs font-semibold text-brand-dark-900 bg-white focus:outline-none focus:border-brand-orange-500"
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-brand-gray-100 bg-brand-gray-50">
            <span className="text-sm text-brand-gray-500">
              Halaman <span className="font-bold text-brand-dark-900">{page}</span> dari <span className="font-bold text-brand-dark-900">{totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-brand-gray-200 text-brand-dark-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gray-100 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white border border-brand-gray-200 text-brand-dark-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-gray-100 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
