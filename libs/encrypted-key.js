import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/+esm";

export const secretKey = "U2FsdGVkX19otrYb3LexhvYkJ25znUsGMt2rVm3Lop1qZMKi8yYtp+yS+ZeLAeS4YQWmR89AHLiKux1Nek3qNw==";

export function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || ciphertext;
  } catch {
    return ciphertext;
  }
}
