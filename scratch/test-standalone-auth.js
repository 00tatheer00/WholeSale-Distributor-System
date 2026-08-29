const path = require('path');
const http = require('http');

process.env.NODE_ENV = 'production';
process.env.PORT = '3008';
process.env.HOSTNAME = '127.0.0.1';

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
process.chdir(standaloneDir);

require(path.join(standaloneDir, 'server.js'));

setTimeout(() => {
  console.log('Sending POST /api/auth/login to port 3008...');
  const postData = JSON.stringify({
    email: 'admin@pharmadist.com',
    password: 'admin123',
    rememberMe: true,
  });

  const req = http.request(
    'http://127.0.0.1:3008/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    },
    (res) => {
      console.log('STATUS:', res.statusCode);
      console.log('HEADERS:', res.headers);
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('BODY:', body);
        process.exit(0);
      });
    }
  );

  req.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}, 2500);
