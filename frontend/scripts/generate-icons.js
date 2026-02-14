/**
 * Script pour générer les icônes PWA manquantes
 * Utilise canvas pour créer des icônes simples avec le logo de l'application
 */

const fs = require('fs');
const path = require('path');

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Tailles d'icônes requises
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// SVG template pour l'icône
const createIconSVG = (size) => {
  const fontSize = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#5B9FED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B7FD4;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="${centerX}" y="${centerY + fontSize * 0.3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">MS</text>
</svg>`;
};

console.log('📦 Génération des icônes PWA...');

// Générer les fichiers SVG (qui peuvent être utilisés comme fallback)
sizes.forEach(size => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, createIconSVG(size));
  console.log(`✅ Créé: icon-${size}x${size}.svg`);
});

// Note: Pour générer de vrais PNG, vous pouvez:
// 1. Utiliser un service en ligne comme https://realfavicongenerator.net/
// 2. Utiliser sharp ou jimp avec Node.js
// 3. Utiliser ImageMagick: convert icon.svg -resize 192x192 icon-192x192.png

console.log('\n⚠️  Note: Les fichiers SVG ont été créés comme placeholder.');
console.log('Pour de vraies icônes PNG, utilisez un convertisseur SVG->PNG ou un service en ligne.');
console.log('\n💡 Recommandation: Utilisez https://realfavicongenerator.net/ pour générer tous les formats nécessaires.');


