// profile.js
import { auth, db } from './libs/firebase.js';
import { doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { decryptData } from './libs/encrypted-key.js';

// --- Ajouter la fonction encryptData locale car non exportée ---
// On réutilise CryptoJS via le CDN, assure-toi que CryptoJS est chargé dans ton index.html ou ajoute un import ici
import CryptoJS from "https://cdn.jsdelivr.net/npm/crypto-js@4.1.1/+esm";

async function encryptData(data) {
  try {
    return CryptoJS.AES.encrypt(data, await decryptData.secretKey || '').toString();
  } catch {
    return data;
  }
}

// Sélecteurs DOM
const prenomInput = document.getElementById('prenom');
const photoImg = document.getElementById('photo');
const photoUpload = document.getElementById('photo-upload');
const nomSpan = document.getElementById('nom');
const ageSpan = document.getElementById('age');
const niveauSpan = document.getElementById('niveau');
const emailSpan = document.getElementById('email');
const progressionList = document.getElementById('progression-list');
const profileForm = document.getElementById('profile-form');
const logoutBtn = document.getElementById('btn-logout');
const deleteAccountBtn = document.getElementById('delete-account');
const activate2FABtn = document.getElementById('activate-2fa');

progressionList.innerHTML = '<li>Chargement des données...</li>';

let currentUserUid = null;
let currentUserData = null;
let allSequences = [];

// Gestion de session utilisateur
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Veuillez vous connecter.");
    window.location.href = './login.html';
    return;
  }

  currentUserUid = user.uid;
  emailSpan.textContent = user.email;

  const userDocRef = doc(db, "users", currentUserUid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    alert("Profil introuvable.");
    window.location.href = './login.html';
    return;
  }

  const data = userDocSnap.data();

  // Déchiffrement des données, on traite null ou undefined
  currentUserData = {
    prenom: data.prenom ? decryptData(data.prenom) : '',
    nom: data.nom ? decryptData(data.nom) : '',
    age: data.age ? decryptData(data.age) : '',
    niveau: data.niveau ? decryptData(data.niveau) : '',
    photo: data.photo ? decryptData(data.photo) : '',
    progression: data.progression || {}
  };

  // Mise à jour de l'interface
  prenomInput.value = currentUserData.prenom;
  photoImg.src = currentUserData.photo || 'https://via.placeholder.com/100';
  nomSpan.textContent = currentUserData.nom;
  ageSpan.textContent = currentUserData.age;
  niveauSpan.textContent = currentUserData.niveau;

  // Chargement et affichage des séquences et progression
  await loadSequencesAndDisplayProgress();
});

// Charge les séquences depuis JSON et affiche la progression
async function loadSequencesAndDisplayProgress() {
  try {
    const response = await fetch('./data/sequences.json');
    const json = await response.json();

    // Fusionne toutes les séquences par niveau en une liste plate avec titres
    allSequences = Object.values(json).flatMap(niveau =>
      niveau.map(seq => seq.title || seq.titre || '').filter(Boolean)
    );

    progressionList.innerHTML = '';
    allSequences.forEach(title => {
      const done = currentUserData.progression[title] === true;
      const li = document.createElement('li');
      li.textContent = `${done ? '✅' : '❌'} ${title}`;
      progressionList.appendChild(li);
    });
  } catch (error) {
    console.error('Erreur chargement des séquences :', error);
    progressionList.innerHTML = '<li>Erreur de chargement des séquences.</li>';
  }
}

// Gestion du changement photo (compression + stockage chiffré)
photoUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;

    img.onload = async () => {
      const maxSize = 150;
      const canvas = document.createElement('canvas');
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      photoImg.src = base64;

      // Stocker la photo en clair pour le moment
      currentUserData.photo = base64;
    };
  };
  reader.readAsDataURL(file);
});

// Sauvegarde du profil
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPrenom = prenomInput.value.trim();
  if (newPrenom.length < 2) {
    alert("Le prénom est trop court.");
    return;
  }

  try {
    const prenomChiffre = CryptoJS.AES.encrypt(newPrenom, await decryptData.secretKey).toString();
    const photoChiffree = currentUserData.photo
      ? CryptoJS.AES.encrypt(currentUserData.photo, await decryptData.secretKey).toString()
      : null;

    await updateDoc(doc(db, "users", currentUserUid), {
      prenom: prenomChiffre,
      photo: photoChiffree
    });

    alert("Profil mis à jour !");
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    alert("Erreur lors de la mise à jour du profil.");
  }
});

// Déconnexion
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = './login.html';
});

// Suppression de compte avec confirmation et ré-authentification si nécessaire
deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return;

  const email = auth.currentUser.email;
  const password = prompt("Veuillez entrer votre mot de passe pour confirmer la suppression :");

  if (!password) return;

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteDoc(doc(db, "users", currentUserUid));
    await deleteUser(auth.currentUser);
    alert("Compte supprimé.");
    window.location.href = './signup.html';
  } catch (error) {
    console.error("Erreur lors de la suppression du compte :", error);
    alert("Erreur : mot de passe incorrect ou problème rencontré.");
  }
});

// Bouton 2FA (placeholder)
activate2FABtn.addEventListener('click', () => {
  alert("L'authentification à deux facteurs sera bientôt disponible.");
});
