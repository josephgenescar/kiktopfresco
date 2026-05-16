#!/usr/bin/env bash

# 🚀 KikTop Fresco - Netlify CMS Quick Setup
# Run this to verify everything is set up correctly

echo "🔍 Vérifiant la configuration de Netlify CMS..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Array to track results
RESULTS=()

# Check 1: Admin files exist
echo -n "✓ Vérification des fichiers admin... "
if [ -f "admin/index.html" ] && [ -f "admin/config.yml" ]; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ Admin files")
else
  echo -e "${RED}MANQUE${NC}"
  RESULTS+=("✗ Admin files missing")
fi

# Check 2: Content folders exist
echo -n "✓ Vérification des dossiers contenu... "
if [ -d "content/announcements" ] && [ -d "content/products" ] && [ -d "content/categories" ]; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ Content folders")
else
  echo -e "${RED}MANQUE${NC}"
  RESULTS+=("✗ Content folders missing")
fi

# Check 3: CMS Loader script exists
echo -n "✓ Vérification du script CMS loader... "
if [ -f "js/cms-loader.js" ]; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ CMS Loader script")
else
  echo -e "${RED}MANQUE${NC}"
  RESULTS+=("✗ CMS Loader script missing")
fi

# Check 4: Git initialized
echo -n "✓ Vérification de Git... "
if [ -d ".git" ]; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ Git initialized")
else
  echo -e "${YELLOW}Non initialisé${NC}"
  RESULTS+=("⚠ Git not initialized (run: git init)")
fi

# Check 5: netlify.toml updated
echo -n "✓ Vérification netlify.toml... "
if grep -q "admin/index.html" netlify.toml; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ netlify.toml updated")
else
  echo -e "${RED}MANQUE${NC}"
  RESULTS+=("✗ netlify.toml not updated")
fi

# Check 6: index.html has cms-loader reference
echo -n "✓ Vérification cms-loader dans index.html... "
if grep -q "cms-loader.js" index.html; then
  echo -e "${GREEN}OK${NC}"
  RESULTS+=("✓ CMS Loader referenced in index.html")
else
  echo -e "${YELLOW}À FAIRE${NC}"
  RESULTS+=("⚠ cms-loader.js not referenced in index.html yet")
fi

echo ""
echo "═════════════════════════════════════════"
echo "📊 RÉSUMÉ DE VÉRIFICATION"
echo "═════════════════════════════════════════"
for result in "${RESULTS[@]}"; do
  echo "$result"
done

echo ""
echo "═════════════════════════════════════════"
echo "📋 PROCHAINES ÉTAPES"
echo "═════════════════════════════════════════"

if [ ! -d ".git" ]; then
  echo "1️⃣  Initialiser Git:"
  echo "    git init"
  echo ""
fi

echo "2️⃣  Ajouter tous les fichiers:"
echo "    git add ."
echo ""

echo "3️⃣  Faire un commit:"
echo "    git commit -m '🎉 Setup Netlify CMS pou KikTop Fresco'"
echo ""

echo "4️⃣  Connecter GitHub (si pa fè deja):"
echo "    git remote add origin https://github.com/VOTRE_USERNAME/kiktopfresco.git"
echo ""

echo "5️⃣  Push vers GitHub:"
echo "    git push -u origin main"
echo ""

echo "6️⃣  Aller sur Netlify et:"
echo "    - Enable Identity (Settings → Identity → Enable)"
echo "    - Invite admin users"
echo "    - Test accès à /admin"
echo ""

echo "═════════════════════════════════════════"
echo "🎉 Une fois terminé, votre CMS sera prêt!"
echo "═════════════════════════════════════════"
