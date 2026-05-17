/**
 * 🔄 CMS Content Loader for KikTop Fresco
 * Loads announcements, products, and settings from Netlify CMS files
 * 
 * Features:
 * - Load announcements with auto-rotation
 * - Dynamically populate products
 * - Load settings from config
 * - Fallback to static data if CMS unavailable
 */

class KikTopCMSLoader {
  constructor() {
    this.baseUrl = '/content';
    this.cache = {};
    this.cacheTimeout = 60000; // 1 minute
    this.loaded = false;
  }

  /**
   * 🔄 Charger les annonces depuis CMS
   */
  async loadAnnouncements() {
    try {
      const files = await this.readDirectory('/content/announcements');
      const announcements = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await this.readFile(file);
          const parsed = this.parseMarkdown(content);
          if (parsed.data.active !== false) {
            announcements.push(parsed);
          }
        }
      }

      return announcements.sort((a, b) => 
        (a.data.position || 0) - (b.data.position || 0)
      );
    } catch (error) {
      console.warn('❌ Impossible charger annonces CMS:', error);
      return this.getDefaultAnnouncements();
    }
  }

  /**
   * 🍔 Charger les produits depuis CMS
   */
  async loadProducts(category = null) {
    try {
      const files = await this.readDirectory('/content/products');
      const products = [];

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await this.readFile(file);
          const parsed = this.parseMarkdown(content);
          
          if (parsed.data.available !== false && 
              (!category || parsed.data.category === category)) {
            products.push(parsed);
          }
        }
      }

      return products.sort((a, b) => 
        (a.data.position || 0) - (b.data.position || 0)
      );
    } catch (error) {
      console.warn('❌ Impossible charger produits CMS:', error);
      return [];
    }
  }

  /**
   * ⚙️ Charger paramètres depuis CMS
   */
  async loadSettings() {
    try {
      const content = await this.readFile('/content/settings/general.yml');
      return this.parseYAML(content);
    } catch (error) {
      console.warn('❌ Impossible charger settings CMS:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * ✨ Charger spécial dimanche
   */
  async loadSpecial() {
    try {
      const files = await this.readDirectory('/content/specials');
      const today = new Date().getDay();

      for (const file of files) {
        if (file.endsWith('.md')) {
          const content = await this.readFile(file);
          const parsed = this.parseMarkdown(content);
          
          if (parsed.data.active !== false && parsed.data.day === today) {
            return parsed;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('❌ Impossible charger special:', error);
      return null;
    }
  }

  /**
   * 📖 Parser Markdown frontmatter
   */
  parseMarkdown(content) {
    const lines = content.split('\n');
    let data = {};
    let body = '';
    let inFrontmatter = false;
    let frontmatterEnd = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          frontmatterEnd = i;
          break;
        }
      } else if (inFrontmatter && lines[i].includes(':')) {
        const [key, value] = lines[i].split(':').map(s => s.trim());
        data[key] = this.parseValue(value);
      }
    }

    body = lines.slice(frontmatterEnd + 1).join('\n').trim();

    return { data, body };
  }

  /**
   * 📄 Parser YAML simple
   */
  parseYAML(content) {
    const lines = content.split('\n');
    const data = {};

    for (const line of lines) {
      if (line.includes(':') && !line.trim().startsWith('#')) {
        const [key, value] = line.split(':').map(s => s.trim());
        data[key] = this.parseValue(value);
      }
    }

    return data;
  }

  /**
   * 🔤 Parse différents types de valeurs
   */
  parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(value) && value !== '') return Number(value);
    return value.replace(/^["']|["']$/g, '');
  }

  /**
   * 🆔 Générer un ID stable à partir d'une clé
   */
  generateId(seed) {
    var str = String(seed || 'item');
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * 📦 Normaliser la catégorie en onglet pour le site
   */
  normalizeCategory(category) {
    if (!category) return 'manger';
    var c = category.toString().toLowerCase();
    if (c.indexOf('alcool') !== -1 || c.indexOf('vin') !== -1 || c.indexOf('rhum') !== -1 || c.indexOf('cocktail') !== -1) return 'alcool';
    if (c.indexOf('boisson') !== -1 || c.indexOf('boissons') !== -1 || c.indexOf('jus') !== -1 || c.indexOf('fresco') !== -1 || c.indexOf('soda') !== -1 || c.indexOf('ice') !== -1) return 'boisson';
    return 'manger';
  }

  /**
   * 🛒 Convertir un produit CMS en objet produit du site
   */
  mapProduct(product, index) {
    var data = product.data || {};
    var category = data.category || '';
    var tab = this.normalizeCategory(category);
    return {
      id: data.id || this.generateId(product.path || data.name || data.description || index),
      fr: data.name || '',
      kr: data.kr || data.name || '',
      tab: tab,
      cat: category || '',
      price: data.price || 0,
      em: data.em || '',
      df: data.description || '',
      dk: data.krDescription || data.description || '',
      badge: data.badge || '',
      alc: tab === 'alcool',
      status: data.available === false ? 'inactive' : 'active',
      img: data.image || null,
      position: data.position || index
    };
  }

  /**
   * 📂 Lire contenu d'un fichier
   */
  async readFile(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      console.warn(`❌ Erreur lecture ${path}:`, error);
      return null;
    }
  }

  /**
   * 📁 Lister fichiers d'un dossier (nécessite index.json)
   */
  async readDirectory(path) {
    try {
      const response = await fetch(`${path}/index.json`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * 🎨 Injecter annonces dans le DOM
   */
  async injectAnnouncements() {
    const announcements = await this.loadAnnouncements();
    if (!announcements.length) return;

    const banners = announcements.map(function(ann){
      return {
        active: ann.data.active !== false,
        type: ann.data.type === 'image' ? 'image' : 'text',
        title: ann.data.title || '',
        body: ann.body || '',
        bg: ann.data.bgColor || '#0D2B5E',
        color: ann.data.textColor || '#ffffff',
        img: ann.data.type === 'image' ? (ann.data.image || '') : '',
        icon: ann.data.icon || '📢',
        position: ann.data.position || 0
      };
    });

    banners.sort(function(a,b){return (a.position||0)-(b.position||0);});
    try { localStorage.setItem('kt_banners', JSON.stringify(banners)); } catch(e) {}
    if (typeof loadBanner === 'function') {
      loadBanner();
    }
    console.log('✅ Annonces CMS envoyées au site:', banners.length);
  }

  /**
   * 🔄 Rotation automatique annonces
   */
  rotateAnnouncements() {
    let current = 0;
    const slides = document.querySelectorAll('.bnslide');
    const dots = document.querySelectorAll('.bndot');

    setInterval(() => {
      slides[current].classList.remove('active');
      if (dots[current]) dots[current].classList.remove('on');

      current = (current + 1) % slides.length;

      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('on');
    }, 5000); // Change every 5 seconds
  }

  /**
   * 🍔 Injecter produits dans le DOM
   */
  async injectProducts() {
    const products = await this.loadProducts();
    if (!products.length) {
      console.log('ℹ️ Aucun produit CMS trouvé');
      return;
    }

    const mapped = products.map((product, index) => this.mapProduct(product, index));
    try { localStorage.setItem('kt_products', JSON.stringify(mapped)); } catch(e) {}
    if (window.products && Array.isArray(window.products)) {
      window.products = mapped;
      lsSet('products', mapped);
      if (typeof switchTab === 'function') {
        switchTab(window.curTab || 'manger');
      }
      if (typeof updSunday === 'function') {
        updSunday();
      }
    }
    console.log('✅ Produits CMS chargés et appliqués:', mapped.length);
  }

  /**
   * ✨ Charger et afficher spécial dimanche
   */
  async injectSpecial() {
    const special = await this.loadSpecial();
    if (special) {
      document.getElementById('sun-img').src = special.data.image;
      document.getElementById('sun-name').textContent = special.data.name;
      document.getElementById('sun-desc').textContent = special.data.description;
      document.getElementById('sun-old').textContent = `G${special.data.originalPrice}`;
      document.getElementById('sun-new').textContent = `G${special.data.salePrice}`;
      console.log('✅ Spécial dimanche mis à jour');
    }
  }

  /**
   * ⚙️ Charger et appliquer settings
   */
  async injectSettings() {
    const settings = await this.loadSettings();
    if (!settings) return;
    try { localStorage.setItem('kt_settings', JSON.stringify(settings)); } catch(e) {}
    if (settings.whatsappNumber) {
      window.waNumber = settings.whatsappNumber;
    }
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--navy', settings.primaryColor);
    }
    if (settings.accentColor) {
      document.documentElement.style.setProperty('--yellow', settings.accentColor);
    }
    if (typeof lsSet === 'function') {
      lsSet('settings', settings);
    }
    console.log('✅ Settings CMS appliqués');
  }

  /**
   * 🎯 Charger tout le contenu
   */
  async loadAllContent() {
    try {
      await Promise.all([
        this.injectSettings(),
        this.injectAnnouncements(),
        this.injectProducts(),
        this.injectSpecial()
      ]);
      this.loaded = true;
      console.log('✅ Contenu CMS complètement chargé!');
      return true;
    } catch (error) {
      console.error('❌ Erreur chargement CMS:', error);
      return false;
    }
  }

  /**
   * Données par défaut en cas d'erreur
   */
  getDefaultAnnouncements() {
    return [{
      data: {
        title: '🎉 Grand Ouverture!',
        type: 'texte',
        bgColor: '#D63031',
        textColor: '#fff',
        active: true,
        position: 1
      },
      body: 'Bienvenue chez KikTop Fresco! Découvrez nos délicieuses spécialités.'
    }];
  }

  getDefaultSettings() {
    return {
      siteName: 'KikTop Fresco',
      whatsappNumber: '50936123456',
      primaryColor: '#0D2B5E',
      accentColor: '#F5C518'
    };
  }
}

// 🚀 Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  const cmsLoader = new KikTopCMSLoader();
  window.cmsLoader = cmsLoader;
  cmsLoader.loadAllContent();
});

console.log('✅ KikTop CMS Loader initialisé');
