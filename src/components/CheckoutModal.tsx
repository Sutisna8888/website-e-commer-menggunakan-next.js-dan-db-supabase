'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, MapPin, CheckCircle2, QrCode, ClipboardCheck, ArrowRight, Loader2, Ticket } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
  onOrderSuccess: () => void;
}

interface Address {
  id: string;
  label: string;
  receiver: string;
  phone: string;
  detail: string;
  isPrimary: boolean;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  totalAmount,
  onOrderSuccess
}: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'payment_detail' | 'success'>('form');
  const [addressType, setAddressType] = useState<'saved' | 'custom'>('saved');
  const [customAddress, setCustomAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VA' | 'QRIS'>('COD');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'Mandiri' | 'BNI' | 'BRI' | 'Permata' | 'CIMB'>('BCA');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [finalTotalAmount, setFinalTotalAmount] = useState(0);

  // Voucher State
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{code: string, amount: number, type: string} | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState<string | null>(null);

  // Addresses States
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setStep('form');
        setCustomAddress('');
        setErrorMessage(null);
        setCreatedOrderId('');
        setPaymentMethod('COD');
        setSelectedBank('BCA');
        setIsLoading(false);
        setFinalTotalAmount(0); // Reset to 0 initially
        setVoucherCodeInput('');
        setAppliedVoucher(null);
        setVoucherError(null);
        setVoucherSuccessMsg(null);
      }, 0);
    }
  }, [isOpen]);

  // Fetch addresses when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsAddressesLoading(true);
        fetch('/api/addresses')
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error('Gagal memuat alamat');
          })
          .then((data: Address[]) => {
            setSavedAddresses(data);
            if (data.length > 0) {
              const primary = data.find((a) => a.isPrimary) || data[0];
              setSelectedAddressId(primary.id);
              setAddressType('saved');
            } else {
              setAddressType('custom');
            }
          })
          .catch((err) => {
            console.error(err);
            setAddressType('custom');
          })
          .finally(() => {
            setIsAddressesLoading(false);
          });
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getResolvedAddress = () => {
    if (addressType === 'custom') return customAddress;
    const addr = savedAddresses.find((a) => a.id === selectedAddressId);
    return addr 
      ? `${addr.detail} (Penerima: ${addr.receiver}, Telp: ${addr.phone})`
      : '';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Generate simulated Virtual Account Number
  const getVANumber = () => {
    const bankPrefixes = {
      BCA: '80777',
      Mandiri: '89608',
      BNI: '82770',
      BRI: '88810',
      Permata: '8528',
      CIMB: '5149'
    };
    const prefix = bankPrefixes[selectedBank] || '80777';
    let phoneSuffix = '81234567890'; // Suffix default jika tidak ada alamat tersimpan

    if (addressType === 'saved') {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr && addr.phone) {
        // Ambil hanya angka dari nomor telepon
        let cleaned = addr.phone.replace(/\D/g, '');
        // Bersihkan awalan kode negara Indonesia (62) atau angka 0 di depan
        if (cleaned.startsWith('62')) {
          cleaned = cleaned.substring(2);
        } else if (cleaned.startsWith('0')) {
          cleaned = cleaned.substring(1);
        }
        if (cleaned) {
          phoneSuffix = cleaned;
        }
      }
    }

    return `${prefix}${phoneSuffix}`;
  };

  const handleNextStep = () => {
    if (addressType === 'custom' && !customAddress.trim()) {
      setErrorMessage('Silakan isi alamat kustom pengiriman Anda.');
      return;
    }
    if (addressType === 'saved' && !selectedAddressId) {
      setErrorMessage('Silakan pilih alamat pengiriman Anda.');
      return;
    }
    setErrorMessage(null);
    setFinalTotalAmount(Math.max(0, totalAmount - (appliedVoucher?.amount || 0)));
    setStep('payment_detail');
  };

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setIsApplyingVoucher(true);
    setVoucherError(null);
    setVoucherSuccessMsg(null);

    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCodeInput, totalAmount })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAppliedVoucher({
          code: data.voucherCode,
          amount: data.discountAmount,
          type: data.discountType
        });
        setVoucherSuccessMsg(`Voucher berhasil dipasang! Diskon Rp ${data.discountAmount.toLocaleString('id-ID')}`);
        setVoucherCodeInput('');
      } else {
        setVoucherError(data.error || 'Gagal menerapkan voucher');
        setAppliedVoucher(null);
      }
    } catch {
      setVoucherError('Terjadi kesalahan koneksi');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherSuccessMsg(null);
    setVoucherError(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const address = getResolvedAddress();
    const resolvedPaymentMethod = paymentMethod === 'COD' 
      ? 'COD (Bayar di Tempat)' 
      : paymentMethod === 'QRIS' 
      ? 'QRIS E-Wallet' 
      : `Virtual Account (${selectedBank})`;

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          paymentMethod: resolvedPaymentMethod,
          items: cartItems,
          totalAmount: finalTotalAmount,
          voucherCode: appliedVoucher?.code || null,
          discountAmount: appliedVoucher?.amount || 0
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCreatedOrderId(data.orderId);
        setStep('success');
        onOrderSuccess(); // Kosongkan keranjang belanja di page utama
      } else {
        setErrorMessage(data.error || 'Gagal memproses pesanan Anda');
      }
    } catch (error) {
      console.error('Error saat submit order:', error);
      setErrorMessage('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark-950/60 backdrop-blur-sm transition-opacity"
        onClick={step === 'success' ? undefined : onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header (Hide on Success) */}
        {step !== 'success' && (
          <div className="flex items-center justify-between border-b border-brand-gray-100 px-6 py-4">
            <h3 className="text-lg font-black text-brand-dark-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-orange-600" />
              Checkout Pembayaran
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-brand-gray-400 hover:bg-brand-gray-100 hover:text-brand-dark-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
              {errorMessage}
            </div>
          )}

          {step === 'form' && (
            <div className="flex flex-col gap-6">
              {/* Alamat Pengiriman */}
              <div>
                <h4 className="text-sm font-bold text-brand-dark-900 flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-brand-orange-600" />
                  Pilih Alamat Pengiriman
                </h4>
                <div className="mt-3 flex flex-col gap-3">
                  {isAddressesLoading ? (
                    <div className="flex justify-center items-center py-6 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-orange-600" />
                      <span className="text-xs font-bold text-brand-gray-400">Memuat alamat pengiriman...</span>
                    </div>
                  ) : (
                    <>
                      {/* Tampilkan Daftar Alamat tersimpan */}
                      {savedAddresses.map((addr) => (
                        <label 
                          key={addr.id} 
                          className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${addressType === 'saved' && selectedAddressId === addr.id ? 'border-brand-orange-500 bg-brand-orange-50/10' : 'border-brand-gray-100 hover:bg-brand-gray-50'}`}
                        >
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="selectedAddressId" 
                              value={addr.id}
                              checked={addressType === 'saved' && selectedAddressId === addr.id}
                              onChange={() => {
                                setAddressType('saved');
                                setSelectedAddressId(addr.id);
                              }}
                              className="text-brand-orange-600 focus:ring-brand-orange-500/20 h-4 w-4"
                            />
                            <span className="text-xs font-bold text-brand-dark-900 flex items-center gap-1.5">
                              {addr.label}
                              {addr.isPrimary && (
                                <span className="bg-brand-orange-100 text-brand-orange-700 text-[9px] px-2 py-0.5 rounded-full font-extrabold border border-brand-orange-200">
                                  Utama
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="mt-1.5 text-[11px] text-brand-dark-700 pl-6 font-semibold">
                            Penerima: {addr.receiver} | Telp: {addr.phone}
                          </div>
                          <span className="mt-0.5 text-[10px] text-brand-gray-500 pl-6">{addr.detail}</span>
                        </label>
                      ))}

                      {/* Opsi Alamat Baru */}
                      <label className={`flex flex-col p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${addressType === 'custom' ? 'border-brand-orange-500 bg-brand-orange-50/10' : 'border-brand-gray-100 hover:bg-brand-gray-50'}`}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="addressType" 
                            value="custom"
                            checked={addressType === 'custom'}
                            onChange={() => setAddressType('custom')}
                            className="text-brand-orange-600 focus:ring-brand-orange-500/20 h-4 w-4"
                          />
                          <span className="text-xs font-bold text-brand-dark-900">Ketik Alamat Baru</span>
                        </div>
                        {addressType === 'custom' && (
                          <div className="mt-3 ml-6 flex flex-col gap-2">
                            <textarea
                              value={customAddress}
                              onChange={(e) => setCustomAddress(e.target.value)}
                              placeholder="Masukkan detail alamat lengkap pengiriman Anda di sini..."
                              className="p-2.5 text-xs border border-brand-gray-200 rounded-xl outline-none focus:border-brand-orange-500 h-16 resize-none font-medium"
                            />
                            <p className="text-[10px] text-brand-gray-400 italic">
                              💡 Tips: Anda juga dapat menyimpan alamat secara permanen di <a href="/profile" className="text-brand-orange-600 font-bold underline hover:text-brand-orange-700">Profil Saya</a> untuk checkout lebih cepat.
                            </p>
                          </div>
                        )}
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* Promo & Voucher */}
              <div>
                <h4 className="text-sm font-bold text-brand-dark-900 flex items-center gap-1.5 mb-3">
                  <Ticket className="h-4.5 w-4.5 text-brand-orange-600" />
                  Makin Hemat Pakai Promo
                </h4>
                
                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Kode {appliedVoucher.code} Terpasang!
                      </span>
                      <span className="text-xs text-green-600 font-medium">Diskon: -{formatPrice(appliedVoucher.amount)}</span>
                    </div>
                    <button onClick={removeVoucher} className="text-xs font-bold text-red-500 hover:text-red-600 px-2 py-1 bg-white rounded-lg border border-red-100">
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Masukkan Kode Promo" 
                        value={voucherCodeInput}
                        onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 p-3 text-sm border border-brand-gray-200 rounded-2xl outline-none focus:border-brand-orange-500 font-bold uppercase"
                      />
                      <button 
                        onClick={handleApplyVoucher}
                        disabled={isApplyingVoucher || !voucherCodeInput}
                        className="px-4 py-3 bg-brand-dark-900 text-white text-sm font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-dark-950 transition-colors flex items-center justify-center min-w-[80px]"
                      >
                        {isApplyingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gunakan'}
                      </button>
                    </div>
                    {voucherError && <span className="text-xs font-bold text-red-500 pl-1">{voucherError}</span>}
                    {voucherSuccessMsg && <span className="text-xs font-bold text-green-600 pl-1">{voucherSuccessMsg}</span>}
                  </div>
                )}
              </div>

              {/* Metode Pembayaran */}
              <div>
                <h4 className="text-sm font-bold text-brand-dark-900 flex items-center gap-1.5">
                  <CreditCard className="h-4.5 w-4.5 text-brand-orange-600" />
                  Pilih Metode Pembayaran
                </h4>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  <label className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'COD' ? 'border-brand-orange-500 bg-brand-orange-50/20 text-brand-orange-600' : 'border-brand-gray-100 hover:bg-brand-gray-50 text-brand-gray-500'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">COD</span>
                    <span className="text-[9px] text-brand-gray-400 mt-1">Bayar di Tempat</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'VA' ? 'border-brand-orange-500 bg-brand-orange-50/20 text-brand-orange-600' : 'border-brand-gray-100 hover:bg-brand-gray-50 text-brand-gray-500'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="VA"
                      checked={paymentMethod === 'VA'}
                      onChange={() => setPaymentMethod('VA')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">Transfer Bank</span>
                    <span className="text-[9px] text-brand-gray-400 mt-1">Virtual Account</span>
                  </label>

                  <label className={`flex flex-col items-center justify-center p-3 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMethod === 'QRIS' ? 'border-brand-orange-500 bg-brand-orange-50/20 text-brand-orange-600' : 'border-brand-gray-100 hover:bg-brand-gray-50 text-brand-gray-500'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="QRIS"
                      checked={paymentMethod === 'QRIS'}
                      onChange={() => setPaymentMethod('QRIS')}
                      className="sr-only"
                    />
                    <span className="text-xs font-bold">QRIS</span>
                    <span className="text-[9px] text-brand-gray-400 mt-1">GoPay / Shopee</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {step === 'payment_detail' && (
            <div className="flex flex-col gap-5">
              {/* Ringkasan Rincian Pembayaran */}
              <div className="rounded-2xl bg-brand-gray-50 p-4 border border-brand-gray-100">
                <h5 className="text-xs font-bold text-brand-dark-900 uppercase tracking-wide">Rincian Pembayaran</h5>
                <div className="mt-3 flex flex-col gap-1.5 text-xs text-brand-gray-500">
                  <div className="flex justify-between">
                    <span>Metode Pembayaran</span>
                    <span className="font-bold text-brand-dark-900">
                      {paymentMethod === 'COD' ? 'COD (Bayar di Tempat)' : paymentMethod === 'QRIS' ? 'QRIS E-Wallet' : `Virtual Account (${selectedBank})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kirim ke</span>
                    <span className="font-bold text-brand-dark-900 truncate max-w-[200px]">{getResolvedAddress()}</span>
                  </div>
                  <div className="mt-2 border-t border-brand-gray-200 pt-2 flex justify-between text-sm font-black text-brand-dark-950">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-sm font-black text-green-600">
                      <span>Diskon ({appliedVoucher.code})</span>
                      <span>-{formatPrice(appliedVoucher.amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-black text-brand-dark-950 pt-1">
                    <span>Total Tagihan Akhir</span>
                    <span className="text-brand-orange-600">{formatPrice(finalTotalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Detail Instruksi Pembayaran */}
              <div className="flex-1 flex flex-col items-center justify-center py-4">
                {paymentMethod === 'COD' && (
                  <div className="text-center max-w-xs flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-brand-orange-50 text-brand-orange-600 flex items-center justify-center mb-3">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <h5 className="text-sm font-bold text-brand-dark-900">Bayar Tunai di Tempat</h5>
                    <p className="mt-1.5 text-xs text-brand-gray-400 leading-relaxed">
                      Anda hanya perlu membayar sejumlah <span className="font-black text-brand-dark-900">{formatPrice(finalTotalAmount)}</span> kepada kurir RasaNusantara saat makanan tiba di rumah Anda.
                    </p>
                  </div>
                )}

                {paymentMethod === 'VA' && (
                  <div className="w-full flex flex-col gap-4">
                    {/* Bank Selection Tab */}
                    <div className="flex justify-center gap-2 flex-wrap">
                      {(['BCA', 'Mandiri', 'BNI', 'BRI', 'Permata', 'CIMB'] as const).map((bank) => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${selectedBank === bank ? 'bg-brand-orange-600 text-white border-brand-orange-600' : 'bg-white text-brand-gray-500 border-brand-gray-200 hover:bg-brand-gray-50'}`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-brand-gray-200 bg-white p-5 flex flex-col items-center text-center">
                      <span className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">Nomor Virtual Account</span>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-black text-brand-dark-900 tracking-wider">{getVANumber()}</span>
                        <button
                          onClick={() => copyToClipboard(getVANumber())}
                          className="rounded-full bg-brand-gray-100 hover:bg-brand-gray-200 p-1 text-brand-dark-800 transition-colors"
                          title="Salin Nomor VA"
                        >
                          <ClipboardCheck className={`h-4 w-4 ${isCopied ? 'text-brand-green-600' : 'text-brand-dark-800'}`} />
                        </button>
                      </div>
                      {isCopied && <span className="text-[10px] text-brand-green-600 font-bold mt-1">Nomor VA disalin!</span>}

                      <p className="mt-4 text-[10px] text-brand-gray-400 leading-relaxed max-w-xs">
                        Silakan salin nomor Virtual Account di atas dan lakukan pembayaran via M-Banking Anda sebelum mengonfirmasi pesanan.
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'QRIS' && (
                  <div className="flex flex-col items-center text-center">
                    {/* Mockup QRIS Card */}
                    <div className="rounded-2xl border border-brand-gray-200 bg-white p-5 flex flex-col items-center">
                      {/* Logo QRIS Header */}
                      <div className="bg-blue-900 text-white font-black text-sm px-5 py-1 rounded-md tracking-wider flex items-center gap-1.5 shadow-sm">
                        <QrCode className="h-4 w-4" />
                        QRIS
                      </div>
                      
                      {/* QR Barcode Block */}
                      <div className="relative mt-4 h-40 w-40 border border-brand-gray-100 p-2 rounded-xl bg-brand-gray-50 flex items-center justify-center">
                        {/* Nested CSS Grid representing a simulated QR Code */}
                        <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-80">
                          {Array.from({ length: 25 }).map((_, i) => {
                            const isFilled = (i * 7 + 13) % 2 === 0 || i === 0 || i === 4 || i === 20 || i === 24;
                            return (
                              <div 
                                key={i} 
                                className={`rounded-sm ${isFilled ? 'bg-brand-dark-950' : 'bg-transparent'}`} 
                              />
                            );
                          })}
                        </div>
                        {/* Center Icon */}
                        <div className="absolute h-10 w-10 bg-white rounded-lg border border-brand-gray-200 shadow-md flex items-center justify-center font-black text-[10px] text-brand-orange-600">
                          RasaNu
                        </div>
                      </div>

                      <span className="text-[10px] text-brand-gray-400 font-medium mt-3">Scan QR di atas untuk membayar</span>
                    </div>

                    <p className="mt-4 text-[10px] text-brand-gray-400 leading-relaxed max-w-xs">
                      Mendukung pembayaran digital GoPay, OVO, Dana, LinkAja, ShopeePay, dan aplikasi M-Banking lainnya.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="h-16 w-16 bg-brand-green-50 text-brand-green-600 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              
              <h3 className="mt-5 text-xl font-black text-brand-dark-900">Pesanan Berhasil Dibuat!</h3>
              <p className="mt-2 text-xs text-brand-gray-400 max-w-xs leading-relaxed">
                Terima kasih sudah memesan di RasaNusantara. Pesanan Anda saat ini sedang diproses oleh dapur mitra kami.
              </p>

              <div className="mt-6 rounded-2xl bg-brand-gray-50 border border-brand-gray-200 px-5 py-4 w-full text-left text-xs flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-brand-gray-400 font-semibold">ID Pesanan</span>
                  <span className="font-mono font-black text-brand-dark-950">{createdOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray-400 font-semibold">Metode Pembayaran</span>
                  <span className="font-bold text-brand-dark-900">
                    {paymentMethod === 'COD' ? 'COD (Bayar di Tempat)' : paymentMethod === 'QRIS' ? 'QRIS E-Wallet' : `Virtual Account (${selectedBank})`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-brand-gray-200 pt-2 font-black text-sm text-brand-dark-950">
                  <span>Total Dibayar</span>
                  <span className="text-brand-orange-600">{formatPrice(finalTotalAmount)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-8 w-full rounded-2xl bg-brand-dark-900 py-3.5 text-center text-sm font-bold text-white shadow-premium hover:bg-brand-orange-600 transition-colors"
              >
                Kembali ke Beranda
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions (Hide on Success) */}
        {step !== 'success' && (
          <div className="border-t border-brand-gray-100 bg-brand-gray-50 px-6 py-4 flex items-center justify-between gap-4">
            {step === 'form' ? (
              <>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-2xl border border-brand-gray-200 bg-white text-xs font-bold text-brand-dark-800 hover:bg-brand-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-brand-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 transition-all"
                >
                  Lanjut ke Pembayaran
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep('form')}
                  className="px-5 py-2.5 rounded-2xl border border-brand-gray-200 bg-white text-xs font-bold text-brand-dark-800 hover:bg-brand-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Kembali
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-brand-orange-600 py-2.5 px-4 text-xs font-bold text-white shadow-premium hover:bg-brand-orange-700 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Konfirmasi & Buat Pesanan'
                  )}
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
