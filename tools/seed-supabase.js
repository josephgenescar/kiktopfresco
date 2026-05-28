const fs = require('fs');
const path = require('path');
const SUPABASE_URL = 'https://kcldctdalowqkwhlhcdy.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGRjdGRhbG93cWt3aGxoY2R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxNjA3NiwiZXhwIjoyMDkzMjkyMDc2fQ.5IsbCAJbnyJupKqMuJMfoiINeB6dubmUC_A8IVYY9q4';
const bucket = 'uploads';

function parseFrontmatter(markdown) {
  const parts = markdown.split(/^---\s*$/m);
  if (parts.length < 3) return { frontmatter: {}, body: markdown };
  const front = parts[1].trim();
  const body = parts.slice(2).join('---').trim();
  const data = {};
  for (const line of front.split(/\r?\n/)) {
    if (!line.includes(':')) continue;
    const idx = line.indexOf(':');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    } else if (value !== '' && !isNaN(Number(value))) {
      value = Number(value);
    }
    data[key] = value;
  }
  return { frontmatter: data, body };
}

function normalizeName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function pickBestImageMatch(productName, uploadedUrls) {
  const productNorm = normalizeName(productName);
  const scored = Object.keys(uploadedUrls).map((fileName) => {
    const baseName = fileName.replace(/\.[^.]+$/i, '');
    const fileNorm = normalizeName(baseName);
    const exact = productNorm === fileNorm ? 10000 : 0;
    const contains = productNorm.includes(fileNorm) || fileNorm.includes(productNorm) ? 1200 : 0;
    const overlap = fileNorm.split(/[^a-z0-9]+/).filter(Boolean).filter((part) => productNorm.includes(part)).length * 250;
    const suffixPenalty = /(?:\(\d+\)|\d+)$/.test(fileNorm) && !/(?:\(\d+\)|\d+)$/.test(productNorm) ? -300 : 0;
    const lengthBonus = Math.min(productNorm.length, fileNorm.length);
    return { fileName, score: exact + contains + overlap + lengthBonus + suffixPenalty };
  }).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.fileName.localeCompare(b.fileName);
  });
  return scored[0] ? scored[0].fileName : null;
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (err) {
    return text;
  }
}

async function uploadFile(filePath, fileName) {
  const fileBuffer = fs.readFileSync(filePath);
  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${encodeURIComponent(fileName)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'x-upsert': 'true',
      'Content-Type': 'application/octet-stream'
    },
    body: fileBuffer
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed for ${fileName}: ${res.status} ${res.statusText}: ${text}`);
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileName)}`;
}

async function clearTable(tableName) {
  try {
    const rows = await fetchJson(`${SUPABASE_URL}/rest/v1/${tableName}?select=id`);
    if (Array.isArray(rows) && rows.length) {
      for (const row of rows) {
        await fetchJson(`${SUPABASE_URL}/rest/v1/${tableName}?id=eq.${row.id}`, { method: 'DELETE' });
      }
      console.log(`Cleared ${rows.length} rows from ${tableName}`);
    }
  } catch (err) {
    console.warn(`Could not clear ${tableName}: ${err.message}`);
  }
}

async function seed() {
  const uploadDir = path.join(process.cwd(), 'images', 'uploads');
  const fileNames = fs.readdirSync(uploadDir).filter((f) => !fs.statSync(path.join(uploadDir, f)).isDirectory());
  const uploadedUrls = {};
  for (const fileName of fileNames) {
    const filePath = path.join(uploadDir, fileName);
    try {
      uploadedUrls[fileName] = await uploadFile(filePath, fileName);
      console.log(`Uploaded ${fileName}`);
    } catch (err) {
      console.warn(`Skipping upload for ${fileName}: ${err.message}`);
    }
  }

  await clearTable('products');
  await clearTable('banners');

  const products = [];
  const productFiles = fs.readdirSync(path.join(process.cwd(), 'content', 'products'))
    .filter((f) => f.endsWith('.md'))
    .sort();

  for (const fileName of productFiles) {
    const filePath = path.join(process.cwd(), 'content', 'products', fileName);
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(markdown);
    let image = frontmatter.image || '';
    const productName = String(frontmatter.name || fileName.replace(/\.md$/i, ''));
    const matchedFile = pickBestImageMatch(productName, uploadedUrls);
    if (matchedFile) {
      image = uploadedUrls[matchedFile];
    }
    const categoryValue = String(frontmatter.category || '').toLowerCase();
    const inferredTab = /biere|beer|rhum|vin|cocktail|alcool|18\+/i.test(categoryValue)
      ? 'alcool'
      : /boisson|boissons|fresco|jus|limonade|malta|tampico|glace|soda|ice/i.test(categoryValue)
        ? 'boisson'
        : 'manger';
    products.push({
      name_fr: productName,
      name_kr: productName,
      tab: inferredTab,
      category: frontmatter.category || 'Autre',
      price: Number(frontmatter.price) || 0,
      emoji: frontmatter.emoji || '',
      description_fr: frontmatter.description || '',
      description_kr: frontmatter.description || '',
      image,
      badge: frontmatter.badge || '',
      alcohol: /biere|beer|rhum|vin|cocktail|alcool/i.test(frontmatter.category || ''),
      status: frontmatter.inStock === false ? 'inactive' : 'active',
      point_value: Number(frontmatter.pointValue) || 1,
      position: Number(frontmatter.position) || 0
    });
  }

  const banners = [];
  const bannerFiles = fs.readdirSync(path.join(process.cwd(), 'content', 'announcements'))
    .filter((f) => f.endsWith('.md'))
    .sort();

  for (const fileName of bannerFiles) {
    const filePath = path.join(process.cwd(), 'content', 'announcements', fileName);
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(markdown);
    const title = frontmatter.title || 'KikTop Fresco';
    const img = frontmatter.image ? frontmatter.image : '';
    banners.push({
      title,
      body: body || 'Bienvenue sur KikTop Fresco',
      icon: frontmatter.icon || '',
      bg: frontmatter.bgColor || '#D63031',
      color: frontmatter.textColor || '#ffffff',
      img,
      link: frontmatter.link || '',
      type: frontmatter.type || (img ? 'image' : 'text'),
      active: frontmatter.active !== false,
      position: Number(frontmatter.position) || 0
    });
  }

  try {
    await fetchJson(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      body: JSON.stringify(products)
    });
    console.log(`Inserted ${products.length} products`);
  } catch (err) {
    console.error('Products insert failed:', err.message);
  }

  try {
    await fetchJson(`${SUPABASE_URL}/rest/v1/banners`, {
      method: 'POST',
      body: JSON.stringify(banners)
    });
    console.log(`Inserted ${banners.length} banners`);
  } catch (err) {
    console.error('Banners insert failed:', err.message);
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
