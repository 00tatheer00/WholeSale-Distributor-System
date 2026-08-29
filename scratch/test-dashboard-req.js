const path = require('path');
const http = require('http');

process.env.NODE_ENV = 'production';
process.env.PORT = '3012';
process.env.HOSTNAME = '127.0.0.1';

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');
process.chdir(standaloneDir);

require(path.join(standaloneDir, 'server.js'));

setTimeout(() => {
  console.log('Requesting GET /dashboard on port 3012 with cookies...');
  const req = http.request(
    'http://127.0.0.1:3012/dashboard',
    {
      method: 'GET',
      headers: {
        Cookie: 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com',
      },
    },
    (res) => {
      console.log('STATUS:', res.statusCode);
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        console.log('BODY:', body.slice(0, 1000));
        process.exit(0);
      });
    }
  );

  req.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
  });

  req.end();
}, 2500);
