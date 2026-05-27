const fs = require('fs');
const path = require('path');

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://kcldctdalowqkwhlhcdy.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGRjdGRhbG93cWt3aGxoY2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3MTYwNzYsImV4cCI6MjA5MzI5MjA3Nn0.iX3hswYAeYffQlpBp2N7AcSz-6ycrYDQSldTkmmvXxg',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjbGRjdGRhbG93cWt3aGxoY2R5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzcxNjA3NiwiZXhwIjoyMDkzMjkyMDc2fQ.5IsbCAJbnyJupKqMuJMfoiINeB6dubmUC_A8IVYY9q4'
};

const filePath = path.join(__dirname, 'supabase-config.js');
const output = `window.SUPABASE_ENV = ${JSON.stringify(env, null, 2)};\n`;

fs.writeFileSync(filePath, output, 'utf8');
console.log('Generated supabase-config.js');
