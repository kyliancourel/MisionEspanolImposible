// Import des fonctions Firebase nécessaires
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase (clé publique)
const firebaseConfig = {
  apiKey: "AIzaSyBn_zM7FTF6BmwEsG_zR6SWpD1Edkj--hQ",
  authDomain: "juego-espanol-54a58.firebaseapp.com",
  projectId: "juego-espanol-54a58",
  storageBucket: "juego-espanol-54a58.firebasestorage.app",
  messagingSenderId: "946808641255",
  appId: "1:946808641255:web:403e28b302d096928c3442",
  measurementId: "G-4E08JJ9Z96"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Initialisation Auth et Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Export des fonctions et objets utiles
export {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
};
