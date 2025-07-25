import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonActivities from '../components/LessonActivities';
import supports from '../data/supports.json';

function LessonPage() {
  const { level, missionKey, lessonKey } = useParams();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    // Validation basique
    if (!level || !missionKey || !supports?.[level]?.[missionKey]) {
      return;
    }

    const lessonList = Object.keys(supports[level][missionKey]);
    setLessons(lessonList);

    const index = lessonList.indexOf(lessonKey);
    if (index >= 0) {
      setCurrentLessonIndex(index);
    } else if (lessonList.length > 0) {
      // Redirige vers la première leçon si l’URL contient un lessonKey invalide
      navigate(`/lesson/${level}/${missionKey}/${lessonList[0]}`, { replace: true });
    }
  }, [level, missionKey, lessonKey, navigate]);

  useEffect(() => {
    // Change l’URL si l’index a changé et la leçon actuelle ne correspond pas à l’URL
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

  if (!level || !missionKey || lessons.length === 0) {
    return <p>❌ Contenu introuvable pour cette mission ou cette leçon.</p>;
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
