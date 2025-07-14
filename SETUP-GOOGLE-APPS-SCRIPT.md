# 🚀 Setup Google Apps Script untuk Rosa Lisca

## 📋 Langkah-langkah Setup

### 1. **Setup Google Apps Script Backend**

1. **URL Apps Script Anda:**
   ```
   https://script.google.com/macros/s/AKfycbwCebLF0mXQ7pnBnAfXe-OGZIYv1zEyHe5C6_KYdKds_WIiAWseYnGebYvPJuJZXcBS/exec
   ```

2. **Copy Backend Code**
   - Buka: https://script.google.com/home/projects/1I1QP60GZlrnuXZYHdM_-ZBd47MuQRt4fBu2HbAXa7MLAxaathFTQPrV/edit
   - Copy semua kode dari file `Google-Apps-Script-Backend.js`
   - Paste dan replace semua kode yang ada

3. **Update Folder ID**
   ```javascript
   // 🎯 GANTI DENGAN ID FOLDER GOOGLE DRIVE ANDA
   const FOLDER_ID = "GANTI_DENGAN_FOLDER_ID_ANDA";
   ```
   - Buat folder baru di Google Drive untuk Rosa Lisca
   - Copy ID folder dari URL (bagian setelah `/folders/`)
   - Ganti `FOLDER_ID` di baris 8 kode

### 2. **Setup Database & Permissions**

1. **Run Setup Database**
   - Pilih function `setupDatabase` dari dropdown
   - Klik "Run"
   - Authorize semua permissions yang diminta:
     - Google Drive access
     - Google Sheets access
     - External URL access

2. **Verifikasi Setup**
   - Pilih function `testAppsScript` 
   - Klik "Run"
   - Check logs untuk memastikan tidak ada error

### 3. **Deploy Web App**

1. **Deploy sebagai Web App**
   - Klik "Deploy" → "New Deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Klik "Deploy"

2. **Copy URL**
   - Copy Web App URL yang diberikan
   - Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`

### 4. **Update Frontend Configuration**

1. **Update Apps Script URL**
   - Buka file `src/lib/googleAppsScript.js`
   - Ganti `APPS_SCRIPT_URL` dengan URL Web App Anda:
   ```javascript
   const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

### 5. **Test Integration**

1. **Run Development Server**
   ```bash
   npm run dev
   ```

2. **Access Test Page**
   - Buka: http://localhost:3002/test
   - Run semua tests untuk verifikasi
   - Pastikan semua test berhasil ✅

3. **Test Upload Gambar**
   - Login ke dashboard
   - Coba upload gambar di form transaksi
   - Verifikasi gambar tersimpan di Google Drive

## 📁 **Struktur Database yang Dibuat**

### Google Sheets: "Rosa Lisca Database"
- **Projects**: Data proyek
- **Transactions**: Data transaksi 
- **Billings**: Data tagihan
- **CashRequests**: Data pengajuan kas
- **Users**: Data pengguna
- **Files**: Metadata file upload

### Google Drive: Folder Structure
```
📁 Rosa Lisca Files/
  ├── 📁 Bukti Transaksi/
  ├── 📁 Bukti Cash Request/
  ├── 📁 Dokumen Proyek/
  └── 📁 Dokumen Billing/
```

## 🔧 **Troubleshooting**

### Error: "Script function not found"
- Pastikan semua kode sudah di-paste dengan benar
- Save project (Ctrl+S)
- Refresh browser dan coba lagi

### Error: "Permission denied"
- Re-authorize permissions:
  - Klik "Review permissions"
  - Allow semua akses yang diminta

### Error: "Folder not found"
- Pastikan `FOLDER_ID` sudah diganti dengan benar
- Folder harus bisa diakses oleh akun yang menjalankan script

### Upload Error
- Check ukuran file (max 5MB)
- Pastikan tipe file didukung (JPG, PNG, GIF, PDF)
- Verifikasi folder permissions

## 📊 **Fitur yang Sudah Terintegrasi**

✅ **Project Management**
- Create, read, update projects
- Auto-generate dummy data

✅ **Transaction Management** 
- Create, read, update, delete transactions
- Upload bukti transaksi ke Google Drive
- Auto-calculate cash flow

✅ **File Upload**
- Upload gambar ke Google Drive
- Auto-generate thumbnail
- Organize files dalam subfolder

✅ **Billing Management**
- Create, read, update billings
- Status management

✅ **Cash Request Management**
- Create, read, update cash requests
- Status approval workflow

## 🎯 **URL Penting**

- **Apps Script Project**: https://script.google.com
- **Web App URL**: `[URL yang Anda copy saat deploy]`
- **Test Page**: http://localhost:3002/test
- **Dashboard**: http://localhost:3002/dashboard

## 📝 **Credentials Default**

```
Email: admin@rosalisca.com
Password: admin123
```

## 🚀 **Ready untuk Production!**

Setelah semua test berhasil, aplikasi Rosa Lisca sudah siap digunakan dengan Google Apps Script sebagai backend. Data akan tersimpan secara real-time di Google Sheets dan Google Drive Anda.
