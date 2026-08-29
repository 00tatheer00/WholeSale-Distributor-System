const path = require('path');
const http = require('http');
const fs = require('fs');

process.env.NODE_ENV = 'production';
process.env.PORT = '3045';
process.env.HOSTNAME = '127.0.0.1';

const packagedAppDir = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app');
const standaloneDir = path.join(packagedAppDir, '.next', 'standalone');
const dbPath = path.join(packagedAppDir, 'prisma', 'wmdms.db');

process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;

// Setup module paths exactly as electron/main.js does
const nodePaths = [
  path.join(packagedAppDir, 'node_modules'),
  path.join(standaloneDir, 'node_modules'),
].join(path.delimiter);
process.env.NODE_PATH = nodePaths;
if (require('module').Module && require('module').Module._initPaths) {
  require('module').Module._initPaths();
}

console.log('Testing packaged standalone server in:', standaloneDir);
console.log('Database path:', dbPath, 'exists:', fs.existsSync(dbPath));

process.chdir(standaloneDir);

try {
  require(path.join(standaloneDir, 'server.js'));
} catch (e) {
  console.error('Failed to load server.js:', e);
  process.exit(1);
}

function testUrl(urlPath, cookies = '') {
  return new Promise((resolve) => {
    const req = http.request(
      `http://127.0.0.1:3045${urlPath}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          console.log(`[GET ${urlPath}] -> STATUS: ${res.statusCode}`);
          if (res.statusCode >= 400) {
            console.log(`Error body for ${urlPath}:`, body.slice(0, 500));
          }
          resolve({ status: res.statusCode, body });
        });
      }
    );

    req.on('error', (err) => {
      console.error(`Request to ${urlPath} failed:`, err.message);
      resolve({ status: 500, error: err });
    });

    req.end();
  });
}

setTimeout(async () => {
  console.log('\n--- STARTING PACKAGED STANDALONE ROUTE TESTS ---');
  await testUrl('/');
  await testUrl('/login');
  await testUrl('/dashboard');
  await testUrl('/dashboard', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  await testUrl('/inventory', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  await testUrl('/sales', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  await testUrl('/reports', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  console.log('--- ROUTE TESTS COMPLETE ---\n');
  process.exit(0);
}, 3000);
