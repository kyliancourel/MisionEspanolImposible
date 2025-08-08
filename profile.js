// profile.js
import { auth, db } from './libs/firebase.js';
import { secretKey } from './libs/encrypted-key.js';
import { signOut, deleteUser, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fonction de déchiffrement AES
function decrypt(data) {
  try {
    return CryptoJS.AES.decrypt(data, secretKey).toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
}

// Chargement des séquences depuis JSON
async function loadSequences() {
  const response = await fetch('./data/sequences.json');
  if (!response.ok) throw new Error("Erreur chargement des séquences.");
  return await response.json();
}

// Affiche le profil utilisateur
async function displayUserProfile(user) {
  const messageDiv = document.getElementById('message');
  const profileDiv = document.getElementById('profile');
  const sequencesDiv = document.getElementById('sequences');
  const prenomSpan = document.getElementById('prenom');
  const photoImg = document.getElementById('photo');

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) throw new Error("Profil introuvable.");

    const userData = userDoc.data();
    const decryptedPrenom = decrypt(userData.prenom);
    const decryptedPhoto = userData.photo ? decrypt(userData.photo) : "https://via.placeholder.com/100";

    // Affichage prénom et photo
    prenomSpan.textContent = decryptedPrenom;
    photoImg.src = decryptedPhoto;

    // Chargement des séquences
    const allSequences = await loadSequences();
    const userSequences = userData.progression?.sequences || [];

    // Création de la liste des séquences (faites ou non)
    const list = document.createElement('ul');

    allSequences[userData.niveau]?.forEach(seq => {
      const li = document.createElement('li');
      const match = userSequences.find(s => decrypt(s.title) === seq.title);
      li.textContent = `${seq.title} ${match?.validated ? "✅" : "❌"}`;
      list.appendChild(li);
    });

    sequencesDiv.appendChild(list);
    profileDiv.style.display = 'block';
  } catch (error) {
    console.error("Erreur profil :", error);
    messageDiv.textContent = error.message;
  }
}

// Déconnexion
document.getElementById('logout').addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = './login.html';
});

// Suppression de compte
document.getElementById('delete-account').addEventListener('click', async () => {
  if (!confirm("Confirmer la suppression de votre compte ?")) return;
  const user = auth.currentUser;
  try {
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
    alert("Compte supprimé.");
    window.location.href = './signup.html';
  } catch (error) {
    console.error("Erreur suppression :", error);
    alert("Erreur lors de la suppression du compte.");
  }
});

// Bouton 2FA (non implémenté)
document.getElementById('enable-2fa').addEventListener('click', () => {
  alert("La 2FA sera bientôt disponible !");
});

// Auth listener
onAuthStateChanged(auth, user => {
  if (user) {
    displayUserProfile(user);
  } else {
    window.location.href = './login.html';
  }
});
