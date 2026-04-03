const fs = require('fs');
let content = fs.readFileSync('src/initialData.ts', 'utf-8');
content = content.replace(/\.jpeg/g, '.jpg');
fs.writeFileSync('src/initialData.ts', content);
console.log('Updated initialData.ts');
