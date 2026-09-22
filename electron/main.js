const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const { spawn } = require('child_process');

const net = require('net');

let mainWindow = null;
let serverProcess = null;
let PORT = 3000;

// Recursive folder copy helper
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Find an available TCP port starting from desired port
function getAvailablePort(desiredPort = 3000) {
  return new Promise((resolve) => {
    const tester = net.createServer();
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(desiredPort + 1));
      } else {
        resolve(desiredPort);
      }
    });
    tester.once('listening', () => {
      tester.close(() => resolve(desiredPort));
    });
    tester.listen(desiredPort, '127.0.0.1');
  });
}

// Get Local LAN IP Addresses for Multi-PC / Mobile access
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const k in interfaces) {
    for (const k2 in interfaces[k]) {
      const address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }
  return addresses.length > 0 ? addresses : ['127.0.0.1'];
}

// Wait for Next.js HTTP server to respond
function waitForServer(url, timeoutMs = 25000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 500) {
            resolve(true);
          } else {
            retry();
          }
        })
        .on('error', () => {
          retry();
        });
    };

    const retry = () => {
      if (Date.now() - startTime > timeoutMs) {
        resolve(false);
      } else {
        setTimeout(check, 300);
      }
    };

    check();
  });
}

// Start Next.js Server (Dedicated Node.js child process in production)
async function startNextServer() {
  const isDev = !app.isPackaged;
  const projectRoot = isDev
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath, 'app');

  // Dynamically find open port if 3000 is occupied
  const requestedPort = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  PORT = await getAvailablePort(requestedPort);
  console.log(`[Server]: Determined operational port: ${PORT}`);

  // Database location resolution:
  // In development, use project root prisma/wmdms.db
  // In packaged desktop (.exe), use writeable AppData (userData) directory to guarantee
  // read/write permissions for standard Windows users and preserve data across updates
  let dbPath;
  const userDataDir = app.getPath('userData');
  if (isDev) {
    dbPath = path.join(projectRoot, 'prisma', 'wmdms.db');
  } else {
    const userDbDir = path.join(userDataDir, 'database');
    if (!fs.existsSync(userDbDir)) {
      fs.mkdirSync(userDbDir, { recursive: true });
    }
    dbPath = path.join(userDbDir, 'wmdms.db');

    // On first installation launch, copy initial seeded template database from app package
    if (!fs.existsSync(dbPath)) {
      const candidates = [
        path.join(projectRoot, 'prisma', 'wmdms.db'),
        path.join(projectRoot, '.next', 'standalone', 'prisma', 'wmdms.db'),
        path.join(process.resourcesPath, 'prisma', 'wmdms.db'),
        path.join(process.resourcesPath, 'wmdms.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          fs.copyFileSync(candidate, dbPath);
          console.log(`[Database]: Initialized writeable user database at: ${dbPath}`);
          break;
        }
      }
    }

    // Ensure .prisma query engine exists in resources/app/node_modules/.prisma
    const targetPrismaDir = path.join(projectRoot, 'node_modules', '.prisma');
    if (!fs.existsSync(targetPrismaDir) || !fs.existsSync(path.join(targetPrismaDir, 'client'))) {
      const prismaCandidates = [
        path.join(process.resourcesPath, 'node_modules', '.prisma'),
        path.join(process.resourcesPath, '.prisma'),
        path.join(process.resourcesPath, 'app', 'node_modules', '.prisma'),
        path.join(projectRoot, '.next', 'standalone', 'node_modules', '.prisma'),
      ];
      for (const cand of prismaCandidates) {
        if (fs.existsSync(cand)) {
          copyDirSync(cand, targetPrismaDir);
          console.log(`[Prisma Engine]: Restored query engine to: ${targetPrismaDir}`);
          break;
        }
      }
    }
  }

  process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;
  process.env.PORT = PORT.toString();
  process.env.HOSTNAME = '0.0.0.0';
  process.env.NODE_ENV = 'production';

  if (isDev) {
    console.log('Running in Development mode with local Next.js dev server...');
    return true;
  }

  // In packaged desktop mode, spawn standalone server via Electron's bundled Node.js engine
  const standaloneServer = path.join(projectRoot, '.next', 'standalone', 'server.js');
  if (fs.existsSync(standaloneServer)) {
    console.log('Spawning standalone Next.js server child process from:', standaloneServer);
    const env = {
      ...process.env,
      PORT: PORT.toString(),
      HOSTNAME: '0.0.0.0',
      NODE_ENV: 'production',
      DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
      ELECTRON_RUN_AS_NODE: '1',
    };

    serverProcess = spawn(process.execPath, [standaloneServer], {
      env,
      cwd: path.dirname(standaloneServer),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Write server output to log file in AppData for easy debugging
    try {
      const logFile = path.join(userDataDir, 'server.log');
      const logStream = fs.createWriteStream(logFile, { flags: 'a' });
      serverProcess.stdout.pipe(logStream);
      serverProcess.stderr.pipe(logStream);
    } catch (e) {
      console.warn('Could not attach log stream:', e);
    }

    serverProcess.stdout.on('data', (d) => {
      console.log(`[Next.js Server]: ${d.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (d) => {
      console.error(`[Next.js Server Error]: ${d.toString().trim()}`);
    });

    serverProcess.on('exit', (code) => {
      console.log(`Next.js server child process exited with code ${code}`);
    });

    return true;
    return false;
  }
}

// Create Native Desktop App Window
function createWindow() {
  const localIps = getLocalIpAddresses();
  const primaryIp = localIps[0];

  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: `PharmaDist Wholesale ERP — Server running on http://${primaryIp}:${PORT}`,
    icon: fs.existsSync(path.join(__dirname, 'icon.ico'))
      ? path.join(__dirname, 'icon.ico')
      : path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
    show: false,
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}/login`);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Custom Application Menu with LAN IP details
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: `Local Network IP: http://${primaryIp}:${PORT}`,
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Multi-PC & Mobile Connection Details',
              message: `Other computers & mobile phones on the same Wi-Fi/LAN can access this ERP at:\n\nhttp://${primaryIp}:${PORT}\n\n(No installation required on other devices)`,
            });
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit Application' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PharmaDist ERP',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'PharmaDist Wholesale ERP',
              message: 'Wholesale Medicine Distribution Management System\n100% Offline Standalone Desktop Edition\nFEFO Inventory & Batch Tracking ERP',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    await startNextServer();
    const ready = await waitForServer(`http://127.0.0.1:${PORT}/login`);
    if (!ready) {
      console.warn('Server wait timed out, attempting window load anyway...');
    }
    createWindow();
  } catch (err) {
    console.error('Failed to start ERP application:', err);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start local ERP server.\n\nError: ${err.message}`
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
    serverProcess = null;
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
    serverProcess = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
