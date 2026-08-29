const { app, BrowserWindow, Menu, Tray, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn, execSync } = require('child_process');
const http = require('http');

let mainWindow = null;
let tray = null;
let nextServerProcess = null;
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

// Check if Next.js local server is ready
function waitForServer(url, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
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
        reject(new Error('Server start timed out'));
      } else {
        setTimeout(check, 1000);
      }
    };

    check();
  });
}

// Start background Next.js Server on 0.0.0.0:3000
function startNextServer() {
  const isDev = !app.isPackaged;
  const projectRoot = isDev
    ? path.join(__dirname, '..')
    : path.join(process.resourcesPath, 'app');

  const env = {
    ...process.env,
    PORT: PORT.toString(),
    HOSTNAME: '0.0.0.0', // Listen on all network interfaces for Multi-PC & Mobile LAN access
    NODE_ENV: isDev ? 'development' : 'production',
  };

  if (isDev) {
    console.log('Running in Development mode with local Next.js dev server...');
  } else {
    // In packaged standalone mode
    const serverScript = path.join(projectRoot, '.next', 'standalone', 'server.js');
    if (fs.existsSync(serverScript)) {
      nextServerProcess = spawn(process.execPath, [serverScript], {
        cwd: projectRoot,
        env,
        stdio: 'inherit',
      });
    } else {
      nextServerProcess = spawn('node', ['node_modules/next/dist/bin/next', 'start'], {
        cwd: projectRoot,
        env,
        stdio: 'inherit',
      });
    }
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
    startNextServer();
    await waitForServer(`http://localhost:${PORT}`);
    createWindow();
  } catch (err) {
    console.error('Failed to start ERP application:', err);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to connect to local server.\nError: ${err.message}`
    );
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextServerProcess) {
    try {
      nextServerProcess.kill();
    } catch {}
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextServerProcess) {
    try {
      nextServerProcess.kill();
    } catch {}
  }
});
