// navbar.js
import { auth } from './libs/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function createNavbarIfAuthenticated() {
  onAuthStateChanged(auth, user => {
    if (!user) return; // Pas connecté → pas de navbar

    const navbar = document.createElement('nav');
    navbar.innerHTML = `
      <ul style="display: flex; gap: 20px; padding: 10px; background-color: #eee;">
        <li><a href="./index.html">Accueil</a></li>
        <li><a href="./sequences.html">Mes séquences</a></li>
        <li><a href="./profile.html">Mon profil</a></li>
        <li><button id="logout-btn">Se déconnecter</button></li>
      </ul>
    `;

    document.body.prepend(navbar); // Ajoute la navbar en haut du <body>

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (err) {
        alert("Erreur lors de la déconnexion.");
        console.error(err);
      }
    });
  });
}
