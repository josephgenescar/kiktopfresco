# 🚀 GUIDE COMPLET - Configuration Netlify CMS pour KikTop Fresco

## 📋 Table des Matières
1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration GitHub](#configuration-github)
4. [Authentification Netlify](#authentification-netlify)
5. [Utilisation Admin](#utilisation-admin)
6. [Gestion Contenu](#gestion-contenu)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prérequis

Avant de commencer, vous avez besoin de:
- ✓ Compte GitHub
- ✓ Projet sur GitHub (ce site)
- ✓ Site déployé sur Netlify
- ✓ Accès Netlify (être propriétaire ou admin)

---

## 📥 Installation Rapide

### Étape 1: Cloner le Repo
```bash
git clone https://github.com/VOTRE_USERNAME/kiktopfresco.git
cd kiktopfresco
```

### Étape 2: Structures Créées ✅
Le setup a créé:
```
admin/
├── config.yml          # Configuration CMS
└── index.html          # Interface Admin

content/
├── announcements/      # Dossier Annonces (vide au départ)
├── categories/         # Dossier Catégories
├── products/           # Dossier Produits
├── specials/           # Dossier Specials
└── settings/           # Paramètres généraux
```

### Étape 3: Push vers GitHub
```bash
git add .
git commit -m "🎉 Setup Netlify CMS"
git push origin main
```

---

## 🔐 Configuration GitHub OAuth

### Pour Authentification Secure (Recommandé)

**Step 1: Créer GitHub OAuth App**
1. Allez sur: https://github.com/settings/developers
2. Click "New OAuth App"
3. Remplissez:
   - **Application name**: KikTop Fresco Admin
   - **Homepage URL**: `https://votresite.netlify.app`
   - **Authorization callback URL**: `https://api.netlify.com/auth/done`
4. Note le **Client ID** et **Client Secret**

**Step 2: Configurer dans Netlify**
1. Allez sur Netlify Dashboard → Site settings
2. Build & deploy → Environment
3. Add variables:
   ```
   GITHUB_OAUTH_CLIENT_ID = votre_client_id
   GITHUB_OAUTH_CLIENT_SECRET = votre_client_secret
   ```

---

## 🔑 Authentification Netlify Identity

### Setup Rapide (Alternative Simple)

Dans `index.html`, Netlify Identity est déjà configuré.

**Activer dans Netlify:**
1. Dashboard → Settings → Identity
2. Click "Enable Identity"
3. Click "Invite users"
4. Entrez emails des admins
5. Ils reçoivent invitation email

---

## 🎨 Utilisation Admin

### Accéder l'Admin
```
https://votresite.netlify.app/admin
```

### Collections Disponibles

#### 1️⃣ **Annonces** 📢
- Créez des bannières texte/image
- Défini dates activation/fin
- Choisissez couleurs
- **Exemple**: 
  ```
  Titre: "GRAND OUVERTURE!"
  Type: image
  Image: logo.jpg
  Couleur: #D63031 (rouge)
  Actif: ✓
  ```

#### 2️⃣ **Catégories** 🏷️
- Manger (🍴)
- Boissons (🥤)
- Alcool (🍷)
- **Action**: Ajoutez vos propres catégories

#### 3️⃣ **Produits** 🍔
- Nom, description, prix
- Image (upload automatique)
- Catégorie
- Stock (en/hors)
- **Exemple**:
  ```
  Nom: Pâté Créole Premium
  Prix: 150 Gourdes
  Catégorie: Manger
  Image: upload
  En Stock: ✓
  ```

#### 4️⃣ **Spécial Dimanche** ✨
- Produit du jour
- Prix original → Prix spécial
- Heure fin (ex: 20:00)
- **Exemple**:
  ```
  Nom: Fresco Tropical
  Prix Original: 200G
  Prix Spécial: 150G (25% réduit!)
  Fin: 20:00
  ```

#### 5️⃣ **Paramètres** ⚙️
- Numéro WhatsApp
- Email
- Adresse
- Couleurs site
- Logo
- **Important**: Changez le WhatsApp!

---

## 💾 Gestion Contenu

### Créer un Produit

1. **Admin** → **Produits** → **New Post**
2. Remplissez:
   - Nom: "Pate Kode Ayisyen"
   - Description: "Recette traditionelle avec viande..."
   - Catégorie: Sélectionnez "Manger"
   - Prix: 200 (en Gourdes)
   - Image: Upload PNG/JPG
3. **Save** (brouillon) ou **Publish** (live)
4. **Git** push automatique ✓

### Éditer une Annonce

1. **Admin** → **Annonces**
2. Click annonce existante
3. Modifiez contenu
4. **Update** → **Publish**
5. Site mis à jour instantanément!

### Supprimer Contenu

1. Click item
2. Menu en haut → Delete
3. Confirm
4. Suppression git + site

---

## 📱 Workflow Editorial

**Brouillon → Revue → Publish**

1. Écrivez contenu
2. **Save** (reste en brouillon)
3. Click **Set status to In review**
4. Admin revoit
5. **Publish** quand OK

---

## 🐛 Troubleshooting

### ❌ "Cannot connect to Git"
- ✓ Vérifiez connexion GitHub dans Netlify
- ✓ Vérifiez OAuth credentials
- ✓ Reconnectez identity: Identity → Logout → Login

### ❌ "Image upload fails"
- ✓ Taille max 10MB
- ✓ Format: JPG, PNG, GIF, WebP
- ✓ Vérifiez `media_folder` dans config.yml

### ❌ "Admin page blank"
- ✓ Attendez 2-3 min après push
- ✓ Hard refresh (Ctrl+Shift+R)
- ✓ Vérifiez console erreurs (F12)

### ❌ "Pas d'email invitation"
- ✓ Check spam folder
- ✓ Renew invit dans Netlify
- ✓ Utilisez Gmail si possible

---

## 🎓 Tutoriels Video

(À ajouter sur votre documentation)
- ✓ https://www.youtube.com/watch?v=eX_cJw0eS5o (Netlify CMS Setup)
- ✓ https://www.youtube.com/watch?v=eSHkdKHT0go (Markdown Basics)

---

## 📞 Support

**En cas de problème:**
1. Consultez [Netlify CMS Docs](https://www.netlifycms.org/)
2. Check GitHub Issues
3. Contactez support Netlify

---

## ✨ Prochaines Étapes (Optionnel)

- [ ] Intégrer Uploadcare pour media library
- [ ] Ajouter webhooks pour notifications
- [ ] Setup CI/CD pour tests
- [ ] Créer preview site séparé
- [ ] Ajouter analytics

---

## 📝 Checklist Déploiement

- [ ] Admin CMS accessible
- [ ] Authentification fonctionne
- [ ] Upload image testé
- [ ] Produit créé & affiché
- [ ] Annonce visible
- [ ] WhatsApp mis à jour
- [ ] Tester sur mobile
- [ ] Backup config.yml

---

**🎉 Félicitations! Votre CMS est prêt!**
L'équipe peut maintenant gérer le site sans coder.

*Dernière mise à jour: Mai 2026*
