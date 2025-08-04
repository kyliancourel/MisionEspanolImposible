// profile.js
import { auth, db } from './libs/firebase.js';
import { secretKey } from './libs/encrypted-key.js';
import {
  onAuthStateChanged,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔐 Fonctions de chiffrement
function encrypt(data) {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
}
function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || ciphertext;
  } catch {
    return ciphertext;
  }
}

// 🔁 Chargement dynamique de toutes les séquences du niveau de l'utilisateur
async function loadAllSequences(niveau, validatedList = []) {
  try {
    const response = await fetch('./data/sequences.json');
    const allData = await response.json();
    const levelSequences = allData[niveau];

    progressionList.innerHTML = '';

    levelSequences.forEach(seq => {
      const isValidated = validatedList.some(
        s => decrypt(s.title) === seq.title && s.validated
      );
      const li = document.createElement('li');
      li.textContent = `${seq.title} ${isValidated ? '✅' : '❌'}`;
      progressionList.appendChild(li);
    });
  } catch (error) {
    console.error("Erreur chargement des séquences :", error);
    progressionList.innerHTML = '<li>Erreur de chargement des séquences.</li>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let currentUserUid = null;
  let currentUserData = null;

  // Références aux éléments HTML
  const photoImg = document.getElementById('photo');
  const prenomInput = document.getElementById('prenom');
  const nomSpan = document.getElementById('nom');
  const ageSpan = document.getElementById('age');
  const niveauSpan = document.getElementById('niveau');
  const emailSpan = document.getElementById('email');
  const progressionList = document.getElementById('progression-list');
  const photoUpload = document.getElementById('photo-upload');
  const profileForm = document.getElementById('profile-form');
  const btnLogout = document.getElementById('btn-logout');
  const btn2FA = document.getElementById('activate-2fa');
  const btnDelete = document.getElementById('delete-account');

  // 🔍 Authentification utilisateur
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      alert("Utilisateur non connecté.");
      window.location.href = "login.html";
      return;
    }

    currentUserUid = firebaseUser.uid;
    const userDocRef = doc(db, "users", currentUserUid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      alert("Profil introuvable.");
      await signOut(auth);
      window.location.href = "login.html";
      return;
    }

    currentUserData = userSnap.data();

    // Affichage des infos déchiffrées
    photoImg.src = currentUserData.photo ? decrypt(currentUserData.photo) : 'https://via.placeholder.com/100';
    prenomInput.value = currentUserData.prenom ? decrypt(currentUserData.prenom) : '';
    nomSpan.textContent = currentUserData.nom ? decrypt(currentUserData.nom) : '';
    ageSpan.textContent = currentUserData.age || '';
    niveauSpan.textContent = currentUserData.niveau || '';
    emailSpan.textContent = currentUserData.email || '';

    // Chargement des séquences du niveau
    await loadAllSequences(currentUserData.niveau, currentUserData.progression?.sequences || []);
  });

  // 📸 Changement de photo
  photoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = evt => {
      photoImg.src = evt.target.result;
      if (!currentUserData) currentUserData = {};
      currentUserData.photo = evt.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 💾 Mise à jour profil
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserUid || !currentUserData) {
      alert("Utilisateur non connecté ou données non chargées.");
      return;
    }

    currentUserData.prenom = prenomInput.value.trim();

    try {
      await updateDoc(doc(db, "users", currentUserUid), {
        prenom: encrypt(currentUserData.prenom),
        photo: currentUserData.photo ? encrypt(currentUserData.photo) : null
      });
      alert("Profil mis à jour.");
    } catch (err) {
      console.error("Erreur mise à jour profil:", err);
      alert("Erreur lors de la mise à jour : " + err.message);
    }
  });

  // 🔐 Déconnexion
  btnLogout.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  // 🔒 Authentification 2FA (non implémentée)
  btn2FA.addEventListener('click', () => {
    alert("Activation de l'authentification à deux facteurs non encore implémentée.");
  });

  // 🧨 Suppression de compte
  async function performAccountDeletion() {
    try {
      await deleteDoc(doc(db, "users", currentUserUid));
      const user = auth.currentUser;
      if (user) await deleteUser(user);
      alert("Compte supprimé.");
      window.location.href = "index.html";
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        const email = auth.currentUser.email;
        const password = prompt("Veuillez entrer votre mot de passe pour confirmer la suppression du compte :");
        if (!password) {
          alert("Suppression annulée : mot de passe requis.");
          btnDelete.disabled = false;
          return;
        }
        const credential = EmailAuthProvider.credential(email, password);
        try {
          await reauthenticateWithCredential(auth.currentUser, credential);
          await performAccountDeletion();
        } catch (reauthErr) {
          alert("Ré-authentification échouée : " + reauthErr.message);
          btnDelete.disabled = false;
        }
      } else {
        alert("Erreur lors de la suppression : " + err.message);
        btnDelete.disabled = false;
      }
    }
  }

  btnDelete.addEventListener('click', async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;
    btnDelete.disabled = true;
    await performAccountDeletion();
  });
});
