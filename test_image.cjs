const http = require('http');
http.get('http://localhost:3000/images/1.jpg', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error(e);
});
