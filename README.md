# Surat Pengunduran Diri — Proyek Pinggir Coffee Shop

Website static yang menampilkan surat pengunduran diri profesional, panel pengaturan, dan dashboard saldo keuangan lokal. Didesain agar dapat dipublikasikan ke GitHub Pages tanpa backend atau dependensi build.

## Struktur proyek

- `index.html` — seluruh struktur halaman
- `style.css` — styling premium, responsif, dan print-friendly
- `script.js` — interaksi, progres, panel pengaturan, dan saldo lokal
- `assets/coffee-background.jpg` — ilustrasi latar belakang kopi
- `assets/logopinggir-removebg-preview.png` — logo Pinggir Coffee Shop
- konfigurasi pribadi dan tanda tangan lokal — diabaikan Git

## Menjalankan secara lokal

Karena website ini merupakan static page, cukup buka `index.html` langsung di browser atau jalankan server lokal sederhana seperti:

```bash
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

## Catatan GitHub Pages

Semua path aset dan tautan navigasi dibuat menggunakan path relatif agar kompatibel saat project dipublish ke subpath seperti `/nama-repository/`.

Workflow pada `.github/workflows/deploy-pages.yml` menerbitkan website secara otomatis ke GitHub Pages setiap kali perubahan didorong ke branch `main`.

## Konfigurasi pribadi

Nilai saldo, pemasukan, pengeluaran, jadwal kuliah, nama, dan tanda tangan pribadi disimpan melalui `personal-overrides.js` dan aset lokal. Berkas konfigurasi serta gambar tanda tangan diabaikan oleh Git, sehingga tidak masuk ke repository publik. Versi GitHub Pages menggunakan data netral.

## Pembaruan otomatis

Setelah satu kali menghubungkan repository lokal, commit dan push ke branch `main` akan menjalankan GitHub Actions dan menerbitkan perubahan ke GitHub Pages secara otomatis. Data lokal yang diabaikan Git tidak ikut terkirim.
