import fs from "fs";
import path from "path";
import sharp from "sharp";

async function generateIcons() {
  const iconsDir = path.join(process.cwd(), "public", "icons");
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // SVG Source for PharmaDist
  const svgBuffer = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <rect width="512" height="512" rx="112" fill="#0071E3"/>
      <circle cx="256" cy="256" r="180" fill="white" opacity="0.12"/>
      <path d="M256 120 V392" stroke="white" stroke-width="52" stroke-linecap="round"/>
      <path d="M120 256 H392" stroke="white" stroke-width="52" stroke-linecap="round"/>
      <circle cx="360" cy="152" r="30" fill="#34C759"/>
    </svg>
  `);

  // Maskable SVG source with safe margin
  const maskableSvgBuffer = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
      <rect width="512" height="512" fill="#0071E3"/>
      <circle cx="256" cy="256" r="140" fill="white" opacity="0.15"/>
      <path d="M256 160 V352" stroke="white" stroke-width="44" stroke-linecap="round"/>
      <path d="M160 256 H352" stroke="white" stroke-width="44" stroke-linecap="round"/>
      <circle cx="335" cy="175" r="24" fill="#34C759"/>
    </svg>
  `);

  console.log("Generating PWA PNG icons...");

  // 1. icon-192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192.png"));
  console.log("✓ Created public/icons/icon-192.png");

  // 2. icon-512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512.png"));
  console.log("✓ Created public/icons/icon-512.png");

  // 3. icon-192-maskable.png
  await sharp(maskableSvgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, "icon-192-maskable.png"));
  console.log("✓ Created public/icons/icon-192-maskable.png");

  // 4. icon-512-maskable.png
  await sharp(maskableSvgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, "icon-512-maskable.png"));
  console.log("✓ Created public/icons/icon-512-maskable.png");

  // 5. apple-touch-icon.png in public root
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(process.cwd(), "public", "apple-touch-icon.png"));
  console.log("✓ Created public/apple-touch-icon.png");

  console.log("All PWA PNG icons generated successfully!");
}

generateIcons().catch((err) => {
  console.error("Icon generation error:", err);
  process.exit(1);
});
