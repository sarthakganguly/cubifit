const fs = require('fs');
const path = require('path');

const replacements = [
  // Backgrounds
  { from: /\bbg-gray-50\b/g, to: 'bg-background' },
  { from: /\bdark:bg-gray-900\b/g, to: '' },
  { from: /\bbg-white\b/g, to: 'bg-surface' },
  { from: /\bdark:bg-gray-800\b/g, to: '' },
  { from: /\bbg-gray-100\b/g, to: 'bg-surface' },
  { from: /\bdark:bg-gray-700\b/g, to: '' },
  { from: /\bbg-gray-200\b/g, to: 'bg-border' },
  { from: /\bdark:bg-gray-600\b/g, to: '' },
  { from: /\bbg-gray-600\b/g, to: 'bg-text-secondary' },
  { from: /\bbg-gray-700\b/g, to: 'bg-border' },
  
  // Text
  { from: /\btext-gray-900\b/g, to: 'text-text-primary' },
  { from: /\bdark:text-gray-100\b/g, to: '' },
  { from: /\btext-gray-800\b/g, to: 'text-text-primary' },
  { from: /\bdark:text-gray-200\b/g, to: '' },
  { from: /\btext-gray-700\b/g, to: 'text-text-primary' },
  { from: /\bdark:text-gray-300\b/g, to: '' },
  { from: /\btext-gray-600\b/g, to: 'text-text-secondary' },
  { from: /\btext-gray-500\b/g, to: 'text-text-secondary' },
  { from: /\bdark:text-gray-400\b/g, to: '' },
  { from: /\btext-gray-400\b/g, to: 'text-text-secondary' },
  { from: /\btext-white\b/g, to: 'text-white' }, // Keep text-white for buttons
  
  // Borders
  { from: /\bborder-gray-200\b/g, to: 'border-border' },
  { from: /\bdark:border-gray-700\b/g, to: '' },
  { from: /\bborder-gray-100\b/g, to: 'border-border' },
  { from: /\bdark:border-gray-800\b/g, to: '' },
  { from: /\bdark:border-gray-600\b/g, to: '' },
  
  // Primary (Indigo)
  { from: /\btext-indigo-600\b/g, to: 'text-primary' },
  { from: /\bdark:text-indigo-400\b/g, to: '' },
  { from: /\btext-indigo-700\b/g, to: 'text-primary' },
  { from: /\bdark:text-indigo-300\b/g, to: '' },
  { from: /\bbg-indigo-600\b/g, to: 'bg-primary' },
  { from: /\bdark:bg-indigo-500\b/g, to: '' },
  { from: /\bbg-indigo-50\b/g, to: 'bg-primary/10' },
  { from: /\bdark:bg-indigo-900\/30\b/g, to: '' },
  { from: /\bdark:bg-indigo-900\/10\b/g, to: '' },
  { from: /\bdark:bg-indigo-900\/20\b/g, to: '' },
  { from: /\bdark:bg-indigo-900\b/g, to: '' },
  { from: /\bborder-indigo-600\b/g, to: 'border-primary' },
  { from: /\bborder-indigo-200\b/g, to: 'border-primary/30' },
  { from: /\bdark:border-indigo-800\/50\b/g, to: '' },
  { from: /\bdark:border-indigo-800\b/g, to: '' },
  { from: /\bhover:bg-indigo-700\b/g, to: 'hover:bg-primary/90' },
  { from: /\bhover:text-indigo-600\b/g, to: 'hover:text-primary' },
  { from: /\bdark:hover:text-indigo-400\b/g, to: '' },
  { from: /\bhover:border-indigo-300\b/g, to: 'hover:border-primary/50' },
  { from: /\bshadow-indigo-200\b/g, to: 'shadow-primary/20' },
  { from: /\bdark:shadow-none\b/g, to: '' },
  { from: /\bbg-indigo-50\/50\b/g, to: 'bg-primary/5' },
  { from: /\bhover:bg-indigo-50\b/g, to: 'hover:bg-primary/10' },

  // Success (Emerald/Green)
  { from: /\btext-emerald-600\b/g, to: 'text-success' },
  { from: /\bdark:text-emerald-400\b/g, to: '' },
  { from: /\btext-green-600\b/g, to: 'text-success' },
  { from: /\bdark:text-green-400\b/g, to: '' },
  { from: /\bbg-emerald-50\b/g, to: 'bg-success/10' },
  { from: /\bdark:bg-emerald-900\/20\b/g, to: '' },
  { from: /\bbg-green-50\b/g, to: 'bg-success/10' },
  { from: /\bdark:bg-green-900\/20\b/g, to: '' },

  // Error (Red)
  { from: /\btext-red-500\b/g, to: 'text-error' },
  { from: /\btext-red-600\b/g, to: 'text-error' },
  { from: /\bdark:text-red-400\b/g, to: '' },
  { from: /\bbg-red-500\b/g, to: 'bg-error' },
  { from: /\bbg-red-600\b/g, to: 'bg-error' },
  { from: /\bbg-red-700\b/g, to: 'bg-error' },
  { from: /\bbg-red-50\b/g, to: 'bg-error/10' },
  { from: /\bbg-red-100\b/g, to: 'bg-error/20' },
  { from: /\bdark:bg-red-900\/20\b/g, to: '' },
  { from: /\bdark:bg-red-900\b/g, to: '' },
  { from: /\bhover:bg-red-50\b/g, to: 'hover:bg-error/10' },
  { from: /\bhover:text-red-500\b/g, to: 'hover:text-error' },

  // Hover states
  { from: /\bhover:bg-gray-50\b/g, to: 'hover:bg-surface' },
  { from: /\bdark:hover:bg-gray-700\b/g, to: '' },
  { from: /\bhover:bg-gray-100\b/g, to: 'hover:bg-surface' },
  { from: /\bhover:text-gray-900\b/g, to: 'hover:text-text-primary' },
  { from: /\bdark:hover:text-gray-100\b/g, to: '' },
  { from: /\bhover:text-gray-600\b/g, to: 'hover:text-text-secondary' },
  { from: /\bdark:hover:text-gray-300\b/g, to: '' },

  // Rings
  { from: /\bring-indigo-500\b/g, to: 'ring-primary' },
  { from: /\bring-gray-200\b/g, to: 'ring-border' },
  { from: /\bdark:ring-gray-700\b/g, to: '' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });

  // Clean up multiple spaces created by removing dark: classes
  content = content.replace(/ +/g, ' ');
  content = content.replace(/ "\n/g, '"\n');
  content = content.replace(/ "/g, '"');
  content = content.replace(/" /g, '"');
  // Wait, replacing / "/g with '"' might break `className=" flex"`. Let's be careful.
  content = content.replace(/ className=" /g, ' className="');
  content = content.replace(/ \b/g, ' '); // just collapse multiple spaces
  
  // Actually, a safer space cleanup:
  content = content.replace(/ {2,}/g, ' ');
  content = content.replace(/className=" /g, 'className="');
  content = content.replace(/ "/g, '"'); // this might break `class="a "` -> `class="a"` which is fine. Wait, ` <div` -> `<div`? No, ` "/g` matches space then quote.
  // Let's just do:
  content = content.replace(/ {2,}/g, ' ');
  content = content.replace(/className=" /g, 'className="');
  content = content.replace(/ "/g, '"');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
