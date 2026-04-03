const fs = require('fs');
let content = fs.readFileSync('src/initialData.ts', 'utf-8');
let id = 1;
content = content.replace(/image_url:\s*"[^"]+"/g, () => {
    return `image_url: "/images/${id++}.jpeg"`;
});
fs.writeFileSync('src/initialData.ts', content);
console.log('Updated initialData.ts');
