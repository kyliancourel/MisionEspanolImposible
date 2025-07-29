// libs/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4FxN6ENrf_BmQ0orLeNkDhjhPwzBJeRc",
  authDomain: "mision-espanol-imposible.firebaseapp.com",
  projectId: "mision-espanol-imposible",
  storageBucket: "mision-espanol-imposible.appspot.com",
  messagingSenderId: "703596309138",
  appId: "1:703596309138:web:f73bed913520d9bd4b944b",
  measurementId: "G-02EEF8PS1E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
