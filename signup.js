// signup.js
import { auth, db } from './libs/firebase.js';
import { secretKey } from './libs/crypto-key.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function encrypt(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Fonction pour redimensionner et compresser l’image
function resizeImage(file, maxSize = 100) {
  return new Promise((resolve, reject) => {
    if (file.size > 500000) { // 500 KB max avant compression (ajustable)
      reject(new Error("Image trop volumineuse, max 500KB."));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // qualité 70%
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function sendValidationEmail(prenom, email, code) {
  // Intègre ton service d’envoi mail ou EmailJS ici
  console.log(`Envoi du code ${code} à ${email} (simulateur).`);
  return new Promise(resolve => setTimeout(resolve, 500));
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signup-form');
  const photoInput = document.getElementById('photo');
  const preview = document.getElementById('preview');
  const messageDiv = document.getElementById('message');

  let base64Photo = "";

  photoInput.addEventListener('change', async () => {
    const file = photoInput.files[0];
    if (!file) return;

    try {
      base64Photo = await resizeImage(file);  // Redimensionner + compresser
      preview.src = base64Photo;
      messageDiv.textContent = "";
    } catch (error) {
      console.error("Erreur lors du redimensionnement de l’image :", error);
      messageDiv.textContent = error.message || "Erreur lors du traitement de la photo. Veuillez réessayer.";
      base64Photo = ""; // Réinitialise photo en erreur
      preview.src = "";
    }
  });

  function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.style.color = "red";

    const prenom = form.prenom.value.trim();
    const nom = form.nom.value.trim();
    const age = parseInt(form.age.value, 10);
    const email = form.email.value.trim();
    const password = form.password.value;
    const niveau = form.niveau.value;
    const rgpdChecked = form.rgpd.checked;

    if (!prenom || !nom || !age || !email || !password || !niveau) {
      messageDiv.textContent = "Merci de remplir tous les champs.";
      return;
    }
    if (password.length < 6) {
      messageDiv.textContent = "Mot de passe trop court.";
      return;
    }
    if (!rgpdChecked) {
      messageDiv.textContent = "Vous devez accepter la politique de confidentialité.";
      return;
    }

    try {
      // Création du compte Firebase
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const code = generateCode();
      await sendValidationEmail(prenom, email, code);

      const userProfile = {
        uid: cred.user.uid,
        email,
        prenom: encrypt(prenom),
        nom: encrypt(nom),
        age, // chiffre si souhaité : encrypt(age.toString())
        niveau, // chiffre si souhaité
        photo: base64Photo ? encrypt(base64Photo) : null,
        isValidated: false,
        validationCode: code,
        progression: {
          sequences: [
            { title: encrypt("Portrait, autoportrait"), validated: false }
          ]
        },
        evaluations: []
      };

      // Enregistrement profil dans Firestore
      await setDoc(doc(db, "users", cred.user.uid), userProfile);

      messageDiv.style.color = "green";
      messageDiv.textContent = "Inscription réussie ! Un code de validation a été envoyé à votre email.";
      setTimeout(() => window.location.href = "validate.html", 3000);

    } catch (err) {
      console.error(err);

      // Supprime l'utilisateur Firebase si l'erreur n'est pas "email déjà utilisé"
      if (err.code !== 'auth/email-already-in-use' && auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteErr) {
          console.error("Erreur suppression utilisateur Firebase après échec signup :", deleteErr);
        }
      }

      if (err.code === 'auth/email-already-in-use') {
        messageDiv.textContent = "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse.";
      } else {
        messageDiv.textContent = err.message || "Erreur lors de la création du compte.";
      }
    }
  });
});
