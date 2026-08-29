const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const exePath = path.join(__dirname, '..', 'dist', 'win-unpacked', 'PharmaDist Wholesale ERP.exe');
const packagedApp = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app');
const standaloneServer = path.join(packagedApp, '.next', 'standalone', 'server.js');
const dbPath = path.join(packagedApp, 'prisma', 'wmdms.db');

console.log('Testing standalone server child process with exact Electron environment...');
console.log('exePath:', exePath);
console.log('standaloneServer:', standaloneServer);
console.log('dbPath:', dbPath);

const env = {
  ...process.env,
  PORT: '3000',
  HOSTNAME: '0.0.0.0',
  NODE_ENV: 'production',
  DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
  ELECTRON_RUN_AS_NODE: '1',
};

const child = spawn(exePath, [standaloneServer], {
  env,
  cwd: path.dirname(standaloneServer),
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (d) => console.log('[CHILD STDOUT]:', d.toString().trim()));
child.stderr.on('data', (d) => console.error('[CHILD STDERR]:', d.toString().trim()));

function testRoute(route, cookie = '') {
  return new Promise((resolve) => {
    http.get(`http://127.0.0.1:3000${route}`, { headers: { Cookie: cookie } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        console.log(`[HTTP ${res.statusCode}] -> GET ${route}`);
        resolve({ status: res.statusCode, body: data });
      });
    }).on('error', (err) => {
      console.error(`[FAIL] GET ${route} ->`, err.message);
      resolve({ status: 'ERROR', error: err.message });
    });
  });
}

setTimeout(async () => {
  console.log('\n--- POLLING SERVER ---');
  await testRoute('/login');
  await testRoute('/dashboard', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  await testRoute('/inventory', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  await testRoute('/sales', 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com');
  console.log('--- TEST COMPLETE ---\n');
  child.kill();
  process.exit(0);
}, 3000);
