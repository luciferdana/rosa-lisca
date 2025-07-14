# 🚀 PANDUAN DEPLOYMENT GOOGLE APPS SCRIPT

## 📋 LANGKAH-LANGKAH YANG BENAR

### 1. COPY KODE BACKEND TERBARU
1. Buka file `Google-Apps-Script-Backend-FINAL.js` dari project ini
2. Copy semua isinya (Ctrl+A, Ctrl+C)

### 2. BUKA APPS SCRIPT EDITOR
1. Pergi ke https://script.google.com
2. Klik proyek Apps Script Anda yang sudah ada
3. ATAU buat proyek baru jika belum punya

### 3. REPLACE KODE LAMA
1. Di Apps Script Editor, hapus semua kode yang ada di file `Code.gs`
2. Paste kode dari `Google-Apps-Script-Backend-FINAL.js`
3. Save (Ctrl+S)

### 4. SETUP IZIN DAN LIBRARY
1. Klik tombol "Review permissions" atau "Authorize" jika muncul
2. Allow semua izin yang diminta:
   - Google Drive access
   - Google Sheets access

### 5. RUN SETUP DATABASE
1. Di Apps Script Editor, pilih function `setupDatabase` dari dropdown
2. Klik tombol "Run" ▶️
3. Tunggu sampai selesai dan check logs
4. Pastikan muncul pesan "✅ Database setup completed!"

### 6. DEPLOY SEBAGAI WEB APP
1. Klik tombol "Deploy" > "New deployment"
2. Pilih type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Klik "Deploy"
6. Copy URL yang diberikan

### 7. UPDATE FRONTEND
1. Buka file `src/lib/googleAppsScript.js`
2. Update `APPS_SCRIPT_URL` dengan URL deployment baru
3. Save file

### 8. TEST KONEKSI
1. Start development server: `npm run dev`
2. Buka http://localhost:3007/test
3. Test semua fungsi:
   - ✅ Connection Test
   - ✅ Get Projects
   - ✅ Create Project
   - ✅ Upload Image

## 🔧 TROUBLESHOOTING

### Jika Upload Image Gagal:
1. Check folder ID di Apps Script benar
2. Pastikan folder Google Drive accessible
3. Check CORS settings di browser

### Jika "Failed to fetch":
1. Pastikan Apps Script di-deploy dengan "Anyone" access
2. Clear browser cache
3. Try di incognito mode

### Jika Database Error:
1. Run ulang `setupDatabase()` function
2. Check Google Sheets permissions
3. Pastikan tidak ada typo di kode

## 📁 STRUCTURE FOLDER GOOGLE DRIVE

Setelah setup, folder Google Drive Anda akan memiliki structure:
```
Rosa Lisca Files/
├── Bukti Transaksi/
├── Bukti Cash Request/
├── Dokumen Proyek/
└── Dokumen Billing/
```

## 🎯 URL PENTING

- **Apps Script Editor**: https://script.google.com
- **Google Drive Folder**: https://drive.google.com/drive/folders/169H831SqR3sR0Tsk7xsjNso_mLCSgAfY
- **Test Page**: http://localhost:3007/test

## ✅ VERIFIKASI SUCCESS

Jika setup berhasil, Anda akan melihat:
1. 🟢 Connection test berhasil
2. 🟢 Projects bisa di-load
3. 🟢 Project baru bisa dibuat
4. 🟢 Image upload berfungsi
5. 🟢 Preview gambar muncul

## 📞 SUPPORT

Jika masih ada masalah, check:
1. Browser console untuk error messages
2. Apps Script execution transcript
3. Google Drive folder permissions
