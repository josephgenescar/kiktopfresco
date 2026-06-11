const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function loadLocalEnv() {
  try {
    const envPath = path.join(__dirname, '../../.env');
    if (!fs.existsSync(envPath)) return;
    const envText = fs.readFileSync(envPath, 'utf8');
    envText.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx < 0) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  } catch (err) {
    console.warn('Failed to load local .env for ImageKit auth:', err.message || err);
  }
}

loadLocalEnv();

function sanitizeEnvValue(value) {
  return String(value || '').trim().replace(/^['"]|['"]$/g, '');
}

function generateAuthParams(publicKey, privateKey, urlEndpoint) {
  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error('ImageKit environment variables are not configured');
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 30;
  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  return { token, expire, signature, publicKey, urlEndpoint };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-store',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const publicKey = sanitizeEnvValue(process.env.IMAGEKIT_PUBLIC_KEY);
  const privateKey = sanitizeEnvValue(process.env.IMAGEKIT_PRIVATE_KEY);
  const urlEndpoint = sanitizeEnvValue(process.env.IMAGEKIT_URL_ENDPOINT);

  if (!publicKey || !privateKey || !urlEndpoint) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ error: 'ImageKit environment variables are not configured' }),
    };
  }

  try {
    const authParams = generateAuthParams(publicKey, privateKey, urlEndpoint);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ token: authParams.token, expire: authParams.expire, signature: authParams.signature }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({ error: error.message || 'Failed to generate auth params' }),
    };
  }
};
