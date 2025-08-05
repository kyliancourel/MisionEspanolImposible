// login.js
import { auth, db } from './libs/firebase.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const messageDiv = document.getElementById('message');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.style.color = "red";

    const email = form.email.value.trim();
    const password = form.password.value;

    if (!email || !password) {
      messageDiv.textContent = "Veuillez remplir tous les champs.";
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        messageDiv.textContent = "Profil utilisateur introuvable.";
        return;
      }

      const userData = userSnap.data();

      if (!userData.isValidated) {
        messageDiv.textContent = "Compte non validé. Redirection...";
        setTimeout(() => window.location.href = "validate.html", 2000);
        return;
      }

      messageDiv.style.color = "green";
      messageDiv.textContent = "Connexion réussie. Redirection...";
      setTimeout(() => window.location.href = "profile.html", 2000);

    } catch (err) {
      console.error("Erreur de connexion :", err);
      if (err.code === "auth/wrong-password") {
        messageDiv.textContent = "Mot de passe incorrect.";
      } else if (err.code === "auth/user-not-found") {
        messageDiv.textContent = "Aucun utilisateur avec cet email.";
      } else {
        messageDiv.textContent = err.message || "Erreur de connexion.";
      }
    }
  });
});
