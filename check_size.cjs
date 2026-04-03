const fs = require('fs');
const stats = fs.statSync('public/images/1.jpg');
console.log('Size of 1.jpg:', stats.size);
