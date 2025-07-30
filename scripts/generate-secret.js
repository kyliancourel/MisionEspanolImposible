const fs = require('fs');

const secretKey = process.env.AES_SECRET_KEY;

if (!secretKey) {
  console.error('Erreur : AES_SECRET_KEY non définie dans les variables d’environnement');
  process.exit(1);
}

const content = `// Fichier généré automatiquement, ne pas modifier manuellement
export const AES_SECRET_KEY = '${secretKey}';
`;

fs.writeFileSync('src/config/secretKey.js', content);

console.log('Fichier secretKey.js généré avec succès.');
