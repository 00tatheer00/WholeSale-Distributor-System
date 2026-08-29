const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const standaloneDir = path.join(projectRoot, '.next', 'standalone');
const serverScript = path.join(standaloneDir, 'server.js');
const dbPath = path.join(projectRoot, 'prisma', 'wmdms.db');

console.log('====================================================');
console.log('DIAGNOSTIC PROD SERVER REPRODUCTION SCRIPT');
console.log('Project Root:', projectRoot);
console.log('Standalone Server:', serverScript, 'Exists:', fs.existsSync(serverScript));
console.log('Database Path:', dbPath, 'Exists:', fs.existsSync(dbPath));
console.log('====================================================');

const env = {
  ...process.env,
  PORT: '3099',
  HOSTNAME: '127.0.0.1',
  NODE_ENV: 'production',
  DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
};

const server = spawn('node', [serverScript], {
  env,
  cwd: standaloneDir,
});

server.stdout.on('data', (d) => console.log('[STDOUT]:', d.toString().trim()));
server.stderr.on('data', (d) => console.error('[STDERR]:', d.toString().trim()));

function waitForReady() {
  return new Promise((resolve) => {
    const check = () => {
      http.get('http://127.0.0.1:3099/login', (res) => {
        if (res.statusCode) {
          resolve(true);
        }
      }).on('error', () => {
        setTimeout(check, 300);
      });
    };
    check();
  });
}

function requestRoute(routePath, cookie = '') {
  return new Promise((resolve) => {
    const req = http.request(
      `http://127.0.0.1:3099${routePath}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookie,
          'User-Agent': 'PharmaDist-Diagnostic-Agent/1.0',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          resolve({
            route: routePath,
            status: res.statusCode,
            headers: res.headers,
            bodyPreview: data.slice(0, 300),
          });
        });
      }
    );

    req.on('error', (err) => {
      resolve({ route: routePath, status: 'ERROR', error: err.message });
    });

    req.end();
  });
}

async function runAudit() {
  console.log('Waiting for standalone server on port 3099 to boot...');
  await waitForReady();
  console.log('Server is ready! Running route audit...');

  const authCookie = 'wmdms_session=admin%40pharmadist.com; wmdms_demo_session=admin%40pharmadist.com';

  const routesToTest = [
    { path: '/', auth: false },
    { path: '/login', auth: false },
    { path: '/dashboard', auth: false },
    { path: '/dashboard', auth: true },
    { path: '/inventory', auth: true },
    { path: '/inventory/movements', auth: true },
    { path: '/inventory/adjustments', auth: true },
    { path: '/medicines', auth: true },
    { path: '/categories', auth: true },
    { path: '/suppliers', auth: true },
    { path: '/purchases', auth: true },
    { path: '/purchases/new', auth: true },
    { path: '/customers', auth: true },
    { path: '/sales', auth: true },
    { path: '/sales/new', auth: true },
    { path: '/invoices', auth: true },
    { path: '/payments', auth: true },
    { path: '/distributors', auth: true },
    { path: '/expenses', auth: true },
    { path: '/profit', auth: true },
    { path: '/reports', auth: true },
    { path: '/reports/sales', auth: true },
    { path: '/reports/purchases', auth: true },
    { path: '/reports/inventory', auth: true },
    { path: '/reports/expiry', auth: true },
    { path: '/reports/low-stock', auth: true },
    { path: '/reports/customer-dues', auth: true },
    { path: '/reports/supplier-dues', auth: true },
    { path: '/reports/payments', auth: true },
    { path: '/notifications', auth: true },
    { path: '/settings', auth: true },
    { path: '/settings/profile', auth: true },
    { path: '/audit-logs', auth: true },
  ];

  for (const r of routesToTest) {
    const res = await requestRoute(r.path, r.auth ? authCookie : '');
    const icon = res.status === 200 || res.status === 307 || res.status === 308 ? '✅' : '❌';
    console.log(`${icon} [${res.status}] ${r.path} (Auth: ${r.auth})`);
    if (res.status === 500 || res.status === 'ERROR') {
      console.error('   -> ERROR BODY:', res.bodyPreview);
    }
  }

  console.log('--- ROUTE AUDIT FINISHED ---\n');
  server.kill();
  process.exit(0);
}

runAudit();
