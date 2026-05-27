const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const newContent = content.replace('SUPABASE_URL !== "https://kcldctdalowqkwhlhcdy.supabase.co"', 'SUPABASE_URL');
fs.writeFileSync('index.html', newContent);
console.log('Fixed Supabase initialization condition');
