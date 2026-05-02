# 🥤 KikTop Fresco — Deployment Guide

## Strukti Fichye

```
kiktop/
├── index.html        ← Site piblik (FR/KR bilenng)
├── admin.html        ← Panel Admin
├── sw.js             ← Service Worker (PWA + Offline)
├── manifest.json     ← PWA Manifest
├── netlify.toml      ← Netlify config
├── _redirects        ← Netlify redirects
├── offline.html      ← Page offline
├── schema.sql        ← Supabase database schema
└── README.md         ← Sa w li kounye a
```

---

## 🗄️ ETAP 1 — Supabase Setup

### 1.1 Kreye Pwojè Supabase
1. Ale sou [supabase.com](https://supabase.com) → **New Project**
2. Chwazi yon non (ex: `kiktop-fresco`)
3. Mete yon modpas solid
4. Chwazi rejyon ki pi pre ou

### 1.2 Kouri SQL Schema
1. Nan Supabase dashboard → **SQL Editor**
2. Kole tout kontni fichye `schema.sql`
3. Klike **Run** — Sa pral kreye tout tab yo ak done depart

### 1.3 Jwenn Kle ou yo
1. **Settings** → **API**
2. Kopye:
   - `Project URL` → `https://XXXX.supabase.co`
   - `anon public` key → pou `index.html`
   - `service_role` key → pou `admin.html` (**SEKRÈ — pa pataje!**)

---

## 🔑 ETAP 2 — Mete Kle Supabase

### Nan `index.html` (chèche `XXXXXXXXXXXX`):
```js
const SUPABASE_URL      = 'https://VOTRE-ID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...votre-anon-key...';
```

### Nan `admin.html` (chèche `XXXXXXXXXXXX`):
```js
const SUPABASE_URL         = 'https://VOTRE-ID.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJ...votre-service-role-key...';
```

---

## 🚀 ETAP 3 — Deploy sou Netlify

### Metòd A — Glise-Depoze (pi rapid)
1. Ale sou [netlify.com](https://netlify.com) → **Add new site**
2. **Deploy manually** → Glise dosye `kiktop/` tout antye
3. Netlify bay ou yon URL gratis (ex: `kiktop-fresco.netlify.app`)

### Metòd B — GitHub (rekòmande)
1. Mete dosye `kiktop/` sou GitHub (repo prive)
2. Netlify → **Import from Git** → Konekte repo ou
3. Build command: lage vid
4. Publish directory: `.`
5. **Deploy!**

### Variables Netlify (opsyonèl — si ou vle pi sekirize)
**Site settings** → **Environment variables**:
```
SUPABASE_URL   = https://VOTRE-ID.supabase.co
SUPABASE_ANON  = eyJ...
```

---

## 🌐 ETAP 4 — Domèn Pèsonèl (opsyonèl)

**Netlify** → **Domain management** → **Add custom domain**

Egzanp: `www.kiktop-fresco.com`

Netlify ba ou sertifika SSL **GRATIS** otomatikman (HTTPS).

---

## 📱 PWA — Aplikasyon Mobile

Apre deploy, vizitè ka "enstale" sit la kòm yon app:
- **iOS**: Safari → Pataje → "Ajoute nan Ekran Akèy"
- **Android**: Chrome → Menu → "Enstale Aplikasyon"

---

## 🔒 Sekirite Admin

Modpas default admin: `kiktop2026`

**CHANJE MODPAS SA IMEDYATMAN** apre premye koneksyon:
- Admin → ⚙️ Paramèt → Chanje Modpas Admin

---

## 🆘 Support & Depannaj

| Pwoblèm | Solisyon |
|---------|----------|
| Bannè pa parèt | Tcheke admin → Annonces → Estati "Aktif" |
| Supabase pa konekte | Verifye kle yo nan `index.html` ak `admin.html` |
| SW pa anrejistre | Sit dwe sou HTTPS (Netlify ba ou sa gratis) |
| Produi pa chaje | Kouri SQL schema ankò sou Supabase |

