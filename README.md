# Sistem Manajemen Keuangan PT Rosa Lisca

Aplikasi web untuk mengelola keuangan proyek, monitoring tagihan, dan pengajuan kas pada PT Rosa Lisca.

## Deskripsi

Sistem ini dirancang untuk memudahkan pengelolaan administrasi keuangan perusahaan dengan fitur lengkap mulai dari manajemen proyek, pencatatan tagihan, transaksi kas, hingga pengajuan dana proyek. Aplikasi menggunakan teknologi modern dengan antarmuka yang responsif dan mudah digunakan.

## Fitur Utama

### Manajemen Proyek
- Tambah, edit, dan hapus data proyek
- Status proyek (Mendatang, Berjalan, Selesai)
- Pencatatan nilai kontrak dan uang muka
- Dashboard overview dengan statistik proyek

### Sistem Tagihan
- Input data tagihan dengan kalkulasi otomatis
- Perhitungan DPP, PPN 11%, PPH 2.65%, dan retensi 5%
- Tracking status pembayaran
- Management tanggal jatuh tempo dan pembayaran

### Manajemen Kas
- Pencatatan transaksi pemasukan dan pengeluaran
- Kategorisasi transaksi per proyek
- Upload bukti transaksi
- Laporan kas per proyek

### Pengajuan Kas
- Sistem pengajuan dana proyek terstruktur
- Detail item pengajuan dengan quantity dan harga
- Workflow approval dengan history
- Status tracking (Pending, Approved, Rejected)

### Manajemen User
- Sistem role-based access (Admin dan Keuangan)
- Assignment proyek untuk user keuangan
- Registrasi user baru
- Kontrol akses berdasarkan role

## Teknologi

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- React Hook Form

**Backend:**
- Next.js API Routes
- Prisma ORM
- MySQL Database
- NextAuth.js (Authentication)

**Security:**
- bcrypt untuk password hashing
- JWT untuk session management
- Input validation dengan Zod
- SQL injection protection

## Instalasi

### Prerequisites
- Node.js 18 atau lebih tinggi
- MySQL 8.0 atau lebih tinggi
- npm atau yarn

### Langkah Instalasi

1. Clone repository
```bash
git clone [repository-url]
cd rosa-lisca
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env.local
```

Edit file `.env.local` dan isi konfigurasi berikut:
```env
DATABASE_URL="mysql://username:password@localhost:3306/rosa_lisca"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Setup database
```bash
# Buat database
mysql -u root -p -e "CREATE DATABASE rosa_lisca"

# Jalankan migration
mysql -u username -p rosa_lisca < database-migration.sql

# Generate Prisma client
npx prisma generate
```

5. Seed data awal
```bash
# Buat company terlebih dahulu melalui database
INSERT INTO companies (name, code, created_at, updated_at) VALUES ('PT Rosa Lisca', 'RL', NOW(), NOW());

# Buat user admin pertama (password: admin123)
INSERT INTO users (company_id, email, password_hash, name, role, created_at, updated_at) 
VALUES (1, 'admin@rosalisca.com', '$2a$12$LQv3c1yqBwEHBgENrR8yV.FjQDNcQnbGU.2eAQ7RnK2EQ6K2eQ8AW', 'Administrator', 'ADMIN', NOW(), NOW());
```

6. Jalankan aplikasi
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## Struktur Database

### Tabel Utama
- **companies** - Data perusahaan
- **users** - User management dengan role
- **projects** - Master data proyek
- **billings** - Data tagihan per proyek
- **transactions** - Transaksi kas masuk/keluar
- **cash_requests** - Pengajuan dana proyek
- **project_assignments** - Assignment proyek ke user

### Relasi
- User belongsTo Company
- Project belongsTo Company
- Billing/Transaction/CashRequest belongsTo Project
- User dapat di-assign ke multiple Projects

## Penggunaan

### Login
- Akses halaman login di `/login`
- Masukkan email dan password yang telah terdaftar
- Klik tombol "Masuk" untuk login

### Role Admin
- Akses penuh ke semua fitur
- Dapat membuat dan mengelola proyek
- Approve/reject pengajuan kas
- Assign proyek ke user keuangan
- Manage user registration

### Role Keuangan
- Akses terbatas pada proyek yang di-assign
- Input tagihan dan transaksi
- Buat pengajuan kas
- View laporan proyek assigned

## Deployment

### Production Setup
1. Setup server dengan Node.js dan MySQL
2. Clone repository dan install dependencies
3. Konfigurasi environment variables untuk production
4. Jalankan database migration
5. Build aplikasi
```bash
npm run build
npm start
```

### Environment Variables Production
```env
DATABASE_URL="mysql://user:pass@host:3306/db"
NEXTAUTH_SECRET="production-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```

## Kontribusi

1. Fork repository
2. Buat branch feature (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

## Lisensi

Aplikasi ini dikembangkan untuk keperluan internal PT Rosa Lisca. Tidak untuk distribusi komersial.