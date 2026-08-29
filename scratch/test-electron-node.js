const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const exePath = path.join(__dirname, '..', 'dist', 'win-unpacked', 'PharmaDist Wholesale ERP.exe');
const standaloneServer = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app', '.next', 'standalone', 'server.js');
const dbPath = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app', 'prisma', 'wmdms.db');

console.log('Testing ELECTRON_RUN_AS_NODE with exePath:', exePath);

const env = {
  ...process.env,
  PORT: '3088',
  HOSTNAME: '127.0.0.1',
  NODE_ENV: 'production',
  DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
  ELECTRON_RUN_AS_NODE: '1',
};

const child = spawn(exePath, [standaloneServer], {
  env,
  cwd: path.dirname(standaloneServer),
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (d) => console.log('[SERVER STDOUT]:', d.toString()));
child.stderr.on('data', (d) => console.error('[SERVER STDERR]:', d.toString()));

child.on('error', (err) => console.error('Failed to spawn child:', err));

setTimeout(() => {
  console.log('Testing GET http://127.0.0.1:3088/login...');
  const req = http.get('http://127.0.0.1:3088/login', (res) => {
    console.log('STATUS:', res.statusCode);
    child.kill();
    process.exit(0);
  });
  req.on('error', (e) => {
    console.error('Request failed:', e.message);
    child.kill();
    process.exit(1);
  });
}, 3000);
