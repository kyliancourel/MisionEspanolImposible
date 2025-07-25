import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const activityLabels = {
  CO: 'Compréhension Orale',
  CE: 'Compréhension Écrite',
  EE: 'Expression Écrite',
};

const activityMap = {
  CO: 'compréhension orale',
  CE: 'compréhension écrite',
  EE: 'expression écrite',
};

function LessonActivities({ level, missionKey, lessonKey, supports }) {
  const user = auth.currentUser;
  const [progression, setProgression] = useState({});
  const [error, setError] = useState(null);

  const activityKeys = ['CO', 'CE', 'EE'];
  const lessonSupport = supports?.[level]?.[missionKey]?.[lessonKey];

  useEffect(() => {
    if (!user) return;

    const fetchProgression = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const savedProgress = data.progression?.[level]?.[missionKey]?.[lessonKey] || {};
          setProgression(savedProgress);
        }
      } catch (err) {
        console.error(err);
        setError("❌ Erreur de chargement de la progression.");
      }
    };

    fetchProgression();
  }, [user, level, missionKey, lessonKey]);

  const handleToggle = async (activityKey) => {
    if (!user) return;

    const updatedProgress = {
      ...progression,
      [activityKey]: !progression[activityKey],
    };

    setProgression(updatedProgress);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        progression: {
          [level]: {
            [missionKey]: {
              [lessonKey]: updatedProgress,
            },
          },
        },
      }, { merge: true });
    } catch (err) {
      console.error(err);
      setError("❌ Erreur lors de l’enregistrement.");
    }
  };

  if (!lessonSupport || Object.keys(lessonSupport).length === 0) {
    return <p>⚠️ Aucun contenu disponible pour cette leçon.</p>;
  }

  return (
    <div style={{ maxWidth: 700, margin: 'auto', padding: 20 }}>
      {activityKeys.map((key) => {
        const content = lessonSupport[activityMap[key]];
        if (!content) return null;

        return (
          <div
            key={key}
            style={{
              marginBottom: 25,
              border: '1px solid #ccc',
              borderRadius: 10,
              padding: 15,
              backgroundColor: progression[key] ? '#e6ffed' : '#fff',
            }}
          >
            <h3 style={{ marginBottom: 10 }}>{activityLabels[key]}</h3>

            {content.audio && (
              <audio controls style={{ marginBottom: 10 }}>
                <source src={content.audio} type="audio/mpeg" />
                Votre navigateur ne supporte pas la lecture audio.
              </audio>
            )}

            {content.consigne && (
              <p style={{ fontWeight: 'bold', marginBottom: 6 }}>
                {content.consigne}
              </p>
            )}

            {content.texte && (
              <blockquote
                style={{
                  background: '#f9f9f9',
                  padding: '10px',
                  borderLeft: '4px solid #ccc',
                  fontStyle: 'italic',
                  marginBottom: 10,
                }}
              >
                {content.texte}
              </blockquote>
            )}

            {key === 'EE' && (
              <>
                <textarea
                  rows={5}
                  placeholder="Écris ta production ici..."
                  style={{ width: '100%', marginBottom: 10 }}
                />
                {content.correction && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: 'pointer', color: 'blue' }}>
                      Afficher la correction
                    </summary>
                    <blockquote
                      style={{
                        background: '#f0f0f0',
                        padding: 10,
                        borderLeft: '3px solid green',
                        marginTop: 10,
                      }}
                    >
                      {content.correction}
                    </blockquote>
                  </details>
                )}
              </>
            )}

            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!!progression[key]}
                onChange={() => handleToggle(key)}
                style={{ marginRight: 8 }}
              />
              Marquer comme terminé
            </label>
          </div>
        );
      })}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default LessonActivities;
