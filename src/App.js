import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import LevelSelector from './components/LevelSelector';
import MissionList from './components/MissionList';
import Auth from './components/Auth';

function App() {
  const [level, setLevel] = useState(null);
  const [user, setUser] = useState(null);
  const [unlockedMissionIndex, setUnlockedMissionIndex] = useState(0); // index mission débloquée

  // Observer état connexion et charger données Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUnlockedMissionIndex(data.unlockedMissionIndex || 0);
        } else {
          // créer doc utilisateur par défaut
          await setDoc(userDocRef, { unlockedMissionIndex: 0 });
          setUnlockedMissionIndex(0);
        }
      } else {
        setUnlockedMissionIndex(0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fonction pour débloquer mission suivante
  const unlockNextMission = async () => {
    if (!user || !level) return;

    // Récupérer nombre total de missions du niveau
    const missionsCount = MissionList.getMissionCount(level);
    if (unlockedMissionIndex + 1 >= missionsCount) return; // déjà tout débloqué

    const newIndex = unlockedMissionIndex + 1;
    setUnlockedMissionIndex(newIndex);

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { unlockedMissionIndex: newIndex }, { merge: true });
  };

  const handleLogout = () => {
    signOut(auth);
    setLevel(null);
    setUnlockedMissionIndex(0);
  };

  return (
    <div className="text-center" style={{ padding: '20px' }}>
      <h1>🎯 ¡Misión: Español Imposible!</h1>

      {user ? (
        <>
          <p>Bienvenue, <strong>{user.displayName || user.email}</strong> 👋</p>
          <button onClick={handleLogout} style={{ marginBottom: '20px' }}>
            Se déconnecter
          </button>

          <LevelSelector onSelectLevel={setLevel} />

          {level ? (
            <>
              <p>Tu as choisi le niveau : <strong>{level}</strong></p>
              <MissionList 
                level={level} 
                isLoggedIn={true} 
                unlockedMissionIndex={unlockedMissionIndex} 
                onUnlockNext={unlockNextMission} 
              />
            </>
          ) : (
            <p>Veuillez sélectionner un niveau.</p>
          )}
        </>
      ) : (
        <>
          <Auth />
          <LevelSelector onSelectLevel={setLevel} />
          {level ? (
            <>
              <p>Tu as choisi le niveau : <strong>{level}</strong></p>
              <MissionList level={level} isLoggedIn={false} />
              <p style={{ marginTop: '20px', color: 'gray' }}>
                Connecte-toi pour débloquer toutes les missions !
              </p>
            </>
          ) : (
            <p>Veuillez sélectionner un niveau.</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
