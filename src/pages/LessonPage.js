import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonActivities from '../components/LessonActivities';

function LessonPage() {
  const { level, missionKey, lessonKey } = useParams();
  const navigate = useNavigate();

  const [supports, setSupports] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger supports.json au montage
  useEffect(() => {
    fetch('/supports.json')
      .then((res) => {
        if (!res.ok) throw new Error('Erreur lors du chargement du fichier supports.json');
        return res.json();
      })
      .then((data) => {
        setSupports(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Met à jour la liste des leçons et l'index courant quand supports ou params changent
  useEffect(() => {
    if (!supports || !level || !missionKey || !supports[level]?.[missionKey]) return;

    const availableLessons = Object.keys(supports[level][missionKey]);
    setLessons(availableLessons);

    const index = availableLessons.indexOf(lessonKey);
    if (index >= 0) {
      setCurrentLessonIndex(index);
    } else if (availableLessons.length > 0) {
      // Redirige vers la première leçon si lessonKey invalide
      navigate(`/lesson/${level}/${missionKey}/${availableLessons[0]}`, { replace: true });
    }
  }, [supports, level, missionKey, lessonKey, navigate]);

  // Synchronise l'URL quand currentLessonIndex change
  useEffect(() => {
    if (
      currentLessonIndex !== null &&
      lessons.length > 0 &&
      lessons[currentLessonIndex] !== lessonKey
    ) {
      navigate(`/lesson/${level}/${missionKey}/${lessons[currentLessonIndex]}`, { replace: true });
    }
  }, [currentLessonIndex, lessons, level, missionKey, lessonKey, navigate]);

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (loading) {
    return <p>Chargement du contenu...</p>;
  }

  if (!supports || !level || !missionKey || lessons.length === 0 || currentLessonIndex === null) {
    return <p>❌ Leçon introuvable.</p>;
  }

  const currentLessonKey = lessons[currentLessonIndex];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{level} → {missionKey}</h1>
      <h2>📚 Leçon {currentLessonIndex + 1} : {currentLessonKey}</h2>

      <LessonActivities
        level={level}
        missionKey={missionKey}
        lessonKey={currentLessonKey}
        supports={supports} // passe supports aux enfants si besoin
      />

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={handlePrev} disabled={currentLessonIndex === 0}>
          ← Leçon précédente
        </button>
        <button
          onClick={handleNext}
          disabled={currentLessonIndex === lessons.length - 1}
        >
          Leçon suivante →
        </button>
      </div>
    </div>
  );
}

export default LessonPage;
