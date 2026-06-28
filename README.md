# 🎬 StreamFlix

Platform streaming film buatan sendiri dengan Next.js 14, Supabase, dan Vercel.

## Fitur

- ✅ **Login & Daftar** — auth via email/password, tersimpan ke Supabase
- ✅ **Nonton Film** — video player custom dengan simpan progress otomatis
- ✅ **Tema Gelap/Terang** — toggle tema, disimpan di localStorage
- ✅ **Panel Admin** — dashboard dengan analytics, kelola film, log aktivitas
- ✅ **Tambah Film** — via link URL (YouTube, direct link) atau upload file lokal
- ✅ **Analytics** — track semua klik, tonton, login, daftar

---

## Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd streamflix
npm install
```

### 2. Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) → New Project
2. Masuk ke **SQL Editor**
3. Copy-paste isi file `supabase/schema.sql` → Run
4. Buka **Authentication → Settings** → disable "Email confirmation" (biar lebih gampang testing)

### 3. Setup Environment Variables
```bash
cp .env.local.example .env.local
```
Isi `.env.local` dengan kredensial dari **Supabase → Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Setup Storage (untuk upload video)
Di Supabase → **Storage** → Create bucket:
- Name: `videos`
- Public: ✅ Yes

Tambahkan policy di SQL Editor:
```sql
CREATE POLICY "Anyone can upload videos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'videos');
CREATE POLICY "Public can read videos" ON storage.objects
  FOR SELECT USING (bucket_id = 'videos');
```

### 5. Jalankan Lokal
```bash
npm run dev
# Buka http://localhost:3000
```

---

## Cara Buat Akun Admin

1. Daftar akun biasa dulu di `/auth/register`
2. Buka Supabase → SQL Editor → jalankan:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'email_kamu@example.com';
```
3. Login ulang → akan ada menu "Panel Admin"

---

## Deploy ke Vercel

```bash
# Push ke GitHub dulu
git init && git add . && git commit -m "init"
git remote add origin https://github.com/username/streamflix.git
git push -u origin main
```

Di [vercel.com](https://vercel.com):
1. New Project → Import dari GitHub
2. Masukkan environment variables (sama seperti `.env.local`)
3. Deploy! 🚀

---

## Struktur Folder

```
streamflix/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Halaman login
│   │   └── register/page.tsx    # Halaman daftar
│   ├── dashboard/page.tsx       # Browse film
│   ├── watch/[id]/page.tsx      # Halaman nonton
│   └── admin/
│       ├── dashboard/page.tsx   # Stats & activity
│       ├── movies/page.tsx      # Kelola film
│       └── analytics/page.tsx   # Charts & log
├── components/
│   ├── ui/                      # Navbar, cards, theme
│   ├── player/                  # VideoPlayer
│   └── admin/                   # Admin components
├── lib/
│   ├── supabase/                # Client & server helpers
│   ├── analytics.ts             # Event tracking
│   └── utils.ts                 # Helper functions
├── types/index.ts               # TypeScript types
├── middleware.ts                # Auth & route protection
└── supabase/schema.sql          # Database schema
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| Video Player | react-player |
| Charts | Recharts |
| Hosting | Vercel |
