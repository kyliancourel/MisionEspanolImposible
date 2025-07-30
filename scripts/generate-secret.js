const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

if (!process.env.AES_SECRET_KEY || !process.env.AES_PASSWORD) {
    console.error("❌ AES_SECRET_KEY ou AES_PASSWORD est manquant.");
    process.exit(1);
  }
  

// On récupère la clé et le mot de passe depuis les secrets GitHub Actions
const encryptedKey = process.env.AES_SECRET_KEY;
const password = process.env.AES_PASSWORD;

// Déchiffrement AES-256
const decipher = crypto.createDecipher("aes-256-cbc", password);
let decrypted = decipher.update(encryptedKey, "base64", "utf8");
decrypted += decipher.final("utf8");

// Chemin de sortie
const dirPath = path.join(__dirname, "../src/config");
const filePath = path.join(dirPath, "secretKey.js");

// ✅ Création du dossier si nécessaire
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// ✅ Écriture du fichier avec la clé
fs.writeFileSync(filePath, `export const SECRET_KEY = "${decrypted}";\n`);
console.log("✅ Clé secrète déchiffrée et injectée dans src/config/secretKey.js");
