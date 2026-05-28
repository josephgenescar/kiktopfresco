(function(){
  async function fetchJson(url, opts) {
    try {
      var res = await fetch(url, Object.assign({ cache: 'no-store' }, opts || {}));
      if(!res.ok) return null;
      return await res.json();
    } catch(e) {
      return null;
    }
  }

  function parseFrontmatter(markdown) {
    if(typeof markdown !== 'string') return { frontmatter: {}, body: '' };
    var parts = markdown.split(/^---\s*$/m);
    if(parts.length < 3) return { frontmatter: {}, body: markdown };
    var front = parts[1].trim();
    var body = parts.slice(2).join('---').trim();
    var data = {};
    var lines = front.split(/\r?\n/);
    for(var i = 0; i < lines.length; i++){
      var line = lines[i];
      if(!line || !line.includes(':')) continue;
      var idx = line.indexOf(':');
      var key = line.slice(0, idx).trim();
      var raw = line.slice(idx + 1).trim();
      if(raw === '') continue;
      var value = raw;
      if((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))){
        value = value.slice(1, -1);
      } else if(value === 'true'){
        value = true;
      } else if(value === 'false'){
        value = false;
      } else if(!isNaN(Number(value)) && value !== ''){
        value = Number(value);
      }
      data[key] = value;
    }
    return { frontmatter: data, body: body };
  }

  function inferTab(itemName, category, fallbackTab){
    var text = [itemName, category, fallbackTab].join(' ').toLowerCase();
    if(/pate|sandwich|popcorn|saucisse|poullet|plat|manger|croq|spagetti/.test(text)) return 'manger';
    if(/fresco|jus|limonade|malta|tampico|glace|soda|boisson|shake|fresh|glase|creem|ice/.test(text)) return 'boisson';
    if(/biere|beer|alcool|rhum|cocktail|vin|spirits|alcohol|wonm|house/.test(text)) return 'alcool';
    return fallbackTab || 'boisson';
  }

  function inferCat(itemName, category){
    var text = [itemName, category].join(' ').toLowerCase();
    if(/pate/.test(text)) return 'Pate';
    if(/sandwich/.test(text)) return 'Sandwich';
    if(/popcorn/.test(text)) return 'Popcorn';
    if(/saucisse|sossis|poullet|spagetti|plat/.test(text)) return 'Saucisse';
    if(/fresco/.test(text)) return 'Fresco';
    if(/jus|jumex|tampico|malta|limonade|grenad|orange|fruit/.test(text)) return 'Jus';
    if(/glace|ice cream|cream|glase/.test(text)) return 'Ice Cream';
    if(/beer|biere/.test(text)) return 'Biere';
    if(/rhum|wonm|robusto|alcohol|officers|old dog|pro red/.test(text)) return 'Rhum';
    if(/cocktail|shake|ponch|mojito/.test(text)) return 'Cocktail';
    if(/vin|diven/.test(text)) return 'Vin';
    if(/soda|cola|fiz/.test(text)) return 'Soda';
    return category || itemName || 'Pate';
  }

  async function loadCmsData(){
    if(window.__KT_CMS_LOADED){
      return window.__KT_CMS_LOADED;
    }

    window.__KT_CMS_LOADED = (async function(){
      var productIndex = await fetchJson('/content/products/index.json');
      var bannerIndex = await fetchJson('/content/announcements/index.json');

      var products = [];
      if(Array.isArray(productIndex)){
        for(var i = 0; i < productIndex.length; i++){
          var file = productIndex[i];
          var md = await fetch('/content/products/' + file, { cache: 'no-store' }).then(function(res){ return res.ok ? res.text() : ''; }).catch(function(){ return ''; });
          var parsed = parseFrontmatter(md);
          var front = parsed.frontmatter || {};
          var name = front.name || file.replace(/\.md$/i, '');
          var tab = inferTab(name, front.category, front.tab);
          var category = inferCat(name, front.category);
          products.push({
            id: String(file.replace(/\.md$/i, '')),
            fr: name,
            kr: name,
            tab: tab,
            cat: category,
            price: Number(front.price) || 0,
            em: front.emoji || '',
            df: front.description || '',
            dk: front.description || '',
            img: front.image || '',
            image: front.image || '',
            badge: front.badge || '',
            status: front.inStock === false ? 'inactive' : 'active',
            alc: /alcool|rhum|biere|vin|cocktail|beer/i.test(category + ' ' + name),
            alcohol: /alcool|rhum|biere|vin|cocktail|beer/i.test(category + ' ' + name),
            point_value: Number(front.pointValue) || 1,
            position: Number(front.position) || i,
            created_at: '',
            updated_at: ''
          });
        }
      }

      var banners = [];
      if(Array.isArray(bannerIndex)){
        for(var j = 0; j < bannerIndex.length; j++){
          var bannerFile = bannerIndex[j];
          var bannerMd = await fetch('/content/announcements/' + bannerFile, { cache: 'no-store' }).then(function(res){ return res.ok ? res.text() : ''; }).catch(function(){ return ''; });
          var bannerData = parseFrontmatter(bannerMd);
          var bannerFront = bannerData.frontmatter || {};
          banners.push({
            id: String(bannerFile.replace(/\.md$/i, '')),
            title: bannerFront.title || '',
            body: bannerData.body || '',
            icon: bannerFront.icon || '',
            bg: bannerFront.bgColor || '#0D2B5E',
            color: bannerFront.textColor || '#ffffff',
            img: bannerFront.image || '',
            link: bannerFront.link || '',
            type: bannerFront.type || (bannerFront.image ? 'image' : 'text'),
            active: bannerFront.active !== false,
            position: Number(bannerFront.position) || j,
            created: '',
            created_at: '',
            updated_at: ''
          });
        }
      }

      if(products.length){
        localStorage.setItem('products', JSON.stringify(products));
      }
      if(banners.length){
        localStorage.setItem('banners', JSON.stringify(banners));
        localStorage.setItem('kt_banners', JSON.stringify(banners));
      }

      window.__KT_CMS_PRODUCTS = products;
      window.__KT_CMS_BANNERS = banners;
      return { products: products, banners: banners };
    })();

    return window.__KT_CMS_LOADED;
  }

  window.loadKiktopCmsData = loadCmsData;
})();
