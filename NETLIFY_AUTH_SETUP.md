# 🔐 Gid Konfigirasyon Netlify Authentication & Google Login

## 📋 Ki-sa ki genyen 

Fichye yo aprè update:
- ✅ `admin/config.yml` - Ajoute seksyon `auth` ak Google OAuth
- ✅ `admin/index.html` - Aktivé Netlify Identity widget + sign-up

---

## ⚙️ ETAP 1: Konfigire Netlify Identity

### 1.1 Ale sou Netlify Dashboard
1. Louvri [Netlify Dashboard](https://app.netlify.com)
2. Chwazi sit ou (KikTop Fresco)
3. Ale: **Settings** → **Identity**

### 1.2 Aktivé Netlify Identity
- Klike: **"Enable Identity"**
- Chwazi: **"Open settings and continue"**

### 1.3 Konfigire Sign-up Settings
1. Nan **Identity** menu, ale: **Settings and usage**
2. Klike: **"Registration"** tab
3. Chwazi:
   - ☑️ **"Open"** (pou pèmèt siyen)
   - **"Enable email confirmations"** (rekömande)
4. **Save**

### 1.4 Aktivé External Providers
1. Nan **Identity** menu, ale: **External providers**
2. Klike: **"Add external provider"**
3. Chwazi: **"Google"**

---

## 🔑 ETAP 2: Jwenn Google OAuth Credentials

### 2.1 Ale sou Google Cloud Console
1. Vizite: [Google Cloud Console](https://console.cloud.google.com)
2. Kreye nouvo **Projet** (oswa chwazi egzistan):
   - Klike: **"New Project"**
   - Non: `KikTop Fresco CMS`
   - Klike: **"Create"**

### 2.2 Aktivé Google+ API
1. Nan sèch, tape: `Google+ API`
2. Klike rezilta a
3. Klike: **"Enable"**

### 2.3 Kreye OAuth Credentials
1. Ale: **Credentials** (bò gòch)
2. Klike: **"Create Credentials"** → **"OAuth client ID"**
3. Yo pral mande ou konfigire "OAuth consent screen":
   - Klike: **"Configure Consent Screen"**
   - Chwazi: **"External"**
   - Klike: **"Create"**

### 2.4 Ranpli OAuth Consent Screen
- **User Type**: External
- **App name**: `KikTop Fresco CMS`
- **User support email**: `your-email@example.com`
- Klike: **"Save and Continue"**
- Klike: **"Save and Continue"** (pou scopes)
- Klike: **"Save and Continue"** (pou test users)
- Klike: **"Back to Dashboard"**

### 2.5 Kreye OAuth Credentials (2yèm fwa)
1. Ale: **Credentials**
2. Klike: **"Create Credentials"** → **"OAuth client ID"**
3. Chwazi: **"Web application"**
4. Non: `KikTop Fresco CMS`
5. **Authorized redirect URIs** - Ajoute:
   ```
   https://YOUR_NETLIFY_SITE_NAME.netlify.app/.netlify/identity/callback
   ```
6. Klike: **"Create"**
7. **KOPIYE** `Client ID` (ou pral bezwen li)

---

## 🔗 ETAP 3: Konfigire Google sou Netlify

### 3.1 Retni Netlify Dashboard
1. Ale: **Settings** → **Identity** → **External providers**
2. Nan **Google**, klike: **"Enable Google"** oswa **"Add"**
3. Ranpli:
   - **Client ID**: Kolé Client ID ou soti Google Cloud
   - **Client Secret**: Kolé Client Secret (si yo mande)
4. Klike: **"Save"**

---

## ✏️ ETAP 4: Update Fichye Local yo

### 4.1 Update `admin/config.yml`
Ranplasè liy yo ak adres Netlify ou:

```yaml
auth:
  base_url: https://your-site-name.netlify.app
  logo_url: https://your-site-name.netlify.app/logo.svg

external_auth_providers:
  - name: google
    auth_type: implicit
    client_id: YOUR_GOOGLE_CLIENT_ID_HERE
```

**Egzanp**:
```yaml
auth:
  base_url: https://kiktopfresco.netlify.app
  logo_url: https://kiktopfresco.netlify.app/images/logo.svg
```

### 4.2 Verifye `admin/index.html`
✅ Fichye a deja update ak:
- Netlify Identity initialization
- Login event handlers
- Sign-up support

---

## 🧪 ETAP 5: Teste Authentifikasyon

### 5.1 Lokal Test (sa ou fè kounye a)
```bash
# Başlangı dev server yo
npm run dev
# oswa
netlify dev
```

1. Ale: `http://localhost:8888/admin`
2. Ou dwe wè login page ak:
   - ✅ Email/Password field
   - ✅ Google login button (apre Netlify Identity setup)
   - ✅ "Don't have an account?" link (pou sign-up)

### 5.2 Sou Production
1. Push code yo GitHub
2. Netlify auto-deploy
3. Ale: `https://your-site.netlify.app/admin`
4. Tès login/sign-up ak Google

---

## 🆘 Debareman Pwoblèm

### Problem: "Google login button pa apare"
- ✅ Verifye Netlify Identity aktivé
- ✅ Verifye Google provider aktivé sou Netlify
- ✅ Verifye Client ID correct nan config.yml
- ✅ Klè browser cache: `Ctrl+Shift+Delete`

### Problem: "Cannot sign up"
- ✅ Verifye **Settings** → **Identity** → **Registration** = "Open"
- ✅ Verifye email confirmations pa force (oswa confirm email)

### Problem: "Redirect error apre login"
- ✅ Verifye Google redirect URI: `https://YOUR_SITE.netlify.app/.netlify/identity/callback`
- ✅ Verifye Netlify site name match `auth.base_url` nan config.yml

### Problem: "CORS error"
- Netlify Identity handle CORS otomatik - dèt la "Enable Identity" 🔧

---

## 📚 References Itil

- [Netlify Identity Docs](https://docs.netlify.com/visitor-access/identity/)
- [Netlify CMS Authentication](https://www.netlifycms.org/docs/authentication-backends/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)

---

## ✨ Ki-sa ki fèt

```
AVAN ❌
- Login: Email/Password sèlman
- Sign-up: Disable
- Google: Pa disponib

APRE ✅  
- Login: Email/Password + Google
- Sign-up: Aktivé
- Google: Konfigire ak external provider
```

---

**Ready? Follow the steps above and you'll have full authentication working! 🚀**
