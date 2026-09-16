# STAS RG Projects — Global Design System & Specification

Dokumentasi ini adalah **Single Source of Truth (SSOT)** standar visual, tata letak, tipografi, palet warna, aturan komponen, sistem notifikasi email, dan identitas visual **STAS-RG Projects** berbasis **Contemporary Editorial & Modern Research Laboratory UI**.

---

## 1. Core Design Principles

1. **Strictly Zero Shadows (`*, ::before, ::after { box-shadow: none !important; }`)**:
    - Seluruh elemen antarmuka (Card, Button, Banner, Modal, Pill Badge) **tidak menggunakan drop shadow tebal**.
    - Pemisahan kedalaman dan hierarki visual dicapai melalui **border 1px yang presisi (`border-zinc-200/80`, `border-emerald-200/70`, `border-zinc-800/80`)**, **sudut lengkung card 24px (`rounded-3xl`) / 16px (`rounded-2xl`)**, dan **kontras latar belakang bernuansa halus (`bg-[#FAFAFA]`, `bg-white`, `bg-[#090D16]`)**.

2. **Contemporary SaaS & Research Editorial Aesthetics**:
    - Spacing lega (*breathable layout*) dengan padding bagian `py-20` hingga `py-28`.
    - Tipografi bersih, proporsional, dan mudah dibaca (high legibility).
    - Struktur layout modular dan teratur (*grid alignment*).

3. **Strictly Zero Emojis / Emotes**:
    - Dilarang menggunakan emoji atau karakter emote pada teks antarmuka dan email.
    - Semua representasi status menggunakan vektor SVG bersih (**Lucide React**) atau bullet dot indicator.

4. **Typography — Plus Jakarta Sans**:
    - Font primer UI Web: **Plus Jakarta Sans** (`sans-serif`), dimuat langsung dari Google Fonts.
    - Font primer Email & PDF: System UI fallback modern (`'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`).
    - Bobot tipografi: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800).

---

## 2. Color Palette & Tokens

### Primary / Brand (Deep Forest & Emerald Greens)
- **Primary Brand**: `#0D5A34` (STAS-RG Deep Green)
- **Primary Hover**: `#094226`
- **Accent Emerald**: `#10B981` (`emerald-500`) / `#059669` (`emerald-600`)
- **Subtle Mint Background**: `#ECFDF5` (`emerald-50`)
- **Subtle Mint Border**: `#A7F3D0` (`emerald-200`) / `#6EE7B7` (`emerald-300`)

### Neutral Grayscale (Light & Dark)
- **Light Mode Background**: `#FAFAFA` / `#FFFFFF`
- **Dark Mode Background**: `#090D16` / `#0D121F`
- **Dark Mode Surface & Card**: `#121824` / `#18181B` / `#1E293B`
- **Dark Mode Card Border**: `border-zinc-800/80`
- **Text Main / Headings**: `#0F172A` (Light) / `#FFFFFF` & `#F8FAFC` (Dark)
- **Text Secondary / Muted**: `#52525B` (Light) / `#A1A1AA` (Dark)
- **Border Default**: `border-zinc-200/80` (Light) / `border-zinc-800/80` (Dark)

---

## 3. Badge & Label Guidelines (No AI-Generated Look)

### Aturan Global Badge / Label:
- **Gunakan Simple Dot Indicator (`●`)**: Jika membutuhkan penanda visual, gunakan small dot bullet/circle indikator berdiameter 6px.
- **Hindari AI-Style Icons atau Decorative Symbols**:
  - Dilarang menggunakan icon sparkle (`Sparkles`, `✨`), magic wand (`🪄`), robot (`🤖`), AI chip, gradient AI badge, atau motif decorative generative AI.
- **Subtle, Functional, dan Editorial**:
  - Badge harus berfungsi murni sebagai metadata kategori atau status sistem (misal: `● IoT & Smart Farming`, `● Approved`, `● Draft`).
- **Bukan Elemen Dekoratif Utama**:
  - Penekanan visual harus dibangun dari tipografi, spacing proporsional, dan warna fungsional, bukan dari ikon animasi yang ramai.

### Varian Status Badges:
| Status | Background | Border | Text Color | Dot Color |
|---|---|---|---|---|
| **Success / Approved** | `#ECFDF5` | `#A7F3D0` | `#065F46` | `#10B981` |
| **Pending / Review** | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` |
| **Warning / Draft** | `#FFF7ED` | `#FED7AA` | `#9A3412` | `#EA580C` |
| **Error / Rejected** | `#FEF2F2` | `#FECACA` | `#991B1B` | `#EF4444` |
| **Info / Category** | `#EFF6FF` | `#BFDBFE` | `#1E40AF` | `#3B82F6` |

---

## 4. Email Design System & Master Template

Email notifikasi merupakan bagian integral dari Design System STAS RG Projects. Seluruh email wajib menginduk ke master template reusable (`resources/views/emails/layouts/master.blade.php`).

### 4.1. Master Email Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ HEADER: Dual Branding (STAS-RG + Telkom University)    │
│ Small Tagline / Context Subtitle                        │
├─────────────────────────────────────────────────────────┤
│ Title / Event Headline                                  │
│ Subtitle / Summary                                      │
│                                                         │
│ Greeting ("Halo [Name],")                               │
│                                                         │
│ Main Paragraph Content                                  │
│                                                         │
│ Information Card / Status Card / Project Summary Card   │
│                                                         │
│ Primary CTA Button (Forest Green #0D5A34)               │
│                                                         │
│ Additional Context / Disclaimer Callout Box             │
├─────────────────────────────────────────────────────────┤
│ FOOTER: Identik dengan Website Landing Page             │
│ - Deskripsi Institusi & Riset Lab                       │
│ - Social Media (Website, Instagram, YouTube, Email)     │
│ - Detail Kontak & Alamat Laboratorium                   │
│ - Copyright © STAS-RG FIT Telkom University             │
└─────────────────────────────────────────────────────────┘
```

### 4.2. Aturan Visual & Teknis Email:
- **Email Client Compatibility**: Gunakan semantic HTML table layout dengan inline-compatible CSS. Lebar kontainer utama `600px` centered dengan background container `#F1F5F9` dan content card `#FFFFFF`.
- **Header**: Menampilkan logo resmi STAS-RG dan Telkom University dengan rasio proporsional, background putih bersih, dan garis pemisah halus `#E2E8F0`.
- **Button (CTA)**: Berwarna Deep Forest Green `#0D5A34` dengan hover `#094226`, sudut lengkung `8px` (`border-radius: 8px;`), padding `12px 28px;`, teks putih tebal.
- **Card**: Border 1px `#E2E8F0`, background `#F8FAFC`, radius `10px`, padding `16px 20px`.
- **Status Badges di Email**: Menggunakan small dot bullet dan warna pastel fungsional sesuai standar Badge System.
- **Footer**: Wajib menyertakan tautan resmi:
  - **Website**: `https://www.stas-rg.com`
  - **Instagram**: `https://instagram.com/stas.rg`
  - **Lab Email**: `stas.research@telkomuniversity.ac.id`
  - **Alamat**: Laboratorium CoE STAS-RG, Fakultas Ilmu Terapan, Gedung Selaru, Telkom University, Bandung 40257.

---

## 5. Event-Driven Email Notification Matrix

Sistem STAS RG Projects mengintegrasikan notifikasi otomatis untuk seluruh lifecycle sistem:

### 5.1. Authentication & Security
1. **User Registered (`UserRegisteredMail`)**: Dikirim ke pengguna baru setelah mengisi form register bahwa akun telah tercatat dan menunggu persetujuan admin.
2. **Admin New User Alert (`AdminNewUserAlertMail`)**: Dikirim ke seluruh admin/superadmin aktif saat ada pendaftar baru yang perlu diverifikasi.
3. **Account Approved (`AccountApprovedMail`)**: Dikirim saat admin menyetujui akun peneliti.
4. **Account Rejected (`AccountRejectedMail`)**: Dikirim saat admin menolak permohonan akun beserta alasan penolakan.
5. **Account Status Changed (`AccountStatusChangedMail`)**: Dikirim saat akun diaktifkan / dinonaktifkan oleh administrator.
6. **OTP Password Reset (`PasswordResetOtpMail`)**: Kode 6-digit OTP pemulihan sandi dengan masa berlaku 15 menit dan security card.
7. **Password Changed (`PasswordChangedMail`)**: Peringatan keamanan ketika kata sandi berhasil diubah beserta IP address.
8. **Login Notification (`LoginNotificationMail`)**: Laporan sesi masuk akun mencakup waktu, IP, dan user-agent browser.

### 5.2. Project Lifecycle
1. **Project Created (`ProjectNotificationMail` - `created`)**: Konfirmasi pembuatan spesifikasi riset baru.
2. **Project Updated (`ProjectNotificationMail` - `updated`)**: Konfirmasi penyimpanan modifikasi data riset.
3. **Project Published (`ProjectNotificationMail` - `published`)**: Notifikasi bahwa project telah live pada showcase publik landing page.
4. **Project Unpublished (`ProjectNotificationMail` - `unpublished`)**: Notifikasi penarikan status publikasi menjadi draft internal.
5. **Project Duplicated (`ProjectNotificationMail` - `duplicated`)**: Notifikasi keberhasilan duplikasi skema project.
6. **Project Deleted (`ProjectNotificationMail` - `deleted`)**: Notifikasi penghapusan dokumen riset dari repositori.
7. **PDF Download Completed (`ProjectNotificationMail` - `pdf_downloaded`)**: Konfirmasi generate dokumen PDF resmi CoE STAS-RG.

### 5.3. Account Settings
1. **Profile Updated (`ProfileUpdatedMail`)**: Notifikasi saat pengguna memperbarui informasi profil atau foto avatar.

---

## 6. Custom Error Pages Specification

Halaman error STAS RG Projects didesain dengan pendekatan **Center-Focused Research Card** yang modern, informatif, dan tidak membocorkan informasi teknis/sensitif pada environment production.

### 6.1. Layout & Elemen Visual Error Page:
- **Header**: Dual branding resmi STAS-RG dan Telkom University yang mengarah ke beranda (`/`).
- **Card Surface**: Background putih `#FFFFFF` (Dark: `#121824`), border 1px `#E2E8F0` (Dark: `#27272A`), radius `24px` (`rounded-3xl`), padding luas `40px 32px`.
- **Status Dot Badge**: Penanda visual `● HTTP [Code] • [Status Label]` dengan warna fungsional sesuai jenis error:
  - `400` & `404`: Info Blue (`#EFF6FF` / `#3B82F6`)
  - `401`, `403`, & `419`: Warning Amber (`#FFFBEB` / `#F59E0B`)
  - `429`: Rate Limit Orange (`#FFF7ED` / `#EA580C`)
  - `500` & `503`: Critical / Maintenance Rose (`#FEF2F2` / `#EF4444`)
- **Prominent Numeric Display**: Angka kode status besar (`72px`, font-extrabold `Plus Jakarta Sans`).
- **Human-Readable Indonesian Copywriting**: Judul tegas dalam bahasa Indonesia disertai penjelasan ramah tanpa istilah teknis berbelit.
- **Action Buttons**:
  - *Primary Button*: Deep Forest Green `#0D5A34` (e.g. `Kembali ke Beranda`, `Coba Muat Ulang`, `Masuk ke Akun`).
  - *Secondary Button*: Neutral surface border `#E2E8F0` (e.g. `Kembali`, `Ke Dashboard`, `Kunjungi Website STAS-RG`).
- **Security & Privacy**:
  - Dilarang keras menampilkan stack trace, query SQL, atau file path internal kepada user pada error 500.
  - Sesi 419 expired dan 429 rate limited dilengkapi info pill pengamanan data riset.

### 6.2. Error Code Matrix:
| Code | Title | Description | Primary Action | Secondary Action |
|---|---|---|---|---|
| **400** | Permintaan Tidak Valid | Parameter atau format request tidak dapat diproses server. | Coba Muat Ulang | Kembali ke Beranda |
| **401** | Autentikasi Diperlukan | Sesi login belum aktif atau telah kedaluwarsa. | Masuk ke Akun | Kembali ke Beranda |
| **403** | Akses Ditolak | Tidak memiliki otorisasi untuk mengakses dokumen/fitur ini. | Kembali | Ke Dashboard |
| **404** | Halaman Tidak Ditemukan | Halaman atau spesifikasi riset tidak ditemukan atau dipindahkan. | Kembali ke Beranda | Kembali |
| **419** | Sesi Halaman Kedaluwarsa | Token keamanan formulir telah berakhir demi keselamatan data. | Segarkan Halaman | Masuk Kembali |
| **429** | Terlalu Banyak Permintaan | Frekuensi request melebihi batas rate limit sistem. | Coba Lagi | Kembali ke Beranda |
| **500** | Kesalahan pada Server | Kendala teknis internal laboratorium, sedang ditangani tim. | Coba Muat Ulang | Kembali ke Beranda |
| **503** | Layanan Pemeliharaan | Sistem sedang menjalani maintenance atau upgrade server. | Coba Muat Ulang | Kunjungi Website |

---

## 7. Global Design Consistency Checklist

Sebelum merilis perubahan pada fitur antarmuka:
- [x] **Landing Page**: Menggunakan tipografi Plus Jakarta Sans, zero drop-shadow, dot category badges, dan footer informatif.
- [x] **Admin Panel**: Konsistensi sidebar navigation, table listing, status pills, dan dialog konfirmasi custom (Alert Modal).
- [x] **Project Generator Form & Preview**: Live preview 1:1 format A4 yang identik dengan output PDF resmi dompdf.
- [x] **Email Notifications**: Menggunakan master layout seragam dengan branding ganda STAS-RG & Tel-U serta footer website yang persis.
- [x] **Custom Error Pages**: Seluruh HTTP error (400, 401, 403, 404, 419, 429, 500, 503) menggunakan layout center-focused seragam tanpa bocoran stack trace.
- [x] **No Sparkle/AI Icons**: Tidak ada icon sparkle, magic wand, atau AI gradient badge di seluruh antarmuka aplikasi.
