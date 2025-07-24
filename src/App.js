import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';

import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import LevelSelector from './components/LevelSelector';
import MissionList from './components/MissionList';
import Auth from './components/Auth';
import PrivacyPolicy from './components/PrivacyPolicy';
import DeleteData from './components/DeleteData';
import UserProfile from './components/UserProfile';
import LessonPage from './pages/LessonPage';

function App() {
  const [level, setLevel] = useState(null);
  const [user, setUser] = useState(null);
  const [unlockedMissionIndex, setUnlockedMissionIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUnlockedMissionIndex(data.unlockedMissionIndex || 0);
          setLevel(data.level || null);
        } else {
          await setDoc(userDocRef, { unlockedMissionIndex: 0 });
          setUnlockedMissionIndex(0);
          setLevel(null);
        }
      } else {
        setUnlockedMissionIndex(0);
        setLevel(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const unlockNextMission = async () => {
    if (!user || !level) return;
    const missionsCount = MissionList.getMissionCount(level);
    if (unlockedMissionIndex + 1 >= missionsCount) return;
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

  const Home = () => (
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

  return (
    <Router>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Accueil</Link>
        {user && (
          <Link to="/profile" style={{ marginRight: '10px' }}>
            Mon Profil
          </Link>
        )}
        <Link to="/privacy-policy" style={{ marginRight: '10px' }}>Politique de confidentialité</Link>
        <Link to="/delete-data">Suppression des données</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/delete-data" element={<DeleteData />} />
        <Route path="/profile" element={user ? <UserProfile /> : <Home />} />
        {/* Route corrigée avec level et missionKey */}
        <Route path="/lesson/:level/:missionKey/:lessonKey" element={<LessonPage />} />
      </Routes>
    </Router>
  );
}

export default App;
