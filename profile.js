// profile.js
import { auth, db } from './libs/firebase.js';
import { doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged, signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { decryptData, encryptData } from './libs/encrypted-key.js';

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

// Message de chargement temporaire
progressionList.innerHTML = '<li>Chargement des données...</li>';

let currentUserUid = null;
let currentUserData = null;
let allSequences = [];

// Gestionnaire de session
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
    return;
  }

  // Déchiffrement
  const data = userDocSnap.data();
  currentUserData = {
    prenom: await decryptData(data.prenom),
    nom: await decryptData(data.nom),
    age: await decryptData(data.age),
    niveau: await decryptData(data.niveau),
    photo: await decryptData(data.photo),
    progression: data.progression || {}
  };

  // Affichage
  prenomInput.value = currentUserData.prenom;
  photoImg.src = currentUserData.photo;
  nomSpan.textContent = currentUserData.nom;
  ageSpan.textContent = currentUserData.age;
  niveauSpan.textContent = currentUserData.niveau;

  // Chargement séquences + progression
  loadSequencesAndDisplayProgress();
});

// Fonction : Charger les séquences et afficher la progression
async function loadSequencesAndDisplayProgress() {
  try {
    const response = await fetch('./data/sequences.json');
    const json = await response.json();

    // Fusionner toutes les séquences dans une seule liste
    allSequences = Object.values(json).flatMap(niveau =>
      niveau.flatMap(se => [se.titre, ...(se.lecons || []), se.evaluation])
    );

    // Afficher progression
    progressionList.innerHTML = '';
    allSequences.forEach(item => {
      const li = document.createElement('li');
      const status = currentUserData.progression[item] ? '✅' : '❌';
      li.textContent = `${status} ${item}`;
      progressionList.appendChild(li);
    });
  } catch (error) {
    console.error('Erreur chargement des séquences :', error);
    progressionList.innerHTML = '<li>Erreur de chargement</li>';
  }
}

// Changement de photo : compression + chiffrement immédiat
photoUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const img = new Image();
    img.src = reader.result;

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const maxSize = 150;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      photoImg.src = base64;

      // Stocker l'image chiffrée en attente de sauvegarde
      currentUserData.photo = await encryptData(base64);
    };
  };
  reader.readAsDataURL(file);
});

// Enregistrement des modifications
profileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const newPrenom = prenomInput.value.trim();
  if (newPrenom.length < 2) {
    alert("Prénom trop court.");
    return;
  }

  const prenomChiffre = await encryptData(newPrenom);
  const photoChiffree = currentUserData.photo; // déjà chiffrée à l'upload

  try {
    await updateDoc(doc(db, "users", currentUserUid), {
      prenom: prenomChiffre,
      photo: photoChiffree
    });

    alert("Profil mis à jour !");
  } catch (error) {
    console.error("Erreur update :", error);
    alert("Erreur lors de la mise à jour.");
  }
});

// Déconnexion
logoutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = './login.html';
});

// Suppression de compte avec confirmation
deleteAccountBtn.addEventListener('click', async () => {
  if (!confirm("Confirmer la suppression de votre compte ?")) return;

  const email = auth.currentUser.email;
  const password = prompt("Entrez votre mot de passe pour confirmer :");

  if (!password) return;

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await deleteDoc(doc(db, "users", currentUserUid));
    await deleteUser(auth.currentUser);
    alert("Compte supprimé.");
    window.location.href = './signup.html';
  } catch (error) {
    console.error("Erreur suppression :", error);
    alert("Échec de la suppression. Mot de passe incorrect ou erreur.");
  }
});

// Placeholder pour le bouton 2FA
activate2FABtn.addEventListener('click', () => {
  alert("La 2FA sera bientôt disponible !");
});
