const fs = require('fs');
const path = require('path');

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_KEY: process.env.SUPABASE_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || ''
};

const filePath = path.join(__dirname, 'supabase-config.js');
const output = `window.SUPABASE_ENV = ${JSON.stringify(env, null, 2)};\n`;

fs.writeFileSync(filePath, output, 'utf8');
console.log('Generated supabase-config.js');
