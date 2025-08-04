// validate.js
import { auth, db } from './libs/firebase.js';
import { secretKey } from './libs/encrypted-key.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { send } from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

async function resendValidationEmail(prenom, email, code) {
  try {
    const result = await send("service_htipgeg", "template_ahp970p", {
      prenom,
      email,
      code
    }, {
      publicKey: "IV4ynVqfhK2_3r-_W"
    });

    alert("Code renvoyé par mail !");
    console.log("Email renvoyé :", result.status);
  } catch (err) {
    console.error("Erreur renvoi email :", err);
    alert("Échec du renvoi de mail.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('validate-form');
  const messageDiv = document.getElementById('message');
  const userInfoDiv = document.getElementById('user-info');
  const btnResend = document.getElementById('btn-resend');
  let currentUserUid = null;
  let currentEmail = "";
  let currentPrenom = "";
  let currentCode = "";

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      messageDiv.textContent = "Vous devez être connecté.";
      setTimeout(() => window.location.href = "login.html", 2000);
      return;
    }

    currentUserUid = user.uid;

    try {
      const userDocRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        messageDiv.textContent = "Profil utilisateur introuvable.";
        return;
      }

      const userData = userSnap.data();
      currentPrenom = decrypt(userData.prenom || "") || "Utilisateur";
      currentEmail = userData.email || "";
      currentCode = userData.validationCode;

      if (userData.isValidated) {
        messageDiv.textContent = "Compte déjà validé.";
        return;
      }

      userInfoDiv.innerHTML = `<p>Bienvenue, <strong>${currentPrenom}</strong>. Un code de validation a été envoyé à : <strong>${currentEmail}</strong>.</p>`;
      btnResend.style.display = "inline-block";

    } catch (err) {
      console.error(err);
      messageDiv.textContent = err.message || "Erreur lors du chargement.";
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.style.color = 'red';

    const inputCode = form.code.value.trim();
    if (!/^\d{6}$/.test(inputCode)) {
      messageDiv.textContent = "Veuillez saisir un code à 6 chiffres.";
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUserUid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) {
        messageDiv.textContent = "Profil utilisateur introuvable.";
        return;
      }

      const userData = userSnap.data();

      if (userData.isValidated) {
        messageDiv.textContent = "Compte déjà validé.";
        return;
      }

      if (inputCode === userData.validationCode) {
        await updateDoc(userDocRef, {
          isValidated: true,
          validationCode: null
        });
        messageDiv.style.color = 'green';
        messageDiv.textContent = "Validation réussie ! Redirection...";
        setTimeout(() => window.location.href = 'profile.html', 2000);
      } else {
        messageDiv.textContent = "Code incorrect, veuillez réessayer.";
      }

    } catch (err) {
      console.error(err);
      messageDiv.textContent = err.message || "Erreur lors de la validation.";
    }
  });

  btnResend.addEventListener('click', async () => {
    if (!currentPrenom || !currentEmail || !currentCode) {
      alert("Impossible de renvoyer le code.");
      return;
    }
    await resendValidationEmail(currentPrenom, currentEmail, currentCode);
  });
});
