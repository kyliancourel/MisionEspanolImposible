import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonActivities from '../components/LessonActivities';
import supports from '../data/supports.json';

function LessonPage() {
  const { level, missionKey, lessonKey } = useParams();
  const navigate = useNavigate();

  // Récupérer toutes les leçons de cette mission
  const lessons = Object.keys(supports?.[level]?.[missionKey] || []);

  // Trouver l’index initial basé sur lessonKey, sinon 0 par défaut
  const initialIndex = lessonKey ? lessons.indexOf(lessonKey) : 0;
  const [currentLessonIndex, setCurrentLessonIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0
  );

  useEffect(() => {
    // Si l’index change, on met à jour l’URL pour refléter la leçon actuelle
    if (lessons[currentLessonIndex] && lessons[currentLessonIndex] !== lessonKey) {
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

  if (!supports?.[level]?.[missionKey]) {
    return <p>❌ Contenu introuvable pour cette mission.</p>;
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
