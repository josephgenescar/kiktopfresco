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

  const products = [];
  const productFiles = fs.readdirSync(path.join(process.cwd(), 'content', 'products'))
    .filter((f) => f.endsWith('.md'))
    .sort();

  for (const fileName of productFiles) {
    const filePath = path.join(process.cwd(), 'content', 'products', fileName);
    const markdown = fs.readFileSync(filePath, 'utf8');
    const { frontmatter } = parseFrontmatter(markdown);
    let image = frontmatter.image || '';
    const normalizedProductName = normalizeName(String(frontmatter.name || fileName.replace(/\.md$/i, '')));
    const matchedFile = Object.keys(uploadedUrls).find((uploadedFile) => {
      const normalizedUploadedName = normalizeName(uploadedFile.replace(/\.[^.]+$/i, ''));
      return normalizedUploadedName === normalizedProductName
        || normalizedUploadedName.includes(normalizedProductName)
        || normalizedProductName.includes(normalizedUploadedName);
    });
    if (matchedFile) {
      image = uploadedUrls[matchedFile];
    }
    products.push({
      name_fr: frontmatter.name || fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
      name_kr: frontmatter.name || fileName.replace(/\.md$/i, '').replace(/-/g, ' '),
      tab: frontmatter.category ? ( /biere|beer|rhum|vin|cocktail|alcool/i.test(frontmatter.category) ? 'alcool' : /fresco|jus|limonade|malta|tampico|glace|soda|ice/i.test(frontmatter.category) ? 'boisson' : 'manger') : 'manger',
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
