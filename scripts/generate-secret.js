const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const encryptedKey = process.env.AES_SECRET_KEY;
const password = process.env.AES_PASSWORD;

if (!encryptedKey || !password) {
  console.error("AES_SECRET_KEY ou AES_PASSWORD manquant");
  process.exit(1);
}

// Convertir la clé chiffrée en buffer
const buffer = Buffer.from(encryptedKey, "base64");

// Extraire les composants : salt (16), iv (16), ciphertext
const salt = buffer.slice(0, 16);
const iv = buffer.slice(16, 32);
const ciphertext = buffer.slice(32);

// Dérive la clé depuis le mot de passe + sel
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

// Déchiffre la clé
const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
let decrypted = decipher.update(ciphertext, undefined, "utf8");
decrypted += decipher.final("utf8");

// Crée le fichier de sortie
const outputPath = path.resolve(__dirname, "../src/config/secretKey.js");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `export const secretKey = "${decrypted}";\n`);

console.log("✔️ Clé secrète générée dans src/config/secretKey.js");
