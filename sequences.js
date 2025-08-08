// sequences.js
import { auth, db } from './libs/firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Récupérer le niveau de l'utilisateur connecté depuis Firestore
async function getUserLevel() {
  return new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            resolve(userDoc.data().niveau);
          } else {
            reject("Erreur : profil utilisateur introuvable.");
          }
        } catch (error) {
          reject("Erreur de lecture Firestore : " + error.message);
        }
      } else {
        reject("Utilisateur non connecté.");
      }
    });
  });
}

// 📘 Afficher toutes les séquences du niveau donné
async function afficherSequences(niveau) {
  try {
    const res = await fetch('data/sequences.json');
    if (!res.ok) throw new Error("Impossible de charger le fichier des séquences.");
    const data = await res.json();

    const sequences = data[niveau];
    const container = document.getElementById('sequence-list');

    if (!sequences || sequences.length === 0) {
      container.innerHTML = `<p>Aucune séquence trouvée pour le niveau "${niveau}".</p>`;
      return;
    }

    container.innerHTML = `<h2>Niveau : ${niveau}</h2><ul>` +
      sequences.map(seq => `
        <li>
          <a href="sequence.html?title=${encodeURIComponent(seq.title)}">
            ${seq.title}
          </a>
        </li>
      `).join('') +
      '</ul>';
  } catch (err) {
    document.getElementById('sequence-list').innerHTML = `<p>Erreur : ${err.message}</p>`;
  }
}

// ▶️ Exécution au chargement
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const niveau = await getUserLevel();
    await afficherSequences(niveau);
  } catch (err) {
    document.getElementById('sequence-list').innerHTML = `<p>${err}</p>`;
  }
});
