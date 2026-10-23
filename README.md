# SIPUSTAKA - Repositori & Publikasi Skripsi Mahasiswa

Website pengelolaan dan publikasi data skripsi mahasiswa universitas dengan desain akademis minimalis, pencarian multi-filter cepat, galeri infografik penelitian, pelacakan publikasi paper ilmiah (DOI), dan integrasi ekspor Google Sheets.

---

## 🌟 Fitur Utama

### 1. Portal Publik
* **Beranda Akademis Minimalis**: Ringkasan metrik statistik real-time (Total Mahasiswa, Skripsi, Publikasi Paper, Program Studi), pencarian topik populer, serta showcase infografik riset.
* **Database & Katalog Skripsi**:
  * Pencarian instan berdasarkan **Nama Mahasiswa, NIM, Judul Skripsi, Dosen Pembimbing, atau Kata Kunci**.
  * Multi-filter: **Program Studi**, **Angkatan**, **Tahun Kelulusan**, dan **Status Publikasi** (Published, Accepted, Submitted, Belum terbit).
  * Opsi tampilan ganda: **Tampilan Kartu (Grid View)** dan **Tampilan Tabel Ringkas (Table View)**.
  * Navigasi halaman (**Pagination**).
* **Detail Skripsi Komprehensif**:
  * Profil lengkap mahasiswa (Nama, NIM, Fakultas, Prodi, Angkatan, Tahun Lulus).
  * Abstrak penelitian, kata kunci (*keywords*), dan dosen pembimbing dengan NIP.
  * **Infografik Penelitian**: Modal zoom layar penuh (*lightbox*) beresolusi tinggi.
  * **Rekam Jejak Publikasi Paper**: Judul paper, nama jurnal/konferensi ilmiah, status telaah, resolver tautan resmi DOI.
  * **Generator Sitasi Instan**: Salin kutipan format **APA Style** dan **IEEE Style** dengan 1-klik.

### 2. Panel Dosen & Admin
* **Autentikasi Aman**: Login berbasis email institusi dan password (Akun demo: `admin@univ.ac.id` / `admin123`).
* **Dashboard Statistik Visual**: Grafik sebaran prodi, tren tahunan skripsi, serta persentase akreditasi publikasi ilmiah.
* **Manajemen CRUD Lengkap**:
  * Tambah skripsi baru & ubah data yang sudah ada dengan validasi form ketat.
  * Unggah infografik penelitian (JPG, PNG, WebP &le; 2.5MB dengan validasi ukuran & pratinjau otomatis).
  * Hapus data dengan dialog konfirmasi pop-up (*destructive warning*).
* **Integrasi Google Sheets & Ekspor CSV**:
  * 1-klik unduh seluruh database atau hasil filter ke format CSV terstandarisasi.
  * Kolom ekspor: `NIM`, `Nama`, `Program Studi`, `Angkatan`, `Judul Skripsi`, `Tahun`, `Dosen Pembimbing`, `Status Publikasi`, `Judul Paper`, `DOI`, `Link Publikasi`.
  * Tutorial impor berkas ke Google Sheets dan rumus `=IMPORTDATA()`.
* **Skrip SQL Database**: Skrip DDL PostgreSQL/Supabase lengkap siap salin.

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### Prasyarat
* Node.js versi 18+ atau 20+
* NPM atau Yarn / PNPM

### Langkah Instalasi
1. Clone repositori atau ekstrak kode proyek:
   ```bash
   git clone <URL_REPOSITORY>
   cd skripsi-database
   ```
2. Pasang seluruh dependensi:
   ```bash
   npm install
   ```
3. Jalankan server pengembangan lokal:
   ```bash
   npm run dev
   ```
4. Buka peramban Anda di `http://localhost:3000`.

---

## 🗄️ Struktur Database (PostgreSQL / Supabase)

Tabel dirancang dengan relasi normalisasi untuk integritas data akademik:

1. **`program_studi`**: Data departemen (`id`, `kode_prodi`, `nama_prodi`, `fakultas`).
2. **`dosen`**: Data pembimbing (`id`, `nip`, `nama_dosen`, `email`, `bidang_keahlian`).
3. **`mahasiswa`**: Data mahasiswa (`id`, `nim`, `nama`, `prodi_id`, `angkatan`, `tahun_lulus`).
4. **`skripsi`**: Karya skripsi (`id`, `mahasiswa_id`, `dosen_pembimbing_id`, `judul`, `abstrak`, `kata_kunci`, `tahun_skripsi`, `infografik_url`, `file_skripsi_url`).
5. **`publikasi`**: Paper ilmiah (`id`, `skripsi_id`, `judul_paper`, `nama_jurnal_conference`, `tahun_publikasi`, `status_publikasi`, `doi`, `link_publikasi`).

> Skrip SQL lengkap dapat disalin langsung melalui tab **"Skema Database SQL"** di dalam Dashboard Admin.

---

## 📊 Pemantauan Google Sheets

1. Masuk ke **Dashboard Admin** &gt; Pilih tab **"Integrasi Google Sheets"**.
2. Klik tombol **"Download File CSV Siap Pakai"**.
3. Buka [Google Sheets](https://sheets.google.com) &gt; **File** &gt; **Import** &gt; **Upload** file CSV tersebut.
4. Data seluruh mahasiswa, judul skripsi, pembimbing, dan link DOI akan tersusun rapi di lembar kerja Google Sheets.
