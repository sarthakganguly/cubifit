import fs from 'fs';
let data = fs.readFileSync('src/initialData.ts', 'utf8');
data = data.replace(/video_link: ""/g, 'video_link: "", image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400&h=300"');
fs.writeFileSync('src/initialData.ts', data);
console.log('Done');
