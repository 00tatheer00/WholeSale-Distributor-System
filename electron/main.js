const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');

let mainWindow = null;
let serverInstance = null;
const PORT = process.env.PORT || 3000;

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

// Start in-process Next.js Server on 0.0.0.0:3000
async function startNextServer() {
  const isDev = !app.isPackaged;
  const projectRoot = isDev
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath, 'app');

  const dbPath = path.join(projectRoot, 'prisma', 'wmdms.db');
  process.env.DATABASE_URL = `file:${dbPath.replace(/\\/g, '/')}`;
  process.env.PORT = PORT.toString();
  process.env.HOSTNAME = '0.0.0.0';
  process.env.NODE_ENV = 'production';

  if (isDev) {
    console.log('Running in Development mode with local Next.js dev server...');
    return true;
  }

  console.log(`Starting in-process Next.js server from ${projectRoot}...`);
  const next = require('next');
  const nextApp = next({
    dev: false,
    dir: projectRoot,
    hostname: '0.0.0.0',
    port: Number(PORT),
  });

  const handle = nextApp.getRequestHandler();
  await nextApp.prepare();

  return new Promise((resolve, reject) => {
    serverInstance = http.createServer((req, res) => {
      handle(req, res);
    });

    serverInstance.listen(Number(PORT), '0.0.0.0', (err) => {
      if (err) {
        return reject(err);
      }
      console.log(`PharmaDist ERP server successfully listening on http://0.0.0.0:${PORT}`);
      resolve(true);
    });

    serverInstance.on('error', (err) => {
      console.error('Server instance error:', err);
      reject(err);
    });
  });
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
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
    show: false,
  });

  mainWindow.loadURL(`http://localhost:${PORT}`);

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

app.on('window-all-closed', () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverInstance) {
    try {
      serverInstance.close();
    } catch {}
  }
});
