/**
 * cms-loader.js
 * Chaje done CMS (pwodui, espesyal, annons) nan sit la.
 * Script sa kouri apre init() epi mete ajou products global la.
 */

(async function loadCMSData() {

  // ── Mapping kategori → tab ────────────────────────────────────
  var CAT_TAB = {
    'Pate':'manger','Sandwich':'manger','Popcorn':'manger','Saucisse':'manger',
    'Fresco':'boisson','Jus':'boisson','Soda':'boisson','Ice Cream':'boisson','Boissons':'boisson',
    'Biere':'alcool','Rhum':'alcool','Cocktail':'alcool','Vin':'alcool'
  };
  var CAT_EM = {
    'Pate':'🥟','Sandwich':'🥪','Popcorn':'🍿','Saucisse':'🌭',
    'Fresco':'🥤','Jus':'🍊','Soda':'🥤','Ice Cream':'🍦','Boissons':'🥤',
    'Biere':'🍺','Rhum':'🥃','Cocktail':'🍹','Vin':'🍷'
  };

  function parseMarkdown(content) {
    var lines = (content || '').split('\n');
    var data = {};
    var body = [];
    var inFrontmatter = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.trim() === '---') {
        inFrontmatter = !inFrontmatter;
        continue;
      }
      if (inFrontmatter) {
        var sep = line.indexOf(':');
        if (sep !== -1) {
          var key = line.slice(0, sep).trim();
          var value = line.slice(sep + 1).trim();
          data[key] = parseValue(value);
        }
      } else {
        body.push(line);
      }
    }

    return { data: data, body: body.join('\n').trim() };
  }

  function parseValue(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(parseFloat(value)) && value !== '') return Number(value);
    return value.replace(/^['\"]|['\"]$/g, '');
  }

  async function fetchJSON(url) {
    var r = await fetch(url + '?_=' + Date.now());
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }

  async function fetchText(url) {
    var r = await fetch(url + '?_=' + Date.now());
    if (!r.ok) throw new Error(r.status);
    return r.text();
  }

  function normalizeCategory(category) {
    if (!category) return 'manger';
    var c = category.toString().toLowerCase();
    if (c.indexOf('alcool') !== -1 || c.indexOf('vin') !== -1 || c.indexOf('rhum') !== -1 || c.indexOf('cocktail') !== -1) return 'alcool';
    if (c.indexOf('boisson') !== -1 || c.indexOf('boissons') !== -1 || c.indexOf('jus') !== -1 || c.indexOf('fresco') !== -1 || c.indexOf('soda') !== -1 || c.indexOf('ice') !== -1) return 'boisson';
    return 'manger';
  }

  function mapProduct(p, i) {
    var data = p || {};
    var category = data.category || '';
    var tab = normalizeCategory(category);
    return {
      id        : 2000 + i,
      fr        : data.name || '',
      kr        : data.name || '',
      tab       : tab,
      cat       : category || '',
      price     : data.price || 0,
      salePrice : data.salePrice || null,
      em        : CAT_EM[category] || '🍔',
      df        : data.description || '',
      dk        : data.description || '',
      badge     : data.badge || '',
      alc       : tab === 'alcool',
      status    : data.available === false ? 'inactive' : 'active',
      img       : data.image || '',
      position  : data.position || i
    };
  }

  async function loadCMSProducts() {
    var files = await fetchJSON('/content/products/index.json');
    var products = [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!file || !file.endsWith('.md')) continue;
      var content = await fetchText('/content/products/' + file);
      var parsed = parseMarkdown(content);
      if (parsed.data && parsed.data.name) products.push(parsed.data);
    }
    return products;
  }

  async function loadCMSSettings() {
    var content = await fetchText('/content/settings/general.yml');
    var lines = content.split('\n');
    var data = {};
    lines.forEach(function(line) {
      var sep = line.indexOf(':');
      if (sep !== -1) {
        var key = line.slice(0, sep).trim();
        var value = line.slice(sep + 1).trim();
        data[key] = parseValue(value);
      }
    });
    return data;
  }

  async function loadCMSAnnouncements() {
    var files = await fetchJSON('/content/announcements/index.json');
    var announcements = [];
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (!file || !file.endsWith('.md')) continue;
      var content = await fetchText('/content/announcements/' + file);
      var parsed = parseMarkdown(content);
      if (parsed.data && parsed.data.active !== false) {
        parsed.data.body = parsed.data.body || parsed.body || "";
        parsed.data.bg = parsed.data.bgColor || parsed.data.bg || "#0D2B5E";
        parsed.data.color = parsed.data.textColor || parsed.data.color || "#ffffff";
        announcements.push(parsed.data);
      }
    }
    return announcements.sort(function(a, b) { return (a.position || 0) - (b.position || 0); });
  }

  try {
    var cmsProds = await loadCMSProducts();
    if (!cmsProds.length) throw new Error('No CMS products found');

    var mapped = cmsProds
      .filter(function(p){ return p.available !== false && p.name; })
      .map(function(p, i) { return mapProduct(p, i); });

    if (mapped.length) {
      var defaults = (window.products || []).filter(function(p){ return p.id < 2000; });
      window.products = defaults.concat(mapped);
      try { localStorage.setItem('kt_products', JSON.stringify(window.products)); } catch(e) {}
      if (typeof renderProds === 'function') renderProds();
      console.log('[CMS] ' + mapped.length + ' pwodui CMS chaje.');
    }
  } catch(e) {
    console.warn('[CMS] content/products pa disponib, eseye /data/products.json.', e.message);
    try {
      var cmsProds = await fetchJSON('/data/products.json');
      var mapped = cmsProds
        .filter(function(p){ return p.available !== false && p.name; })
        .map(function(p, i) { return mapProduct(p, i); });

      if (mapped.length) {
        var defaults = (window.products || []).filter(function(p){ return p.id < 2000; });
        window.products = defaults.concat(mapped);
        try { localStorage.setItem('kt_products', JSON.stringify(window.products)); } catch(e) {}
        if (typeof renderProds === 'function') renderProds();
        console.log('[CMS] ' + mapped.length + ' pwodui /data CMS chaje.');
      }
    } catch(err) {
      console.warn('[CMS] products.json pa disponib.', err.message);
    }
  }

  try {
    var generalSettings = await loadCMSSettings();
    if (Object.keys(generalSettings).length) {
      try { localStorage.setItem('kt_settings', JSON.stringify(generalSettings)); } catch(e) {}
      console.log('[CMS] Settings chaje.');
    }
  } catch(e) {
    console.warn('[CMS] content/settings/general.yml pa disponib.', e.message);
  }

  try {
    var announces = await loadCMSAnnouncements();
    if (announces.length) {
      try { localStorage.setItem('kt_banners', JSON.stringify(announces)); } catch(e) {}
      if (typeof loadBanner === 'function') loadBanner();
      console.log('[CMS] ' + announces.length + ' annons CMS chaje.');
    }
  } catch(e) {
    console.warn('[CMS] announces.json pa disponib.', e.message);
  }

})();
