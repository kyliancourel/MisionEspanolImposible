// login.js
import { auth, db } from './libs/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    messageDiv.textContent = "";

    const email = form.email.value.trim();
    const password = form.password.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, "users", cred.user.uid);
      const userSnap = await getDoc(userDocRef);
      if (!userSnap.exists()) throw new Error("Profil utilisateur introuvable.");

      const userData = userSnap.data();
      if (!userData.isValidated) {
        throw new Error("Compte non validé. Veuillez valider votre email.");
      }

      messageDiv.style.color = "green";
      messageDiv.textContent = "Connexion réussie !";
      setTimeout(() => window.location.href = "index.html", 2000);

    } catch (err) {
      console.error(err);
      messageDiv.style.color = "red";
      messageDiv.textContent = err.message || "Erreur de connexion.";
    }
  });
});
