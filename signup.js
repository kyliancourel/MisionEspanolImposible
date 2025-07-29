// signup.js
import { auth, db } from './libs/firebase.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Même clé que dans profile.js (change-la et garde-la secrète)
const secretKey = 'TA_CLE_SECRETE_ULTRA_SECURE';

function encrypt(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
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

  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      base64Photo = reader.result;
      preview.src = base64Photo;
    };
    reader.readAsDataURL(file);
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const code = generateCode();
      await sendValidationEmail(prenom, email, code);

      const userProfile = {
        uid: cred.user.uid,
        email,
        prenom: encrypt(prenom),
        nom: encrypt(nom),
        age, // on peut laisser âge en clair si souhaité, sinon chiffre aussi avec encrypt(age.toString())
        niveau, // idem pour niveau, chiffre si besoin
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

      await setDoc(doc(db, "users", cred.user.uid), userProfile);

      messageDiv.style.color = "green";
      messageDiv.textContent = "Inscription réussie ! Un code de validation a été envoyé à votre email.";
      setTimeout(() => window.location.href = "validate.html", 3000);

    } catch (err) {
      console.error(err);
      messageDiv.textContent = err.message || "Erreur lors de la création du compte.";
    }
  });
});
