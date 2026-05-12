# 🍜 Mie Ayam POS (Point of Sales)

Aplikasi **Point of Sales (POS)** ringan berbasis web yang dirancang khusus untuk manajemen penjualan kedai Mie Ayam atau bisnis kuliner serupa. Dibangun menggunakan Node.js (Express), aplikasi ini menawarkan fitur kasir yang komprehensif mulai dari manajemen stok harian hingga analitik penjualan.

## ✨ Fitur Utama

- **👨‍🍳 Multi-Kasir & Sistem Shift**: Dukungan banyak kasir dengan pencatatan shift masuk dan manual shift closure (tutup kasir).
- **📦 Manajemen Stok Harian**: Lacak ketersediaan stok bahan baku atau menu secara *real-time* untuk mencegah *overselling*.
- **💸 Sistem Diskon Otomatis/Manual**: Atur aturan diskon (contoh: promo jam tertentu atau diskon persentase/nominal kasir).
- **📊 Analitik Penjualan**: Laporan penjualan lengkap dilengkapi grafik (*charts*) untuk mengetahui jam sibuk (*peak hours*) dan produk terlaris.
- **🔐 Keaturan Ber-PIN**: Halaman pengaturan (*settings*) dan fitur sensitif dilindungi oleh PIN keamanan.
- **📱 Struk WhatsApp Otomatis**: Integrasi pengiriman struk belanja digital langsung ke nomor WhatsApp pelanggan.
- **🖥️ Antarmuka Web Interaktif**: UI kasir responsif dengan panel produk, keranjang belanja (cart), dan panel pembayaran yang efisien.

---

## 🚀 Cara Instalasi & Penggunaan

### 1. Persyaratan Sistem
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- Browser modern (Chrome, Firefox, Safari, Edge)

### 2. Instalasi
Clone repositori ini dan install dependensinya:
```bash
git clone https://github.com/fattanafif/mie-ayam-pos.git
cd mie-ayam-pos
npm install
```

### 3. Menjalankan Aplikasi
Mulai server Node.js dengan perintah berikut:
```bash
npm start
```
Atau jika Anda menggunakan nodemon untuk mode pengembangan:
```bash
npm run dev
```

Server akan berjalan secara default di `http://localhost:3000`.

### 4. Cara Menggunakan
1. Buka browser dan arahkan ke `http://localhost:3000`.
2. **Mulai Shift**: Pilih nama kasir dari daftar yang tersedia untuk memulai shift.
3. **Transaksi Baru**: Klik menu yang dibeli oleh pelanggan untuk menambahkannya ke keranjang. Sesuaikan jumlah pesanan atau tambahkan diskon jika perlu.
4. **Pembayaran**: Klik tombol bayar, masukkan jumlah uang yang diterima, dan sistem otomatis menghitung kembalian.
5. **Kirim Struk**: Masukkan nomor WhatsApp pelanggan untuk mengirim bukti transaksi digital.
6. **Tutup Kasir**: Pada akhir hari atau pergantian shift, masuk ke menu *Settings* (masukkan PIN) dan pilih *Tutup Kasir* untuk melihat rekapitulasi shift tersebut.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: Node.js, Express.js
- **Database**: Local JSON Database (`db.json`)
- **Frontend**: HTML5, CSS3 (Vanilla / Custom Styles), Vanilla JavaScript

## 🔒 Catatan Keamanan
Pastikan untuk tidak mengunggah file `db.json` ke repositori publik jika berisi data transaksi atau kontak pelanggan yang sensitif (sudah otomatis diabaikan di `.gitignore`).
