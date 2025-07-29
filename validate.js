// validate.js
import { auth, db } from './libs/firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('validate-form');
  const messageDiv = document.getElementById('message');
  let currentUserUid = null;

  onAuthStateChanged(auth, user => {
    if (user) {
      currentUserUid = user.uid;
    } else {
      messageDiv.textContent = "Vous devez être connecté.";
      setTimeout(() => window.location.href = "login.html", 2000);
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    messageDiv.textContent = '';
    messageDiv.style.color = 'red';

    const inputCode = form.code.value.trim();
    if (!/^\d{6}$/.test(inputCode)) {
      messageDiv.textContent = "Veuillez saisir un code à 6 chiffres.";
      return;
    }

    if (!currentUserUid) {
      messageDiv.textContent = "Utilisateur non connecté.";
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
        setTimeout(() => window.location.href = 'index.html', 2000);
      } else {
        messageDiv.textContent = "Code incorrect, veuillez réessayer.";
      }
    } catch (err) {
      console.error(err);
      messageDiv.textContent = err.message || "Erreur lors de la validation.";
    }
  });
});
