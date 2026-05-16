---
title: "KikTop Fresco - CMS Visual Reference Guide"
description: "Visual guide for using Netlify CMS admin interface"
---

# 📱 NETLIFY CMS - VISUAL REFERENCE GUIDE

## 🎯 Admin Dashboard Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  KikTop Fresco Admin              [Logout] [Settings]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  COLLECTIONS:                    RECENT:                          │
│                                                                   │
│  📢 Annonces                      Welcome announcement           │
│  🍔 Produits                      (Last edited: 5 min ago)      │
│  🏷️  Catégories                   ────────────────────          │
│  ✨ Spécial Dimanche              [New Post] [Drafts]           │
│  ⚙️  Paramètres                                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📢 ANNONCES (ANNOUNCEMENTS) - EXAMPLE

### Creating New Announcement:

```
┌──────────────────────────────────────────────────────┐
│ NEW ANNOUNCEMENT                     [Save] [Publish] │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Titre de l'Annonce                                  │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🎉 SPECIAL DIMANCHE - PÂTÉ 50% OFF!             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Description                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Venez découvrir notre délicieuse pâté créole   │ │
│ │ à prix réduit ce dimanche uniquement!           │ │
│ │ 200G → seulement 100G!                          │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Type: [▼ texte]  ou  [▼ image]                     │
│                                                       │
│ Couleur de fond: [🔴 #D63031]  [PICKER]            │
│ Texte couleur:   [⚪ #ffffff]   [PICKER]            │
│                                                       │
│ Actif: ☑ (check to publish)                        │
│                                                       │
│ Date de début:  [18/05/2026]  [10:00]              │
│ Date de fin:    [25/05/2026]   [20:00]              │
│                                                       │
│ Position: [1]  (1=first, 2=second...)              │
│                                                       │
│ [SAVE AS DRAFT]    [PUBLISH NOW]                     │
└──────────────────────────────────────────────────────┘
```

### List View:

```
┌──────────────────────────────────────────────────────┐
│ ANNONCES                              [+ NEW POST]    │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ✅ 🎉 SPECIAL DIMANCHE - PÂTÉ 50% OFF!              │
│    Published • Last edit: 2 hours ago • [EDIT]      │
│                                                       │
│ ✅ Grand Ouverture KikTop Fresco!                   │
│    Published • Last edit: 1 day ago • [EDIT]        │
│                                                       │
│ 📝 Nouvelle Promo (Draft)                           │
│    Draft • Last edit: 10 min ago • [EDIT] [DELETE]  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🍔 PRODUITS (PRODUCTS) - EXAMPLE

### Creating New Product:

```
┌──────────────────────────────────────────────────────┐
│ NEW PRODUCT                         [Save] [Publish] │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Nom du Produit                                       │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pâté Créole Premium                             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Description                                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Recette traditionnelle avec:                    │ │
│ │ • Viande hachée premium                         │ │
│ │ • Épices sélectionnées                          │ │
│ │ • Fait maison quotidiennement                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Catégorie: [▼ Manger]                              │
│                                                       │
│ Prix (Gourdes): [200]                              │
│ Prix Promo:     [150]                              │
│                                                       │
│ Image: [UPLOAD]  [📷 pate.jpg]                     │
│                                                       │
│ En Stock: ☑                                         │
│ Disponible: ☑                                       │
│ Position: [1]                                       │
│                                                       │
│ [SAVE]    [PUBLISH]                                 │
└──────────────────────────────────────────────────────┘
```

### Product Grid View:

```
┌──────────────────────────────────────────────────────┐
│ PRODUITS                              [+ NEW POST]    │
├──────────────────────────────────────────────────────┤
│                                                       │
│ 🍴 MANGER (3 produits)                              │
│  ├─ Pâté Créole Premium (200G) [EDIT] [DELETE]     │
│  ├─ Sandwich Spécial (150G)     [EDIT] [DELETE]    │
│  └─ Popcorn Aigre & Sucré (100G) [EDIT] [DELETE]   │
│                                                       │
│ 🥤 BOISSONS (5 produits)                            │
│  ├─ Fresco Tropical (350ml) [EDIT]                  │
│  ├─ Jus Naturel Orange ...                          │
│  └─ ...                                              │
│                                                       │
│ 🍷 ALCOOL (2 produits)                              │
│  └─ ...                                              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🏷️ CATÉGORIES (CATEGORIES) - EXAMPLE

### Category Edit Form:

```
┌──────────────────────────────────────────────────────┐
│ EDIT CATEGORY - MANGER               [Save] [Delete] │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Nom: [Manger]                                       │
│                                                       │
│ Description:                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pâté, Sandwich, Popcorn, et autres             │ │
│ │ spécialités savereuses                         │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Emoji/Icon: [🍴]                                    │
│                                                       │
│ Position: [1]  (Order on menu)                     │
│ Afficher: ☑    (Visible)                           │
│                                                       │
│ [UPDATE]   [DELETE]                                 │
└──────────────────────────────────────────────────────┘
```

---

## ✨ SPÉCIAL DIMANCHE (SUNDAY SPECIAL)

### Edit Form:

```
┌──────────────────────────────────────────────────────┐
│ SUNDAY SPECIAL - THIS WEEK           [Save] [Publish]│
├──────────────────────────────────────────────────────┤
│                                                       │
│ Nom du Produit: [Fresco Tropical Fusion]            │
│                                                       │
│ Description:                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Notre spécialité de la semaine:                 │ │
│ │ Fresco naturel avec fruits tropicaux            │ │
│ │ Glaçon, sucre, saveur incomparable!             │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Image: [UPLOAD]  [📷 fresco.jpg]                   │
│                                                       │
│ Prix Original: [200]  Gourdes                      │
│ Prix Spécial:  [150]  Gourdes (25% off!)          │
│                                                       │
│ Jour: [0] (0=Dimanche, 1=Lundi... 6=Samedi)       │
│                                                       │
│ Heure de fin: [20:00]                              │
│                                                       │
│ Actif: ☑                                            │
│                                                       │
│ [UPDATE]   [PUBLISH]                                │
└──────────────────────────────────────────────────────┘
```

---

## ⚙️ PARAMÈTRES (SETTINGS)

### General Settings:

```
┌──────────────────────────────────────────────────────┐
│ GENERAL SETTINGS                      [Save] [Update]│
├──────────────────────────────────────────────────────┤
│                                                       │
│ Nom du Site: [KikTop Fresco]                        │
│                                                       │
│ Description:                                         │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Snack Bar - Saveurs Naturelles, Recettes        │ │
│ │ Authentiques, Service Rapide                    │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ WhatsApp Number: [50936123456]  ⚠️ IMPORTANT!      │
│ Email: [info@kiktop.ht]                             │
│ Adresse: [Port-au-Prince, Haiti]                    │
│                                                       │
│ Logo: [UPLOAD]  [🖼️ logo.png]                      │
│                                                       │
│ Couleur Principale: [🔵 #0D2B5E]  [PICKER]         │
│ Couleur Accent:     [🟡 #F5C518]  [PICKER]         │
│                                                       │
│ [SAVE SETTINGS]                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔄 PUBLISHING WORKFLOW

### Publish Status:

```
┌──────────────────────────────────┐
│ STATUS: READY TO PUBLISH          │
├──────────────────────────────────┤
│                                   │
│ Current Status: DRAFT             │
│                                   │
│ Changes pending:                  │
│ ✏️ Title changed                 │
│ ✏️ Price updated                  │
│ ✏️ Image added                    │
│                                   │
│ ┌───────────────────────────────┐│
│ │ [SAVE] (keep as draft)         ││
│ │ [PUBLISH] (go live now!)       ││
│ │ [SCHEDULE] (publish later)     ││
│ └───────────────────────────────┘│
│                                   │
│ Published:    15/05/2026 10:30    │
│ Last edited:  16/05/2026 14:15    │
│ Updated by:   Admin User          │
│                                   │
└──────────────────────────────────┘
```

### Git Commit Details:

```
┌──────────────────────────────────────────────────────┐
│ PUBLISH CONFIRMATION                                 │
├──────────────────────────────────────────────────────┤
│                                                       │
│ ✅ Changes saved successfully!                      │
│                                                       │
│ Git Info:                                            │
│ Commit: a3f8c92d4 (auto-generated)                  │
│ Branch: main                                         │
│ Files changed: content/products/pate.md             │
│                                                       │
│ ⏳ Deploying to Netlify...                          │
│                                                       │
│ 🌐 Site will be updated in ~30 seconds              │
│ Fresh content on live site!                          │
│                                                       │
│ Link: https://kiktop.netlify.app                     │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 COMMON TASKS QUICK REFERENCE

### 1. Update WhatsApp Number
```
Settings → Général → WhatsApp Number → [new number] → [SAVE]
```

### 2. Create New Announcement
```
Annonces → [+ NEW POST] → Fill form → [PUBLISH]
```

### 3. Add New Product
```
Produits → [+ NEW POST] → Fill form → [PUBLISH]
```

### 4. Update Special Price
```
Spécial Dimanche → [EDIT] → Change prices → [PUBLISH]
```

### 5. Manage Categories
```
Catégories → [SELECT] → [EDIT] → Update → [SAVE]
```

---

## 📱 Mobile View

Even on phone, you can edit! CMS is responsive:

```
Mobile Dashboard:
┌─────────────────┐
│ ☰ Menu          │
├─────────────────┤
│ 📢 Annonces     │
│ 🍔 Produits     │
│ 🏷️  Catégories  │
│ ✨ Spécial      │
│ ⚙️  Paramètres   │
└─────────────────┘

Mobile Edit Form:
┌──────────────┐
│ Title        │
│ [input...]   │
│              │
│ Description  │
│ [large box]  │
│              │
│ Category     │
│ [dropdown]   │
│              │
│ Price        │
│ [300]        │
│              │
│ [SAVE]       │
│ [PUBLISH]    │
└──────────────┘
```

---

## ✨ FINAL RESULT ON WEBSITE

After you publish changes:

```
WEBSITE HOMEPAGE:

┌─────────────────────────────────┐
│ 🎉 SPECIAL DIMANCHE - PÂTÉ 50% │ ← Announcement
│                                 │   (from CMS)
├─────────────────────────────────┤
│                                 │
│ 🍔 MENU                         │
│                                 │
│ MANGER:                         │
│ ┌─────┐  ┌─────┐  ┌─────┐     │
│ │Pâté │  │Sand-│  │Popcorn│  │
│ │200G │  │wich │  │100G   │   │
│ └─────┘  └─────┘  └─────┘    │
│                                │
│ BOISSONS:                      │
│ ┌─────┐  ┌─────┐  ┌─────┐    │
│ │Fresh│  │Jus  │  │...  │    │
│ │350ml│  │250ml│  │      │    │
│ └─────┘  └─────┘  └─────┘    │
│                                │
└─────────────────────────────────┘

✅ All products/announcements loaded from CMS!
```

---

## 🎓 TIPS & TRICKS

### Keyboard Shortcuts (many CMS have these)
```
Cmd/Ctrl + S → Save
Cmd/Ctrl + Shift + P → Publish
Cmd/Ctrl + Z → Undo
```

### Formatting in Description
```
**Bold text**
*Italic text*
• Bullet point
- List item
[Link Text](URL)
```

### Image Optimization Tips
- Keep under 10MB
- Use JPG for photos
- Use PNG for graphics
- Compress before upload
- Resize to ~1200px width

---

**🎉 Ready to use CMS? Start with SETUP_COMPLETE.md!**
