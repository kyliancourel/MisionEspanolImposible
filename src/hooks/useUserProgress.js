import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function useUserProgress(userId) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la progression au démarrage
  useEffect(() => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      setLoading(true);
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProgress(docSnap.data().unlockedMissions || {});
      } else {
        // Si pas de doc, créer un doc avec la progression initiale (1 mission débloquée pour chaque niveau)
        const initialProgress = {
          Débutant: 1,
          Intermédiaire: 0,
          Avancé: 0,
        };
        await setDoc(docRef, { unlockedMissions: initialProgress });
        setProgress(initialProgress);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [userId]);

  // Fonction pour débloquer la mission suivante dans un niveau
  const unlockNextMission = async (level) => {
    if (!userId || !progress) return;

    const currentUnlocked = progress[level] || 0;
    const newUnlocked = currentUnlocked + 1;

    const docRef = doc(db, 'users', userId);

    // Met à jour la progression localement et dans Firestore
    setProgress(prev => ({ ...prev, [level]: newUnlocked }));

    await updateDoc(docRef, {
      [`unlockedMissions.${level}`]: newUnlocked
    });
  };

  return { progress, loading, unlockNextMission };
}
