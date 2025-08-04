// signup.js
import { auth, db } from './libs/firebase.js';
import { secretKey } from './libs/encrypted-key.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { send } from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

// Fonction de chiffrement AES
function encrypt(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}

// Redimensionne et compresse la photo
function resizeImage(file, maxSize = 100) {
  return new Promise((resolve, reject) => {
    if (file.size > 500000) {
      reject(new Error("Image trop volumineuse, max 500KB."));
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => (img.src = e.target.result);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Envoi mail de validation via EmailJS
async function sendValidationEmail(prenom, email, code) {
  try {
    const result = await send("service_htipgeg", "template_ahp970p", {
      prenom,
      email,
      code
    }, {
      publicKey: "IV4ynVqfhK2_3r-_W"
    });

    console.log("Email envoyé :", result.status);
  } catch (err) {
    console.error("Erreur envoi email :", err);
    throw new Error("Échec de l’envoi du mail de validation.");
  }
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
      base64Photo = await resizeImage(file);
      preview.src = base64Photo;
      preview.style.display = "block";
      messageDiv.textContent = "";
    } catch (error) {
      console.error("Erreur traitement image :", error);
      messageDiv.textContent = error.message || "Erreur traitement image.";
      base64Photo = "";
      preview.src = "https://via.placeholder.com/100";
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
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const code = generateCode();

      await sendValidationEmail(prenom, email, code);

      const userProfile = {
        uid: cred.user.uid,
        email,
        prenom: encrypt(prenom),
        nom: encrypt(nom),
        age,
        niveau,
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
      messageDiv.textContent = "Inscription réussie ! Un code a été envoyé à votre adresse.";
      setTimeout(() => window.location.href = "./validate.html", 3000);

    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/email-already-in-use' && auth.currentUser) {
        try {
          await auth.currentUser.delete();
        } catch (deleteErr) {
          console.error("Erreur suppression utilisateur :", deleteErr);
        }
      }

      messageDiv.textContent = (err.code === 'auth/email-already-in-use')
        ? "Email déjà utilisé."
        : (err.message || "Erreur inscription.");
    }
  });
});
