# Icônes PWA

Les icônes SVG ont été générées automatiquement. Pour créer les fichiers PNG requis par le manifest, vous avez plusieurs options :

## Option 1: Utiliser un service en ligne (Recommandé)

1. Allez sur https://realfavicongenerator.net/
2. Uploadez une icône source (512x512px minimum)
3. Téléchargez tous les formats générés
4. Placez les fichiers PNG dans ce dossier

## Option 2: Convertir les SVG en PNG localement

Si vous avez ImageMagick installé :
```bash
for size in 72 96 128 144 152 192 384 512; do
  convert icon-${size}x${size}.svg -background none icon-${size}x${size}.png
done
```

Ou avec Inkscape :
```bash
for size in 72 96 128 144 152 192 384 512; do
  inkscape icon-${size}x${size}.svg --export-filename=icon-${size}x${size}.png -w $size -h $size
done
```

## Option 3: Utiliser Node.js avec sharp

```bash
npm install sharp --save-dev
node scripts/convert-icons-to-png.js
```

## Tailles requises

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512


