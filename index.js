import { auth, db } from './libs/firebase.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const userInfoSection = document.getElementById('user-info');
  const userNameSpan = document.getElementById('user-name');
  const btnLogout = document.getElementById('btn-logout');
  const userAccessSection = document.getElementById('user-access');
  const contentSection = document.getElementById('content');
  const btnCreateAccount = document.getElementById('btn-create-account');
  const btnLogin = document.getElementById('btn-login');

  // Affiche les séquences et leur état (validé ou non)
  function displaySequences(sequences) {
    contentSection.innerHTML = ''; // Reset contenu

    const title = document.createElement('h2');
    title.textContent = 'Vos séquences';
    contentSection.appendChild(title);

    const ul = document.createElement('ul');
    sequences.forEach(seq => {
      const li = document.createElement('li');
      li.textContent = seq.title + (seq.validated ? ' ✅' : ' ❌');
      ul.appendChild(li);
    });
    contentSection.appendChild(ul);
  }

  // Affiche la première séquence accessible sans compte avec bouton
  function displayFreeSequence() {
    contentSection.innerHTML = `
      <h2>Première séquence accessible à tous</h2>
      <p>Titre : Portrait, autoportrait</p>
      <button id="btn-start-free-seq">Commencer cette séquence</button>
    `;
    const btnStart = document.getElementById('btn-start-free-seq');
    btnStart.addEventListener('click', () => {
      alert('Lancement de la séquence gratuite — à implémenter');
    });
  }

  onAuthStateChanged(auth, async (user) => {
    console.log("Événement Auth : ", user);

    if (user) {
      try {
        console.log("Utilisateur connecté :", user.uid);

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Données utilisateur récupérées :", userData);

          userNameSpan.textContent = userData.prenom || user.email || 'Utilisateur';
          userInfoSection.style.display = 'block';
          userAccessSection.style.display = 'none';

          if (userData.progression && userData.progression.sequences) {
            displaySequences(userData.progression.sequences);
          } else {
            contentSection.innerHTML = '<p>Aucune progression trouvée.</p>';
          }
        } else {
          console.warn('Document utilisateur non trouvé dans Firestore.');
          userNameSpan.textContent = 'Utilisateur';
          userInfoSection.style.display = 'block';
          userAccessSection.style.display = 'none';
          contentSection.innerHTML = '<p>Profil utilisateur introuvable.</p>';
        }
      } catch (err) {
        console.error('Erreur récupération progression Firestore :', err);

        if (err.code === 'permission-denied') {
          contentSection.innerHTML = '<p>Accès interdit : vous n’avez pas les permissions Firestore nécessaires.</p>';
        } else {
          contentSection.innerHTML = '<p>Erreur lors du chargement des données.</p>';
        }

        userInfoSection.style.display = 'none';
        userAccessSection.style.display = 'block';
      }
    } else {
      console.log("Aucun utilisateur connecté");
      userInfoSection.style.display = 'none';
      userAccessSection.style.display = 'block';
      displayFreeSequence();
    }
  });

  btnLogout.addEventListener('click', async () => {
    await signOut(auth);
    window.location.reload();
  });

  btnCreateAccount.addEventListener('click', () => {
    window.location.href = 'signup.html';
  });

  btnLogin.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
});
