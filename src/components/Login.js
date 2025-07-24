// src/components/Login.js
import React from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

function Login() {
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Connexion réussie avec Google !");
    } catch (error) {
      console.error("Erreur Google :", error);
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      alert("Connexion réussie avec Facebook !");
    } catch (error) {
      console.error("Erreur Facebook :", error);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>🔐 Connexion</h2>
      <button onClick={handleGoogleLogin}>Se connecter avec Google</button>
      <br /><br />
      <button onClick={handleFacebookLogin}>Se connecter avec Facebook</button>
    </div>
  );
}

export default Login;
