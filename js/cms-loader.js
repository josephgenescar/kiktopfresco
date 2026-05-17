/**
 * cms-loader.js
 * Chaje done CMS (pwodui, espesyal, annons) nan sit la.
 * Script sa kouri apre init() epi mete ajou products global la.
 */

(async function loadCMSData() {

  // ── Mapping kategori → tab ────────────────────────────────────
  var CAT_TAB = {
    'Pate':'manger','Sandwich':'manger','Popcorn':'manger','Saucisse':'manger',
    'Fresco':'boisson','Jus':'boisson','Soda':'boisson','Ice Cream':'boisson',
    'Biere':'alcool','Rhum':'alcool','Cocktail':'alcool','Vin':'alcool'
  };
  var CAT_EM = {
    'Pate':'🥟','Sandwich':'🥪','Popcorn':'🍿','Saucisse':'🌭',
    'Fresco':'🥤','Jus':'🍊','Soda':'🥤','Ice Cream':'🍦',
    'Biere':'🍺','Rhum':'🥃','Cocktail':'🍹','Vin':'🍷'
  };

  // ── Fetch helper (cache-bust) ─────────────────────────────────
  async function fetchJSON(url) {
    var r = await fetch(url + '?_=' + Date.now());
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  // ─────────────────────────────────────────────────────────────
  // 1. CHARJE PWODUI
  // ─────────────────────────────────────────────────────────────
  try {
    var cmsProds = await fetchJSON('/data/products.json');

    var mapped = cmsProds
      .filter(function(p){ return p.available !== false && p.name; })
      .map(function(p, i) {
        var cat = p.category || 'Pate';
        var tab = CAT_TAB[cat] || 'manger';
        return {
          id       : 2000 + i,
          fr       : p.name,
          kr       : p.name,
          tab      : tab,
          cat      : cat,
          price    : p.price    || 100,
          salePrice: p.salePrice || null,
          em       : CAT_EM[cat] || '🍔',
          // ← ICI: imaj la soti nan CMS exactement
          img      : p.image    || '',
          df       : p.description || '',
          dk       : p.description || '',
          badge    : p.salePrice ? 'Promo' : '',
          alc      : (tab === 'alcool'),
          status   : 'active',
          pointValue: p.pointValue || 1,
          position  : p.position  || 0
        };
      });

    if (mapped.length) {
      // Merge: garde produits defaut (id<2000) + ajoute CMS
      var defaults = (window.products || []).filter(function(p){ return p.id < 2000; });
      window.products = defaults.concat(mapped);
      // Sauvegarde localStorage
      try { localStorage.setItem('kt_products', JSON.stringify(window.products)); } catch(e){}
      // Re-affiche
      if (typeof renderProds === 'function') renderProds();
      console.log('[CMS] ' + mapped.length + ' pwodui chaje.');
    }
  } catch(e) {
    console.warn('[CMS] products.json pa disponib - sèvi defaut.', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CHARJE ESPESYAL DIMANCH
  // ─────────────────────────────────────────────────────────────
  try {
    var specials = await fetchJSON('/data/specials.json');
    var today = new Date().getDay(); // 0=Dimanch

    var todaySpecial = specials.find(function(s){
      return s.active !== false && (s.day === undefined || s.day === today);
    });

    if (todaySpecial) {
      // Jwenn pwodui ki koresponn nan
      var matchProd = (window.products || []).find(function(p){
        return p.fr === todaySpecial.name || p.img === todaySpecial.image;
      });

      var sunData = {
        productId : matchProd ? matchProd.id : null,
        price     : todaySpecial.salePrice,
        origPrice : todaySpecial.originalPrice,
        message   : todaySpecial.description || '',
        img       : todaySpecial.image || (matchProd ? matchProd.img : '')
      };

      try { localStorage.setItem('kt_sunday', JSON.stringify(sunData)); } catch(e){}

      // Mete ajou UI espesyal dimanch
      var sunImg = document.getElementById('sun-img');
      if (sunImg && sunData.img) sunImg.src = sunData.img;

      var sunName = document.getElementById('sun-name');
      if (sunName) sunName.textContent = todaySpecial.name || '';

      var sunDesc = document.getElementById('sun-desc');
      if (sunDesc) sunDesc.textContent = todaySpecial.description || '';

      var sunNew = document.getElementById('sun-new');
      if (sunNew) sunNew.textContent = (todaySpecial.salePrice || '-') + ' HTG';

      var sunOld = document.getElementById('sun-old');
      if (sunOld) sunOld.textContent = (todaySpecial.originalPrice || '') + ' HTG';

      console.log('[CMS] Espesyal dimanch chaje:', todaySpecial.name);
    }
  } catch(e) {
    console.warn('[CMS] specials.json pa disponib.', e.message);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. CHARJE ANNONS (banners)
  // ─────────────────────────────────────────────────────────────
  try {
    var announces = await fetchJSON('/data/announces.json');
    var now = Date.now();

    var active = announces.filter(function(a) {
      if (a.active === false) return false;
      if (a.startDate && new Date(a.startDate) > now) return false;
      if (a.endDate   && new Date(a.endDate)   < now) return false;
      return true;
    }).sort(function(a,b){ return (a.position||0)-(b.position||0); });

    if (active.length) {
      var banners = active.map(function(a){
        return {
          type  : a.type  || 'texte',
          title : a.title || '',
          body  : a.body  || '',
          img   : a.image || '',
          bg    : a.bgColor   || '#0D2B5E',
          color : a.textColor || '#ffffff',
          active: true,
          position: a.position || 0
        };
      });

      try { localStorage.setItem('kt_banners', JSON.stringify(banners)); } catch(e){}
      // Re-load banners
      if (typeof loadBanner === 'function') loadBanner();
      console.log('[CMS] ' + banners.length + ' annons chaje.');
    }
  } catch(e) {
    console.warn('[CMS] announces.json pa disponib.', e.message);
  }

})();