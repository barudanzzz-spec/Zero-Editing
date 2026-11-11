# Zero Editing — Expo starter

Starter aplikasi Android Zero Editing dengan React Native + Expo.

## Isi versi awal
- Dashboard tema merah, hitam, putih.
- Pilih foto/video dari galeri.
- Preview foto terpilih.
- Halaman fitur AI Enhance, Background Remover, AI Video Enhance, Photo Editor, Video Editor dalam bentuk dashboard.

## Catatan penting
Fungsi AI, penghapusan background, timeline editing video, dan ekspor hasil **belum aktif**. Ini memerlukan implementasi pemrosesan media dan layanan/backend. Jangan memasukkan API key rahasia ke aplikasi Android.

## Menjalankan proyek
```bash
npm install
npx expo start
```

## Build APK dengan EAS
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Konfigurasi project: `eas build:configure`
4. Build APK: `eas build --platform android --profile preview`

File APK akan tersedia dari tautan build EAS setelah proses selesai.
