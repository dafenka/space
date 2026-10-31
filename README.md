# Dafenka Rythan — situs pribadi

Satu berkas HTML tanpa framework, folder media, dan dua fungsi serverless opsional. Siap dipasang di Vercel.

## Isi folder

```
index.html              halaman lengkap (HTML, CSS, JS dalam satu berkas)
media/                  11 foto (.webp) + versi 640 px, potret, rekaman suara, 3 video
og.jpg                  gambar pratinjau saat tautan dibagikan (1200×630)
api/guestbook.js        buku tamu: GET daftar, POST jejak baru (Vercel KV)
api/guestbook/[id].js   hapus atau sematkan satu jejak (butuh kunci admin)
api/now-playing.js      ubin Sedang diputar (Spotify)
vercel.json             cache media, header keamanan, izin geolokasi
package.json            dependensi fungsi (@vercel/kv)
```

## Pasang

1. **GitHub.** Buat repositori baru, unggah semua isi folder ini (termasuk `media/` dan `api/`), commit.
2. **Vercel.** Add New → Project → pilih repositori → Framework Preset *Other* → Deploy. Tidak ada perintah build; `index.html` disajikan apa adanya.
3. **Domain.** Settings → Domains → tambahkan domainmu. Lalu ganti dua alamat di `index.html` (`og:url` dan `og:image`, keduanya masih `https://dafenka.com/…`) dengan domainmu.

Sampai sini situs sudah jalan penuh. Buku tamu memakai penyimpanan peramban (jejak hanya terlihat di peramban yang sama) dan ubin Sedang diputar memakai lagu cadangan.

## Buku tamu bersama (opsional)

1. Vercel → Storage → Create Database → **KV** (Upstash) → Connect to Project. Vercel mengisi `KV_REST_API_URL` dan `KV_REST_API_TOKEN` sendiri.
2. Tambahkan env `ADMIN_KEY` (teks acak yang panjang) untuk hapus dan sematkan.
3. Redeploy. Halaman mendeteksi `/api/guestbook` sendiri dan beralih dari lokal ke bersama.

Hapus atau sematkan jejak lewat terminal:

```
curl -X DELETE https://domainmu/api/guestbook/ID -H "x-admin-key: KUNCI"
curl -X PATCH  https://domainmu/api/guestbook/ID -H "x-admin-key: KUNCI" -H "Content-Type: application/json" -d '{"pin":true}'
```

Batas: satu jejak per 30 detik per alamat IP, 200 karakter, maksimal 500 jejak tersimpan.

## Sedang diputar (opsional)

1. Buat aplikasi di developer.spotify.com, catat Client ID dan Client Secret, tambahkan Redirect URI `http://localhost:3000/callback`.
2. Dapatkan *refresh token* dengan cakupan `user-read-currently-playing user-read-recently-played` (alur Authorization Code; panduan "spotify refresh token" di web memandu dalam lima menit).
3. Isi env di Vercel: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`. Redeploy.

## Mengubah isi

Semua teks, foto, catatan, dan tautan ada di blok `CONTENT` dan `MEDIA` di bagian atas skrip dalam `index.html`. Teks bertanda `[Draf]` menunggu ceritamu. Foto baru: simpan sebagai `.webp` di `media/`, lalu tambahkan ke `MEDIA.photos` dan `CONTENT.photos`.

## Catatan

- Di claude.ai halaman ini memakai penyimpanan artefak; di Vercel bagian itu otomatis tidak aktif.
- `MEDIA.audioEn` kosong: isi dengan nama berkas kalau kamu merekam versi Inggris.
