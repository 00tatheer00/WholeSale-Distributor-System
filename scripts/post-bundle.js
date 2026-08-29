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

console.log('📦 Running Post-Bundle Sync for Packaged Electron App...');

const projectRoot = path.join(__dirname, '..');
const distAppRoot = path.join(projectRoot, 'dist', 'win-unpacked', 'resources', 'app');

if (fs.existsSync(distAppRoot)) {
  // 1. Copy .prisma runtime client into dist node_modules (prevents MODULE_NOT_FOUND)
  const prismaSrc = path.join(projectRoot, 'node_modules', '.prisma');
  if (fs.existsSync(prismaSrc)) {
    copyFolderSync(prismaSrc, path.join(distAppRoot, 'node_modules', '.prisma'));
    copyFolderSync(prismaSrc, path.join(distAppRoot, '.next', 'standalone', 'node_modules', '.prisma'));
    console.log('✅ Synchronized .prisma query engine to dist/win-unpacked.');
  }

  // 2. Copy SQLite Database to all target paths in dist
  const dbSrc = path.join(projectRoot, 'prisma', 'wmdms.db');
  if (fs.existsSync(dbSrc)) {
    fs.mkdirSync(path.join(distAppRoot, 'prisma'), { recursive: true });
    fs.mkdirSync(path.join(distAppRoot, '.next', 'standalone', 'prisma'), { recursive: true });
    fs.copyFileSync(dbSrc, path.join(distAppRoot, 'prisma', 'wmdms.db'));
    fs.copyFileSync(dbSrc, path.join(distAppRoot, 'wmdms.db'));
    fs.copyFileSync(dbSrc, path.join(distAppRoot, '.next', 'standalone', 'prisma', 'wmdms.db'));
    fs.copyFileSync(dbSrc, path.join(distAppRoot, '.next', 'standalone', 'wmdms.db'));
    console.log('✅ Synchronized SQLite database to dist/win-unpacked.');
  }

  // 3. Copy public folder
  const publicSrc = path.join(projectRoot, 'public');
  if (fs.existsSync(publicSrc)) {
    copyFolderSync(publicSrc, path.join(distAppRoot, 'public'));
    copyFolderSync(publicSrc, path.join(distAppRoot, '.next', 'standalone', 'public'));
    console.log('✅ Synchronized public assets to dist/win-unpacked.');
  }

  console.log('🎉 Post-bundle synchronization complete!');
} else {
  console.log('ℹ️ dist/win-unpacked not found, skipping post-bundle step.');
}
