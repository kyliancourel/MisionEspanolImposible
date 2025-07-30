// scripts/build.js
const fs = require('fs');
const path = require('path');

const key = process.env.AES_SECRET_KEY || 'clé_non_définie';

// Fichier source index.html à la racine du projet
const srcIndex = path.join(__dirname, '../index.html');
const distDir = path.join(__dirname, '../dist');
const distIndex = path.join(distDir, 'index.html');

// Crée dossier dist/ s'il n'existe pas
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Lire index.html source
let content = fs.readFileSync(srcIndex, 'utf-8');

// Remplacer {{AES_KEY}} par la clé injectée
content = content.replace(/{{AES_KEY}}/g, key);

// Écrire dans dist/index.html
fs.writeFileSync(distIndex, content);

console.log('Build terminé avec clé injectée dans dist/index.html');
