const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'public', 'guide', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const docsDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      offscreen: false,
    },
  });

  // Set auth cookies for admin session
  const cookie1 = { url: 'http://localhost:3000', name: 'wmdms_session', value: 'admin@pharmadist.com' };
  const cookie2 = { url: 'http://localhost:3000', name: 'wmdms_demo_session', value: 'admin@pharmadist.com' };
  await win.webContents.session.cookies.set(cookie1);
  await win.webContents.session.cookies.set(cookie2);

  const targets = [
    { url: 'http://localhost:3000/dashboard', name: '01_dashboard.png', waitMs: 6000 },
    { url: 'http://localhost:3000/sales/new', name: '02_new_sale.png', waitMs: 5000 },
    { url: 'http://localhost:3000/purchases/new', name: '03_new_purchase.png', waitMs: 5000 },
    { url: 'http://localhost:3000/inventory', name: '04_inventory.png', waitMs: 5000 },
    { url: 'http://localhost:3000/expenses', name: '05_expenses.png', waitMs: 3000 },
    { url: 'http://localhost:3000/settings', name: '06_settings.png', waitMs: 3000 },
    { url: 'http://localhost:3000/customers/new', name: '07_new_customer.png', waitMs: 4000 },
    { url: 'http://localhost:3000/expenses/new', name: '08_new_expense.png', waitMs: 4000 },
  ];

  for (const target of targets) {
    console.log(`Loading ${target.url}...`);
    await win.loadURL(target.url);
    await new Promise((resolve) => setTimeout(resolve, target.waitMs));

    const image = await win.webContents.capturePage();
    const buf = image.toPNG();
    const publicPath = path.join(outDir, target.name);
    const docsPath = path.join(docsDir, target.name);
    fs.writeFileSync(publicPath, buf);
    fs.writeFileSync(docsPath, buf);
    console.log(`Saved screenshot: ${target.name} (${buf.length} bytes)`);
  }

  console.log('All screenshots captured successfully!');
  app.quit();
});
