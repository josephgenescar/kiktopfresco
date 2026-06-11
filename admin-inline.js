
  
// ══════════════════════════════════════════════════════
//  SUPABASE CONFIG — Admin
// ══════════════════════════════════════════════════════
const SUPABASE_URL = window.SUPABASE_ENV?.SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';          // <-- Ranplase ak URL pwojè Supabase ou
const SUPABASE_SERVICE_KEY = window.SUPABASE_ENV?.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';             // <-- Ranplase ak service_role key ou (sekirize li)
const DEFAULT_SETTINGS = { maxPoints: 100, pointsRate: 100, adminPwd: 'kiktop2026', adminEmail: 'admin@kiktop.com' };

const isSupabaseConfigured =
  SUPABASE_URL.startsWith('https://') &&
  !SUPABASE_URL.includes('YOUR-PROJECT') &&
  SUPABASE_SERVICE_KEY !== 'YOUR_SERVICE_ROLE_KEY';

const sb = isSupabaseConfigured ? supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

const IMAGEKIT_PUBLIC_KEY = window.IMAGEKIT_ENV?.IMAGEKIT_PUBLIC_KEY || 'YOUR_IMAGEKIT_PUBLIC_KEY';
const IMAGEKIT_URL_ENDPOINT = window.IMAGEKIT_ENV?.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/7q1q0vmzk';
const IMAGEKIT_AUTH_ENDPOINT = window.IMAGEKIT_ENV?.IMAGEKIT_AUTH_ENDPOINT || '/.netlify/functions/imagekit-auth';
function getImageKitAuthUrls(){
  var urls = [];
  var primary = IMAGEKIT_AUTH_ENDPOINT.startsWith('/') ? window.location.origin + IMAGEKIT_AUTH_ENDPOINT : IMAGEKIT_AUTH_ENDPOINT;
  if(primary) urls.push(primary);
  var fallback = window.location.origin + '/imagekit-auth';
  if(!urls.includes(fallback)) urls.push(fallback);

  var devPorts = ['8888'];
  var devHosts = ['localhost', '127.0.0.1'];
  devHosts.forEach(function(host){
    devPorts.forEach(function(port){
      var origin = window.location.protocol + '//' + host + ':' + port;
      var candidate = IMAGEKIT_AUTH_ENDPOINT.startsWith('/') ? origin + IMAGEKIT_AUTH_ENDPOINT : IMAGEKIT_AUTH_ENDPOINT;
      if(!urls.includes(candidate)) urls.push(candidate);
      var alt = origin + '/imagekit-auth';
      if(!urls.includes(alt)) urls.push(alt);
    });
  });

  return urls;
}
const imagekit = typeof ImageKit === 'function' ? new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  authenticationEndpoint: IMAGEKIT_AUTH_ENDPOINT
}) : null;

if(!imagekit){
  console.warn('ImageKit SDK unavailable; image uploads disabled.');
}

// Admin DB wrapper
const ADB = {
  // ── Settings ──
  async getSettings(){
    if(!isSupabaseConfigured) return JSON.parse(localStorage.getItem('kt_settings')||'{}');
    const {data} = await sb.from('settings').select('*').eq('id',1).single();
    return data ? {
      maxPoints:data.max_points,
      pointsRate:data.points_rate,
      adminPwd:data.admin_pwd,
      adminEmail:data.admin_email || DEFAULT_SETTINGS.adminEmail
    } : {};
  },
  async saveSettings(s){
    if(!isSupabaseConfigured){localStorage.setItem('kt_settings',JSON.stringify(s));return;}
    const payload = {
      max_points:s.maxPoints,
      points_rate:s.pointsRate,
      admin_pwd:s.adminPwd
    };
    if(s.adminEmail) payload.admin_email = s.adminEmail;
    try{
      await sb.from('settings').update(payload).eq('id',1);
    }catch(e){
      console.warn('Supabase settings save failed:', e);
    }
  },

  // ── Products ──
  async getProducts(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_products'))||[];}catch{return [];} }
    const {data} = await sb.from('products').select('*').order('position');
    return data||[];
  },
  async saveProduct(p){
    if(!isSupabaseConfigured){ /* handled below */ return null; }
    const remoteProduct = toRemoteProduct(p);
    if(p.id !== undefined && p.id !== null && p.id !== ""){
      try{
        const {data,error} = await sb.from('products').update(remoteProduct).eq('id',p.id).select().single();
        if(error) throw error;
        return data;
      }catch(error){
        if(error && error.code === 'PGRST116'){
          const {data:insertData,error:insertError} = await sb.from('products').insert(remoteProduct).select().single();
          if(insertError) throw insertError;
          return insertData;
        }
        throw error;
      }
    } else {
      const {id,...rest} = remoteProduct;
      const {data,error} = await sb.from('products').insert(rest).select();
      if(error) throw error;
      return Array.isArray(data) ? data[0] : data;
    }
  },
  async deleteProduct(id){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('products').delete().eq('id',id);
  },

  // ── Customers ──
  async getCustomers(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_customers'))||[];}catch{return[];} }
    const {data} = await sb.from('customers').select('*').order('points',{ascending:false});
    return data||[];
  },
  async updateCustomer(id, payload){
    if(!isSupabaseConfigured){ return null; }
    const {data,error} = await sb.from('customers').update(payload).eq('id',id).select().single();
    if(error) throw error;
    return data;
  },

  // ── Orders ──
  async getOrders(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_orders'))||[];}catch{return[];} }
    const {data} = await sb.from('orders').select('*').order('created_at',{ascending:false});
    return data||[];
  },
  async deleteOrder(id){
    if(!isSupabaseConfigured){ return; }
    await sb.from('orders').delete().eq('id',id);
  },

  // ── Reviews ──
  async getReviews(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_reviews'))||[];}catch{return[];} }
    const {data} = await sb.from('customer_reviews').select('*').order('created_at',{ascending:false});
    return data||[];
  },
  async deleteReview(id){
    if(!isSupabaseConfigured){ return; }
    await sb.from('customer_reviews').delete().eq('id',id);
  },
  async updateReview(id, payload){
    if(!isSupabaseConfigured){ return; }
    const {data,error} = await sb.from('customer_reviews').update(payload).eq('id',id).select().single();
    if(error) throw error;
    return data;
  },

  // ── Site Visits ──
  async getSiteVisits(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_site_visits'))||[];}catch{return[];} }
    const {data} = await sb.from('site_visits').select('*').order('visit_date',{ascending:false});
    return data||[];
  },
  async trackSiteVisit(payload){
    if(!isSupabaseConfigured){
      var visits = JSON.parse(localStorage.getItem('kt_site_visits')||'[]');
      if(!Array.isArray(visits)) visits=[];
      visits.unshift(payload);
      localStorage.setItem('kt_site_visits', JSON.stringify(visits.slice(0,150)));
      return payload;
    }
    const {data,error} = await sb.from('site_visits').upsert(payload, { onConflict: 'session_id' }).select().single();
    if(error) throw error;
    return data;
  },

  // ── Banners ──
  async getBanners(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_banners'))||[];}catch{return[];} }
    const {data} = await sb.from('banners').select('*').order('position');
    return data||[];
  },
  async saveBanner(b){
    if(!isSupabaseConfigured){ return null; }
    if(b.id && !b.id.toString().startsWith('b_')){
      const {data,error} = await sb.from('banners').update({title:b.title,body:b.body,icon:b.icon,bg:b.bg,color:b.color,img:b.img,link:b.link,active:b.active}).eq('id',b.id).select().single();
      if(error) throw error;
      return data;
    } else {
      const {id,...rest} = b;
      const {data,error} = await sb.from('banners').insert(rest).select().single();
      if(error) throw error;
      return data;
    }
  },
  async deleteBanner(id){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('banners').delete().eq('id',id);
  },
  async toggleBanner(id, active){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('banners').update({active}).eq('id',id);
  },

  // ── Local Ads / Publicité locale ──
  async getAds(){
    if(!isSupabaseConfigured){ console.warn('Supabase not configured for local_ads'); return []; }
    const {data,error} = await sb.from('local_ads').select('*').order('position');
    if(error){ throw error; }
    return data||[];
  },
  async saveAd(a){
    if(!isSupabaseConfigured){ return null; }
    const payload = {
      title: a.title || '',
      subtitle: a.subtitle || '',
      body: a.body || '',
      button_text: a.btnText || '',
      img: a.img || '',
      link: a.link || '',
      active: a.active === true,
      position: Number(a.position) || 0,
      created_at: a.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if(a.id){
      const {data,error} = await sb.from('local_ads').update(payload).eq('id',a.id).select().single();
      if(error){
        if(error.code === 'PGRST116'){
          const {data:insertData, error:insertError} = await sb.from('local_ads').insert(payload).select().single();
          if(insertError) throw insertError;
          return insertData;
        }
        throw error;
      }
      return data;
    }
    const {data,error} = await sb.from('local_ads').insert(payload).select().single();
    if(error) throw error;
    return data;
  },
  async deleteAd(id){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('local_ads').delete().eq('id',id);
  },
  async toggleAd(id, active){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('local_ads').update({active}).eq('id',id);
  },

  // ── Customers ──
  async getCustomers(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_customers'))||[];}catch{return[];} }
    const {data} = await sb.from('customers').select('*').order('points',{ascending:false});
    return data||[];
  },
  async resetPoints(id){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('customers').update({points:0}).eq('id',id);
  },
  async resetCustomer(id){
    if(!isSupabaseConfigured){ /* handled below */ return; }
    await sb.from('customers').update({points:0, history:[], orders_count:0, total_spent:0}).eq('id',id);
    await sb.from('orders').delete().eq('customer_id',id);
    try{
      await sb.rpc('sync_customer_points', { p_customer_id: id });
    }catch(e){
      console.warn('Failed to resync customer points after reset', e);
    }
  },

  // ── Orders ──
  async getOrders(){
    if(!isSupabaseConfigured){ try{return JSON.parse(localStorage.getItem('kt_orders'))||[];}catch{return[];} }
    const {data} = await sb.from('orders').select('*').order('created_at',{ascending:false});
    return data||[];
  },

  // ── Sunday ──
  async getSunday(){
    if(!isSupabaseConfigured){ return {}; }
    const {data,error} = await sb.from('sunday_special').select('*').eq('id',1).maybeSingle();
    if(error && error.code !== 'PGRST116') throw error;
    if(!data){ return {}; }
    return {
      productId: Number(data.product_id) || null,
      price: Number(data.special_price) || 0,
      message: data.special_message || "",
      image: data.image_url || "",
      active: data.active !== false
    };
  },
  async saveSunday(productId, price, message, imageUrl){
    if(!isSupabaseConfigured){ return; }
    await sb.from('sunday_special').upsert({
      id: 1,
      product_id: Number(productId),
      special_price: Number(price) || 0,
      special_message: message || "",
      image_url: imageUrl || null,
      active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
  },
};

const DB={
  get:(k,d=[])=>{try{return JSON.parse(localStorage.getItem("kt_"+k))??d;}catch{return d;}},
  set:(k,v)=>localStorage.setItem("kt_"+k,JSON.stringify(v)),
  obj:(k,d={})=>{try{return JSON.parse(localStorage.getItem("kt_"+k))??d;}catch{return d;}}
};

function toRemoteProduct(p){
  return {
    name_fr: p.fr || p.name_fr || p.name || "",
    name_kr: p.kr || p.name_kr || p.name || p.fr || "",
    tab: p.tab || "manger",
    category: p.cat || p.category || "",
    price: Number(p.price) || 0,
    emoji: p.em || p.emoji || "",
    description_fr: p.df || p.description_fr || "",
    description_kr: p.dk || p.description_kr || "",
    image: p.img || "",
    badge: p.badge || "",
    alcohol: p.alc === true || p.alcohol === true,
    status: p.status || "active",
    position: Number(p.position) || 0
  };
}

function normalizeProduct(p){
  if(!p) return p;
  return {
    id: p.id,
    fr: p.fr || p.name_fr || p.name || "",
    name_fr: p.name_fr || p.fr || p.name || "",
    kr: p.kr || p.name_kr || p.name_fr || p.fr || "",
    name_kr: p.name_kr || p.kr || p.name_fr || p.fr || "",
    name: p.name || p.fr || p.name_fr || "",
    tab: p.tab || "manger",
    cat: p.cat || p.category || "",
    category: p.category || p.cat || "",
    price: Number(p.price) || 0,
    em: p.em || p.emoji || "",
    emoji: p.emoji || p.em || "",
    df: p.df || p.description_fr || "",
    desc_fr: p.description_fr || p.df || "",
    dk: p.dk || p.description_kr || "",
    desc_kr: p.description_kr || p.dk || "",
    img: p.img || p.image || "",
    image: p.image || p.img || "",
    badge: p.badge || "",
    status: p.status || "active",
    alc: p.alc === true || p.alcohol === true,
    alcohol: p.alcohol === true || p.alc === true,
    position: Number(p.position) || 0,
    created_at: p.created_at,
    updated_at: p.updated_at
  };
}

function normalizeBanner(b){
  if(!b) return b;
  return {
    id: b.id,
    title: b.title || "",
    body: b.body || "",
    icon: b.icon || "",
    bg: b.bg || "#0D2B5E",
    color: b.color || "#ffffff",
    img: b.img || "",
    link: b.link || "",
    type: b.type || (b.img ? "image" : "text"),
    active: b.active !== false,
    position: Number(b.position) || 0,
    created: b.created || b.created_at || "",
    created_at: b.created_at,
    updated_at: b.updated_at
  };
}

function normalizeAd(a){
  if(!a) return a;
  var active = true;
  if(a.active === false || a.active === 'false' || a.active === 0 || a.active === '0') active = false;
  return {
    id: a.id,
    title: a.title || "",
    subtitle: a.subtitle || a.subtitle_text || "",
    body: a.body || "",
    btnText: a.btnText || a.button_text || "Wè plis",
    link: a.link || "",
    img: a.img || a.image || "",
    active: active,
    position: Number(a.position) || 0,
    created: a.created || a.created_at || "",
    created_at: a.created_at,
    updated_at: a.updated_at
  };
}

function normalizeReview(r){
  if(!r) return r;
  return {
    id: r.id,
    customer_name: r.customer_name || r.name || "",
    customer_phone: r.customer_phone || r.phone || "",
    rating: Number(r.rating) || 5,
    review: r.review || r.message || "",
    approved: r.approved === true || r.status === 'approved',
    status: r.approved === true || r.status === 'approved' ? 'approved' : 'pending',
    created_at: r.created_at,
    updated_at: r.updated_at
  };
}

function normalizeVisit(v){
  if(!v) return v;
  return {
    id: v.id,
    session_id: v.session_id || "",
    visit_date: v.visit_date || (v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : ''),
    page: v.page || "/",
    referrer: v.referrer || "",
    user_agent: v.user_agent || "",
    created_at: v.created_at
  };
}

async function loadProductsFromSource(){
  var local = lsGet("products",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getProducts();
      if(Array.isArray(remote) && remote.length){
        var normalized = remote.map(normalizeProduct);
        lsSet("products", normalized);
        return normalized;
      }
    }catch(e){console.warn('Failed to load remote products', e);}
  }
  return local;
}

async function loadBannersFromSource(){
  var local = lsGet("banners",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getBanners();
      if(Array.isArray(remote) && remote.length){
        var normalized = remote.map(normalizeBanner);
        lsSet("banners", normalized);
        return normalized;
      }
    }catch(e){console.warn('Failed to load remote banners', e);}
  }
  return local;
}

async function loadAdsFromSource(){
  var local = lsGet("local_ads",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getAds();
      if(Array.isArray(remote) && remote.length){
        lsSet("local_ads", remote);
        return remote;
      }
    }catch(e){
      console.warn('Failed to load remote local_ads', e);
    }
  }
  return local;
}

async function loadCustomersFromSource(){
  var local = lsGet("customers",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getCustomers();
      if(Array.isArray(remote) && remote.length){
        var normalized = remote.map(normalizeCustomer);
        lsSet("customers", normalized);
        return normalized;
      }
    }catch(e){console.warn('Failed to load remote customers', e);}
  }
  return local;
}

async function loadOrdersFromSource(){
  var local = lsGet("orders",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getOrders();
      if(Array.isArray(remote) && remote.length){
        lsSet("orders", remote);
        return remote;
      }
    }catch(e){console.warn('Failed to load remote orders', e);}
  }
  return local;
}

async function loadReviewsFromSource(){
  var local = lsGet("reviews",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getReviews();
      if(Array.isArray(remote) && remote.length){
        var normalized = remote.map(normalizeReview);
        lsSet("reviews", normalized);
        return normalized;
      }
    }catch(e){console.warn('Failed to load remote reviews', e);}
  }
  return local;
}

async function loadVisitsFromSource(){
  var local = lsGet("site_visits",[]);
  if(isSupabaseConfigured){
    try{
      var remote = await ADB.getSiteVisits();
      if(Array.isArray(remote) && remote.length){
        var normalized = remote.map(normalizeVisit);
        lsSet("site_visits", normalized);
        return normalized;
      }
    }catch(e){console.warn('Failed to load remote site visits', e);}
  }
  return local;
}

// ============================================================
//  STORAGE
// ============================================================
function lsGet(k,d){try{var v=localStorage.getItem("kt_"+k);return v!==null?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem("kt_"+k,JSON.stringify(v));}catch(e){}}

function normalizeCustomer(c){
  if(!c) return c;
  c.points = Number(c.points) || 0;
  c.totalOrders = Number(c.totalOrders) || 0;
  c.history = Array.isArray(c.history) ? c.history : [];
  c.name = c.name || c.email || "Client";
  c.phone = c.phone || "";
  return c;
}

var settings = normalizeAdminSettings(lsGet("settings", DEFAULT_SETTINGS));

function normalizeAdminSettings(raw){
  var merged = Object.assign({}, DEFAULT_SETTINGS, raw || {});
  if(typeof merged.adminEmail !== 'string' || !merged.adminEmail.trim()) merged.adminEmail = DEFAULT_SETTINGS.adminEmail;
  if(typeof merged.adminPwd !== 'string' || !merged.adminPwd.trim()) merged.adminPwd = DEFAULT_SETTINGS.adminPwd;
  merged.adminEmail = merged.adminEmail.trim();
  merged.adminPwd = merged.adminPwd.trim();
  return merged;
}

async function getAdminSettings(){
  try{
    var remote = await ADB.getSettings();
    var localSettings = normalizeAdminSettings(lsGet("settings", {}));
    if(remote && typeof remote === 'object'){
      var remoteSettings = normalizeAdminSettings(remote);
      return Object.assign({}, localSettings, remoteSettings);
    }
    return localSettings;
  }catch(e){
    console.warn('Failed to load admin settings, using local fallback', e);
    return normalizeAdminSettings(lsGet("settings", DEFAULT_SETTINGS));
  }
}

// ============================================================
//  LOGIN
// ============================================================
['email','pwd'].forEach(id=>{
  var el = document.getElementById(id);
  if(el){
    el.addEventListener("keydown",function(e){if(e.key==="Enter")login();});
    el.addEventListener("input",function(){document.getElementById("lerr").style.display = "none";});
  }
});

async function login(){
  try{
    settings = await getAdminSettings();
  }catch(e){
    settings = normalizeAdminSettings(lsGet("settings", DEFAULT_SETTINGS));
  }
  var email = document.getElementById("email").value.trim().toLowerCase();
  var pwd = document.getElementById("pwd").value;
  var expectedEmail = (settings.adminEmail || DEFAULT_SETTINGS.adminEmail).toLowerCase();
  if(email === expectedEmail && pwd === settings.adminPwd){
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").classList.add("show");
    await refreshAll();
    toast("✅ Bienvenu Admin!","s");
  } else {
    document.getElementById("lerr").style.display = "block";
    document.getElementById("pwd").value = "";
  }
}

function logout(){
  document.getElementById("app").classList.remove("show");
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("pwd").value = "";
  document.getElementById("lerr").style.display = "none";
}

// ============================================================
//  NAVIGATION
// ============================================================
function showPage(name){
  document.querySelectorAll(".page").forEach(function(p){p.classList.remove("on");});
  document.querySelectorAll(".nav-item").forEach(function(n){n.classList.remove("on");});
  document.getElementById("page-"+name).classList.add("on");
  document.querySelector("[data-p='"+name+"']").classList.add("on");
  if(name==="dashboard") renderDashboard();
  if(name==="annonces")  renderBanners();
  if(name==="ads")       renderAds();
  if(name==="products")  renderProducts();
  if(name==="special")   renderSpecialPage();
  if(name==="clients")   renderClients();
  if(name==="orders")    renderOrders();
  if(name==="reviews")   renderReviews();
  if(name==="settings")  loadSettings();
}

async function refreshAll(){
  settings = await getAdminSettings();
  await renderDashboard();
  renderProducts();
  await renderReviews();
}

function formatLocalDate(date){
  var y = date.getFullYear();
  var m = String(date.getMonth()+1).padStart(2,'0');
  var d = String(date.getDate()).padStart(2,'0');
  return y + "-" + m + "-" + d;
}

// ============================================================
//  DASHBOARD
// ============================================================
async function renderDashboard(){
  var prods   = await loadProductsFromSource();
  var prodsActive = prods.filter(function(p){return p.status==="active";});
  var custs   = await loadCustomersFromSource();
  var custsNorm = custs.map(normalizeCustomer);
  var ords    = await loadOrdersFromSource();
  var banners = await loadBannersFromSource();
  var reviews = await loadReviewsFromSource();
  var visits  = await loadVisitsFromSource();
  var rev     = ords.filter(function(o){return !o.usedPoints;}).reduce(function(s,o){return s+Number(o.total||0);},0);
  var todayKey = formatLocalDate(new Date());
  var todayOrders = ords.filter(function(o){
    var d = o.created_at || o.date || "";
    if(!d) return false;
    try{ return new Date(d).toISOString().slice(0,10) === todayKey; }catch(e){ return false; }
  });
  var todayVisits = visits.filter(function(v){
    var d = v.visit_date || (v.created_at ? new Date(v.created_at).toISOString().slice(0,10) : "");
    return d === todayKey;
  });

  document.getElementById("ds-prods").textContent  = prodsActive.length;
  document.getElementById("ds-custs").textContent  = custsNorm.length;
  document.getElementById("ds-orders").textContent = ords.length;
  document.getElementById("ds-orders-day").textContent = todayOrders.length;
  document.getElementById("ds-visits").textContent = todayVisits.length;
  document.getElementById("ds-reviews").textContent = reviews.length;
  document.getElementById("ds-rev").textContent    = rev;
  document.getElementById("ds-bann").textContent   = banners.filter(function(b){return b.active!==false;}).length;

  // Recent orders
  var tbody = document.getElementById("db-orders-body");
  var rec   = ords.slice().reverse().slice(0,8);
  tbody.innerHTML = rec.length ? rec.map(function(o){
    return "<tr><td><b style='color:var(--yellow)'>#"+o.id+"</b></td><td>"+o.customer+"</td><td style='max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+o.items+"</td><td>"+o.total+" HTG</td><td>"+(o.usedPoints?"<span style='color:var(--red)'>GRATIS</span>":"<span style='color:var(--green)'>+"+o.ptsEarned+" pts</span>")+"</td><td style='color:var(--gray);font-size:11px'>"+o.date+"</td><td><button type='button' class='btn-save btn-sm btn-del' data-order-id='"+o.id+"' onclick='deleteOrderById(this.dataset.orderId)'>Efase</button></td></tr>";
  }).join("") : "<tr><td colspan='7' style='text-align:center;color:var(--gray);padding:20px'>Pa gen komand</td></tr>";

  var reviewBody = document.getElementById("db-reviews-body");
  var recentReviews = reviews.slice().sort(function(a,b){return new Date(b.created_at||0)-new Date(a.created_at||0);}).slice(0,8);
  reviewBody.innerHTML = recentReviews.length ? recentReviews.map(function(r){
    var stars = "★".repeat(Math.max(1, Number(r.rating)||0)) + "☆".repeat(Math.max(0, 5 - (Number(r.rating)||0)));
    return "<tr><td style='font-weight:700'>"+r.customer_name+"</td><td style='color:var(--yellow);font-weight:800'>"+stars+"</td><td style='max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+r.review+"</td><td style='color:var(--gray);font-size:11px'>"+(r.created_at?new Date(r.created_at).toLocaleString():"-")+"</td><td><span class='"+(r.approved?"badge-on":"badge-off")+"'>"+(r.approved?"Apwouve":"Pandan")+"</span></td></tr>";
  }).join("") : "<tr><td colspan='5' style='text-align:center;color:var(--gray);padding:20px'>Pa gen avis</td></tr>";

  // Top clients
  var topBody = document.getElementById("db-top-body");
  var sorted  = custsNorm.slice().sort(function(a,b){return b.points-a.points;}).slice(0,5);
  topBody.innerHTML = sorted.length ? sorted.map(function(c,i){
    return "<tr><td><b style='color:var(--yellow)'>"+(i+1)+"</b></td><td>"+c.name+"</td><td><b style='color:var(--yellow)'>"+c.points+"</b></td><td>"+(c.totalOrders||0)+"</td></tr>";
  }).join("") : "<tr><td colspan='4' style='text-align:center;color:var(--gray);padding:20px'>Pa gen kliyan</td></tr>";
}

// ============================================================
//  BANNERS / ANNONCES
// ============================================================
var bnType = "text";
var bnImgData = null;

function setBnType(t){
  bnType = t;
  document.getElementById("bnt-text").classList.toggle("on", t==="text");
  document.getElementById("bnt-image").classList.toggle("on", t==="image");
  document.getElementById("bn-text-fields").style.display  = t==="text"  ? "block" : "none";
  document.getElementById("bn-image-fields").style.display = t==="image" ? "block" : "none";
  bnPreview();
}

function handleBnImg(input){
  var file = input.files[0];
  if(!file) return;
  if(file.size > 3*1024*1024){toast("Imaj twò gwo! Maks 3MB","e");return;}
  var reader = new FileReader();
  reader.onload = function(e){
    bnImgData = e.target.result;
    document.getElementById("bn-img-preview-wrap").innerHTML =
      '<img src="'+bnImgData+'" style="max-height:130px;border-radius:8px;object-fit:cover;width:100%"><p style="color:var(--gray);font-size:11px;margin-top:6px">✅ '+file.name+'</p>';
    bnPreview();
  };
  reader.readAsDataURL(file);
}

function bnPreview(){
  var box = document.getElementById("bn-live-preview");
  if(bnType === "image"){
    if(!bnImgData){box.innerHTML='<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:13px;padding:16px">Upload yon imaj pou wè aperçu...</div>';return;}
    var t = document.getElementById("bn-img-title").value;
    var b = document.getElementById("bn-img-body").value;
    box.innerHTML = '<div style="position:relative;border-radius:10px;overflow:hidden">'
      +'<img src="'+bnImgData+'" style="width:100%;max-height:160px;object-fit:cover;display:block">'
      +((t||b)?'<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.65));padding:14px">'
        +(t?'<div style="color:#fff;font-weight:900;font-size:15px">'+t+"</div>":"")
        +(b?'<div style="color:rgba(255,255,255,0.8);font-size:12px">'+b+"</div>":"")
      +"</div>":"")+"</div>";
  } else {
    var bg = document.getElementById("bn-bg").value || "#0D2B5E";
    var cl = document.getElementById("bn-color").value || "#ffffff";
    var ic = document.getElementById("bn-icon").value;
    var ti = document.getElementById("bn-title").value || "<em style='opacity:0.4'>Tit annonce...</em>";
    var bo = document.getElementById("bn-body").value;
    box.innerHTML = '<div style="background:'+bg+';border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px">'
      +(ic?'<span style="font-size:22px">'+ic+"</span>":"")
      +'<div><div style="color:'+cl+';font-weight:900;font-size:14px">'+ti+"</div>"
      +(bo?'<div style="color:'+cl+';font-size:12px;opacity:0.85;margin-top:2px">'+bo+"</div>":"")
      +"</div></div>";
  }
}

async function saveBanner(){
  var eid   = document.getElementById("bn-edit-id").value;
  var title = bnType==="text" ? document.getElementById("bn-title").value.trim()
                               : document.getElementById("bn-img-title").value.trim();
  var body  = bnType==="text" ? document.getElementById("bn-body").value.trim()
                               : document.getElementById("bn-img-body").value.trim();

  if(bnType==="text" && !title){toast("Tit obligatwa!","e");return;}
  if(bnType==="image" && !bnImgData && !eid){toast("Chwazi yon imaj!","e");return;}

  var banners = lsGet("banners",[]);
  var existImg = eid ? ((banners.find(function(x){return String(x.id)===String(eid);})||{}).img||"") : "";

  var b = {
    id      : eid || ("b"+Date.now()),
    type    : bnType,
    title   : title,
    body    : body,
    icon    : document.getElementById("bn-icon").value || "",
    bg      : document.getElementById("bn-bg").value   || "#0D2B5E",
    color   : document.getElementById("bn-color").value|| "#ffffff",
    img     : bnType==="image" ? (bnImgData || existImg) : "",
    link    : document.getElementById("bn-link").value.trim(),
    active  : document.getElementById("bn-status").value === "true",
    created : eid ? ((banners.find(function(x){return String(x.id)===String(eid);})||{}).created||new Date().toLocaleDateString()) : new Date().toLocaleDateString()
  };

  try{
    if(isSupabaseConfigured){
      var saved = await ADB.saveBanner(b);
      if(saved){
        b = normalizeBanner(saved);
      }
    }
    banners = lsGet("banners",[]);
    if(eid){
      var idx = banners.findIndex(function(x){return String(x.id)===String(eid);});
      if(idx>=0) banners[idx]=b; else banners.unshift(b);
    } else {
      banners.unshift(b);
    }
    lsSet("banners", banners);
    await renderBanners();
    resetBnForm();
    toast("✅ Annonce sove! Afiche sou sit la.","s");
  }catch(e){
    console.warn('Banner save failed', e);
    toast("⚠️ Erè sove annonce","e");
  }
}

async function renderBanners(){
  var banners = await loadBannersFromSource();
  banners = banners.map(normalizeBanner);
  document.getElementById("bn-count").textContent = banners.length;
  var list = document.getElementById("bn-list");
  if(!banners.length){
    list.innerHTML = '<div style="text-align:center;padding:36px;color:var(--gray)"><div style="font-size:44px;margin-bottom:10px">📢</div><p>Pa gen annonce toujou. Kreye premye a!</p></div>';
    return;
  }
  var html = "";
  banners.forEach(function(b){
    var thumb = (b.type==="image" && b.img)
      ? '<img src="'+b.img+'" style="width:100%;height:100%;object-fit:cover">'
      : '<div style="width:100%;height:100%;background:'+(b.bg||"#0D2B5E")+';display:flex;align-items:center;justify-content:center;font-size:'+(b.icon?"22":"13")+'px;color:'+(b.color||"#fff")+'">'+(b.icon||"📢")+"</div>";
    var isOn = b.active !== false;
    html += '<div class="bn-item">';
    html += '<div class="bn-thumb">'+thumb+"</div>";
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(b.title||(b.type==="image"?"(Bannè Imaj)":"Sans titre"))+"</div>";
    if(b.body) html += '<div style="font-size:12px;color:var(--gray);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">'+b.body+"</div>";
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-top:5px">'+(b.type==="image"?"🖼️ Imaj":"📝 Tèks")+" · "+(b.created||"-")+"</div>";
    html += "</div>";
    html += '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">';
    html += '<button type="button" class="'+(isOn?"btn-toggle-on":"btn-toggle-off")+'" data-id="'+b.id+'" data-action="toggle">'+(isOn?"✅ Aktif":"👁️ Kache")+"</button>";
    html += '<button type="button" class="btn-save btn-sm btn-edit" data-id="'+b.id+'" data-action="edit">✏️ Edit</button>';
    html += '<button type="button" class="btn-save btn-sm btn-del" data-id="'+b.id+'" data-action="delete">🗑</button>';
    html += "</div></div>";
  });
  list.innerHTML = html;
}

document.body.addEventListener("click", function(e){
  if(!e.target.closest("#bn-list button[data-id]")) return;
  handleBnClick(e);
});

function handleBnClick(e){
  var btn = e.target.closest("#bn-list button[data-id]");
  if(!btn) return;
  var id = btn.dataset.id;
  var action = btn.dataset.action;
  if(action === "edit") return editBanner(id);
  if(action === "delete") return deleteBanner(id);
  if(action === "toggle") return toggleBanner(id);
}

function editBanner(id){
  var banners = lsGet("banners",[]);
  var b = banners.find(function(x){return String(x.id)===String(id);});
  if(!b) return;
  document.getElementById("bn-edit-id").value = b.id;
  document.getElementById("bn-form-title").textContent = "✏️ Modifye Annonce";
  setBnType(b.type||"text");
  if(b.type==="text"){
    document.getElementById("bn-title").value = b.title||"";
    document.getElementById("bn-icon").value  = b.icon||"";
    document.getElementById("bn-body").value  = b.body||"";
    document.getElementById("bn-bg").value    = b.bg||"#0D2B5E";
    document.getElementById("bn-color").value = b.color||"#ffffff";
  } else {
    document.getElementById("bn-img-title").value = b.title||"";
    document.getElementById("bn-img-body").value  = b.body||"";
    if(b.img){
      bnImgData = b.img;
      document.getElementById("bn-img-preview-wrap").innerHTML =
        '<img src="'+b.img+'" style="max-height:120px;border-radius:8px;object-fit:cover;width:100%"><p style="color:var(--gray);font-size:11px;margin-top:6px">✅ Imaj aktyèl</p>';
    }
  }
  document.getElementById("bn-link").value   = b.link||"";
  document.getElementById("bn-status").value = b.active!==false?"true":"false";
  bnPreview();
  document.getElementById("page-annonces").scrollTop = 0;
}

async function toggleBanner(id){
  var banners = lsGet("banners",[]);
  var b = banners.find(function(x){return String(x.id)===String(id);});
  if(!b) return;
  b.active = !b.active;
  try{
    if(isSupabaseConfigured){
      await ADB.toggleBanner(id, b.active);
    }
    lsSet("banners", banners);
    await renderBanners();
    toast(b.active?"✅ Annonce aktive!":"Annonce kache","s");
  }catch(e){
    console.warn('Banner toggle failed', e);
    toast("⚠️ Erè chanje eta annonce","e");
  }
}

async function deleteBanner(id){
  if(!confirm("Efase annonce sa?")) return;
  try{
    if(isSupabaseConfigured){
      await ADB.deleteBanner(id);
    }
    var banners = lsGet("banners",[]);
    lsSet("banners", banners.filter(function(x){return String(x.id)!==String(id);}));
    await renderBanners();
    toast("Annonce efase","e");
  }catch(e){
    console.warn('Banner delete failed', e);
    toast("⚠️ Erè efase annonce","e");
  }
}

function resetBnForm(){
  document.getElementById("bn-edit-id").value     = "";
  document.getElementById("bn-title").value        = "";
  document.getElementById("bn-icon").value         = "";
  document.getElementById("bn-body").value         = "";
  document.getElementById("bn-link").value         = "";
  document.getElementById("bn-img-title").value    = "";
  document.getElementById("bn-img-body").value     = "";
  document.getElementById("bn-bg").value           = "#0D2B5E";
  document.getElementById("bn-color").value        = "#ffffff";
  document.getElementById("bn-status").value       = "true";
  document.getElementById("bn-img-preview-wrap").innerHTML =
    '<div style="font-size:40px;margin-bottom:8px">🖼️</div><p style="color:var(--gray);font-size:14px;font-weight:700">Klike pou chwazi yon imaj</p>';
  document.getElementById("bn-live-preview").innerHTML =
    '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:13px;padding:10px">Ranpli fòm nan pou wè aperçu...</div>';
  bnImgData = null;
  bnType    = "text";
  setBnType("text");
  document.getElementById("bn-form-title").textContent = "➕ Kreye Nouvo Annonce";
}

var adImgData = null;

function updateAdSaveState(){
  var btn = document.getElementById("save-ad-btn");
  var hint = document.getElementById("ad-save-hint");
  if(!btn || !hint) return;
  var hasImage = !!adImgData;
  var eid = document.getElementById("ad-edit-id").value;
  if(!hasImage && eid){
    var ads = window._ktAds || [];
    var existing = ads.find(function(x){return String(x.id)===String(eid);});
    hasImage = !!(existing && existing.img);
  }
  btn.disabled = !hasImage;
  hint.textContent = hasImage ? "Imaj pare. Ou ka sove kounye a." : "Upload foto a avan ou sove."
}

async function handleAdImg(input){
  var file = input.files[0];
  if(!file) return;
  if(file.size > 3*1024*1024){toast("Imaj twò gwo! Maks 3MB","e");return;}
  try{
    document.getElementById("ad-img-info").textContent = "⏳ Upload imaj...";
    adImgData = await uploadProductImage(file);
    document.getElementById("ad-img-info").textContent = "✅ "+file.name+" (ImageKit)";
    document.getElementById("ad-img-preview-wrap").innerHTML =
      '<img src="'+adImgData+'" style="max-height:130px;border-radius:8px;object-fit:cover;width:100%"><p style="color:var(--gray);font-size:11px;margin-top:6px">✅ '+file.name+'</p>';
    document.getElementById("ad-save-hint").textContent = "Imaj telechaje. Ou ka sove kounye a.";
    updateAdSaveState();
    adPreview();
  }catch(err){
    console.error('ImageKit upload error', err);
    adImgData = null;
    var msg = err && err.message ? err.message : String(err);
    document.getElementById("ad-img-info").textContent = "❌ Upload echwe: " + msg;
    toast("Upload imaj echwe: " + msg,"e");
  }
}

function adPreview(){
  var box = document.getElementById("ad-live-preview");
  var title = document.getElementById("ad-title").value.trim() || "Tit reklam lokal...";
  var subtitle = document.getElementById("ad-subtitle").value.trim();
  var body = document.getElementById("ad-body").value.trim();
  var button = document.getElementById("ad-button").value.trim() || "Wè plis";
  var img = adImgData;
  if(img){
    box.innerHTML = '<div style="position:relative;border-radius:18px;overflow:hidden;background:#111;color:#fff">'
      +'<img src="'+img+'" style="width:100%;height:220px;object-fit:cover;display:block">'
      +'<div style="position:absolute;left:0;right:0;bottom:0;padding:18px;backdrop-filter:blur(10px);background:linear-gradient(transparent,rgba(0,0,0,0.7));">'
      +'<div style="font-size:18px;font-weight:900;margin-bottom:6px">'+title+'</div>'
      +(subtitle?'<div style="font-size:13px;color:rgba(255,255,255,0.85);margin-bottom:8px">'+subtitle+'</div>':'')
      +(body?'<div style="font-size:12px;color:rgba(255,255,255,0.8);line-height:1.4">'+body+'</div>':'')
      +'<div style="margin-top:12px;padding:10px 16px;background:rgba(245,197,24,0.95);color:#0d2b5e;display:inline-block;border-radius:999px;font-weight:800;">'+button+'</div>'
      +'</div></div>';
  } else {
    box.innerHTML = '<div style="border-radius:18px;background:#0D2B5E;padding:22px;color:#fff;display:flex;flex-direction:column;gap:10px;">'
      +'<div style="font-size:20px;font-weight:900">'+title+'</div>'
      +(subtitle?'<div style="font-size:14px;color:rgba(255,255,255,0.85)">'+subtitle+'</div>':'')
      +(body?'<div style="font-size:13px;color:rgba(255,255,255,0.75);line-height:1.5">'+body+'</div>':'')
      +'<div style="margin-top:10px;padding:10px 16px;background:#fff;color:#0d2b5e;border-radius:999px;font-weight:800;width:max-content;">'+button+'</div>'
      +'</div>';
  }
}

async function saveAd(){
  var eid = document.getElementById("ad-edit-id").value;
  var title = document.getElementById("ad-title").value.trim();
  var subtitle = document.getElementById("ad-subtitle").value.trim();
  var body = document.getElementById("ad-body").value.trim();
  var btnText = document.getElementById("ad-button").value.trim() || "Wè plis";
  var link = document.getElementById("ad-link").value.trim();
  var active = document.getElementById("ad-status").value === "true";
  console.log('saveAd clicked', { title, subtitle, body, btnText, link, active, adImgData, isSupabaseConfigured });
  var ads = lsGet("local_ads", []);
  var existing = eid ? ads.find(function(x){return String(x.id)===String(eid);}) : null;
  var img = adImgData || (existing ? existing.img : "");
  if(!title){
    toast("Tit obligatwa pou reklam la!","e");
    return;
  }
  if(!img){
    document.getElementById("ad-img-info").textContent = "❌ Upload yon imaj obligatwa pou sove reklam la.";
    toast("Upload yon imaj pou reklam la.","e");
    return;
  }
  var ad = {
    id: eid || ("ad"+Date.now()),
    title: title,
    subtitle: subtitle,
    body: body,
    btnText: btnText,
    link: link,
    img: img,
    active: active,
    position: existing ? existing.position : 0,
    created_at: existing ? existing.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  try{
    var saved = ad;
    if(isSupabaseConfigured){
      try {
        saved = await ADB.saveAd(ad);
        if(saved){ saved = normalizeAd(saved); }
      } catch(e){
        console.warn('Supabase save failed, using localStorage:', e);
      }
    }
    // Always save to localStorage as backup
    ads = lsGet("local_ads", []);
    if(eid){
      var idx = ads.findIndex(function(x){return String(x.id)===String(eid);});
      if(idx >= 0) ads[idx] = saved; else ads.unshift(saved);
    } else {
      ads.unshift(saved);
    }
    lsSet("local_ads", ads);
    await renderAds();
    resetAdForm();
    toast("✅ Publicité lokal sove!","s");
  }catch(e){
    console.warn('Ad save failed', e);
    toast("⚠️ Erè sove publicite","e");
  }
}

async function renderAds(){
  var ads = await loadAdsFromSource();
  ads = ads.map(normalizeAd);
  window._ktAds = ads;
  document.getElementById("ad-count").textContent = ads.length;
  var list = document.getElementById("ad-list");
  if(!ads.length){
    list.innerHTML = '<div style="text-align:center;padding:36px;color:var(--gray);"><div style="font-size:44px;margin-bottom:10px;">🛍️</div><p>Pa gen publicite toujou. Kreye premye a!</p></div>';
    return;
  }
  var html = "";
  ads.forEach(function(ad){
    html += '<div class="bn-item">';
    html += '<div class="bn-thumb">'+(ad.img?'<img src="'+ad.img+'" style="width:100%;height:100%;object-fit:cover">':'<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:20px;">🛍️</div>')+'</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+ad.title+'</div>';
    if(ad.subtitle) html += '<div style="font-size:12px;color:var(--gray);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">'+ad.subtitle+'</div>';
    if(ad.body) html += '<div style="font-size:11px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:4px">'+ad.body+'</div>';
    html += '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:6px">'+(ad.active?"✅ Aktif":"👁️ Kache")+'</div>';
    html += '</div>';
    html += '<div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end">';
    html += '<button type="button" class="btn-save btn-sm btn-edit" data-id="'+ad.id+'" data-action="edit">✏️ Edit</button>';
    html += '<button type="button" class="btn-save btn-sm btn-del" data-id="'+ad.id+'" data-action="delete">🗑</button>';
    html += '<button type="button" class="'+(ad.active?"btn-toggle-on":"btn-toggle-off")+'" data-id="'+ad.id+'" data-action="toggle">'+(ad.active?"✅ Aktif":"👁️ Kache")+'</button>';
    html += '</div></div>';
  });
  list.innerHTML = html;
}

document.body.addEventListener("click", function(e){
  var btn = e.target.closest("#ad-list button[data-id]");
  if(!btn) return;
  var id = btn.dataset.id;
  var action = btn.dataset.action;
  if(action === "edit") return editAd(id);
  if(action === "delete") return deleteAd(id);
  if(action === "toggle") return toggleAd(id);
});

function editAd(id){
  var ads = window._ktAds || [];
  var ad = ads.find(function(x){return String(x.id)===String(id);});
  if(!ad) return;
  document.getElementById("ad-edit-id").value = ad.id;
  document.getElementById("ad-form-title").textContent = "✏️ Modifye Publicité";
  document.getElementById("ad-title").value = ad.title || "";
  document.getElementById("ad-subtitle").value = ad.subtitle || "";
  document.getElementById("ad-body").value = ad.body || "";
  document.getElementById("ad-button").value = ad.btnText || "";
  document.getElementById("ad-link").value = ad.link || "";
  document.getElementById("ad-status").value = ad.active!==false?"true":"false";
  if(ad.img){
    adImgData = ad.img;
    document.getElementById("ad-img-preview-wrap").innerHTML =
      '<img src="'+ad.img+'" style="max-height:130px;border-radius:8px;object-fit:cover;width:100%"><p style="color:var(--gray);font-size:11px;margin-top:6px">✅ Imaj aktyèl</p>';
    document.getElementById("ad-img-info").textContent = "✅ Imaj chaje";
    document.getElementById("ad-save-hint").textContent = "Imaj la pare. Ou ka sove kounye a.";
  }
  adPreview();
  updateAdSaveState();
  document.getElementById("page-ads").scrollTop = 0;
}

async function toggleAd(id){
  var ads = lsGet("local_ads", []);
  var ad = ads.find(function(x){return String(x.id)===String(id);});
  if(!ad) return;
  var newActive = !ad.active;
  try{
    if(isSupabaseConfigured){
      try {
        await ADB.toggleAd(id, newActive);
      } catch(e) {
        console.warn('Supabase toggle failed, using localStorage:', e);
      }
    }
    // Update localStorage
    ads = lsGet("local_ads", []);
    var idx = ads.findIndex(function(x){return String(x.id)===String(id);});
    if(idx >= 0) {
      ads[idx].active = newActive;
      lsSet("local_ads", ads);
    }
    await renderAds();
    toast(newActive?"✅ Publicité aktive!":"Publicité kache","s");
  }catch(e){
    console.warn('Ad toggle failed', e);
    toast("⚠️ Erè chanje eta publicité","e");
  }
}

async function deleteAd(id){
  if(!confirm("Efase publicité sa?")) return;
  try{
    if(isSupabaseConfigured){
      try {
        await ADB.deleteAd(id);
      } catch(e) {
        console.warn('Supabase delete failed, using localStorage:', e);
      }
    }
    // Delete from localStorage
    var ads = lsGet("local_ads", []);
    ads = ads.filter(function(x){return String(x.id)!==String(id);});
    lsSet("local_ads", ads);
    await renderAds();
    toast("Publicité efase","e");
  }catch(e){
    console.warn('Ad delete failed', e);
    toast("⚠️ Erè efase publicité","e");
  }
}

function resetAdForm(){
  document.getElementById("ad-edit-id").value = "";
  document.getElementById("ad-title").value = "";
  document.getElementById("ad-subtitle").value = "";
  document.getElementById("ad-body").value = "";
  document.getElementById("ad-button").value = "";
  document.getElementById("ad-link").value = "";
  document.getElementById("ad-status").value = "true";
  document.getElementById("ad-img-preview-wrap").innerHTML =
    '<div style="font-size:40px;margin-bottom:8px">🖼️</div><p style="color:var(--gray);font-size:14px;font-weight:700">Klike pou chwazi yon imaj</p>';
  document.getElementById("ad-img-info").textContent = "";
  document.getElementById("ad-live-preview").innerHTML =
    '<div style="text-align:center;color:rgba(255,255,255,0.25);font-size:13px;padding:10px">Ranpli fòm nan pou wè aperçu...</div>';
  document.getElementById("ad-save-hint").textContent = "Upload foto a avan ou sove.";
  adImgData = null;
  document.getElementById("ad-form-title").textContent = "➕ Kreye Nouvo Publicité";
  updateAdSaveState();
}

// ============================================================
//  PRODUCTS
// ============================================================
var pImgData = null;

async function uploadProductImage(file){
  if(!IMAGEKIT_PUBLIC_KEY || IMAGEKIT_PUBLIC_KEY === 'YOUR_IMAGEKIT_PUBLIC_KEY'){
    throw new Error('ImageKit public key not configured');
  }

  var authData = null;
  var authUrls = getImageKitAuthUrls();
  var authResponse = null;
  var lastError = null;

  for(var i=0;i<authUrls.length;i++){
    var authUrl = authUrls[i];
    try{
      authResponse = await fetch(authUrl, { method:'GET' });
    }catch(err){
      lastError = err;
      authResponse = null;
    }
    if(authResponse && authResponse.ok){
      authData = await authResponse.json();
      break;
    }
    if(authResponse && authResponse.status !== 404){
      var authText = await authResponse.text();
      throw new Error('Failed to fetch ImageKit auth (' + authResponse.status + '): ' + authText);
    }
  }

  if(!authData){
    var info = lastError ? lastError.message : 'No response';
    throw new Error('ImageKit auth unavailable. Tried: ' + authUrls.join(' or ') + '. ' + info + '. Use Netlify dev or deploy to Netlify so functions are available.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('folder', '/kiktopfresco/products');
  formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
  formData.append('token', authData.token);
  formData.append('signature', authData.signature);
  formData.append('expire', String(authData.expire));

  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData
  });

  if(!uploadResponse.ok){
    const errorText = await uploadResponse.text();
    throw new Error(errorText || 'ImageKit upload failed');
  }

  const uploaded = await uploadResponse.json();
  var imageUrl = uploaded.url || '';
  if(!imageUrl && uploaded.filePath){
    var path = uploaded.filePath;
    if(!path.startsWith('/')) path = '/'+path;
    imageUrl = IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '') + path;
  }
  if(!imageUrl){
    throw new Error('ImageKit upload returned no URL');
  }
  return imageUrl;
}

async function handleProdImg(input){
  var file = input.files[0];
  if(!file) return;
  if(file.size > 3*1024*1024){toast("Imaj twò gwo! Maks 3MB","e");return;}
  try{
    document.getElementById("p-img-info").textContent = "⏳ Upload imaj...";
    pImgData = await uploadProductImage(file);
    document.getElementById("p-img-url").value = "";
    document.getElementById("p-img-info").textContent = "✅ "+file.name+" (ImageKit)";
  }catch(err){
    console.error('ImageKit upload error', err);
    pImgData = null;
    document.getElementById("p-img-info").textContent = "❌ Upload echwe";
    toast("Upload imaj echwe","e");
  }
}

async function renderProducts(){
  var prods = await loadProductsFromSource();
  prods = prods.map(normalizeProduct);
  document.getElementById("prod-count").textContent = prods.length;
  var tbody = document.getElementById("prod-tbody");
  if(!prods.length){
    tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;color:var(--gray);padding:20px'>Pa gen pwodui. Ajoute premye a!</td></tr>";
    return;
  }
  tbody.innerHTML = prods.map(function(p){
    var pid = String(p.id);
    var name = p.fr||p.name_fr||p.name||"?";
    var tab  = p.tab||"-";
    var cat  = p.cat||p.category||"-";
    var imgHtml = p.img ? '<img src="'+p.img+'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:8px">' : '';
    return "<tr>"
      +"<td style='font-size:24px'>"+(p.em||p.emoji||"🍽️")+"</td>"
      +"<td style='font-weight:700'>"+imgHtml+name+"</td>"
      +"<td style='color:var(--gray)'>"+tab+"</td>"
      +"<td>"+cat+"</td>"
      +"<td style='color:var(--yellow);font-weight:800'>"+p.price+" HTG</td>"
      +"<td><span class='"+(p.status==="active"?"badge-on":"badge-off")+"'>"+(p.status==="active"?"Aktif":"Inaktif")+"</span></td>"
      +"<td style='display:flex;gap:6px'>"
        +"<button type='button' class='btn-save btn-sm btn-edit' data-id='"+pid+"' onclick='editProd(this.dataset.id)'>✏️</button>"
        +"<button type='button' class='btn-save btn-sm btn-del' data-id='"+pid+"' onclick='deleteProd(this.dataset.id)'>🗑</button>"
      +"</td></tr>";
  }).join("");

  var sel = document.getElementById("sp-prod");
  if(sel){
    var cur = sel.value;
    sel.innerHTML = '<option value="">-- Chwazi yon pwodui --</option>';
    prods.filter(function(p){return p.status==="active";}).forEach(function(p){
      var name = p.fr||p.name_fr||p.name||"?";
      var em   = p.em||p.emoji||"";
      var opt  = document.createElement("option");
      opt.value = p.id;
      opt.textContent = em+" "+name+" ("+p.price+" HTG)";
      if(String(p.id)===String(cur)) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

async function saveProd(){
  var prods = lsGet("products",[]);
  var eid   = document.getElementById("p-edit-id").value;
  var nameFr = document.getElementById("p-name-fr").value.trim();
  var nameKr = document.getElementById("p-name-kr").value.trim();
  var price  = parseInt(document.getElementById("p-price").value);

  if(!nameFr){toast("Non Français obligatwa!","e");return;}
  if(!price || price<=0){toast("Pri obligatwa!","e");return;}

  var imgVal = pImgData || document.getElementById("p-img-url").value.trim();

  var p = {
    id      : eid ? eid : String(Date.now()),
    fr      : nameFr,
    name_fr : nameFr,
    kr      : nameKr||nameFr,
    name_kr : nameKr||nameFr,
    name    : nameFr,
    tab     : document.getElementById("p-tab").value,
    cat     : document.getElementById("p-cat").value,
    price   : price,
    em      : document.getElementById("p-emoji").value.trim() || "🍽️",
    emoji   : document.getElementById("p-emoji").value.trim() || "🍽️",
    df      : document.getElementById("p-desc-fr").value.trim(),
    desc_fr : document.getElementById("p-desc-fr").value.trim(),
    dk      : document.getElementById("p-desc-kr").value.trim(),
    desc_kr : document.getElementById("p-desc-kr").value.trim(),
    img     : imgVal,
    badge   : document.getElementById("p-badge").value.trim(),
    status  : document.getElementById("p-status").value,
    alc     : document.getElementById("p-alc").value === "true"
  };

  try{
    var remotePayload = Object.assign({}, p);
    if(!eid){
      delete remotePayload.id;
    }
    if(isSupabaseConfigured){
      var savedRow = await ADB.saveProduct(remotePayload);
      if(savedRow){
        p = normalizeProduct(savedRow);
      }
    }
    prods = lsGet("products",[]);
    if(eid){
      var idx = prods.findIndex(function(x){return String(x.id)===String(eid);});
      if(idx>=0) prods[idx] = p;
      else prods.push(p);
      toast("✅ Pwodui modifye: "+nameFr,"s");
    } else {
      prods.push(p);
      toast("✅ Pwodui ajoute: "+nameFr,"s");
    }
    lsSet("products", prods);
    resetProdForm();
    await renderProducts();
  }catch(e){
    console.warn('Product save failed', e);
    toast("⚠️ Erè sove pwodui", "e");
  }
}

function editProd(id){
  var prods = lsGet("products",[]);
  // Use == for flexible type comparison
  var p = prods.find(function(x){return String(x.id)===String(id);});
  if(!p){toast("Pwodui pa jwenn!","e");return;}

  // Scroll to form first
  document.getElementById("prod-form-card").scrollIntoView({behavior:"smooth",block:"start"});

  // Fill all fields
  document.getElementById("p-edit-id").value    = p.id;
  document.getElementById("p-name-fr").value    = p.fr||p.name_fr||p.name||"";
  document.getElementById("p-name-kr").value    = p.kr||p.name_kr||"";
  document.getElementById("p-tab").value        = p.tab||"manger";
  document.getElementById("p-cat").value        = p.cat||"Pate";
  document.getElementById("p-price").value      = p.price||0;
  document.getElementById("p-emoji").value      = p.em||p.emoji||"";
  document.getElementById("p-desc-fr").value    = p.df||p.desc_fr||"";
  document.getElementById("p-desc-kr").value    = p.dk||p.desc_kr||"";
  document.getElementById("p-img-url").value    = (p.img&&!p.img.startsWith("data:"))?p.img:"";
  document.getElementById("p-badge").value      = p.badge||"";
  document.getElementById("p-status").value     = p.status||"active";
  document.getElementById("p-alc").value        = p.alc?"true":"false";
  document.getElementById("prod-form-title").textContent = "✏️ Modifye: "+(p.fr||p.name_fr||p.name||"");

  // Handle base64 image
  if(p.img && p.img.startsWith("data:")){
    pImgData = p.img;
    document.getElementById("p-img-info").textContent = "✅ Imaj aktyèl";
  } else {
    pImgData = null;
    document.getElementById("p-img-info").textContent = "";
  }
}

async function deleteProd(id){
  if(!confirm("Efase pwodui sa?")) return;
  try{
    if(isSupabaseConfigured){
      await ADB.deleteProduct(id);
    }
    var prods = lsGet("products",[]);
    lsSet("products", prods.filter(function(x){return String(x.id)!==String(id);}));
    await renderProducts();
    toast("Pwodui efase","e");
  }catch(e){
    console.warn('Product delete failed', e);
    toast("⚠️ Erè efase pwodui","e");
  }
}

function resetProdForm(){
  document.getElementById("p-edit-id").value    = "";
  document.getElementById("p-name-fr").value    = "";
  document.getElementById("p-name-kr").value    = "";
  document.getElementById("p-desc-fr").value    = "";
  document.getElementById("p-desc-kr").value    = "";
  document.getElementById("p-price").value      = "";
  document.getElementById("p-emoji").value      = "";
  document.getElementById("p-img-url").value    = "";
  document.getElementById("p-badge").value      = "";
  document.getElementById("p-tab").value        = "manger";
  document.getElementById("p-cat").value        = "Pate";
  document.getElementById("p-status").value     = "active";
  document.getElementById("p-alc").value        = "false";
  document.getElementById("prod-form-title").textContent = "➕ Ajoute Nouvo Pwodui";
  document.getElementById("p-img-info").textContent = "";
  pImgData = null;
}

// ============================================================
//  SPECIAL DIMANCHE
// ============================================================
async function renderSpecialPage(){
  renderProducts();
  try{
    var sp = await ADB.getSunday();
    if(sp.productId) document.getElementById("sp-prod").value = sp.productId;
    if(sp.price)     document.getElementById("sp-price").value = sp.price;
    if(sp.message)   document.getElementById("sp-msg").value = sp.message;
    spImgData = sp.image || "";
  }catch(e){
    console.warn('Failed to load Sunday special', e);
  }
  updateSpPreview();
  document.getElementById("sp-prod").onchange  = updateSpPreview;
  document.getElementById("sp-price").oninput  = updateSpPreview;
  document.getElementById("sp-msg").oninput    = updateSpPreview;
}

function updateSpPreview(){
  var pid   = document.getElementById("sp-prod").value;
  var price = document.getElementById("sp-price").value;
  var msg   = document.getElementById("sp-msg").value;
  var prods = lsGet("products",[]);
  var p     = prods.find(function(x){return String(x.id)===String(pid);});
  document.getElementById("sp-pv-em").textContent  = p?(p.em||p.emoji||"🌟"):"🌟";
  document.getElementById("sp-pv-nm").textContent  = p?(p.fr||p.name_fr||p.name||"?"):"Pwodui Espesyal";
  document.getElementById("sp-pv-ms").textContent  = msg||"Mesaj espesyal...";
  document.getElementById("sp-pv-old").textContent = p?p.price+" HTG":"--";
  document.getElementById("sp-pv-new").textContent = price?price+" HTG":"-- HTG";
  if(spImgData){
    document.getElementById("sp-pv-img").innerHTML = '<img src="'+spImgData+'" style="width:100%;height:auto;border-radius:12px;">';
  } else if(p && p.img){
    document.getElementById("sp-pv-img").innerHTML = '<img src="'+p.img+'" style="width:100%;height:auto;border-radius:12px;">';
  } else {
    document.getElementById("sp-pv-img").innerHTML = '';
  }
}

async function saveSpecial(){
  var pid   = document.getElementById("sp-prod").value;
  var price = parseInt(document.getElementById("sp-price").value);
  var msg   = document.getElementById("sp-msg").value.trim();
  var img   = spImgData || "";
  if(!pid||!price){toast("Chwazi pwodui ak pri!","e");return;}
  try{
    if(typeof ADB !== 'undefined' && typeof ADB.saveSunday === 'function'){
      await ADB.saveSunday(pid, price, msg, img);
    }
  }catch(e){
    console.warn('Failed to sync Sunday special', e);
    toast("⚠️ Erè sove espesyal","e");
    return;
  }
  toast("✅ Spécial Dimanche sove!","s");
}

var spImgData = "";
async function handleSpecialImg(input){
  var file = input.files && input.files[0];
  if(!file){ return; }
  if(file.size > 3*1024*1024){toast("Imaj twò gwo! Maks 3MB","e");return;}
  try{
    spImgData = await uploadProductImage(file);
    document.getElementById("sp-pv-img").innerHTML = '<img src="'+spImgData+'" style="width:100%;height:auto;border-radius:12px;">';
  }catch(err){
    console.error('ImageKit upload error', err);
    spImgData = "";
    toast("Upload imaj echwe","e");
  }
}

// ============================================================
//  CLIENTS
// ============================================================
function renderClients(){
  var custs = lsGet("customers",[]).map(normalizeCustomer);
  var max   = settings.maxPoints||100;
  var sorted = custs.slice().sort(function(a,b){return b.points-a.points;});

  document.getElementById("cl-total").textContent = custs.length;
  document.getElementById("cl-ready").textContent = custs.filter(function(c){return c.points>=max;}).length;
  document.getElementById("cl-avg").textContent   = custs.length ? Math.round(custs.reduce(function(s,c){return s+c.points;},0)/custs.length) : 0;

  var tbody = document.getElementById("cl-tbody");
  tbody.innerHTML = sorted.length ? sorted.map(function(c,i){
    var pct  = Math.min(100, c.points/max*100);
    var col  = c.points>=max?"var(--green)":"var(--yellow)";
    var phoneB64 = btoa(unescape(encodeURIComponent(c.phone)));
    return "<tr data-customer-id='"+(c.id||"")+"'>"
      +"<td><b style='color:var(--yellow)'>"+(i+1)+"</b></td>"
      +"<td style='font-weight:700'>"+c.name+"</td>"
      +"<td style='color:var(--gray)'>"+c.phone+"</td>"
      +"<td><div style='display:flex;flex-direction:column;gap:6px'>"
        +"<div style='display:flex;align-items:center;gap:8px'>"
          +"<div class='pts-bar'><div class='pts-fill' style='width:"+pct+"%;background:"+col+"'></div></div>"
          +"<b style='color:"+col+"'>"+c.points+"</b>"
        +"</div>"
        +"<div style='display:flex;gap:6px;align-items:center'>"
          +"<input type='number' min='0' value='"+c.points+"' class='point-input' data-customer-id='"+(c.id||"")+"' style='width:72px;background:#09112a;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:6px;color:#fff;font-size:12px;'/>"
          +"<button type='button' class='btn-save btn-sm' onclick='saveCustomerPoints(this)'>Sere</button>"
        +"</div>"
      +"</div></td>"
      +"<td>"+(c.totalOrders||0)+"</td>"
      +"<td style='color:var(--gray);font-size:11px'>"+(c.joined||"-")+"</td>"
      +"<td><div style='display:flex;flex-wrap:wrap;gap:6px'>"
        +"<button type='button' class='btn-save btn-sm' data-phone='"+phoneB64+"' data-customer-id='"+(c.id||"")+"' onclick='resetPtsByEl(this)'>Reset Pwen</button>"
        +"<button type='button' class='btn-save btn-sm btn-del' data-phone='"+phoneB64+"' data-customer-id='"+(c.id||"")+"' onclick='resetCustomerByEl(this)'>Reset Kont</button>"
      +"</div></td>"
      +"</tr>";
  }).join("") : "<tr><td colspan='7' style='text-align:center;color:var(--gray);padding:20px'>Pa gen kliyan</td></tr>";
}

async function saveCustomerPoints(btn){
  var row = btn.closest('tr');
  var input = row.querySelector('.point-input');
  var customerId = input.getAttribute('data-customer-id');
  var newPoints = Number(input.value);
  if(Number.isNaN(newPoints) || newPoints < 0){
    toast("Antre kantite pwen valid!","e");
    return;
  }

  var custs = lsGet("customers",[]);
  var idx = custs.findIndex(function(c){return String(c.id||"") === String(customerId);});
  if(idx < 0){
    toast("Kliyan pa jwenn!","e");
    return;
  }

  custs[idx].points = Math.max(0, Math.round(newPoints));
  lsSet("customers", custs);

  if(isSupabaseConfigured && customerId){
    try{
      await ADB.updateCustomer(Number(customerId), { points: custs[idx].points, updated_at: new Date().toISOString() });
    }catch(e){
      console.warn('Failed to update customer points remotely', e);
    }
  }

  renderClients();
  renderDashboard();
  toast("Pwen mete a jou!","s");
}

function resetPtsByEl(btn){
  var b64 = btn.getAttribute("data-phone");
  var phone = decodeURIComponent(escape(atob(b64)));
  resetPts(phone);
}

function resetCustomerByEl(btn){
  var b64 = btn.getAttribute("data-phone");
  var phone = decodeURIComponent(escape(atob(b64)));
  var customerId = btn.getAttribute("data-customer-id");
  resetCustomer(phone, customerId);
}

function resetPts(phone){
  if(!confirm("Reset pwen kliyan sa?")) return;
  var custs = lsGet("customers",[]);
  var idx   = custs.findIndex(function(c){return c.phone===phone;});
  if(idx>=0){
    custs[idx].points = 0;
    if(!Array.isArray(custs[idx].history)) custs[idx].history = [];
    custs[idx].totalOrders = Number(custs[idx].totalOrders)||0;
    custs[idx].totalSpent = Number(custs[idx].totalSpent)||0;
    lsSet("customers",custs);
  }
  renderClients();
  toast("Pwen reset!","s");
}

async function resetCustomer(phone, customerId){
  if(!confirm("Rekòmanse kont sa a a zero (pwen, istorik, komand)?")) return;
  var custs = lsGet("customers",[]);
  var idx   = custs.findIndex(function(c){return c.phone===phone;});
  if(idx>=0){
    custs[idx].points = 0;
    custs[idx].history = [];
    custs[idx].totalOrders = 0;
    custs[idx].totalSpent = 0;
    lsSet("customers",custs);
  }

  var filteredOrders = lsGet("orders",[]).filter(function(order){
    if(customerId && String(order.customer_id||"") === String(customerId)) return false;
    if(phone && (String(order.phone||"") === String(phone) || String(order.customer_phone||"") === String(phone))) return false;
    return true;
  });
  lsSet("orders", filteredOrders);

  if(isSupabaseConfigured && customerId){
    try{
      await ADB.resetCustomer(Number(customerId));
    }catch(e){
      console.warn('Failed to reset customer remotely', e);
    }
  }

  renderClients();
  if(document.getElementById("ord-tbody")) renderOrders();
  renderDashboard();
  toast("Kont reset e istorik efase!","s");
}

async function deleteOrderById(id){
  if(!confirm("Efase kòmand sa?")) return;

  var ords = lsGet("orders",[]);
  var target = ords.find(function(order){return String(order.id)===String(id);});
  if(!target){
    toast("Kòmand pa jwenn!","e");
    return;
  }

  var custs = lsGet("customers",[]);
  var matchedCustomer = custs.find(function(customer){
    return String(customer.id||"") === String(target.customer_id||"") || String(customer.phone||"") === String(target.customer_phone||target.phone||"");
  });

  var updatedCustomers = custs.map(function(customer){
    if(!matchedCustomer) return customer;
    if(String(customer.id||"") !== String(matchedCustomer.id||"") && String(customer.phone||"") !== String(matchedCustomer.phone||"")) return customer;

    customer.points = Math.max(0, Number(customer.points||0) - Number(target.ptsEarned||0));
    customer.totalOrders = Math.max(0, Number(customer.totalOrders||0) - 1);
    customer.totalSpent = Math.max(0, Number(customer.totalSpent||0) - Number(target.total||0));
    if(!Array.isArray(customer.history)) customer.history = [];
    customer.history = customer.history.filter(function(item){
      if(typeof item === 'object' && item){
        return String(item.orderId||item.id||"") !== String(target.id);
      }
      return true;
    });
    return customer;
  });

  var remainingOrders = ords.filter(function(order){return String(order.id)!==String(id);});
  lsSet("orders", remainingOrders);
  lsSet("customers", updatedCustomers);

  if(isSupabaseConfigured){
    try{
      await ADB.deleteOrder(id);
      if(matchedCustomer && matchedCustomer.id){
        await ADB.updateCustomer(Number(matchedCustomer.id), {
          points: Number(updatedCustomers.find(function(customer){return String(customer.id||"")===String(matchedCustomer.id||"");}).points||0),
          orders_count: Math.max(0, Number(updatedCustomers.find(function(customer){return String(customer.id||"")===String(matchedCustomer.id||"");}).totalOrders||0)),
          total_spent: Math.max(0, Number(updatedCustomers.find(function(customer){return String(customer.id||"")===String(matchedCustomer.id||"");}).totalSpent||0)),
          history: updatedCustomers.find(function(customer){return String(customer.id||"")===String(matchedCustomer.id||"");}).history,
          updated_at: new Date().toISOString()
        });
      }
    }catch(e){
      console.warn('Failed to sync order deletion remotely', e);
    }
  }

  renderOrders();
  renderDashboard();
  renderClients();
  toast("Kòmand efase!","e");
}

// ============================================================
//  ORDERS
// ============================================================
function renderOrders(){
  var ords   = lsGet("orders",[]).slice().reverse();
  var tbody  = document.getElementById("ord-tbody");
  tbody.innerHTML = ords.length ? ords.map(function(o){
    return "<tr>"
      +"<td><b style='color:var(--yellow)'>#"+o.id+"</b></td>"
      +"<td style='font-weight:700'>"+o.customer+"</td>"
      +"<td style='max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--gray)'>"+o.items+"</td>"
      +"<td style='font-weight:800'>"+o.total+" HTG</td>"
      +"<td>"+(o.usedPoints?"<span style='color:var(--red);font-weight:800'>GRATIS</span>":"<span style='color:var(--green);font-weight:800'>+"+o.ptsEarned+" pts</span>")+"</td>"
      +"<td style='color:var(--gray)'>"+(o.via==="whatsapp"?"📱 WA":"🛒 Site")+"</td>"
      +"<td style='color:var(--gray);font-size:11px'>"+o.date+"</td>"
      +"<td><button type='button' class='btn-save btn-sm btn-del' data-order-id='"+o.id+"' onclick='deleteOrderById(this.dataset.orderId)'>Efase</button></td>"
      +"</tr>";
  }).join("") : "<tr><td colspan='8' style='text-align:center;color:var(--gray);padding:20px'>Pa gen komand</td></tr>";
}

async function renderReviews(){
  var reviews = await loadReviewsFromSource();
  reviews = reviews.map(normalizeReview);
  var approved = reviews.filter(function(r){return r.approved;});
  var pending = reviews.filter(function(r){return !r.approved;});

  document.getElementById("rv-total").textContent = reviews.length;
  document.getElementById("rv-approved").textContent = approved.length;
  document.getElementById("rv-pending").textContent = pending.length;

  var tbody = document.getElementById("rv-tbody");
  tbody.innerHTML = reviews.length ? reviews.map(function(r){
    var stars = "★".repeat(Number(r.rating)||0)+"☆".repeat(Math.max(0,5-(Number(r.rating)||0)));
    return "<tr>"
      +"<td style='font-weight:700'>"+r.customer_name+"</td>"
      +"<td style='color:var(--gray)'>"+(r.customer_phone||"-")+"</td>"
      +"<td style='color:var(--yellow);font-weight:800'>"+stars+"</td>"
      +"<td style='max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap'>"+r.review+"</td>"
      +"<td style='color:var(--gray);font-size:11px'>"+(r.created_at?new Date(r.created_at).toLocaleString():"-")+"</td>"
      +"<td><span class='"+(r.approved?"badge-on":"badge-off")+"'>"+(r.approved?"Aprovede":"Pandan")+"</span></td>"
      +"<td><div style='display:flex;flex-wrap:wrap;gap:6px'>"
      +(r.approved?"<button type='button' class='btn-save btn-sm btn-del' data-review-id='"+r.id+"' onclick='toggleReviewApproval(this.dataset.reviewId)'>Retire</button>":"<button type='button' class='btn-save btn-sm' data-review-id='"+r.id+"' onclick='toggleReviewApproval(this.dataset.reviewId)'>Aprowe</button>")
      +"<button type='button' class='btn-save btn-sm btn-del' data-review-id='"+r.id+"' onclick='deleteReviewById(this.dataset.reviewId)'>Efase</button>"
      +"</div></td>"
      +"</tr>";
  }).join("") : "<tr><td colspan='7' style='text-align:center;color:var(--gray);padding:20px'>Pa gen avis</td></tr>";
}

async function toggleReviewApproval(id){
  var reviews = lsGet("reviews",[]).map(normalizeReview);
  var review = reviews.find(function(item){return String(item.id)===String(id);});
  if(!review){
    review = (await loadReviewsFromSource()).map(normalizeReview).find(function(item){return String(item.id)===String(id);});
  }
  if(!review){ toast("Avis pa jwenn!","e"); return; }
  review.approved = !review.approved;
  review.status = review.approved ? 'approved' : 'pending';
  lsSet("reviews", reviews);
  if(isSupabaseConfigured){
    try{ await ADB.updateReview(id, { approved: review.approved, updated_at: new Date().toISOString() }); }catch(e){ console.warn('Failed to update review', e); }
  }
  await renderReviews();
  toast(review.approved ? "✅ Avis apwouve!" : "Avis retire!","s");
}

async function deleteReviewById(id){
  if(!confirm("Efase avis sa?")) return;
  try{
    if(isSupabaseConfigured){ await ADB.deleteReview(id); }
    var reviews = lsGet("reviews",[]).filter(function(item){return String(item.id)!==String(id);});
    lsSet("reviews", reviews);
    await renderReviews();
    renderDashboard();
    toast("Avis efase","e");
  }catch(e){
    console.warn('Review delete failed', e);
    toast("⚠️ Erè efase avis","e");
  }
}

// ============================================================
//  SETTINGS
// ============================================================
async function loadSettings(){
  settings = await getAdminSettings();
  document.getElementById("s-admin-email").value = settings.adminEmail || DEFAULT_SETTINGS.adminEmail;
  document.getElementById("s-maxpts").value = settings.maxPoints||100;
  document.getElementById("s-rate").value   = settings.pointsRate||100;
}

async function saveSettings(){
  settings.adminEmail = document.getElementById("s-admin-email").value.trim() || DEFAULT_SETTINGS.adminEmail;
  settings.maxPoints  = parseInt(document.getElementById("s-maxpts").value)||100;
  settings.pointsRate = parseInt(document.getElementById("s-rate").value)||100;
  lsSet("settings", settings);
  if(isSupabaseConfigured){
    await ADB.saveSettings(settings);
  }
  toast("✅ Paramèt sove!","s");
}

async function changePwd(){
  var np = document.getElementById("s-newpwd").value;
  var cp = document.getElementById("s-confpwd").value;
  if(!np){toast("Antre nouvo modpas!","e");return;}
  if(np!==cp){toast("Modpas yo pa menm!","e");return;}
  settings.adminPwd = np;
  lsSet("settings", settings);
  if(isSupabaseConfigured){
    await ADB.saveSettings(settings);
  }
  document.getElementById("s-newpwd").value  = "";
  document.getElementById("s-confpwd").value = "";
  toast("✅ Modpas chanje!","s");
}

function clearOrders(){
  if(!confirm("Efase TOUT komand?")) return;
  lsSet("orders",[]);
  renderDashboard();
  toast("Komand efase","e");
}

function clearAll(){
  if(!confirm("Efase TOUT done? (Pwodui, kliyan, komand, avis, vizit)")) return;
  if(!confirm("DÈNYE avètisman — aksyon sa pa ka defèt!")) return;
  ["products","customers","orders","sunday","reviews","site_visits"].forEach(function(k){localStorage.removeItem("kt_"+k);});
  localStorage.removeItem("kt_banners");
  toast("Tout done efase!","e");
  setTimeout(function(){location.reload();},1200);
}

// ============================================================
//  TOAST
// ============================================================
function toast(msg, type){
  var d = document.createElement("div");
  d.className = "tst"+(type?" "+type:"");
  d.innerHTML = msg;
  document.getElementById("tc").appendChild(d);
  setTimeout(function(){if(d.parentNode)d.parentNode.removeChild(d);},3100);
}
