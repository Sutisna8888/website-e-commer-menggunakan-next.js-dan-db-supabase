# Roadmap & Backlog Fitur E-Commerce RasaNusantara

Dokumen ini berisi daftar lengkap fitur aplikasi pemesanan makanan **RasaNusantara**. Dokumen ini digunakan sebagai acuan pengembangan langkah demi langkah secara terstruktur.

---

## 📌 Legenda Status Fitur
* `[x]` **Selesai**: Fitur sudah dibuat, diintegrasikan ke backend/database secara nyata, dan lolos uji kompilasi.
* `[/]` **Sementara (Butuh Penyesuaian)**: Fitur sudah berjalan sebagian secara mockup/simulasi, atau sudah ada komponen visualnya namun masih membutuhkan penyesuaian fungsional lebih lanjut (misal: integrasi database di tahap berikutnya).
* `[ ]` **Belum**: Fitur belum dikerjakan sama sekali.

---

## Progres Pengembangan Saat Ini
 
* **Fase 1 (Selesai)**: Desain beranda premium (Next.js + Tailwind CSS) & interaktivitas filter pencarian produk.
* **Fase 2 (Selesai)**: Integrasi database PostgreSQL Supabase & Prisma ORM v7, serta API route `/api/foods` untuk memuat menu makanan secara dinamis.
* **Fase 3 (Selesai)**: Sistem autentikasi pengguna (Login/Daftar) nyata menggunakan database, profil pelanggan dinamis di header, dan fitur pengelolaan keranjang belanja persisten.
* **Fase 4 (Selesai)**: Detail & Kustomisasi Makanan (Varian Pedas, Topping tambahan berbayar, Catatan Koki) beserta pemisahan item kustom di keranjang belanja.
* **Fase 5 (Selesai)**: Checkout & Simulasi Pemesanan (Alamat, Pembayaran VA/QRIS/COD, API Database, & Riwayat Pesanan).
* **Fase 6 (Selesai)**: Profil Pengguna & Manajemen Alamat Dinamis (CRUD Alamat terhubung ke Supabase).

---

## 1. Fitur Pengguna (Customer)

### Autentikasi & Akun
- [x] **Login Akun**: Menggunakan email & password terdaftar (Real API JWT + HttpOnly Cookies)
- [x] **Registrasi Akun**: Pendaftaran pelanggan baru (Real API + password hash bcryptjs)
- [x] **Logout**: Keluar dari sesi akun secara aman (Menghapus cookie sesi)
- [x] **Profil Pengguna**:
  - [x] Menampilkan inisial huruf nama profil di header setelah masuk
  - [x] Melihat halaman profil pribadi lengkap (`/profile`)
  - [x] Mengubah informasi profil (Nama)
  - [x] Unggah foto profil
  - [x] Mengubah password akun
- [x] **Manajemen Alamat**:
  - [x] Menambah alamat baru (Rumah, Kantor, dll)
  - [x] Mengubah detail alamat
  - [x] Menghapus alamat
  - [x] Memilih alamat utama untuk pengiriman
- [ ] **OAuth Login**: Login cepat via Google
- [ ] **OAuth Login**: Login cepat via Facebook
- [ ] **Lupa & Reset Password**: Pengiriman tautan reset password via email
- [ ] **Verifikasi Email**: Aktivasi akun setelah pendaftaran

### Eksplorasi Menu (Beranda & Cari)
- [x] **Banner Promosi**: Section Hero interaktif dengan tombol CTA
- [x] **Kategori Makanan**: Tab filter kategori (Makanan Utama, Cemilan, Minuman, Sehat)
- [x] **Produk Populer**: Penanda produk terlaris ("🔥 Terpopuler")
- [x] **Pencarian Makanan**: Kolom pencarian responsif dengan fitur *debounce* 300ms
- [x] **Filter & Sorting**:
  - [x] Filter kategori dari database Supabase
  - [x] Filter rating & harga
  - [x] Sorting harga (terendah/tertinggi)
  - [x] Sorting rating & terlaris
- [ ] **Promo & Flash Sale**: Section khusus makanan diskon/promo hari ini

### Detail & Ulasan Produk
- [x] **Daftar Makanan**: Tampilan grid menu yang responsif dari database Supabase
- [x] **Detail Makanan**: Menampilkan informasi lengkap menu (Gambar, deskripsi, harga, rating, estimasi waktu masak) via `FoodDetailModal`
- [x] **Kustomisasi Makanan**:
  - [x] Pilihan varian tingkat kepedasan (Tidak Pedas, Sedang, Pedas, Sangat Pedas)
  - [x] Pilihan topping tambahan berbayar (Telur Mata Sapi, Keju, Ekstra Ayam) dengan harga ter-update real-time
  - [x] Catatan pesanan khusus untuk koki (textarea input)
- [x] **Favorit / Wishlist**:
  - [x] Menambah makanan ke daftar favorit
  - [x] Menghapus dari daftar favorit
  - [x] Halaman khusus daftar makanan favorit

### Keranjang Belanja & Checkout
- [x] **Keranjang Belanja (Cart)**:
  - [x] Tambah produk ke keranjang belanja (Pemisahan baris item kustomisasi unik)
  - [x] Menyesuaikan jumlah (quantity) produk langsung di keranjang
  - [x] Menghapus produk dari keranjang belanja
  - [x] Persistensi isi keranjang di LocalStorage (Tidak hilang saat refresh halaman)
- [x] **Perhitungan Biaya Tambahan**:
  - [x] Perhitungan Pajak restoran (10% dari subtotal)
  - [x] Perhitungan Ongkir otomatis (Flat Rp 12.000, Gratis jika belanja > Rp 50.000)
- [x] **Checkout Pesanan**:
  - [x] Klik tombol pembayaran di Cart Drawer
  - [x] Memilih alamat pengiriman utama (dari alamat tersimpan Supabase)
  - [x] Menentukan metode pembayaran asli (COD, VA, QRIS)
  - [x] Konfirmasi akhir & buat pesanan ke database
- [ ] **Voucher & Diskon**: Menggunakan kode voucher/promo

### Transaksi & Pesanan
- [x] **Metode Pembayaran**:
  - [x] COD (Bayar di Tempat)
  - [x] Virtual Account / Transfer Bank (Simulasi BCA/Mandiri/BNI dengan VA code)
  - [x] E-Wallet (QRIS scan mockup)
- [x] **Manajemen Transaksi**:
  - [x] Status pembayaran real-time (Berhasil, Gagal, Tertunda)
  - [x] Riwayat transaksi pesanan pelanggan (Histori belanja)
  - [x] Pelacakan status pengiriman (Diproses)
  - [x] Cetak / unduh invoice transaksi (PDF)
- [ ] **Notifikasi Real-time**: Notifikasi perubahan status pesanan & promo terbaru
- [ ] **Layanan Pelanggan (Customer Service)**:
  - [ ] Halaman FAQ (Pertanyaan yang sering diajukan)
  - [ ] Sistem Live Chat / WhatsApp Admin bantuan

---

## 2. Fitur Merchant / Restoran (Belum Dimulai)
- [ ] **Dashboard Ringkasan**: Statistik penjualan harian/bulanan & grafik pendapatan
- [ ] **Manajemen Produk**: Tambah, edit, hapus menu makanan dari database harian
- [ ] **Manajemen Pesanan Masuk**: Menerima/menolak pesanan & update status memasak harian
- [ ] **Manajemen Promo Restoran**: Pembuatan voucher diskon khusus merchant
- [ ] **Laporan Penjualan**: Laporan performa menu terlaris

---

## 3. Fitur Administrator (Admin Super) (Belum Dimulai)
- [ ] **Dashboard Utama**: Statistik total pengguna, merchant aktif, dan total transaksi harian
- [ ] **User Management**: Monitoring & blokir akun pelanggan/merchant yang melanggar
- [ ] **Verifikasi & Moderasi**: Verifikasi merchant baru & moderasi ulasan produk
- [ ] **Manajemen Keuangan**: Verifikasi transfer manual & rekapitulasi bulanan
- [ ] **Promosi Nasional**: Kelola banner promo beranda & voucher diskon global

---

## 4. Fitur Kurir (Opsional) (Belum Dimulai)
- [ ] **Akses Kurir**: Autentikasi khusus kurir
- [ ] **Daftar Pesanan Siap Kirim**: Mengambil tugas pengiriman terdekat
- [ ] **Navigasi Maps**: Integrasi rute rincian alamat via Google Maps
- [ ] **Update Lokasi**: Sistem pelacakan kurir saat pengantaran
- [ ] **Konfirmasi Pengiriman**: Unggah foto bukti serah terima makanan ke pelanggan

---

## 5. Fitur Tambahan & Optimasi (Belum Dimulai)
- [ ] **Dark Mode**: Pilihan tema gelap untuk kenyamanan mata malam hari
- [ ] **Multi Bahasa**: Dukungan Bahasa Indonesia & Bahasa Inggris
- [ ] **Progressive Web App (PWA)**: Website bisa diinstal di HP tanpa app store
- [ ] **Loyalty Point**: Pengumpulan poin setiap transaksi untuk ditukar diskon
- [ ] **Chatbot AI**: Asisten AI untuk membantu merekomendasikan menu makanan terbaik
