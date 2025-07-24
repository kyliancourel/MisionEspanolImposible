import React, { useState } from 'react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from '../firebase';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailPasswordAuth = async () => {
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProviderLogin = async (provider) => {
    setError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: 'auto', textAlign: 'center' }}>
      <h3>{isRegister ? 'Inscription' : 'Connexion'}</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ marginBottom: 8, width: '100%' }}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ marginBottom: 8, width: '100%' }}
      />
      <button onClick={handleEmailPasswordAuth} style={{ width: '100%', marginBottom: 12 }}>
        {isRegister ? "S'inscrire" : 'Se connecter'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>
        {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
        <button onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', color: 'blue', background: 'none', border: 'none', padding: 0 }}>
          {isRegister ? 'Se connecter' : "S'inscrire"}
        </button>
      </p>

      <hr style={{ margin: '20px 0' }} />

      <button
        onClick={() => handleProviderLogin(new GoogleAuthProvider())}
        style={{ width: '100%', marginBottom: 8 }}
      >
        Se connecter avec Google
      </button>

      <button
        onClick={() => handleProviderLogin(new FacebookAuthProvider())}
        style={{ width: '100%', marginBottom: 8 }}
      >
        Se connecter avec Facebook
      </button>

      <button
        onClick={() => handleProviderLogin(new OAuthProvider('apple.com'))}
        style={{ width: '100%' }}
      >
        Se connecter avec Apple
      </button>
    </div>
  );
}

export default Auth;
