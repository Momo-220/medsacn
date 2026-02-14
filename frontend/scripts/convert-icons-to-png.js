/**
 * Script pour convertir les icônes SVG en PNG
 * Nécessite: npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Sharp n\'est pas installé. Installez-le avec: npm install sharp --save-dev');
  process.exit(1);
}

const iconsDir = path.join(__dirname, '../public/icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

console.log('🔄 Conversion des icônes SVG en PNG...');

async function convertIcons() {
  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    if (!fs.existsSync(svgPath)) {
      console.log(`⚠️  Fichier SVG manquant: ${svgPath}`);
      continue;
    }
    
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      console.log(`✅ Converti: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erreur lors de la conversion de ${size}x${size}:`, error.message);
    }
  }
  
  console.log('\n✨ Conversion terminée!');
}

convertIcons().catch(console.error);


