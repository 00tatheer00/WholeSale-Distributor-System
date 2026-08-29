const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach((element) => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

console.log('📦 Bundling standalone Next.js assets for Electron Desktop Distribution...');

const projectRoot = path.join(__dirname, '..');
const standaloneRoot = path.join(projectRoot, '.next', 'standalone');

// 1. Copy .next/static to .next/standalone/.next/static
const staticSrc = path.join(projectRoot, '.next', 'static');
const staticDest = path.join(standaloneRoot, '.next', 'static');
copyFolderSync(staticSrc, staticDest);
console.log('✅ Static assets copied to standalone.');

// 2. Copy public to .next/standalone/public
const publicSrc = path.join(projectRoot, 'public');
const publicDest = path.join(standaloneRoot, 'public');
copyFolderSync(publicSrc, publicDest);
console.log('✅ Public assets copied to standalone.');

// 3. Copy prisma to .next/standalone/prisma and root
const prismaSrc = path.join(projectRoot, 'prisma');
const prismaDest = path.join(standaloneRoot, 'prisma');
copyFolderSync(prismaSrc, prismaDest);

// Copy db file to standalone root directly as well
const dbSrc = path.join(projectRoot, 'prisma', 'wmdms.db');
if (fs.existsSync(dbSrc)) {
  fs.copyFileSync(dbSrc, path.join(standaloneRoot, 'wmdms.db'));
  fs.copyFileSync(dbSrc, path.join(standaloneRoot, 'prisma', 'wmdms.db'));
}
console.log('✅ SQLite database & Prisma schema copied to standalone.');

console.log('🎉 Standalone desktop bundle is 100% ready for packaging!');
